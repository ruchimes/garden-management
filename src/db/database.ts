/**
 * database.ts
 * Capa de persistencia usando idb (IndexedDB, ESM nativo) con soporte
 * de sincronización bidireccional con un servidor CouchDB remoto vía REST.
 *
 * Arquitectura:
 *   ┌─────────────┐        ┌─────────────────┐        ┌──────────────┐
 *   │  AppContext  │ ←────→ │   database.ts   │ ←────→ │  CouchDB /   │
 *   │  (React)    │        │  idb (IndexedDB) │  sync  │  Cloudant    │
 *   └─────────────┘        └─────────────────┘        └──────────────┘
 */

import { openDB, type IDBPDatabase } from 'idb'
import type { Garden, PlantedCrop, Notification, Vegetable } from '../types'

// ── Schema de IndexedDB ───────────────────────────────────────────────────────

const DB_NAME = 'huerto-app'
const DB_VERSION = 1

interface HuertoDB {
  gardens: Garden
  crops: PlantedCrop
  notifications: Notification
  customVegetables: Vegetable
}

let _db: IDBPDatabase<HuertoDB> | null = null

async function getDB(): Promise<IDBPDatabase<HuertoDB>> {
  if (_db) return _db
  _db = await openDB<HuertoDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('gardens'))
        db.createObjectStore('gardens', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('crops'))
        db.createObjectStore('crops', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('notifications'))
        db.createObjectStore('notifications', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('customVegetables'))
        db.createObjectStore('customVegetables', { keyPath: 'id' })
    },
  })
  return _db
}

// ── Helpers internos ──────────────────────────────────────────────────────────

async function getAllFromStore<T>(store: keyof HuertoDB): Promise<T[]> {
  const db = await getDB()
  return db.getAll(store) as Promise<T[]>
}

async function saveAllToStore<T extends { id: string }>(
  store: keyof HuertoDB,
  items: T[]
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(store, 'readwrite')
  await tx.store.clear()
  await Promise.all(items.map(item => tx.store.put(item as never)))
  await tx.done
}

// ── Configuración de la nube ──────────────────────────────────────────────────

const CLOUD_KEY = 'huerto-cloud-config'

export interface CloudConfig {
  url: string
  username: string
  password: string
  enabled: boolean
}

export function getCloudConfig(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(CLOUD_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCloudConfig(config: CloudConfig): void {
  localStorage.setItem(CLOUD_KEY, JSON.stringify(config))
}

export function clearCloudConfig(): void {
  localStorage.removeItem(CLOUD_KEY)
}

// ── Estado y listeners de sincronización ─────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error'

interface SyncState {
  status: SyncStatus
  error: string | null
  lastSync: string | null
}

const syncState: SyncState = {
  status: 'idle',
  error: null,
  lastSync: null,
}

let syncListeners: Array<(s: SyncState) => void> = []
let syncInterval: ReturnType<typeof setInterval> | null = null

export function onSyncChange(cb: (s: SyncState) => void) {
  syncListeners.push(cb)
  return () => { syncListeners = syncListeners.filter(l => l !== cb) }
}

function notifySyncListeners() {
  syncListeners.forEach(cb => cb({ ...syncState }))
}

export function getSyncStatus(): SyncState {
  return { ...syncState }
}

// ── Helpers CouchDB REST ──────────────────────────────────────────────────────

const COUCH_STORES: Array<{ store: keyof HuertoDB; loadKey: string; dbName: string }> = [
  { store: 'gardens',          loadKey: 'gardens',          dbName: 'huerto_gardens' },
  { store: 'crops',            loadKey: 'plantedCrops',     dbName: 'huerto_crops' },
  { store: 'notifications',    loadKey: 'notifications',    dbName: 'huerto_notifications' },
  { store: 'customVegetables', loadKey: 'customVegetables', dbName: 'huerto_vegetables' },
]

function couchHeaders(config: CloudConfig): HeadersInit {
  const creds = btoa(`${config.username}:${config.password}`)
  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${creds}`,
  }
}

function couchDbUrl(config: CloudConfig, dbName: string): string {
  return `${config.url.replace(/\/$/, '')}/${dbName}`
}

/** Asegura que la base de datos existe en CouchDB */
async function ensureRemoteDB(config: CloudConfig, dbName: string): Promise<void> {
  const url = couchDbUrl(config, dbName)
  const res = await fetch(url, {
    method: 'PUT',
    headers: couchHeaders(config),
  })
  if (res.status !== 201 && res.status !== 412) {
    const body = await res.text()
    throw new Error(`No se pudo crear/verificar DB remota ${dbName}: ${body}`)
  }
}

/** Descarga todos los documentos de una BD remota */
async function fetchAllRemoteDocs<T extends { id: string }>(
  config: CloudConfig,
  dbName: string
): Promise<T[]> {
  const url = `${couchDbUrl(config, dbName)}/_all_docs?include_docs=true`
  const res = await fetch(url, { headers: couchHeaders(config) })
  if (!res.ok) throw new Error(`Error al leer ${dbName}: ${res.status}`)
  const data = await res.json()
  return (data.rows as Array<{ id: string; doc: T & { _id: string; _rev: string } }>)
    .filter(r => !r.id.startsWith('_design'))
    .map(({ doc }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, _rev, ...rest } = doc
      return rest as unknown as T
    })
}

/** Sube todos los documentos locales a la BD remota (bulk) */
async function pushAllDocs<T extends { id: string }>(
  config: CloudConfig,
  dbName: string,
  items: T[]
): Promise<void> {
  const allDocsUrl = `${couchDbUrl(config, dbName)}/_all_docs`
  const allDocsRes = await fetch(allDocsUrl, { headers: couchHeaders(config) })
  const revMap: Record<string, string> = {}
  if (allDocsRes.ok) {
    const allDocs = await allDocsRes.json()
    for (const row of allDocs.rows as Array<{ id: string; value: { rev: string } }>) {
      revMap[row.id] = row.value.rev
    }
  }

  const docs = items.map(item => ({
    ...item,
    _id: item.id,
    ...(revMap[item.id] ? { _rev: revMap[item.id] } : {}),
  }))

  const localIds = new Set(items.map(i => i.id))
  const toDelete = Object.entries(revMap)
    .filter(([id]) => !localIds.has(id) && !id.startsWith('_design'))
    .map(([id, rev]) => ({ _id: id, _rev: rev, _deleted: true }))

  const allDocs = [...docs, ...toDelete]
  if (allDocs.length === 0) return

  const bulkUrl = `${couchDbUrl(config, dbName)}/_bulk_docs`
  const res = await fetch(bulkUrl, {
    method: 'POST',
    headers: couchHeaders(config),
    body: JSON.stringify({ docs: allDocs }),
  })
  if (!res.ok) throw new Error(`Error al subir ${dbName}: ${res.status}`)
}

// ── API de sincronización ─────────────────────────────────────────────────────

/** Sincronización manual única: push local → remote, luego pull remote → local */
export async function syncOnce(config: CloudConfig): Promise<void> {
  syncState.status = 'syncing'
  syncState.error = null
  notifySyncListeners()

  try {
    await Promise.all(COUCH_STORES.map(({ dbName }) => ensureRemoteDB(config, dbName)))

    const localData = await DB.loadAll()
    const localDataMap = localData as Record<string, Array<{ id: string }>>
    await Promise.all(
      COUCH_STORES.map(({ loadKey, dbName }) =>
        pushAllDocs(config, dbName, localDataMap[loadKey])
      )
    )

    const remoteResults = await Promise.all(
      COUCH_STORES.map(({ store, dbName }) =>
        fetchAllRemoteDocs<{ id: string }>(config, dbName).then(docs => ({ store, docs }))
      )
    )
    for (const { store, docs } of remoteResults) {
      await saveAllToStore(store, docs as never[])
    }

    syncState.status = 'ok'
    syncState.lastSync = new Date().toISOString()
  } catch (err) {
    syncState.status = 'error'
    syncState.error = err instanceof Error ? err.message : 'Error de sincronización'
  }
  notifySyncListeners()
}

/** Arranca sincronización periódica automática (cada 30s) */
export function startSync(config: CloudConfig): void {
  stopSync()
  if (!config.enabled || !config.url) return
  syncOnce(config)
  syncInterval = setInterval(() => { syncOnce(config) }, 30_000)
}

/** Detiene la sincronización periódica */
export function stopSync(): void {
  if (syncInterval !== null) {
    clearInterval(syncInterval)
    syncInterval = null
  }
  syncState.status = 'idle'
  syncState.error = null
  notifySyncListeners()
}

// ── API pública ───────────────────────────────────────────────────────────────

export const DB = {
  async loadAll() {
    const [gardens, plantedCrops, notifications, customVegetables] = await Promise.all([
      getAllFromStore<Garden>('gardens'),
      getAllFromStore<PlantedCrop>('crops'),
      getAllFromStore<Notification>('notifications'),
      getAllFromStore<Vegetable>('customVegetables'),
    ])
    return { gardens, plantedCrops, notifications, customVegetables }
  },

  async saveAll(state: {
    gardens: Garden[]
    plantedCrops: PlantedCrop[]
    notifications: Notification[]
    customVegetables: Vegetable[]
  }): Promise<void> {
    await Promise.all([
      saveAllToStore('gardens', state.gardens),
      saveAllToStore('crops', state.plantedCrops),
      saveAllToStore('notifications', state.notifications),
      saveAllToStore('customVegetables', state.customVegetables),
    ])
  },

  async exportJSON(): Promise<string> {
    const data = await DB.loadAll()
    return JSON.stringify({
      ...data,
      _meta: { version: 1, exportedAt: new Date().toISOString() },
    }, null, 2)
  },

  async importJSON(json: string): Promise<void> {
    const data = JSON.parse(json)
    await DB.saveAll({
      gardens:          data.gardens          ?? [],
      plantedCrops:     data.plantedCrops     ?? [],
      notifications:    data.notifications    ?? [],
      customVegetables: data.customVegetables ?? [],
    })
  },

  async clearAll(): Promise<void> {
    const db = await getDB()
    await Promise.all(
      (['gardens', 'crops', 'notifications', 'customVegetables'] as const)
        .map(store => db.clear(store))
    )
  },

  async migrateFromLocalStorage(): Promise<boolean> {
    const OLD_KEY = 'huerto-app-state'
    const raw = localStorage.getItem(OLD_KEY)
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw)
      const existing = await DB.loadAll()
      if (
        existing.gardens.length === 0 &&
        existing.plantedCrops.length === 0 &&
        existing.customVegetables.length === 0
      ) {
        await DB.saveAll({
          gardens:          parsed.gardens          ?? [],
          plantedCrops:     parsed.plantedCrops     ?? [],
          notifications:    parsed.notifications    ?? [],
          customVegetables: parsed.customVegetables ?? [],
        })
        localStorage.removeItem(OLD_KEY)
        console.info('[DB] Migración desde localStorage completada.')
        return true
      }
    } catch (e) {
      console.error('[DB] Error en migración:', e)
    }
    return false
  },
}



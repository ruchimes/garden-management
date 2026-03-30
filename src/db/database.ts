/**
 * database.ts
 * Capa de persistencia usando idb (IndexedDB, ESM nativo) con soporte
 * de sincronización bidireccional con MongoDB Atlas a través de la API
 * serverless en /api/sync (Vercel Functions).
 *
 * Arquitectura:
 *   ┌─────────────┐        ┌─────────────────┐        ┌──────────────────┐
 *   │  AppContext │ ←────→ │   database.ts   │ ←────→ │  /api/sync       │
 *   │  (React)    │        │  idb (IndexedDB)│  sync  │  MongoDB Atlas   │
 *   └─────────────┘        └─────────────────┘        └──────────────────┘
 */

import { openDB, type IDBPDatabase } from 'idb'
import type { Garden, PlantedCrop, Notification, Vegetable, Seedling } from '../types'

// ── Schema de IndexedDB ───────────────────────────────────────────────────────

const DB_NAME = 'huerto-app'
const DB_VERSION = 2

interface HuertoDB {
  gardens: Garden
  crops: PlantedCrop
  notifications: Notification
  customVegetables: Vegetable
  seedlings: Seedling
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
      if (!db.objectStoreNames.contains('seedlings'))
        db.createObjectStore('seedlings', { keyPath: 'id' })
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
// La URL base de la API y el secreto opcional vienen de variables de entorno.
// En Vercel: Settings → Environment Variables
// En local:  crea un fichero .env.local con estas variables

export interface CloudConfig {
  apiBase: string   // URL base de la API, p.ej. "" (mismo origen) o "https://mi-app.vercel.app"
  secret: string    // Valor de X-Api-Secret (puede estar vacío en dev)
  enabled: boolean
}

/** Config inyectada en build desde variables de entorno. Nunca va al repo. */
export function getEnvCloudConfig(): CloudConfig | null {
  // VITE_API_BASE puede estar vacío si la API está en el mismo origen (producción en Vercel)
  const apiBase = (import.meta.env.VITE_API_BASE as string | undefined) ?? ''
  const secret  = (import.meta.env.VITE_API_SECRET as string | undefined) ?? ''
  // Si se define explícitamente VITE_MONGO_ENABLED=false, desactivamos la nube
  const enabled = import.meta.env.VITE_MONGO_ENABLED !== 'false'
  if (!enabled) return null
  return { apiBase, secret, enabled: true }
}

// Mantenemos también la config manual por localStorage para desarrollo local
const CLOUD_KEY = 'huerto-mongo-config'

export function getCloudConfig(): CloudConfig | null {
  // Las variables de entorno tienen prioridad sobre la config manual
  const envConfig = getEnvCloudConfig()
  if (envConfig) return envConfig
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

// ── Helpers API MongoDB ───────────────────────────────────────────────────────

const MONGO_STORES: Array<{ store: keyof HuertoDB; loadKey: string; collection: string }> = [
  { store: 'gardens',          loadKey: 'gardens',          collection: 'gardens' },
  { store: 'crops',            loadKey: 'plantedCrops',     collection: 'crops' },
  { store: 'notifications',    loadKey: 'notifications',    collection: 'notifications' },
  { store: 'customVegetables', loadKey: 'customVegetables', collection: 'customVegetables' },
  { store: 'seedlings',        loadKey: 'seedlings',        collection: 'seedlings' },
]

function apiHeaders(config: CloudConfig): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.secret) h['X-Api-Secret'] = config.secret
  return h
}

function apiUrl(config: CloudConfig, collection: string): string {
  const base = config.apiBase.replace(/\/$/, '')
  return `${base}/api/sync?collection=${collection}`
}

/** Descarga todos los documentos de una colección remota */
async function fetchRemoteCollection<T>(
  config: CloudConfig,
  collection: string
): Promise<T[]> {
  const res = await fetch(apiUrl(config, collection), { headers: apiHeaders(config) })
  if (!res.ok) throw new Error(`Error al leer ${collection}: ${res.status}`)
  return res.json() as Promise<T[]>
}

/** Reemplaza todos los documentos de una colección remota */
async function pushCollection<T>(
  config: CloudConfig,
  collection: string,
  items: T[]
): Promise<void> {
  const res = await fetch(apiUrl(config, collection), {
    method: 'POST',
    headers: apiHeaders(config),
    body: JSON.stringify(items),
  })
  if (!res.ok) throw new Error(`Error al subir ${collection}: ${res.status}`)
}

// ── API de sincronización ─────────────────────────────────────────────────────

/** Sincronización manual única: push local → remote, luego pull remote → local */
export async function syncOnce(config: CloudConfig): Promise<void> {
  syncState.status = 'syncing'
  syncState.error = null
  notifySyncListeners()

  try {
    const localData = await DB.loadAll()
    const localDataMap = localData as Record<string, Array<{ id: string }>>

    // Push: sube los datos locales a MongoDB
    await Promise.all(
      MONGO_STORES.map(({ loadKey, collection }) =>
        pushCollection(config, collection, localDataMap[loadKey])
      )
    )

    // Pull: descarga los datos remotos y actualiza IndexedDB
    const remoteResults = await Promise.all(
      MONGO_STORES.map(({ store, collection }) =>
        fetchRemoteCollection<{ id: string }>(config, collection).then(docs => ({ store, docs }))
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
  if (!config.enabled) return
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
    const [gardens, plantedCrops, notifications, customVegetables, seedlings] = await Promise.all([
      getAllFromStore<Garden>('gardens'),
      getAllFromStore<PlantedCrop>('crops'),
      getAllFromStore<Notification>('notifications'),
      getAllFromStore<Vegetable>('customVegetables'),
      getAllFromStore<Seedling>('seedlings'),
    ])
    return { gardens, plantedCrops, notifications, customVegetables, seedlings }
  },

  async saveAll(state: {
    gardens: Garden[]
    plantedCrops: PlantedCrop[]
    notifications: Notification[]
    customVegetables: Vegetable[]
    seedlings: Seedling[]
  }): Promise<void> {
    await Promise.all([
      saveAllToStore('gardens', state.gardens),
      saveAllToStore('crops', state.plantedCrops),
      saveAllToStore('notifications', state.notifications),
      saveAllToStore('customVegetables', state.customVegetables),
      saveAllToStore('seedlings', state.seedlings),
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
      seedlings:        data.seedlings        ?? [],
    })
  },

  async clearAll(): Promise<void> {
    const db = await getDB()
    await Promise.all(
      (['gardens', 'crops', 'notifications', 'customVegetables', 'seedlings'] as const)
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
          seedlings:        parsed.seedlings        ?? [],
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

// ── Arranque automático del sync ──────────────────────────────────────────────
// Si las variables de entorno están configuradas, arranca el sync al cargar.
const _autoConfig = getEnvCloudConfig()
if (_autoConfig) {
  console.info('[DB] Sync automático activado con MongoDB Atlas.')
  startSync(_autoConfig)
}



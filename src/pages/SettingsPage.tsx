import { useState, useEffect } from 'react'
import {
  Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, Clock,
  Database, Download, Upload, Trash2, WifiOff,
} from 'lucide-react'
import {
  syncOnce, getSyncStatus, onSyncChange, getEnvCloudConfig, DB,
  type SyncStatus,
} from '../db/database'
import { useAppContext } from '../store/AppContext'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' })
    .format(new Date(iso))
}

function SyncBadge({ status }: { status: SyncStatus }) {
  const map: Record<SyncStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    idle:    { label: 'Sin conectar',   cls: 'bg-gray-100 text-gray-500',   icon: <WifiOff size={13} /> },
    syncing: { label: 'Sincronizando…', cls: 'bg-blue-100 text-blue-700',   icon: <RefreshCw size={13} className="animate-spin" /> },
    ok:      { label: 'Sincronizado',   cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={13} /> },
    error:   { label: 'Error',          cls: 'bg-red-100 text-red-700',     icon: <AlertCircle size={13} /> },
  }
  const { label, cls, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {icon} {label}
    </span>
  )
}

export default function SettingsPage() {
  const { state } = useAppContext()
  const [syncState, setSyncState] = useState(getSyncStatus())
  const [syncing, setSyncing] = useState(false)
  const [exportMsg, setExportMsg] = useState('')
  const [importMsg, setImportMsg] = useState('')

  const hasCloud = getEnvCloudConfig() !== null

  useEffect(() => {
    return onSyncChange(s => setSyncState({ ...s }))
  }, [])

  async function handleSyncNow() {
    const config = getEnvCloudConfig()
    if (!config) return
    setSyncing(true)
    await syncOnce(config)
    setSyncing(false)
  }

  async function handleExport() {
    const json = await DB.exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `huerto-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg('Backup descargado ✓')
    setTimeout(() => setExportMsg(''), 3000)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await DB.importJSON(text)
      setImportMsg('Datos importados correctamente ✓')
    } catch {
      setImportMsg('Error al importar el fichero')
    }
    setTimeout(() => setImportMsg(''), 4000)
    e.target.value = ''
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Ajustes</h1>

      {/* Estado sync */}
      <div className={`rounded-2xl p-5 border shadow-sm ${
        syncState.status === 'ok'      ? 'bg-green-50  border-green-100' :
        syncState.status === 'error'   ? 'bg-red-50    border-red-100'   :
        syncState.status === 'syncing' ? 'bg-blue-50   border-blue-100'  :
                                         'bg-gray-50   border-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          {syncState.status === 'ok'      && <CheckCircle size={26} className="text-green-600" />}
          {syncState.status === 'error'   && <AlertCircle size={26} className="text-red-500" />}
          {syncState.status === 'syncing' && <RefreshCw   size={26} className="text-blue-500 animate-spin" />}
          {syncState.status === 'idle'    && <CloudOff    size={26} className="text-gray-400" />}
          <div className="flex-1">
            <SyncBadge status={syncState.status} />
            {syncState.lastSync && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock size={11} /> {formatDate(syncState.lastSync)}
              </p>
            )}
            {syncState.error && (
              <p className="text-xs text-red-600 mt-1">{syncState.error}</p>
            )}
          </div>
          {hasCloud && (
            <button onClick={handleSyncNow} disabled={syncing || syncState.status === 'syncing'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              Sync
            </button>
          )}
        </div>
        {hasCloud && syncState.status === 'ok' && (
          <p className="text-xs text-green-700 flex items-center gap-1.5 mt-3">
            <Cloud size={12} />
            Tus datos se sincronizan automáticamente con MongoDB Atlas.
          </p>
        )}
        {!hasCloud && (
          <p className="text-xs text-gray-500 mt-3">
            La app está en modo local. Para activar la nube, configura{' '}
            <code className="bg-gray-100 px-1 rounded">VITE_API_BASE</code> en las variables de entorno.
          </p>
        )}
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
          <Database size={15} className="text-green-600" /> Datos guardados
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Huertos',   value: state.gardens.length },
            { label: 'Cultivos',  value: state.plantedCrops.length },
            { label: 'Verduras',  value: state.customVegetables.length },
            { label: 'Alertas',   value: state.notifications.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
          <Download size={15} className="text-green-600" /> Copia de seguridad
        </h2>
        <button onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors">
          <Download size={15} /> Descargar backup JSON
        </button>
        {exportMsg && <p className="text-sm text-green-600 text-center">{exportMsg}</p>}
        <label className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl font-medium text-sm text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors cursor-pointer">
          <Upload size={15} /> Restaurar desde JSON
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
        {importMsg && (
          <p className={`text-sm text-center ${importMsg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {importMsg}
          </p>
        )}
      </div>

      {/* Zona de peligro */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 space-y-3">
        <h2 className="font-semibold text-red-600 flex items-center gap-2 text-sm">
          <Trash2 size={15} /> Zona de peligro
        </h2>
        <button
          onClick={async () => {
            if (confirm('¿Borrar TODOS los datos locales? Esta acción no se puede deshacer.')) {
              await DB.clearAll()
              window.location.reload()
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors">
          <Trash2 size={15} /> Borrar todos los datos locales
        </button>
      </div>
    </div>
  )
}


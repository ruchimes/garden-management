import { useState, useEffect } from 'react'
import { Cloud, CloudOff, RefreshCw, Check, X, AlertTriangle, Info, Wifi, WifiOff, ExternalLink, Eye, EyeOff } from 'lucide-react'
import {
  getCloudConfig,
  saveCloudConfig,
  clearCloudConfig,
  startSync,
  stopSync,
  syncOnce,
  getSyncStatus,
  onSyncChange,
  type CloudConfig,
  type SyncStatus,
} from '../db/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'short', timeStyle: 'short',
  }).format(new Date(iso))
}

// ── Componente de estado de sync ──────────────────────────────────────────────

function SyncBadge({ status }: { status: SyncStatus }) {
  const map: Record<SyncStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    idle:    { label: 'Sin conectar', cls: 'bg-gray-100 text-gray-500',     icon: <WifiOff size={13} /> },
    syncing: { label: 'Sincronizando…', cls: 'bg-blue-100 text-blue-700',  icon: <RefreshCw size={13} className="animate-spin" /> },
    ok:      { label: 'Sincronizado',  cls: 'bg-green-100 text-green-700', icon: <Check size={13} /> },
    error:   { label: 'Error',         cls: 'bg-red-100 text-red-700',     icon: <AlertTriangle size={13} /> },
  }
  const { label, cls, icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {icon} {label}
    </span>
  )
}

// ── Página de ajustes ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [config, setConfig] = useState<CloudConfig>(() =>
    getCloudConfig() ?? { url: '', username: '', password: '', enabled: false }
  )
  const [syncState, setSyncState] = useState(getSyncStatus())
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Escuchar cambios del estado de sync
  useEffect(() => {
    const unsub = onSyncChange(s => setSyncState({ ...s }))
    return unsub
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveCloudConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)

    if (config.enabled && config.url) {
      startSync(config)
    } else {
      stopSync()
    }
  }

  async function handleTest() {
    if (!config.url || !config.username) {
      setTestResult({ ok: false, msg: 'Rellena la URL y el usuario antes de probar.' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const url = new URL(config.url)
      url.username = config.username
      url.password = config.password
      const res = await fetch(url.toString(), { method: 'GET' })
      if (res.ok) {
        setTestResult({ ok: true, msg: '✅ Conexión correcta. El servidor CouchDB responde.' })
      } else {
        setTestResult({ ok: false, msg: `❌ El servidor respondió con ${res.status} ${res.statusText}` })
      }
    } catch (err) {
      setTestResult({ ok: false, msg: `❌ No se pudo conectar: ${err instanceof Error ? err.message : 'Error desconocido'}` })
    } finally {
      setTesting(false)
    }
  }

  async function handleSyncNow() {
    if (!config.url) return
    setSyncing(true)
    await syncOnce(config)
    setSyncing(false)
  }

  function handleDisconnect() {
    stopSync()
    clearCloudConfig()
    setConfig({ url: '', username: '', password: '', enabled: false })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Cloud size={22} className="text-green-600" /> Sincronización con la nube
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Conecta tu HuertoApp con un servidor CouchDB para tener tus datos en varios
          dispositivos y hacer copias de seguridad automáticas.
        </p>
      </div>

      {/* Estado actual */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Estado de sincronización</p>
          <SyncBadge status={syncState.status} />
          {syncState.lastSync && (
            <p className="text-xs text-gray-400 mt-1">Última sync: {formatDate(syncState.lastSync)}</p>
          )}
          {syncState.error && (
            <p className="text-xs text-red-600 mt-1">⚠️ {syncState.error}</p>
          )}
        </div>
        {config.enabled && config.url && (
          <button onClick={handleSyncNow} disabled={syncing}
            className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            Sincronizar ahora
          </button>
        )}
      </div>

      {/* Opciones de servidor */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
          <Info size={14} /> ¿Qué servidor puedo usar?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-blue-700">
          <a href="https://cloudant.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline font-medium">
            <ExternalLink size={11} /> IBM Cloudant — gratis 1GB
          </a>
          <a href="https://couchdb.apache.org" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline font-medium">
            <ExternalLink size={11} /> Apache CouchDB — autoalojado
          </a>
          <a href="https://neighbourhood.ie/hosted-couchdb" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline font-medium">
            <ExternalLink size={11} /> Hosted CouchDB — $5/mes
          </a>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          Necesitas activar <strong>CORS</strong> en tu servidor CouchDB para que la app pueda conectarse desde el navegador.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <Wifi size={15} className="text-green-600" /> Configuración del servidor
        </h3>

        {/* URL */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            URL del servidor CouchDB
          </label>
          <input
            type="url"
            value={config.url}
            onChange={e => setConfig(c => ({ ...c, url: e.target.value }))}
            placeholder="https://tu-servidor.couchdb.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none font-mono"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            No incluyas usuario/contraseña en la URL — rellena los campos de abajo.
          </p>
        </div>

        {/* Usuario y contraseña */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={config.username}
              onChange={e => setConfig(c => ({ ...c, username: e.target.value }))}
              placeholder="admin"
              autoComplete="username"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={e => setConfig(c => ({ ...c, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none pr-10"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Toggle activar/desactivar */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Sincronización automática</p>
            <p className="text-xs text-gray-400">Mantiene los datos actualizados en tiempo real</p>
          </div>
          <button type="button"
            onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Resultado del test */}
        {testResult && (
          <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${testResult.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {testResult.ok ? <Check size={15} className="shrink-0 mt-0.5" /> : <X size={15} className="shrink-0 mt-0.5" />}
            <p>{testResult.msg}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-wrap gap-3">
          <button type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors">
            {saved
              ? <><Check size={15} /> Guardado</>
              : <><Cloud size={15} /> Guardar configuración</>}
          </button>
          <button type="button" onClick={handleTest} disabled={testing}
            className="flex items-center gap-2 px-4 bg-blue-50 border border-blue-200 text-blue-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-colors disabled:opacity-50">
            <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
            {testing ? 'Probando…' : 'Probar conexión'}
          </button>
          {config.url && (
            <button type="button" onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 bg-red-50 border border-red-200 text-red-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors">
              <CloudOff size={14} /> Desconectar
            </button>
          )}
        </div>
      </form>

      {/* Instrucciones Docker */}
      <div className="bg-gray-900 rounded-2xl p-5 text-gray-300 text-xs font-mono space-y-3">
        <p className="text-sm font-bold text-white font-sans mb-3 flex items-center gap-2">
          🐳 Levantar CouchDB en local con Docker
        </p>
        <div className="space-y-1">
          <p className="text-gray-500"># Arrancar el contenedor</p>
          <p className="text-green-400 select-all">docker run -d --name couchdb \</p>
          <p className="text-green-400 select-all pl-4">-e COUCHDB_USER=admin \</p>
          <p className="text-green-400 select-all pl-4">-e COUCHDB_PASSWORD=password \</p>
          <p className="text-green-400 select-all pl-4">-p 5984:5984 \</p>
          <p className="text-green-400 select-all pl-4">couchdb:latest</p>
        </div>
        <div className="space-y-1">
          <p className="text-gray-500"># Habilitar CORS (necesario para el navegador)</p>
          <p className="text-green-400 select-all">curl -X PUT http://admin:password@localhost:5984/_node/nonode@nohost/_config/cors/origins -d '"*"'</p>
          <p className="text-green-400 select-all">curl -X PUT http://admin:password@localhost:5984/_node/nonode@nohost/_config/cors/credentials -d '"true"'</p>
          <p className="text-green-400 select-all">curl -X PUT http://admin:password@localhost:5984/_node/nonode@nohost/_config/cors/methods -d '"GET, PUT, POST, HEAD, DELETE"'</p>
        </div>
        <div className="border-t border-gray-700 pt-3 text-gray-400 font-sans text-[11px]">
          <p>URL para esta app: <span className="text-yellow-300 font-mono select-all">http://localhost:5984</span></p>
          <p className="mt-0.5">Usuario: <span className="text-yellow-300 select-all">admin</span> · Contraseña: <span className="text-yellow-300 select-all">password</span></p>
        </div>
      </div>

    </div>
  )
}

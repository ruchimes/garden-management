import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Sprout, BookOpen, Bell, Repeat, Database, Settings, Cloud, CloudOff } from 'lucide-react'
import { useAppContext } from '../store/AppContext'
import { getSyncStatus, onSyncChange, type SyncStatus } from '../db/database'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/gardens', icon: Sprout, label: 'Huertos' },
  { to: '/catalog', icon: BookOpen, label: 'Catálogo' },
  { to: '/rotation', icon: Repeat, label: 'Rotación' },
  { to: '/notifications', icon: Bell, label: 'Alertas' },
  { to: '/admin/vegetables', icon: Database, label: 'Gestión' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
]

function SyncDot({ status }: { status: SyncStatus }) {
  if (status === 'idle') return null
  const cls = {
    syncing: 'bg-blue-400 animate-pulse',
    ok:      'bg-green-400',
    error:   'bg-red-500',
  }[status]
  return <span className={`absolute top-0 right-0 w-2 h-2 rounded-full ${cls}`} />
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { state } = useAppContext()
  const unreadCount = state.notifications.filter(n => !n.read).length
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus().status)

  useEffect(() => {
    const unsub = onSyncChange(s => setSyncStatus(s.status))
    return unsub
  }, [])

  const syncIcon = syncStatus === 'ok' ? Cloud : syncStatus === 'error' ? CloudOff : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Desktop */}
      <header className="bg-green-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="text-xl font-bold tracking-tight">HuertoApp</h1>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to))
                return (
                  <Link key={item.to} to={item.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      isActive ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-600/50'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {item.to === '/notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {item.to === '/settings' && <SyncDot status={syncStatus} />}
                  </Link>
                )
              })}
            </nav>
            {/* Indicador cloud en header */}
            {syncIcon && (
              <span className={`ml-2 ${syncStatus === 'ok' ? 'text-green-300' : 'text-red-400'}`} title={syncStatus === 'ok' ? 'Sincronizado' : 'Error de sync'}>
                {syncIcon === Cloud ? <Cloud size={16} /> : <CloudOff size={16} />}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg relative transition-colors ${
                  isActive
                    ? 'text-green-700'
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.to === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {item.to === '/settings' && <SyncDot status={syncStatus} />}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

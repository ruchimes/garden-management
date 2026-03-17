import { BellOff, CheckCheck } from 'lucide-react'
import { useAppContext } from '../store/AppContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const TYPE_STYLES = {
  stage_change: 'bg-green-50 border-green-200',
  reminder: 'bg-amber-50 border-amber-200',
  rotation_warning: 'bg-red-50 border-red-200',
  companion_tip: 'bg-blue-50 border-blue-200',
}

const TYPE_ICONS = {
  stage_change: '🌿',
  reminder: '⏰',
  rotation_warning: '⚠️',
  companion_tip: '💡',
}

export default function NotificationsPage() {
  const { state, dispatch } = useAppContext()
  const { notifications } = state

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  function markAllRead() {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }

  function markRead(id: string) {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id })
  }

  if (notifications.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">🔔 Notificaciones</h1>
        <div className="text-center py-16">
          <BellOff className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-500 mb-2">Sin notificaciones</h2>
          <p className="text-gray-400 text-sm">
            Planta cultivos para recibir alertas sobre sus etapas de crecimiento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🔔 Notificaciones</h1>
        {unread.length > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors font-medium"
          >
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Sin leer ({unread.length})
          </h2>
          <div className="space-y-2">
            {unread.map(notif => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onRead={() => markRead(notif.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Read */}
      {read.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Leídas ({read.length})
          </h2>
          <div className="space-y-2 opacity-70">
            {read.map(notif => (
              <NotificationCard key={notif.id} notification={notif} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function NotificationCard({
  notification,
  onRead,
}: {
  notification: ReturnType<typeof useAppContext>['state']['notifications'][0]
  onRead?: () => void
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: es,
  })

  const styleClass = TYPE_STYLES[notification.type] ?? 'bg-gray-50 border-gray-200'
  const typeIcon = TYPE_ICONS[notification.type] ?? '🔔'

  return (
    <div
      className={`border rounded-xl p-4 ${styleClass} ${
        !notification.read ? 'shadow-sm' : ''
      }`}
      onClick={onRead}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{typeIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-green-500 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
          <p className="text-[10px] text-gray-400 mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  )
}

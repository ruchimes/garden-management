import { Link } from 'react-router-dom'
import { Sprout, BookOpen, Bell, Repeat, Plus, TrendingUp } from 'lucide-react'
import { useAppContext } from '../store/AppContext'
import { VEGETABLES } from '../data/vegetables'

export default function HomePage() {
  const { state } = useAppContext()
  const activeCrops = state.plantedCrops.filter(c => c.isActive)
  const unreadNotifications = state.notifications.filter(n => !n.read).length

  const currentMonth = new Date().getMonth() + 1
  const sowableNow = VEGETABLES.filter(v => v.sowingMonths.includes(currentMonth))
  const harvestableNow = VEGETABLES.filter(v => v.harvestMonths.includes(currentMonth))

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          🌿 Bienvenido a HuertoApp
        </h1>
        <p className="text-green-100 text-sm md:text-base mb-4">
          Tu asistente para la agricultura ecológica con rotación de cultivos
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/gardens"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors"
          >
            <Plus size={16} />
            Crear huerto
          </Link>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-green-500/30 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-500/50 transition-colors border border-green-400/30"
          >
            <BookOpen size={16} />
            Ver catálogo
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Sprout size={20} />} label="Huertos" value={state.gardens.length} color="bg-green-50 text-green-700" />
        <StatCard icon={<TrendingUp size={20} />} label="Cultivos activos" value={activeCrops.length} color="bg-emerald-50 text-emerald-700" />
        <StatCard icon={<Bell size={20} />} label="Alertas sin leer" value={unreadNotifications} color="bg-amber-50 text-amber-700" />
        <StatCard icon={<Repeat size={20} />} label="Variedades" value={VEGETABLES.length} color="bg-blue-50 text-blue-700" />
      </div>

      {/* What to sow now */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          🌱 Qué sembrar este mes
        </h2>
        {sowableNow.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay hortalizas para sembrar este mes.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sowableNow.map(v => (
              <Link
                key={v.id}
                to={`/catalog/${v.id}`}
                className="inline-flex items-center gap-1 bg-lime-50 border border-lime-200 text-lime-800 px-3 py-1.5 rounded-full text-sm hover:bg-lime-100 transition-colors"
              >
                <span>{v.icon}</span>
                {v.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* What to harvest now */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          🧺 Qué cosechar este mes
        </h2>
        {harvestableNow.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay hortalizas para cosechar este mes.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {harvestableNow.map(v => (
              <Link
                key={v.id}
                to={`/catalog/${v.id}`}
                className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-full text-sm hover:bg-amber-100 transition-colors"
              >
                <span>{v.icon}</span>
                {v.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Active crops summary */}
      {activeCrops.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            🌿 Tus cultivos activos
          </h2>
          <div className="space-y-2">
            {activeCrops.slice(0, 5).map(crop => {
              const veg = VEGETABLES.find(v => v.id === crop.vegetableId)
              const garden = state.gardens.find(g => g.id === crop.gardenId)
              return (
                <Link
                  key={crop.id}
                  to={`/gardens/${crop.gardenId}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{veg?.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{veg?.name}</p>
                      <p className="text-xs text-gray-500">{garden?.name}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">
                    {crop.currentStage}
                  </span>
                </Link>
              )
            })}
            {activeCrops.length > 5 && (
              <Link to="/gardens" className="block text-center text-sm text-green-600 hover:text-green-700 font-medium mt-2">
                Ver todos ({activeCrops.length})
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-4 ${color} border border-current/10`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}

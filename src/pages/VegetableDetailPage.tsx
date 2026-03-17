import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Sun, Droplets, BarChart3, Clock, Users, Ban } from 'lucide-react'
import { VEGETABLES } from '../data/vegetables'
import { useAppContext } from '../store/AppContext'

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export default function VegetableDetailPage() {
  const { vegetableId } = useParams<{ vegetableId: string }>()
  const { state } = useAppContext()
  const allVegetables = [...VEGETABLES, ...state.customVegetables]
  const veg = allVegetables.find(v => v.id === vegetableId)

  if (!veg) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Hortaliza no encontrada</p>
        <Link to="/catalog" className="text-green-600 hover:underline mt-2 inline-block">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const currentMonth = new Date().getMonth() + 1
  const companions = veg.companionPlants
    .map(id => allVegetables.find(v => v.id === id))
    .filter(Boolean)
  const incompatibles = veg.incompatiblePlants
    .map(id => allVegetables.find(v => v.id === id))
    .filter(Boolean)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        to="/catalog"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-6xl">{veg.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{veg.name}</h1>
            <p className="text-sm text-gray-500 capitalize">Familia: {veg.family}</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{veg.description}</p>
      </div>

      {/* Properties */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200">
          <Sun size={20} className="mx-auto text-yellow-600 mb-1" />
          <p className="text-xs font-semibold text-yellow-800">{veg.sunRequirement}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
          <Droplets size={20} className="mx-auto text-blue-600 mb-1" />
          <p className="text-xs font-semibold text-blue-800">Riego {veg.waterRequirement}</p>
        </div>
        <div className={`rounded-xl p-3 text-center border ${
          veg.difficulty === 'fácil'
            ? 'bg-green-50 border-green-200'
            : veg.difficulty === 'medio'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <BarChart3 size={20} className={`mx-auto mb-1 ${
            veg.difficulty === 'fácil'
              ? 'text-green-600'
              : veg.difficulty === 'medio'
              ? 'text-amber-600'
              : 'text-red-600'
          }`} />
          <p className={`text-xs font-semibold ${
            veg.difficulty === 'fácil'
              ? 'text-green-800'
              : veg.difficulty === 'medio'
              ? 'text-amber-800'
              : 'text-red-800'
          }`}>{veg.difficulty}</p>
        </div>
      </div>

      {/* Timing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Clock size={18} /> Tiempos
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Germinación</p>
            <p className="font-bold text-gray-800">{veg.daysToGerminate} días</p>
          </div>
          {veg.daysToTransplant > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Trasplante</p>
              <p className="font-bold text-gray-800">{veg.daysToTransplant} días</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Floración</p>
            <p className="font-bold text-gray-800">{veg.daysToFlowering} días</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Cosecha</p>
            <p className="font-bold text-gray-800">{veg.daysToHarvest} días</p>
          </div>
        </div>
      </div>

      {/* Sowing/Harvest calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📅 Calendario</h2>
        <div className="grid grid-cols-12 gap-1 mb-2">
          {MONTH_NAMES.map((m, idx) => (
            <div key={m} className={`text-center text-[10px] font-medium ${
              idx + 1 === currentMonth ? 'text-green-700' : 'text-gray-500'
            }`}>
              {m}
            </div>
          ))}
        </div>

        {/* Sowing */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs w-16 text-gray-600 font-medium">Siembra</span>
          <div className="grid grid-cols-12 gap-1 flex-1">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`h-4 rounded-sm ${
                  veg.sowingMonths.includes(i + 1)
                    ? i + 1 === currentMonth ? 'bg-lime-500' : 'bg-lime-300'
                    : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Harvest */}
        <div className="flex items-center gap-2">
          <span className="text-xs w-16 text-gray-600 font-medium">Cosecha</span>
          <div className="grid grid-cols-12 gap-1 flex-1">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={`h-4 rounded-sm ${
                  veg.harvestMonths.includes(i + 1)
                    ? i + 1 === currentMonth ? 'bg-amber-500' : 'bg-amber-300'
                    : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Companions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Users size={18} /> Asociaciones
        </h2>

        {companions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-green-700 mb-2">✅ Buenos compañeros</h3>
            <div className="flex flex-wrap gap-2">
              {companions.map(c => (
                <Link
                  key={c!.id}
                  to={`/catalog/${c!.id}`}
                  className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 px-3 py-1 rounded-full text-sm hover:bg-green-100 transition-colors"
                >
                  {c!.icon} {c!.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {incompatibles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
              <Ban size={14} /> Incompatibles
            </h3>
            <div className="flex flex-wrap gap-2">
              {incompatibles.map(c => (
                <Link
                  key={c!.id}
                  to={`/catalog/${c!.id}`}
                  className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-800 px-3 py-1 rounded-full text-sm hover:bg-red-100 transition-colors"
                >
                  {c!.icon} {c!.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-green-50 rounded-xl border border-green-200 p-4 md:p-6">
        <h2 className="text-lg font-bold text-green-800 mb-3">💡 Consejos de cultivo ecológico</h2>
        <ul className="space-y-2">
          {veg.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
              <span className="mt-0.5">🌿</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

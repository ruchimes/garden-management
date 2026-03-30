import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, X } from 'lucide-react'
import { VEGETABLES } from '../data/vegetables'
import { useAppContext } from '../store/AppContext'
import AddVegetableModal from '../components/AddVegetableModal'
import type { CropFamily } from '../types'

const FAMILIES: CropFamily[] = [
  'solanáceas', 'cucurbitáceas', 'leguminosas', 'crucíferas',
  'liliáceas', 'umbelíferas', 'compuestas', 'quenopodiáceas',
]

const DIFFICULTIES = ['fácil', 'medio', 'difícil'] as const

export default function CatalogPage() {
  const { state } = useAppContext()
  const [search, setSearch] = useState('')
  const [familyFilter, setFamilyFilter] = useState<CropFamily | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const currentMonth = new Date().getMonth() + 1
  const allVegetables = [...VEGETABLES, ...state.customVegetables]

  const filtered = allVegetables.filter(v => {
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
    if (familyFilter && v.family !== familyFilter) return false
    if (difficultyFilter && v.difficulty !== difficultyFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {showAddModal && <AddVegetableModal onClose={() => setShowAddModal(false)} />}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-800">📖 Catálogo de Hortalizas</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          <Plus size={15} />
          Añadir hortaliza
        </button>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar hortalizas..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
        >
          <Filter size={14} />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>

        {showFilters && (
          <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Familia</label>
              <select
                value={familyFilter}
                onChange={e => setFamilyFilter(e.target.value as CropFamily | '')}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Todas</option>
                {FAMILIES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dificultad</label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Todas</option>
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            {(familyFilter || difficultyFilter) && (
              <button
                onClick={() => { setFamilyFilter(''); setDifficultyFilter('') }}
                className="self-end text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <p className="text-sm text-gray-500">{filtered.length} hortalizas encontradas</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(veg => {
          const canSowNow = veg.sowingMonths.includes(currentMonth)
          const canHarvestNow = veg.harvestMonths.includes(currentMonth)

          return (
            <Link
              key={veg.id}
              to={`/catalog/${veg.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-green-300 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-4xl">{veg.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                    {veg.name}
                  </h3>
                  <p className="text-xs text-gray-500 capitalize">{veg.family}</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{veg.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
                  ☀️ {veg.sunRequirement}
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  💧 {veg.waterRequirement}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  veg.difficulty === 'fácil'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : veg.difficulty === 'medio'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  📊 {veg.difficulty}
                </span>
                <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                  🕐 {veg.daysToHarvest}d cosecha
                </span>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {canSowNow && (
                  <span className="text-[10px] bg-lime-100 text-lime-800 px-2 py-0.5 rounded-full font-medium">
                    🌱 Siembra ahora
                  </span>
                )}
                {canHarvestNow && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                    🧺 Cosecha ahora
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

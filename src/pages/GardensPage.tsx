import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Trash2, Sprout } from 'lucide-react'
import { useAppContext } from '../store/AppContext'
import { VEGETABLES } from '../data/vegetables'

export default function GardensPage() {
  const { state, dispatch } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [bedCount, setBedCount] = useState(4)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const beds = Array.from({ length: bedCount }, (_, i) => ({
      name: `Bancal ${i + 1}`,
      cropHistory: [] as string[],
    }))

    dispatch({
      type: 'ADD_GARDEN',
      payload: { name, description, location, beds: beds.map(b => ({ ...b, id: '' })) },
    })

    setName('')
    setDescription('')
    setLocation('')
    setBedCount(4)
    setShowForm(false)
  }

  function handleDelete(gardenId: string) {
    if (confirm('¿Estás seguro de eliminar este huerto y todos sus cultivos?')) {
      dispatch({ type: 'DELETE_GARDEN', payload: gardenId })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🌱 Mis Huertos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
        >
          <Plus size={16} />
          Nuevo huerto
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-800">Crear nuevo huerto</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Huerto del jardín"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe tu huerto..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej: Terraza, Jardín trasero..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de bancales</label>
              <input
                type="number"
                value={bedCount}
                onChange={e => setBedCount(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={20}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
            >
              Crear huerto
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Garden list */}
      {state.gardens.length === 0 ? (
        <div className="text-center py-12">
          <Sprout className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            No tienes huertos aún
          </h2>
          <p className="text-gray-500 mb-4">
            Crea tu primer huerto para empezar a gestionar tus cultivos
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Crear mi primer huerto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.gardens.map(garden => {
            const gardenCrops = state.plantedCrops.filter(
              c => c.gardenId === garden.id && c.isActive
            )
            return (
              <Link
                key={garden.id}
                to={`/gardens/${garden.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-green-300 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                      {garden.name}
                    </h3>
                    {garden.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {garden.location}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDelete(garden.id)
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Eliminar huerto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {garden.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {garden.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{garden.beds.length} bancales</span>
                  <span>{gardenCrops.length} cultivos activos</span>
                </div>

                {/* Mini crop icons */}
                {gardenCrops.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {gardenCrops.slice(0, 8).map(c => {
                      const veg = VEGETABLES.find(v => v.id === c.vegetableId)
                      return (
                        <span key={c.id} className="text-lg" title={veg?.name}>
                          {veg?.icon}
                        </span>
                      )
                    })}
                    {gardenCrops.length > 8 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{gardenCrops.length - 8}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

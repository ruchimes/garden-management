import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, ChevronRight, StickyNote } from 'lucide-react'
import { useAppContext } from '../store/AppContext'
import { VEGETABLES, GROWTH_STAGES, getRotationRecommendation } from '../data/vegetables'
import StageTimeline from '../components/StageTimeline'
import type { CropFamily, GrowthStage } from '../types'

export default function GardenDetailPage() {
  const { gardenId } = useParams<{ gardenId: string }>()
  const { state, dispatch } = useAppContext()
  const garden = state.gardens.find(g => g.id === gardenId)
  const allVegetables = [...VEGETABLES, ...state.customVegetables]

  const [selectedBedIndex, setSelectedBedIndex] = useState<number | null>(null)
  const [showPlantForm, setShowPlantForm] = useState(false)
  const [selectedVegetableId, setSelectedVegetableId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showCropDetail, setShowCropDetail] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  if (!garden) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Huerto no encontrado</p>
        <Link to="/gardens" className="text-green-600 hover:underline mt-2 inline-block">
          Volver a mis huertos
        </Link>
      </div>
    )
  }

  const gardenCrops = state.plantedCrops.filter(c => c.gardenId === garden.id)
  const activeCrops = gardenCrops.filter(c => c.isActive)

  function handlePlant(e: React.FormEvent) {
    e.preventDefault()
    if (selectedBedIndex === null || !selectedVegetableId) return

    dispatch({
      type: 'PLANT_CROP',
      payload: {
        vegetableId: selectedVegetableId,
        gardenId: garden!.id,
        bedIndex: selectedBedIndex,
        plantedDate: new Date().toISOString(),
        currentStage: 'semillero' as GrowthStage,
        notes: '',
        quantity,
      },
    })

    setShowPlantForm(false)
    setSelectedVegetableId('')
    setQuantity(1)
  }

  function handleAdvanceStage(cropId: string) {
    dispatch({ type: 'ADVANCE_STAGE', payload: { cropId } })
  }

  function handleSaveNotes(cropId: string) {
    dispatch({ type: 'UPDATE_CROP_NOTES', payload: { cropId, notes: noteText } })
  }

  // Get rotation recommendation for the selected bed
  function getBedRecommendation(bedIndex: number): CropFamily[] {
    const bed = garden!.beds[bedIndex]
    if (!bed) return []
    const previousFamilies = bed.cropHistory
      .map(vegId => allVegetables.find(v => v.id === vegId)?.family)
      .filter((f): f is CropFamily => !!f)
    return getRotationRecommendation(previousFamilies)
  }

  const detailCrop = showCropDetail
    ? gardenCrops.find(c => c.id === showCropDetail)
    : null
  const detailVeg = detailCrop
    ? allVegetables.find(v => v.id === detailCrop.vegetableId)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/gardens"
          className="text-gray-500 hover:text-green-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{garden.name}</h1>
          {garden.location && (
            <p className="text-sm text-gray-500">📍 {garden.location}</p>
          )}
        </div>
      </div>

      {garden.description && (
        <p className="text-gray-600 text-sm bg-white rounded-lg p-3 border border-gray-100">
          {garden.description}
        </p>
      )}

      {/* Beds overview */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🌾 Bancales</h2>
          <button
            onClick={() => {
              setSelectedBedIndex(0)
              setShowPlantForm(true)
            }}
            className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus size={14} />
            Plantar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {garden.beds.map((bed, idx) => {
            const bedCrops = activeCrops.filter(c => c.bedIndex === idx)
            return (
              <div
                key={bed.id || idx}
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
                  selectedBedIndex === idx
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50 hover:border-green-300'
                }`}
                onClick={() => setSelectedBedIndex(idx)}
              >
                <h3 className="font-semibold text-sm text-gray-700 mb-2">
                  {bed.name}
                </h3>
                {bedCrops.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Sin cultivos</p>
                ) : (
                  <div className="space-y-1.5">
                    {bedCrops.map(crop => {
                      const veg = allVegetables.find(v => v.id === crop.vegetableId)
                      const stageInfo = GROWTH_STAGES.find(
                        s => s.id === crop.currentStage
                      )
                      return (
                        <div
                          key={crop.id}
                          onClick={e => {
                            e.stopPropagation()
                            setShowCropDetail(crop.id)
                            setNoteText(crop.notes)
                          }}
                          className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5 border border-gray-100 hover:border-green-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{veg?.icon}</span>
                            <div>
                              <p className="text-xs font-medium text-gray-700">
                                {veg?.name} ×{crop.quantity}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {stageInfo?.icon} {stageInfo?.name}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      )
                    })}
                  </div>
                )}
                {bed.cropHistory.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    Historial: {bed.cropHistory.map(id => allVegetables.find(v => v.id === id)?.icon).join(' ')}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Planting form modal */}
      {showPlantForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🌱 Plantar cultivo</h2>

            <form onSubmit={handlePlant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bancal</label>
                <select
                  value={selectedBedIndex ?? 0}
                  onChange={e => setSelectedBedIndex(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {garden.beds.map((bed, idx) => (
                    <option key={idx} value={idx}>{bed.name}</option>
                  ))}
                </select>
              </div>

              {/* Rotation recommendation */}
              {selectedBedIndex !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1">
                    🔄 Recomendación de rotación:
                  </p>
                  <p className="text-xs text-blue-700">
                    Familias recomendadas:{' '}
                    {getBedRecommendation(selectedBedIndex).join(', ') || 'Cualquiera'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hortaliza</label>
                <select
                  value={selectedVegetableId}
                  onChange={e => setSelectedVegetableId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  required
                >
                  <option value="">Selecciona una hortaliza...</option>
                  {allVegetables.map(v => {
                    const recommended =
                      selectedBedIndex !== null &&
                      getBedRecommendation(selectedBedIndex).includes(v.family)
                    return (
                      <option key={v.id} value={v.id}>
                        {v.icon} {v.name} ({v.family})
                        {recommended ? ' ✓ Recomendada' : ''}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Selected veggie info */}
              {selectedVegetableId && (
                <VeggieQuickInfo vegetableId={selectedVegetableId} />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                >
                  🌱 Plantar
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlantForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crop detail modal */}
      {detailCrop && detailVeg && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{detailVeg.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{detailVeg.name}</h2>
                  <p className="text-xs text-gray-500">
                    Plantado: {new Date(detailCrop.plantedDate).toLocaleDateString('es-ES')}
                    {' · '}Cantidad: {detailCrop.quantity}
                  </p>
                </div>
              </div>
            </div>

            {/* Stage timeline */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Progreso</h3>
              <StageTimeline currentStage={detailCrop.currentStage} />
            </div>

            {/* Advance button */}
            {detailCrop.isActive && detailCrop.currentStage !== 'cosecha' && (
              <button
                onClick={() => {
                  handleAdvanceStage(detailCrop.id)
                  setShowCropDetail(null)
                }}
                className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors mb-3"
              >
                ⏩ Avanzar a siguiente etapa
              </button>
            )}

            {detailCrop.currentStage === 'cosecha' && detailCrop.isActive && (
              <button
                onClick={() => {
                  dispatch({ type: 'FINISH_CROP', payload: detailCrop.id })
                  setShowCropDetail(null)
                }}
                className="w-full bg-amber-500 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-amber-600 transition-colors mb-3"
              >
                ✅ Marcar como finalizado
              </button>
            )}

            {/* Notes */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <StickyNote size={14} /> Notas
              </h3>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Añade notas sobre este cultivo..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
              <button
                onClick={() => handleSaveNotes(detailCrop.id)}
                className="mt-1 text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Guardar notas
              </button>
            </div>

            {/* Stage history */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Historial de fases</h3>
              <div className="space-y-1">
                {detailCrop.stageHistory.map((record, idx) => {
                  const stageInfo = GROWTH_STAGES.find(s => s.id === record.stage)
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span>{stageInfo?.icon}</span>
                      <span className="font-medium">{stageInfo?.name}</span>
                      <span className="text-gray-400">
                        {new Date(record.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <h3 className="text-sm font-semibold text-green-800 mb-1">💡 Consejos</h3>
              <ul className="text-xs text-green-700 space-y-1">
                {detailVeg.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowCropDetail(null)}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* All crops list */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📋 Todos los cultivos</h2>

        {gardenCrops.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay cultivos plantados aún.</p>
        ) : (
          <div className="space-y-2">
            {gardenCrops.map(crop => {
              const veg = allVegetables.find(v => v.id === crop.vegetableId)
              return (
                <div
                  key={crop.id}
                  onClick={() => {
                    setShowCropDetail(crop.id)
                    setNoteText(crop.notes)
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:border-green-300 ${
                    crop.isActive
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{veg?.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {veg?.name} ×{crop.quantity}
                        {!crop.isActive && (
                          <span className="ml-2 text-xs text-gray-400">(Finalizado)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <StageTimeline currentStage={crop.currentStage} compact />
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function VeggieQuickInfo({ vegetableId }: { vegetableId: string }) {
  const { state } = useAppContext()
  const allVegetables = [...VEGETABLES, ...state.customVegetables]
  const veg = allVegetables.find(v => v.id === vegetableId)
  if (!veg) return null

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-700">{veg.icon} {veg.name} — {veg.family}</p>
      <p className="text-gray-600">{veg.description}</p>
      <div className="flex flex-wrap gap-2 mt-1">
        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">☀️ {veg.sunRequirement}</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">💧 Riego: {veg.waterRequirement}</span>
        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">📊 {veg.difficulty}</span>
      </div>
      <p className="text-gray-500">
        🕐 Germinación: {veg.daysToGerminate}d · Cosecha: {veg.daysToHarvest}d
      </p>
    </div>
  )
}

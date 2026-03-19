import { useState } from 'react'
import { Plus, Trash2, ArrowRight, StickyNote, X } from 'lucide-react'
import { useAppContext } from '../store/AppContext'
import { VEGETABLES, getTransplantDestination, daysUntilTransplantReady } from '../data/vegetables'
import type { Seedling } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function addDays(isoDate: string, days: number): Date {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysRemaining(targetDate: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ── Transplant destination labels ────────────────────────────────────────────

const DESTINATION_LABELS = {
  'bancal': { label: 'Trasplantar a bancal', icon: '🌾', color: 'text-green-700 bg-green-50 border-green-300' },
  'maceta-mayor': { label: 'Pasar a maceta mayor', icon: '🪴', color: 'text-amber-700 bg-amber-50 border-amber-300' },
  'siembra-directa': { label: 'Siembra directa', icon: '🌱', color: 'text-blue-700 bg-blue-50 border-blue-300' },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SeedlingCard({
  seedling,
  onTransplant,
  onRemove,
}: {
  seedling: Seedling
  onTransplant: (seedling: Seedling) => void
  onRemove: (id: string) => void
}) {
  const { state, dispatch } = useAppContext()
  const allVegetables = [...VEGETABLES, ...state.customVegetables]
  const veg = allVegetables.find(v => v.id === seedling.vegetableId)
  const [showNotes, setShowNotes] = useState(false)
  const [noteText, setNoteText] = useState(seedling.notes)

  if (!veg) return null

  const readyDays = daysUntilTransplantReady(veg)
  const germinationDate = addDays(seedling.sowDate, veg.daysToGerminate)
  const transplantDate = addDays(seedling.sowDate, readyDays)
  const daysLeft = daysRemaining(transplantDate)
  const germDaysLeft = daysRemaining(germinationDate)
  const destination = getTransplantDestination(veg)
  const destInfo = DESTINATION_LABELS[destination]

  const isReady = daysLeft <= 0
  const hasGerminated = germDaysLeft <= 0
  const progressPct = Math.min(100, Math.max(0, Math.round(
    ((readyDays - Math.max(0, daysLeft)) / readyDays) * 100
  )))

  return (
    <div className={`border-2 rounded-xl p-4 transition-all ${
      isReady
        ? 'border-green-500 bg-green-50 shadow-md shadow-green-100'
        : 'border-gray-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{veg.icon}</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{veg.name}</p>
            <p className="text-xs text-gray-500">
              {seedling.quantity} {seedling.quantity === 1 ? 'planta' : 'plantas'} ·{' '}
              Sembrado el {new Date(seedling.sowDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
        {isReady && (
          <span className="flex-shrink-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            ✓ LISTO
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>🌱 Siembra</span>
          <span>🪴 Trasplante</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-green-500' : 'bg-lime-400'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-500 mt-1 text-center">
          {isReady
            ? '¡Listo para trasplantar!'
            : `Listo para trasplantar el ${formatDate(transplantDate)} (${daysLeft} días)`}
        </p>
      </div>

      {/* Milestones */}
      <div className="space-y-1 mb-3 text-xs">
        <div className={`flex items-center gap-2 ${hasGerminated ? 'text-green-700' : 'text-gray-500'}`}>
          <span>{hasGerminated ? '✅' : '⏳'}</span>
          <span>
            Germinación estimada: {formatDate(germinationDate)}
            {!hasGerminated && germDaysLeft > 0 && ` (${germDaysLeft} días)`}
          </span>
        </div>
        <div className={`flex items-center gap-2 ${isReady ? 'text-green-700 font-semibold' : 'text-gray-500'}`}>
          <span>{isReady ? '✅' : '⏳'}</span>
          <span>
            Listo para trasplantar: {formatDate(transplantDate)}
          </span>
        </div>
      </div>

      {/* Destination badge */}
      <div className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border mb-3 ${destInfo.color}`}>
        <span>{destInfo.icon}</span>
        <span>{destInfo.label}</span>
        {destination === 'maceta-mayor' && (
          <span className="text-[10px] opacity-75 ml-1">— requiere adaptación</span>
        )}
      </div>

      {/* Notes toggle */}
      {showNotes && (
        <div className="mb-3">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Notas sobre esta siembra..."
            rows={2}
            className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-green-500 outline-none resize-none"
          />
          <button
            onClick={() => {
              dispatch({ type: 'UPDATE_SEEDLING_NOTES', payload: { seedlingId: seedling.id, notes: noteText } })
              setShowNotes(false)
            }}
            className="text-[10px] text-green-600 hover:text-green-700 font-medium mt-0.5"
          >
            Guardar notas
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        {isReady ? (
          <button
            onClick={() => onTransplant(seedling)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowRight size={13} />
            Trasplantar ahora
          </button>
        ) : (
          <button
            onClick={() => onTransplant(seedling)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowRight size={13} />
            Trasplantar antes de tiempo
          </button>
        )}
        <button
          onClick={() => setShowNotes(v => !v)}
          className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Notas"
        >
          <StickyNote size={15} />
        </button>
        <button
          onClick={() => onRemove(seedling.id)}
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Transplant modal ──────────────────────────────────────────────────────────

function TransplantModal({
  seedling,
  onClose,
}: {
  seedling: Seedling
  onClose: () => void
}) {
  const { state, dispatch } = useAppContext()
  const allVegetables = [...VEGETABLES, ...state.customVegetables]
  const veg = allVegetables.find(v => v.id === seedling.vegetableId)

  const [selectedGardenId, setSelectedGardenId] = useState(state.gardens[0]?.id ?? '')
  const [selectedBedIdx, setSelectedBedIdx] = useState(0)
  const [qty, setQty] = useState(seedling.quantity)

  const selectedGarden = state.gardens.find(g => g.id === selectedGardenId)

  // Free beds: not occupied by any active crop
  const freeBeds = selectedGarden?.beds.filter((_, idx) =>
    !state.plantedCrops.some(c => c.gardenId === selectedGardenId && c.bedIndex === idx && c.isActive)
  ) ?? []

  const destination = veg ? getTransplantDestination(veg) : 'bancal'
  const destInfo = DESTINATION_LABELS[destination]

  function handleConfirm() {
    if (!selectedGardenId || !selectedGarden) return
    const actualBedIdx = selectedGarden.beds.findIndex((_, i) => {
      const freeBed = freeBeds[selectedBedIdx]
      return selectedGarden.beds[i] === freeBed
    })
    if (actualBedIdx === -1) return
    dispatch({
      type: 'TRANSPLANT_SEEDLING',
      payload: {
        seedlingId: seedling.id,
        gardenId: selectedGardenId,
        bedIndex: actualBedIdx,
        quantity: qty,
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🪴 Trasplantar al huerto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {veg && (
          <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl p-3">
            <span className="text-3xl">{veg.icon}</span>
            <div>
              <p className="font-semibold text-sm text-gray-800">{veg.name}</p>
              <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg border mt-0.5 ${destInfo.color}`}>
                <span>{destInfo.icon}</span>
                <span>{destInfo.label}</span>
              </div>
            </div>
          </div>
        )}

        {destination === 'maceta-mayor' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-800">
            <p className="font-semibold mb-0.5">⚠️ Recomendación</p>
            <p>
              Las {veg?.family} como {veg?.name} se benefician de pasar primero a una maceta
              mayor (p.ej. 10–15 cm de diámetro) durante 1–2 semanas antes del bancal definitivo.
              Trasplanta aquí cuando ya estés listo para el bancal.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Huerto</label>
            <select
              value={selectedGardenId}
              onChange={e => { setSelectedGardenId(e.target.value); setSelectedBedIdx(0) }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              {state.gardens.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bancal libre
              {freeBeds.length === 0 && (
                <span className="ml-2 text-xs text-red-500 font-normal">— no hay bancales libres</span>
              )}
            </label>
            <select
              value={selectedBedIdx}
              onChange={e => setSelectedBedIdx(parseInt(e.target.value))}
              disabled={freeBeds.length === 0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
            >
              {freeBeds.map((bed, idx) => (
                <option key={bed.id} value={idx}>{bed.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad a trasplantar
            </label>
            <input
              type="number"
              min={1}
              max={seedling.quantity}
              value={qty}
              onChange={e => setQty(Math.min(seedling.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleConfirm}
            disabled={freeBeds.length === 0 || !selectedGardenId}
            className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🪴 Trasplantar
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add seedling form ─────────────────────────────────────────────────────────

function AddSeedlingForm({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useAppContext()
  const allVegetables = [...VEGETABLES, ...state.customVegetables]

  // Only show vegetables that benefit from a seedling tray
  const seedlingVegetables = allVegetables.filter(v => v.daysToTransplant > 0)

  const [vegetableId, setVegetableId] = useState('')
  const [quantity, setQuantity] = useState(6)
  const [sowDate, setSowDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const selectedVeg = allVegetables.find(v => v.id === vegetableId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vegetableId) return
    dispatch({
      type: 'ADD_SEEDLING',
      payload: { vegetableId, quantity, sowDate: new Date(sowDate).toISOString(), notes },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">🌱 Nueva siembra en semillero</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hortaliza</label>
            <select
              value={vegetableId}
              onChange={e => setVegetableId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Selecciona una hortaliza...</option>
              {seedlingVegetables.map(v => (
                <option key={v.id} value={v.id}>
                  {v.icon} {v.name} — {v.family}
                </option>
              ))}
            </select>
          </div>

          {selectedVeg && (
            <div className="bg-lime-50 border border-lime-200 rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold text-lime-800">{selectedVeg.icon} {selectedVeg.name}</p>
              <p className="text-lime-700">🕐 Germinación: ~{selectedVeg.daysToGerminate} días</p>
              <p className="text-lime-700">🪴 Listo para trasplantar en: ~{daysUntilTransplantReady(selectedVeg)} días totales</p>
              {(() => {
                const dest = getTransplantDestination(selectedVeg)
                const di = DESTINATION_LABELS[dest]
                return (
                  <p className="text-lime-700">{di.icon} {di.label}</p>
                )
              })()}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de plantas</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de siembra</label>
            <input
              type="date"
              value={sowDate}
              onChange={e => setSowDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Variedad, sustrato usado, etc."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
            >
              🌱 Añadir al semillero
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main SeedlingTray component ───────────────────────────────────────────────

export default function SeedlingTray() {
  const { state, dispatch } = useAppContext()
  const [showAddForm, setShowAddForm] = useState(false)
  const [transplantSeedling, setTransplantSeedling] = useState<Seedling | null>(null)

  const activeSeedlings = state.seedlings.filter(s => s.isActive)

  // Sort: ready first, then by transplant date
  const allVegetables = [...VEGETABLES, ...state.customVegetables]
  const sortedSeedlings = [...activeSeedlings].sort((a, b) => {
    const vegA = allVegetables.find(v => v.id === a.vegetableId)
    const vegB = allVegetables.find(v => v.id === b.vegetableId)
    const daysA = vegA ? daysUntilTransplantReady(vegA) : 999
    const daysB = vegB ? daysUntilTransplantReady(vegB) : 999
    const dateA = addDays(a.sowDate, daysA).getTime()
    const dateB = addDays(b.sowDate, daysB).getTime()
    return dateA - dateB
  })

  const readyCount = sortedSeedlings.filter(s => {
    const veg = allVegetables.find(v => v.id === s.vegetableId)
    if (!veg) return false
    return daysRemaining(addDays(s.sowDate, daysUntilTransplantReady(veg))) <= 0
  }).length

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">🌱 Semillero</h2>
          {readyCount > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {readyCount} listo{readyCount > 1 ? 's' : ''}
            </span>
          )}
          {activeSeedlings.length > 0 && readyCount === 0 && (
            <span className="bg-lime-100 text-lime-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {activeSeedlings.length} en curso
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1 bg-lime-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-lime-700 transition-colors"
        >
          <Plus size={14} />
          Sembrar
        </button>
      </div>

      {/* Empty state */}
      {activeSeedlings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🌱</p>
          <p className="text-gray-500 text-sm font-medium">El semillero está vacío</p>
          <p className="text-gray-400 text-xs mt-1">
            Siembra tus semillas aquí y te avisaremos cuando estén listas para trasplantar
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 inline-flex items-center gap-1.5 bg-lime-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-lime-700 transition-colors"
          >
            <Plus size={14} />
            Añadir primera siembra
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedSeedlings.map(seedling => (
            <SeedlingCard
              key={seedling.id}
              seedling={seedling}
              onTransplant={setTransplantSeedling}
              onRemove={id => dispatch({ type: 'REMOVE_SEEDLING', payload: id })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddForm && <AddSeedlingForm onClose={() => setShowAddForm(false)} />}
      {transplantSeedling && (
        <TransplantModal
          seedling={transplantSeedling}
          onClose={() => setTransplantSeedling(null)}
        />
      )}
    </section>
  )
}

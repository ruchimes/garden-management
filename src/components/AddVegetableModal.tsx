import { useState } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useAppContext } from '../store/AppContext'
import type { CropFamily, Vegetable } from '../types'

interface Props {
  onClose: () => void
}

const FAMILIES: { value: CropFamily; label: string }[] = [
  { value: 'solanáceas',     label: '🍅 Solanáceas' },
  { value: 'cucurbitáceas',  label: '🥒 Cucurbitáceas' },
  { value: 'leguminosas',    label: '🫘 Leguminosas' },
  { value: 'crucíferas',     label: '🥦 Crucíferas' },
  { value: 'liliáceas',      label: '🧅 Liliáceas' },
  { value: 'umbelíferas',    label: '🥕 Umbelíferas' },
  { value: 'compuestas',     label: '🥬 Compuestas' },
  { value: 'quenopodiáceas', label: '🌿 Quenopodiáceas' },
]

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const BLANK: {
  name: string; icon: string; family: CropFamily; description: string
  sowingMonths: number[]; harvestMonths: number[]
  daysToGerminate: number; daysToHarvest: number
  sunRequirement: Vegetable['sunRequirement']
  waterRequirement: Vegetable['waterRequirement']
  difficulty: Vegetable['difficulty']
  tips: string
} = {
  name: '', icon: '🌱', family: 'solanáceas', description: '',
  sowingMonths: [], harvestMonths: [],
  daysToGerminate: 10, daysToHarvest: 90,
  sunRequirement: 'pleno sol', waterRequirement: 'medio', difficulty: 'medio',
  tips: '',
}

export default function AddVegetableModal({ onClose }: Props) {
  const { state, dispatch } = useAppContext()
  const [form, setForm] = useState(BLANK)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  function toggleMonth(month: number, type: 'sowing' | 'harvest') {
    const key = type === 'sowing' ? 'sowingMonths' : 'harvestMonths'
    setForm(f => {
      const months = f[key]
      return {
        ...f,
        [key]: months.includes(month)
          ? months.filter(m => m !== month)
          : [...months, month].sort((a, b) => a - b),
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!form.name.trim()) errs.push('El nombre es obligatorio.')
    if (form.sowingMonths.length === 0) errs.push('Selecciona al menos un mes de siembra.')
    if (form.harvestMonths.length === 0) errs.push('Selecciona al menos un mes de cosecha.')
    if (errs.length) { setErrors(errs); return }

    const newVeg: Vegetable = {
      id: uuidv4(),
      name: form.name.trim(),
      icon: form.icon || '🌱',
      family: form.family,
      description: form.description.trim(),
      sowingMonths: form.sowingMonths,
      harvestMonths: form.harvestMonths,
      daysToGerminate: form.daysToGerminate,
      daysToTransplant: Math.round(form.daysToGerminate * 2),
      daysToFlowering: Math.round(form.daysToHarvest * 0.6),
      daysToHarvest: form.daysToHarvest,
      companionPlants: [], incompatiblePlants: [],
      sunRequirement: form.sunRequirement,
      waterRequirement: form.waterRequirement,
      difficulty: form.difficulty,
      tips: form.tips.split('\n').map(t => t.trim()).filter(Boolean),
    }
    dispatch({ type: 'ADD_CUSTOM_VEGETABLE', payload: newVeg })
    setForm(BLANK)
    setErrors([])
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Plus size={20} className="text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">Añadir hortaliza</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Nombre + icono */}
          <div className="flex gap-3">
            <div className="w-20">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Icono</label>
              <input
                type="text"
                value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                maxLength={2}
                className="w-full text-center text-3xl border border-gray-200 rounded-xl py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="🌱"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Alcachofa"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          {/* Familia */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Familia botánica</label>
            <select
              value={form.family}
              onChange={e => setForm(f => ({ ...f, family: e.target.value as CropFamily }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
            >
              {FAMILIES.map(fam => (
                <option key={fam.value} value={fam.value}>{fam.label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Breve descripción de la hortaliza..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
            />
          </div>

          {/* Meses de siembra */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Meses de siembra <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {MONTH_NAMES.map((m, i) => {
                const month = i + 1
                const active = form.sowingMonths.includes(month)
                return (
                  <button key={month} type="button" onClick={() => toggleMonth(month, 'sowing')}
                    className={`text-xs py-1.5 rounded-lg font-medium transition-colors ${active ? 'bg-lime-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {m}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Meses de cosecha */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Meses de cosecha <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {MONTH_NAMES.map((m, i) => {
                const month = i + 1
                const active = form.harvestMonths.includes(month)
                return (
                  <button key={month} type="button" onClick={() => toggleMonth(month, 'harvest')}
                    className={`text-xs py-1.5 rounded-lg font-medium transition-colors ${active ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {m}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Días */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Días germinación</label>
              <input type="number" min={1} max={365} value={form.daysToGerminate}
                onChange={e => setForm(f => ({ ...f, daysToGerminate: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Días a cosecha</label>
              <input type="number" min={1} max={730} value={form.daysToHarvest}
                onChange={e => setForm(f => ({ ...f, daysToHarvest: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
            </div>
          </div>

          {/* Requisitos */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">☀️ Sol</label>
              <select value={form.sunRequirement}
                onChange={e => setForm(f => ({ ...f, sunRequirement: e.target.value as Vegetable['sunRequirement'] }))}
                className="w-full border border-gray-200 rounded-xl px-2 py-2.5 text-xs focus:ring-2 focus:ring-green-500 outline-none bg-white">
                <option value="pleno sol">Pleno sol</option>
                <option value="semi-sombra">Semi-sombra</option>
                <option value="sombra">Sombra</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">💧 Agua</label>
              <select value={form.waterRequirement}
                onChange={e => setForm(f => ({ ...f, waterRequirement: e.target.value as Vegetable['waterRequirement'] }))}
                className="w-full border border-gray-200 rounded-xl px-2 py-2.5 text-xs focus:ring-2 focus:ring-green-500 outline-none bg-white">
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">📊 Dificultad</label>
              <select value={form.difficulty}
                onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Vegetable['difficulty'] }))}
                className="w-full border border-gray-200 rounded-xl px-2 py-2.5 text-xs focus:ring-2 focus:ring-green-500 outline-none bg-white">
                <option value="fácil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="difícil">Difícil</option>
              </select>
            </div>
          </div>

          {/* Consejos */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              💡 Consejos <span className="font-normal text-gray-400">(uno por línea)</span>
            </label>
            <textarea value={form.tips}
              onChange={e => setForm(f => ({ ...f, tips: e.target.value }))}
              rows={3}
              placeholder={"Rota el cultivo cada temporada.\nEvita el exceso de nitrógeno."}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none" />
          </div>

          {/* Errores de validación */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
              {errors.map((e, i) => <p key={i} className="text-sm text-red-700">• {e}</p>)}
            </div>
          )}

          {/* Botón enviar */}
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors">
            {saved
              ? <><Check size={16} /> ¡Añadida al catálogo!</>
              : <><Plus size={16} /> Añadir hortaliza</>}
          </button>

          {/* Hortalizas personalizadas existentes */}
          {state.customVegetables.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Tus hortalizas personalizadas
              </p>
              <div className="space-y-1.5">
                {state.customVegetables.map(veg => (
                  <div key={veg.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm">
                      {veg.icon}{' '}
                      <span className="font-medium">{veg.name}</span>
                      <span className="text-gray-400 text-xs ml-1">({veg.family})</span>
                    </span>
                    <button type="button"
                      onClick={() => dispatch({ type: 'DELETE_CUSTOM_VEGETABLE', payload: veg.id })}
                      className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  )
}

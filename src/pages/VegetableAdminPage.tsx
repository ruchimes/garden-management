import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Save, X, ChevronLeft, Database, Download, Upload, AlertTriangle } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { VEGETABLES } from '../data/vegetables'
import { useAppContext } from '../store/AppContext'
import { DB } from '../db/database'
import type { CropFamily, Vegetable } from '../types'

// ── Constantes ────────────────────────────────────────────────────────────────

const FAMILIES: { value: CropFamily; label: string; desc: string }[] = [
  { value: 'solanáceas',     label: '🍅 Solanáceas',     desc: 'Tomate, pimiento, berenjena, patata' },
  { value: 'cucurbitáceas',  label: '🥒 Cucurbitáceas',  desc: 'Calabacín, pepino, melón, sandía' },
  { value: 'leguminosas',    label: '🫘 Leguminosas',    desc: 'Judía, guisante, haba, lenteja' },
  { value: 'crucíferas',     label: '🥦 Crucíferas',     desc: 'Col, brócoli, coliflor, nabo' },
  { value: 'liliáceas',      label: '🧅 Liliáceas',      desc: 'Cebolla, ajo, puerro' },
  { value: 'umbelíferas',    label: '🥕 Umbelíferas',    desc: 'Zanahoria, apio, perejil, hinojo' },
  { value: 'compuestas',     label: '🥬 Compuestas',     desc: 'Lechuga, escarola, alcachofa' },
  { value: 'quenopodiáceas', label: '🌿 Quenopodiáceas', desc: 'Espinaca, acelga, remolacha' },
]

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const EMPTY_FORM: Omit<Vegetable, 'id'> = {
  name: '',
  icon: '🌱',
  family: 'solanáceas',
  description: '',
  sowingMonths: [],
  harvestMonths: [],
  daysToGerminate: 7,
  daysToTransplant: 21,
  daysToFlowering: 60,
  daysToHarvest: 90,
  companionPlants: [],
  incompatiblePlants: [],
  sunRequirement: 'pleno sol',
  waterRequirement: 'medio',
  difficulty: 'medio',
  tips: [],
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function MonthPicker({
  label, color, selected, onChange,
}: {
  label: string
  color: 'lime' | 'amber'
  selected: number[]
  onChange: (months: number[]) => void
}) {
  function toggle(m: number) {
    onChange(
      selected.includes(m)
        ? selected.filter(x => x !== m)
        : [...selected, m].sort((a, b) => a - b)
    )
  }
  const activeClass = color === 'lime'
    ? 'bg-lime-500 text-white ring-2 ring-lime-400'
    : 'bg-amber-500 text-white ring-2 ring-amber-400'

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
        {MONTH_NAMES.map((m, i) => {
          const month = i + 1
          return (
            <button key={month} type="button" onClick={() => toggle(month)}
              className={`text-xs py-1.5 rounded-lg font-medium transition-all ${selected.includes(month) ? activeClass : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {m}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PlantRelationPicker({
  label, emoji, color, selected, allVegetables, onChange,
}: {
  label: string
  emoji: string
  color: string
  selected: string[]
  allVegetables: Vegetable[]
  onChange: (ids: string[]) => void
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {emoji} {label}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
        {allVegetables.map(v => (
          <button key={v.id} type="button" onClick={() => toggle(v.id)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border transition-all text-left ${selected.includes(v.id) ? `${color} font-semibold` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            <span>{v.icon}</span>
            <span className="truncate">{v.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Formulario principal ──────────────────────────────────────────────────────

function VegetableForm({
  initial,
  allVegetables,
  editingId,
  onSave,
  onCancel,
}: {
  initial: Omit<Vegetable, 'id'>
  allVegetables: Vegetable[]
  editingId: string | null
  onSave: (veg: Vegetable) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Omit<Vegetable, 'id'>>(initial)
  const [tipInput, setTipInput] = useState(initial.tips.join('\n'))
  const [errors, setErrors] = useState<string[]>([])

  // Excluir la hortaliza que se está editando de las listas de compañeras
  const pickableVegs = allVegetables.filter(v => v.id !== editingId)

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function validate(): boolean {
    const errs: string[] = []
    if (!form.name.trim()) errs.push('El nombre es obligatorio.')
    if (form.sowingMonths.length === 0) errs.push('Selecciona al menos un mes de siembra.')
    if (form.harvestMonths.length === 0) errs.push('Selecciona al menos un mes de cosecha.')
    if (form.daysToGerminate <= 0) errs.push('Los días de germinación deben ser > 0.')
    if (form.daysToHarvest <= 0) errs.push('Los días a cosecha deben ser > 0.')
    if (form.daysToHarvest < form.daysToGerminate) errs.push('Los días a cosecha deben ser mayores que los de germinación.')
    setErrors(errs)
    return errs.length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const tips = tipInput.split('\n').map(t => t.trim()).filter(Boolean)
    onSave({ ...form, tips, id: editingId ?? uuidv4() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Identificación básica ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">🪴</span> Identificación
        </h3>

        <div className="flex gap-3">
          <div className="w-24">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Icono</label>
            <input type="text" value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={2}
              className="w-full text-center text-4xl border border-gray-200 rounded-xl py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="🌱" />
            <p className="text-[10px] text-gray-400 mt-1 text-center">Emoji</p>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Ej: Tomate cherry"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Familia botánica <span className="text-red-400">*</span>
              </label>
              <select value={form.family} onChange={e => set('family', e.target.value as CropFamily)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
                {FAMILIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label} — {f.desc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
            placeholder="Descripción breve de la hortaliza, variedad, características principales..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none" />
        </div>
      </section>

      {/* ── Calendario de cultivo ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">📅</span> Calendario de cultivo
        </h3>
        <MonthPicker label="Meses de siembra" color="lime" selected={form.sowingMonths}
          onChange={m => set('sowingMonths', m)} />
        <MonthPicker label="Meses de cosecha" color="amber" selected={form.harvestMonths}
          onChange={m => set('harvestMonths', m)} />
      </section>

      {/* ── Tiempos ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">⏱️</span> Tiempos de desarrollo
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { key: 'daysToGerminate', label: 'Germinación', icon: '🌱', help: 'Días desde siembra hasta que emerge la plántula' },
            { key: 'daysToTransplant', label: 'Trasplante', icon: '🪴', help: 'Días desde siembra hasta que se trasplanta al huerto' },
            { key: 'daysToFlowering', label: 'Floración', icon: '🌸', help: 'Días desde siembra hasta la primera flor' },
            { key: 'daysToHarvest', label: 'Cosecha', icon: '🧺', help: 'Días desde siembra hasta la primera cosecha' },
          ] as const).map(({ key, label, icon, help }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {icon} {label}
              </label>
              <input type="number" min={1} max={730} value={form[key]}
                onChange={e => set(key, Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
              <p className="text-[10px] text-gray-400 mt-0.5">{help}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Condiciones de cultivo ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">🌤️</span> Condiciones de cultivo
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">☀️ Necesidad de sol</label>
            <select value={form.sunRequirement} onChange={e => set('sunRequirement', e.target.value as Vegetable['sunRequirement'])}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="pleno sol">Pleno sol (6-8h/día)</option>
              <option value="semi-sombra">Semi-sombra (3-5h/día)</option>
              <option value="sombra">Sombra (&lt;3h/día)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">💧 Necesidad de agua</label>
            <select value={form.waterRequirement} onChange={e => set('waterRequirement', e.target.value as Vegetable['waterRequirement'])}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="alto">Alta — riego frecuente</option>
              <option value="medio">Media — riego moderado</option>
              <option value="bajo">Baja — riego escaso</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">📊 Dificultad de cultivo</label>
            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value as Vegetable['difficulty'])}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="fácil">Fácil — apta para principiantes</option>
              <option value="medio">Media — algo de experiencia</option>
              <option value="difícil">Difícil — requiere destreza</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Asociaciones ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">🤝</span> Asociaciones de cultivo
          <span className="text-xs font-normal text-gray-400 normal-case">(Opcional — mejoran la rotación)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlantRelationPicker
            label="Plantas compañeras (beneficiosas)"
            emoji="💚" color="bg-green-100 border border-green-400 text-green-800"
            selected={form.companionPlants} allVegetables={pickableVegs}
            onChange={ids => set('companionPlants', ids)} />
          <PlantRelationPicker
            label="Plantas incompatibles (perjudiciales)"
            emoji="❌" color="bg-red-100 border border-red-400 text-red-800"
            selected={form.incompatiblePlants} allVegetables={pickableVegs}
            onChange={ids => set('incompatiblePlants', ids)} />
        </div>
      </section>

      {/* ── Consejos ── */}
      <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">💡</span> Consejos de cultivo ecológico
        </h3>
        <p className="text-xs text-gray-500">Escribe un consejo por línea. Se mostrarán en la ficha de la hortaliza.</p>
        <textarea value={tipInput} onChange={e => setTipInput(e.target.value)} rows={5}
          placeholder={"Rota el cultivo cada temporada para evitar enfermedades del suelo.\nEvita el exceso de nitrógeno en la fase de floración.\nPlanta con albahaca para repeler pulgones."}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none font-mono" />
        <p className="text-[10px] text-gray-400">{tipInput.split('\n').filter(Boolean).length} consejo(s)</p>
      </section>

      {/* ── Errores ── */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {errors.map((e, i) => <p key={i} className="text-sm text-red-700">{e}</p>)}
          </div>
        </div>
      )}

      {/* ── Acciones ── */}
      <div className="flex gap-3 pb-8">
        <button type="submit"
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">
          <Save size={16} />
          {editingId ? 'Guardar cambios' : 'Añadir al catálogo'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
          <X size={16} />
        </button>
      </div>

    </form>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function VegetableAdminPage() {
  const { state, dispatch } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingVeg, setEditingVeg] = useState<Vegetable | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [exportMsg, setExportMsg] = useState('')
  const [tab, setTab] = useState<'builtin' | 'custom'>('custom')

  const allVegetables = useMemo(
    () => [...VEGETABLES, ...state.customVegetables],
    [state.customVegetables]
  )

  function openNew() {
    setEditingVeg(null)
    setShowForm(true)
  }

  function openEdit(veg: Vegetable) {
    setEditingVeg(veg)
    setShowForm(true)
  }

  function handleSave(veg: Vegetable) {
    dispatch({ type: 'ADD_CUSTOM_VEGETABLE', payload: veg })
    setShowForm(false)
    setEditingVeg(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_CUSTOM_VEGETABLE', payload: id })
    setDeleteConfirm(null)
  }

  async function handleExport() {
    try {
      const json = await DB.exportJSON()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `huerto-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportMsg('✅ Copia exportada')
      setTimeout(() => setExportMsg(''), 3000)
    } catch {
      setExportMsg('❌ Error al exportar')
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      await DB.importJSON(text)
      window.location.reload()
    } catch {
      setExportMsg('❌ Archivo no válido')
    }
    e.target.value = ''
  }

  // ── Vista: formulario ──
  if (showForm) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <button onClick={() => { setShowForm(false); setEditingVeg(null) }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft size={16} /> Volver al listado
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {editingVeg ? `✏️ Editar: ${editingVeg.icon} ${editingVeg.name}` : '➕ Nueva hortaliza'}
        </h1>
        <p className="text-sm text-gray-500">
          Completa todos los campos para añadir la hortaliza al catálogo.
          Los campos con <span className="text-red-400">*</span> son obligatorios.
        </p>
        <VegetableForm
          initial={editingVeg ? { ...editingVeg } : EMPTY_FORM}
          allVegetables={allVegetables}
          editingId={editingVeg?.id ?? null}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingVeg(null) }}
        />
      </div>
    )
  }

  // ── Vista: listado ──
  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Database size={22} className="text-green-600" /> Gestión de Hortalizas
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {VEGETABLES.length} integradas · {state.customVegetables.length} personalizadas
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
          <Plus size={16} /> Nueva hortaliza
        </button>
      </div>

      {/* Backup */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
          💾 Copia de seguridad de la base de datos
        </span>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:border-green-400 hover:text-green-700 transition-colors">
          <Download size={14} /> Exportar JSON
        </button>
        <label className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:border-green-400 hover:text-green-700 transition-colors cursor-pointer">
          <Upload size={14} /> Importar JSON
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
        {exportMsg && <span className="text-sm text-green-700 font-medium">{exportMsg}</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button onClick={() => setTab('custom')}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${tab === 'custom' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Mis hortalizas ({state.customVegetables.length})
        </button>
        <button onClick={() => setTab('builtin')}
          className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${tab === 'builtin' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          Catálogo base ({VEGETABLES.length})
        </button>
      </div>

      {/* ── Tab: Personalizadas ── */}
      {tab === 'custom' && (
        <div className="space-y-2">
          {state.customVegetables.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-2">🌱</p>
              <p className="font-semibold text-gray-600">Aún no tienes hortalizas personalizadas</p>
              <p className="text-sm mt-1">Pulsa "Nueva hortaliza" para añadir la primera</p>
              <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                <Plus size={14} /> Crear ahora
              </button>
            </div>
          ) : (
            state.customVegetables.map(veg => (
              <VegetableCard key={veg.id} veg={veg} editable
                onEdit={() => openEdit(veg)}
                onDelete={() => setDeleteConfirm(veg.id)}
                confirmDelete={deleteConfirm === veg.id}
                onConfirmDelete={() => handleDelete(veg.id)}
                onCancelDelete={() => setDeleteConfirm(null)}
              />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Integradas ── */}
      {tab === 'builtin' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 px-1">
            Estas hortalizas forman parte del catálogo base de la aplicación y no se pueden editar.
            Para crear una versión personalizada, usa "Nueva hortaliza".
          </p>
          {VEGETABLES.map(veg => (
            <VegetableCard key={veg.id} veg={veg} editable={false} />
          ))}
        </div>
      )}

    </div>
  )
}

// ── Tarjeta de hortaliza ──────────────────────────────────────────────────────

function VegetableCard({
  veg, editable, onEdit, onDelete, confirmDelete, onConfirmDelete, onCancelDelete,
}: {
  veg: Vegetable
  editable: boolean
  onEdit?: () => void
  onDelete?: () => void
  confirmDelete?: boolean
  onConfirmDelete?: () => void
  onCancelDelete?: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/catalog/${veg.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-3xl shrink-0">{veg.icon}</span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{veg.name}</p>
            <p className="text-xs text-gray-400 capitalize">{veg.family}</p>
          </div>
        </Link>
        <div className="flex flex-wrap gap-1.5 items-center shrink-0">
          <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">☀️ {veg.sunRequirement}</span>
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">💧 {veg.waterRequirement}</span>
          <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">🕐 {veg.daysToHarvest}d</span>
          {editable && (
            <>
              <button onClick={onEdit} title="Editar"
                className="text-gray-400 hover:text-green-600 p-1 rounded-lg hover:bg-green-50 transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={onDelete} title="Eliminar"
                className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmación de borrado */}
      {confirmDelete && (
        <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700 flex-1">¿Eliminar <strong>{veg.name}</strong> del catálogo?</p>
          <button onClick={onConfirmDelete} className="text-xs bg-red-600 text-white px-2 py-1 rounded-lg font-semibold hover:bg-red-700">Sí, eliminar</button>
          <button onClick={onCancelDelete} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50">Cancelar</button>
        </div>
      )}

      {/* Mini calendario */}
      <div className="mt-2 grid grid-cols-12 gap-0.5">
        {Array.from({ length: 12 }, (_, i) => {
          const m = i + 1
          const sow = veg.sowingMonths.includes(m)
          const harv = veg.harvestMonths.includes(m)
          return (
            <div key={m} title={MONTH_NAMES[i]}
              className={`h-1.5 rounded-full ${sow && harv ? 'bg-green-500' : sow ? 'bg-lime-400' : harv ? 'bg-amber-400' : 'bg-gray-100'}`} />
          )
        })}
      </div>
      <div className="flex gap-3 mt-1">
        <span className="text-[10px] text-gray-400 flex items-center gap-1"><span className="w-2 h-1.5 bg-lime-400 rounded-full inline-block" />Siembra</span>
        <span className="text-[10px] text-gray-400 flex items-center gap-1"><span className="w-2 h-1.5 bg-amber-400 rounded-full inline-block" />Cosecha</span>
      </div>
    </div>
  )
}

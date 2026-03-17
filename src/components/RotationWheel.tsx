import { CROP_ROTATION_ORDER, FAMILY_LABELS } from '../data/vegetables'
import type { CropFamily } from '../types'

interface Props {
  previousFamilies: CropFamily[]
}

export default function RotationWheel({ previousFamilies }: Props) {
  const lastFamily = previousFamilies.length > 0
    ? previousFamilies[previousFamilies.length - 1]
    : null

  const currentGroupIndex = lastFamily
    ? CROP_ROTATION_ORDER.findIndex(group => group.includes(lastFamily))
    : -1

  const nextGroupIndex = currentGroupIndex >= 0
    ? (currentGroupIndex + 1) % CROP_ROTATION_ORDER.length
    : 0

  const groupLabels = [
    { title: 'Año 1: Fruto (Exigentes)', color: 'bg-red-100 border-red-300 text-red-800' },
    { title: 'Año 2: Hoja', color: 'bg-green-100 border-green-300 text-green-800' },
    { title: 'Año 3: Raíz', color: 'bg-amber-100 border-amber-300 text-amber-800' },
    { title: 'Año 4: Leguminosas (Regeneran)', color: 'bg-blue-100 border-blue-300 text-blue-800' },
  ]

  return (
    <div className="space-y-3">
      {CROP_ROTATION_ORDER.map((group, idx) => {
        const isNext = idx === nextGroupIndex
        const isCurrent = idx === currentGroupIndex
        const label = groupLabels[idx]

        return (
          <div
            key={idx}
            className={`rounded-xl border-2 p-3 transition-all ${label.color} ${
              isNext ? 'ring-2 ring-green-500 ring-offset-2 scale-[1.02]' : ''
            } ${isCurrent ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold">{label.title}</h4>
              {isNext && (
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                  ✨ Recomendado
                </span>
              )}
              {isCurrent && (
                <span className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded-full">
                  Último plantado
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {group.map(family => (
                <span key={family} className="text-xs bg-white/60 rounded px-2 py-0.5">
                  {FAMILY_LABELS[family] || family}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

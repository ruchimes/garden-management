import type { GrowthStage } from '../types'
import { GROWTH_STAGES } from '../data/vegetables'

interface Props {
  currentStage: GrowthStage
  compact?: boolean
}

export default function StageTimeline({ currentStage, compact = false }: Props) {
  const stageOrder: GrowthStage[] = [
    'semillero', 'trasplante', 'crecimiento', 'floración', 'fructificación', 'cosecha', 'finalizado',
  ]
  const currentIndex = stageOrder.indexOf(currentStage)

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {stageOrder.map((stage, idx) => {
          const info = GROWTH_STAGES.find(s => s.id === stage)!
          const isPast = idx < currentIndex
          const isCurrent = idx === currentIndex
          return (
            <div
              key={stage}
              className={`flex items-center`}
              title={info.name}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${isCurrent ? 'ring-2 ring-green-500 ring-offset-1' : ''}
                  ${isPast ? 'bg-green-200' : isCurrent ? 'bg-green-500 text-white' : 'bg-gray-200'}
                `}
              >
                {info.icon}
              </div>
              {idx < stageOrder.length - 1 && (
                <div className={`w-2 h-0.5 ${idx < currentIndex ? 'bg-green-400' : 'bg-gray-300'}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {stageOrder.map((stage, idx) => {
        const info = GROWTH_STAGES.find(s => s.id === stage)!
        const isPast = idx < currentIndex
        const isCurrent = idx === currentIndex
        const isFuture = idx > currentIndex

        return (
          <div key={stage} className="flex items-start gap-3">
            {/* Line + Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 shrink-0
                  ${isCurrent ? 'border-green-500 bg-green-100 scale-110' : ''}
                  ${isPast ? 'border-green-400 bg-green-50' : ''}
                  ${isFuture ? 'border-gray-300 bg-gray-50' : ''}
                `}
              >
                {info.icon}
              </div>
              {idx < stageOrder.length - 1 && (
                <div className={`w-0.5 h-6 ${isPast ? 'bg-green-400' : 'bg-gray-300'}`} />
              )}
            </div>

            {/* Label */}
            <div className={`pt-1 ${isFuture ? 'opacity-50' : ''}`}>
              <p className={`text-sm font-semibold ${isCurrent ? 'text-green-700' : 'text-gray-700'}`}>
                {info.name}
                {isCurrent && (
                  <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Actual
                  </span>
                )}
              </p>
              {(isCurrent || isPast) && (
                <p className="text-xs text-gray-500">{info.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

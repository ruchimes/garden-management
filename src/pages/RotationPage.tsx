import { useAppContext } from '../store/AppContext'
import { VEGETABLES } from '../data/vegetables'
import RotationWheel from '../components/RotationWheel'
import type { CropFamily } from '../types'

export default function RotationPage() {
  const { state } = useAppContext()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">🔄 Rotación de Cultivos</h1>

      {/* Explanation */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6">
        <h2 className="text-base font-bold text-green-800 mb-2">¿Por qué rotar cultivos?</h2>
        <ul className="text-sm text-green-700 space-y-1">
          <li>🌱 Evita el agotamiento de nutrientes específicos del suelo</li>
          <li>🐛 Rompe el ciclo de plagas y enfermedades específicas de cada familia</li>
          <li>💚 Mejora la estructura y fertilidad del suelo de forma natural</li>
          <li>🫘 Las leguminosas fijan nitrógeno y regeneran la tierra tras cultivos exigentes</li>
        </ul>
      </div>

      {/* Order explained */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Orden de rotación recomendado</h2>
        <RotationWheel previousFamilies={[]} />
      </div>

      {/* Per garden bed status */}
      {state.gardens.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          Crea un huerto para ver el estado de rotación de cada bancal.
        </div>
      ) : (
        state.gardens.map(garden => (
          <div key={garden.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              🌿 {garden.name}
            </h2>
            <div className="space-y-3">
              {garden.beds.map((bed, idx) => {
                const history = bed.cropHistory
                const previousFamilies = history
                  .map(vegId => VEGETABLES.find(v => v.id === vegId)?.family)
                  .filter((f): f is CropFamily => !!f)

                const lastVeg = history.length > 0
                  ? VEGETABLES.find(v => v.id === history[history.length - 1])
                  : null

                const activeCrop = state.plantedCrops.find(
                  c => c.gardenId === garden.id && c.bedIndex === idx && c.isActive
                )
                const activeVeg = activeCrop
                  ? VEGETABLES.find(v => v.id === activeCrop.vegetableId)
                  : null

                return (
                  <div key={bed.id || idx} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-700">{bed.name}</h3>
                      {activeVeg && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {activeVeg.icon} {activeVeg.name} — {activeCrop?.currentStage}
                        </span>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <p className="text-sm text-gray-400 italic mb-3">
                        Sin historial. Puedes plantar cualquier familia.
                      </p>
                    ) : (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Historial de cultivos:</p>
                        <div className="flex flex-wrap gap-1">
                          {history.map((vegId, hIdx) => {
                            const v = VEGETABLES.find(veg => veg.id === vegId)
                            return (
                              <span
                                key={hIdx}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                                title={v?.family}
                              >
                                {v?.icon} {v?.name}
                              </span>
                            )
                          })}
                        </div>
                        {lastVeg && (
                          <p className="text-xs text-gray-400 mt-1">
                            Último: {lastVeg.icon} {lastVeg.name} ({lastVeg.family})
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-blue-700 mb-2">
                        🔄 Siguiente familia recomendada:
                      </p>
                      <RotationWheel previousFamilies={previousFamilies} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 md:p-6">
        <h2 className="text-base font-bold text-amber-800 mb-2">🌻 Reglas de oro de la rotación</h2>
        <ul className="text-sm text-amber-700 space-y-1.5">
          <li><strong>1.</strong> Nunca plantes la misma familia dos temporadas seguidas en el mismo bancal.</li>
          <li><strong>2.</strong> Después de solanáceas (tomate, pimiento), planta leguminosas o crucíferas.</li>
          <li><strong>3.</strong> Las leguminosas mejoran el suelo: plántalas antes de los cultivos más exigentes.</li>
          <li><strong>4.</strong> Deja descansar el bancal o planta abonos verdes si es posible.</li>
          <li><strong>5.</strong> Usa el compost para reponer los nutrientes del suelo cada temporada.</li>
        </ul>
      </div>
    </div>
  )
}

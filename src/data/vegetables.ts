import type { Vegetable, StageInfo, TransplantDestination } from '../types'

export const GROWTH_STAGES: StageInfo[] = [
  {
    id: 'semillero',
    name: 'Semillero',
    description: 'Las semillas están germinando en un ambiente protegido',
    icon: '🌱',
    color: 'bg-lime-100 text-lime-800 border-lime-300',
  },
  {
    id: 'trasplante',
    name: 'Trasplante',
    description: 'La plántula se ha trasplantado al huerto',
    icon: '🪴',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  {
    id: 'crecimiento',
    name: 'Crecimiento',
    description: 'La planta está desarrollándose y ganando tamaño',
    icon: '🌿',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'floración',
    name: 'Floración',
    description: 'La planta ha empezado a florecer',
    icon: '🌸',
    color: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  {
    id: 'fructificación',
    name: 'Fructificación',
    description: 'Los frutos se están formando',
    icon: '🍅',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    id: 'cosecha',
    name: 'Cosecha',
    description: '¡Es hora de recoger los frutos!',
    icon: '🧺',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'finalizado',
    name: 'Finalizado',
    description: 'El ciclo de cultivo ha terminado',
    icon: '✅',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
  },
]

export const VEGETABLES: Vegetable[] = [
  {
    id: 'tomate',
    name: 'Tomate',
    family: 'solanáceas',
    icon: '🍅',
    description: 'El rey del huerto mediterráneo. Fruto versátil y nutritivo.',
    sowingMonths: [2, 3, 4],
    harvestMonths: [7, 8, 9, 10],
    daysToGerminate: 8,
    daysToTransplant: 45,
    daysToFlowering: 70,
    daysToHarvest: 120,
    companionPlants: ['albahaca', 'zanahoria', 'lechuga', 'cebolla'],
    incompatiblePlants: ['pepino', 'patata', 'hinojo'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'medio',
    tips: [
      'Entutorar cuando alcance 30cm de altura',
      'Eliminar los chupones laterales para mejor producción',
      'Regar por la base, nunca mojar las hojas',
    ],
  },
  {
    id: 'pimiento',
    name: 'Pimiento',
    family: 'solanáceas',
    icon: '🫑',
    description: 'Hortaliza rica en vitamina C, ideal para ensaladas y guisos.',
    sowingMonths: [2, 3, 4],
    harvestMonths: [7, 8, 9, 10],
    daysToGerminate: 12,
    daysToTransplant: 50,
    daysToFlowering: 75,
    daysToHarvest: 130,
    companionPlants: ['zanahoria', 'cebolla', 'albahaca'],
    incompatiblePlants: ['hinojo', 'pepino'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'medio',
    tips: [
      'Necesita calor constante para germinar',
      'Proteger del viento',
      'El primer fruto se puede recoger verde para estimular producción',
    ],
  },
  {
    id: 'berenjena',
    name: 'Berenjena',
    family: 'solanáceas',
    icon: '🍆',
    description: 'Fruto de pulpa esponjosa, muy usado en la cocina mediterránea.',
    sowingMonths: [2, 3],
    harvestMonths: [7, 8, 9],
    daysToGerminate: 14,
    daysToTransplant: 55,
    daysToFlowering: 80,
    daysToHarvest: 140,
    companionPlants: ['judía', 'lechuga', 'espinaca'],
    incompatiblePlants: ['patata', 'tomate'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'alto',
    difficulty: 'medio',
    tips: [
      'Muy sensible al frío, plantar cuando no haya riesgo de heladas',
      'Necesita mucho riego en verano',
      'Cosechar antes de que las semillas endurezcan',
    ],
  },
  {
    id: 'calabacin',
    name: 'Calabacín',
    family: 'cucurbitáceas',
    icon: '🥒',
    description: 'Planta muy productiva, de crecimiento rápido.',
    sowingMonths: [3, 4, 5],
    harvestMonths: [6, 7, 8, 9],
    daysToGerminate: 7,
    daysToTransplant: 30,
    daysToFlowering: 50,
    daysToHarvest: 65,
    companionPlants: ['judía', 'maíz', 'cebolla'],
    incompatiblePlants: ['patata', 'pepino'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'alto',
    difficulty: 'fácil',
    tips: [
      'Necesita mucho espacio, dejar al menos 1m entre plantas',
      'Recoger jóvenes para mejor sabor',
      'Polinización manual si hay pocos insectos',
    ],
  },
  {
    id: 'pepino',
    name: 'Pepino',
    family: 'cucurbitáceas',
    icon: '🥒',
    description: 'Hortaliza refrescante, ideal para ensaladas veraniegas.',
    sowingMonths: [3, 4, 5],
    harvestMonths: [6, 7, 8, 9],
    daysToGerminate: 7,
    daysToTransplant: 30,
    daysToFlowering: 50,
    daysToHarvest: 70,
    companionPlants: ['judía', 'guisante', 'lechuga', 'rábano'],
    incompatiblePlants: ['tomate', 'patata', 'hierbas aromáticas'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'alto',
    difficulty: 'fácil',
    tips: [
      'Entutorar para ahorrar espacio y mejorar la ventilación',
      'Regar abundantemente en verano',
      'Recolectar antes de que amarilleen',
    ],
  },
  {
    id: 'lechuga',
    name: 'Lechuga',
    family: 'compuestas',
    icon: '🥬',
    description: 'Hortaliza de hoja verde, base de ensaladas.',
    sowingMonths: [1, 2, 3, 4, 5, 9, 10, 11],
    harvestMonths: [3, 4, 5, 6, 7, 10, 11, 12],
    daysToGerminate: 5,
    daysToTransplant: 25,
    daysToFlowering: 60,
    daysToHarvest: 70,
    companionPlants: ['zanahoria', 'rábano', 'fresa', 'cebolla'],
    incompatiblePlants: ['apio', 'perejil'],
    sunRequirement: 'semi-sombra',
    waterRequirement: 'alto',
    difficulty: 'fácil',
    tips: [
      'Siembras escalonadas cada 15 días para cosecha continua',
      'En verano buscar variedades resistentes al espigado',
      'Proteger del sol directo en los meses más calurosos',
    ],
  },
  {
    id: 'zanahoria',
    name: 'Zanahoria',
    family: 'umbelíferas',
    icon: '🥕',
    description: 'Raíz dulce y crujiente, rica en betacarotenos.',
    sowingMonths: [2, 3, 4, 5, 6, 7],
    harvestMonths: [5, 6, 7, 8, 9, 10, 11],
    daysToGerminate: 14,
    daysToTransplant: 0, // siembra directa
    daysToFlowering: 90,
    daysToHarvest: 100,
    companionPlants: ['tomate', 'lechuga', 'cebolla', 'guisante'],
    incompatiblePlants: ['eneldo', 'hinojo'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'medio',
    tips: [
      'Siembra directa, no tolera trasplante',
      'Suelo suelto y sin piedras para raíces rectas',
      'Aclarar cuando las plántulas tengan 5cm',
    ],
  },
  {
    id: 'cebolla',
    name: 'Cebolla',
    family: 'liliáceas',
    icon: '🧅',
    description: 'Bulbo imprescindible en la cocina, de largo almacenamiento.',
    sowingMonths: [1, 2, 9, 10],
    harvestMonths: [5, 6, 7, 8],
    daysToGerminate: 10,
    daysToTransplant: 45,
    daysToFlowering: 120,
    daysToHarvest: 150,
    companionPlants: ['zanahoria', 'tomate', 'lechuga', 'fresa'],
    incompatiblePlants: ['judía', 'guisante', 'haba'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'bajo',
    difficulty: 'fácil',
    tips: [
      'Dejar de regar 2 semanas antes de la cosecha',
      'Cosechar cuando las hojas se doblen',
      'Curar al sol antes de almacenar',
    ],
  },
  {
    id: 'ajo',
    name: 'Ajo',
    family: 'liliáceas',
    icon: '🧄',
    description: 'Bulbo aromático fundamental en la cocina mediterránea.',
    sowingMonths: [10, 11, 12, 1],
    harvestMonths: [5, 6, 7],
    daysToGerminate: 15,
    daysToTransplant: 0, // siembra directa de dientes
    daysToFlowering: 120,
    daysToHarvest: 180,
    companionPlants: ['tomate', 'zanahoria', 'fresa', 'lechuga'],
    incompatiblePlants: ['judía', 'guisante', 'haba'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'bajo',
    difficulty: 'fácil',
    tips: [
      'Plantar los dientes con la punta hacia arriba',
      'No regar en exceso, prefiere suelo seco',
      'Cosechar cuando las hojas inferiores se sequen',
    ],
  },
  {
    id: 'judia',
    name: 'Judía verde',
    family: 'leguminosas',
    icon: '🫘',
    description: 'Leguminosa que fija nitrógeno, excelente para rotación.',
    sowingMonths: [4, 5, 6, 7],
    harvestMonths: [6, 7, 8, 9, 10],
    daysToGerminate: 7,
    daysToTransplant: 0, // siembra directa
    daysToFlowering: 45,
    daysToHarvest: 65,
    companionPlants: ['calabacin', 'maíz', 'zanahoria', 'pepino'],
    incompatiblePlants: ['cebolla', 'ajo', 'puerro'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'fácil',
    tips: [
      'Siembra directa, no trasplantar',
      'Las trepadoras necesitan tutor',
      'Fija nitrógeno en el suelo, ideal antes de cultivos exigentes',
    ],
  },
  {
    id: 'guisante',
    name: 'Guisante',
    family: 'leguminosas',
    icon: '🟢',
    description: 'Leguminosa de invierno que enriquece el suelo.',
    sowingMonths: [10, 11, 2, 3],
    harvestMonths: [3, 4, 5, 6],
    daysToGerminate: 10,
    daysToTransplant: 0,
    daysToFlowering: 50,
    daysToHarvest: 75,
    companionPlants: ['zanahoria', 'rábano', 'pepino', 'lechuga'],
    incompatiblePlants: ['cebolla', 'ajo', 'puerro'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'fácil',
    tips: [
      'Prefiere clima fresco, no tolera calor excesivo',
      'Proporcionar tutor o malla para trepar',
      'Recoger con frecuencia para estimular producción',
    ],
  },
  {
    id: 'espinaca',
    name: 'Espinaca',
    family: 'quenopodiáceas',
    icon: '🥬',
    description: 'Hoja verde muy nutritiva, rica en hierro.',
    sowingMonths: [2, 3, 4, 9, 10, 11],
    harvestMonths: [4, 5, 6, 10, 11, 12],
    daysToGerminate: 7,
    daysToTransplant: 20,
    daysToFlowering: 50,
    daysToHarvest: 50,
    companionPlants: ['fresa', 'lechuga', 'rábano', 'guisante'],
    incompatiblePlants: ['remolacha', 'acelga'],
    sunRequirement: 'semi-sombra',
    waterRequirement: 'alto',
    difficulty: 'fácil',
    tips: [
      'Se espiga rápido con calor, cultivar en primavera u otoño',
      'Recoger hojas exteriores para cosecha continua',
      'Mantener el suelo húmedo pero sin encharcamiento',
    ],
  },
  {
    id: 'acelga',
    name: 'Acelga',
    family: 'quenopodiáceas',
    icon: '🥬',
    description: 'Hoja verde resistente, se puede cosechar durante meses.',
    sowingMonths: [3, 4, 5, 8, 9],
    harvestMonths: [5, 6, 7, 8, 9, 10, 11],
    daysToGerminate: 10,
    daysToTransplant: 30,
    daysToFlowering: 80,
    daysToHarvest: 65,
    companionPlants: ['zanahoria', 'lechuga', 'cebolla', 'rábano'],
    incompatiblePlants: ['espinaca', 'remolacha'],
    sunRequirement: 'semi-sombra',
    waterRequirement: 'medio',
    difficulty: 'fácil',
    tips: [
      'Cortar hojas exteriores, el centro seguirá produciendo',
      'Tolera bien el frío ligero',
      'Muy agradecida con el compost',
    ],
  },
  {
    id: 'brocoli',
    name: 'Brócoli',
    family: 'crucíferas',
    icon: '🥦',
    description: 'Crucífera rica en nutrientes y antioxidantes.',
    sowingMonths: [6, 7, 8],
    harvestMonths: [10, 11, 12, 1, 2],
    daysToGerminate: 7,
    daysToTransplant: 35,
    daysToFlowering: 70,
    daysToHarvest: 90,
    companionPlants: ['cebolla', 'lechuga', 'espinaca', 'zanahoria'],
    incompatiblePlants: ['tomate', 'fresa'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'medio',
    tips: [
      'Cosechar la cabeza central antes de que florezca',
      'Tras la cosecha principal, produce brotes laterales',
      'Proteger de la mariposa de la col',
    ],
  },
  {
    id: 'rabano',
    name: 'Rábano',
    family: 'crucíferas',
    icon: '🔴',
    description: 'Raíz de crecimiento muy rápido, ideal para principiantes.',
    sowingMonths: [1, 2, 3, 4, 5, 9, 10, 11],
    harvestMonths: [2, 3, 4, 5, 6, 10, 11, 12],
    daysToGerminate: 4,
    daysToTransplant: 0,
    daysToFlowering: 40,
    daysToHarvest: 30,
    companionPlants: ['lechuga', 'zanahoria', 'guisante', 'espinaca'],
    incompatiblePlants: ['pepino'],
    sunRequirement: 'semi-sombra',
    waterRequirement: 'medio',
    difficulty: 'fácil',
    tips: [
      'Cosecha rápida en 30 días',
      'Ideal para marcar hileras de cultivos lentos',
      'No dejar mucho tiempo en tierra o se ponen fibrosos',
    ],
  },
  {
    id: 'calabaza',
    name: 'Calabaza',
    family: 'cucurbitáceas',
    icon: '🎃',
    description: 'Planta rastrera que produce grandes frutos de larga conservación.',
    sowingMonths: [3, 4, 5],
    harvestMonths: [8, 9, 10, 11],
    daysToGerminate: 8,
    daysToTransplant: 30,
    daysToFlowering: 60,
    daysToHarvest: 120,
    companionPlants: ['maíz', 'judía', 'cebolla'],
    incompatiblePlants: ['patata'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'fácil',
    tips: [
      'Necesita mucho espacio (2-3m²)',
      'El acolchado ayuda a conservar humedad',
      'Cosechar cuando el tallo esté seco',
    ],
  },
  {
    id: 'patata',
    name: 'Patata',
    family: 'solanáceas',
    icon: '🥔',
    description: 'Tubérculo básico en la alimentación, muy productivo.',
    sowingMonths: [2, 3, 4],
    harvestMonths: [6, 7, 8, 9],
    daysToGerminate: 15,
    daysToTransplant: 0,
    daysToFlowering: 60,
    daysToHarvest: 100,
    companionPlants: ['judía', 'guisante', 'espinaca'],
    incompatiblePlants: ['tomate', 'berenjena', 'pimiento', 'calabaza'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'fácil',
    tips: [
      'Aporcar tierra conforme crece para más producción',
      'No plantar después de otras solanáceas',
      'Cosechar cuando la planta se seque',
    ],
  },
  {
    id: 'puerro',
    name: 'Puerro',
    family: 'liliáceas',
    icon: '🟢',
    description: 'Hortaliza de invierno con sabor suave, muy versátil.',
    sowingMonths: [2, 3, 4],
    harvestMonths: [9, 10, 11, 12, 1, 2],
    daysToGerminate: 12,
    daysToTransplant: 60,
    daysToFlowering: 150,
    daysToHarvest: 170,
    companionPlants: ['zanahoria', 'tomate', 'lechuga'],
    incompatiblePlants: ['judía', 'guisante'],
    sunRequirement: 'pleno sol',
    waterRequirement: 'medio',
    difficulty: 'medio',
    tips: [
      'Aporcar para blanquear el tallo',
      'Muy resistente al frío',
      'Trasplantar cuando tenga el grosor de un lápiz',
    ],
  },
]

export const CROP_ROTATION_ORDER: CropFamily[][] = [
  // Año 1: Plantas exigentes (solanáceas, cucurbitáceas)
  ['solanáceas', 'cucurbitáceas'],
  // Año 2: Plantas de hoja (compuestas, quenopodiáceas, crucíferas)
  ['compuestas', 'quenopodiáceas', 'crucíferas'],
  // Año 3: Plantas de raíz (umbelíferas, liliáceas)
  ['umbelíferas', 'liliáceas'],
  // Año 4: Leguminosas (fijan nitrógeno, regeneran suelo)
  ['leguminosas'],
]

export const FAMILY_LABELS: Record<string, string> = {
  'solanáceas': '🍅 Solanáceas (tomate, pimiento, berenjena, patata)',
  'cucurbitáceas': '🥒 Cucurbitáceas (calabacín, pepino, calabaza)',
  'leguminosas': '🫘 Leguminosas (judía, guisante)',
  'crucíferas': '🥦 Crucíferas (brócoli, rábano)',
  'liliáceas': '🧅 Liliáceas (cebolla, ajo, puerro)',
  'umbelíferas': '🥕 Umbelíferas (zanahoria)',
  'compuestas': '🥬 Compuestas (lechuga)',
  'quenopodiáceas': '🥬 Quenopodiáceas (espinaca, acelga)',
}

import type { CropFamily } from '../types'

export function getRotationRecommendation(previousFamilies: CropFamily[]): CropFamily[] {
  if (previousFamilies.length === 0) {
    // Sin historial, cualquier familia es válida
    return CROP_ROTATION_ORDER.flat()
  }

  const lastFamily = previousFamilies[previousFamilies.length - 1]

  // Find which rotation group the last family belongs to
  const currentGroupIndex = CROP_ROTATION_ORDER.findIndex(group =>
    group.includes(lastFamily)
  )

  if (currentGroupIndex === -1) return CROP_ROTATION_ORDER.flat()

  // Recommend the next group in rotation
  const nextGroupIndex = (currentGroupIndex + 1) % CROP_ROTATION_ORDER.length
  return CROP_ROTATION_ORDER[nextGroupIndex]
}

// ── Semillero helpers ─────────────────────────────────────────────────────────

/**
 * Determina si una planta necesita semillero o puede sembrarse directamente.
 * Las plantas con daysToTransplant === 0 se siembran directo al bancal.
 */
export function needsSeedling(veg: Vegetable): boolean {
  return veg.daysToTransplant > 0
}

/**
 * Indica el destino óptimo del trasplante del semillero.
 * - Solanáceas y cucurbitáceas grandes → maceta mayor antes del bancal
 * - Resto con semillero → bancal directo
 * - Sin semillero → siembra directa
 */
export function getTransplantDestination(veg: Vegetable): TransplantDestination {
  if (veg.daysToTransplant === 0) return 'siembra-directa'
  const intermediateFamilies = ['solanáceas', 'cucurbitáceas']
  if (intermediateFamilies.includes(veg.family)) return 'maceta-mayor'
  return 'bancal'
}

/** Días totales desde siembra en semillero hasta que está listo para trasplantar */
export function daysUntilTransplantReady(veg: Vegetable): number {
  return veg.daysToGerminate + veg.daysToTransplant
}

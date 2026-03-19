export type CropFamily =
  | 'solanáceas'    // tomate, pimiento, berenjena, patata
  | 'cucurbitáceas' // calabacín, pepino, calabaza, melón, sandía
  | 'leguminosas'   // judía, guisante, haba, lenteja
  | 'crucíferas'    // col, brócoli, coliflor, rábano, nabo
  | 'liliáceas'     // cebolla, ajo, puerro
  | 'umbelíferas'   // zanahoria, apio, perejil, hinojo
  | 'compuestas'    // lechuga, escarola, alcachofa, girasol
  | 'quenopodiáceas' // espinaca, acelga, remolacha

export type GrowthStage =
  | 'semillero'
  | 'trasplante'
  | 'crecimiento'
  | 'floración'
  | 'fructificación'
  | 'cosecha'
  | 'finalizado'

export type Season = 'primavera' | 'verano' | 'otoño' | 'invierno'

export interface StageInfo {
  id: GrowthStage
  name: string
  description: string
  icon: string
  color: string
}

export interface Vegetable {
  id: string
  name: string
  family: CropFamily
  icon: string
  description: string
  sowingMonths: number[]       // months 1-12
  harvestMonths: number[]
  daysToGerminate: number
  daysToTransplant: number
  daysToFlowering: number
  daysToHarvest: number
  companionPlants: string[]    // IDs of good companions
  incompatiblePlants: string[] // IDs of bad companions
  sunRequirement: 'pleno sol' | 'semi-sombra' | 'sombra'
  waterRequirement: 'alto' | 'medio' | 'bajo'
  difficulty: 'fácil' | 'medio' | 'difícil'
  tips: string[]
}

export interface PlantedCrop {
  id: string
  vegetableId: string
  gardenId: string
  bedIndex: number           // index of the bed/zone in the garden
  plantedDate: string        // ISO date
  currentStage: GrowthStage
  stageHistory: StageRecord[]
  notes: string
  quantity: number
  isActive: boolean
}

export interface StageRecord {
  stage: GrowthStage
  date: string               // ISO date
  notes?: string
}

export interface GardenBed {
  id: string
  name: string
  cropHistory: string[]      // vegetable IDs previously planted (for rotation)
}

export interface Garden {
  id: string
  name: string
  description: string
  location: string
  beds: GardenBed[]
  createdAt: string
  imageUrl?: string
}

export interface Notification {
  id: string
  plantedCropId: string
  gardenId: string
  title: string
  message: string
  date: string
  read: boolean
  type: 'stage_change' | 'reminder' | 'rotation_warning' | 'companion_tip'
}

export type TransplantDestination =
  | 'bancal'          // trasplante directo a bancal
  | 'maceta-mayor'    // primero a maceta más grande antes del bancal
  | 'siembra-directa' // no necesita semillero, se siembra directamente

export interface Seedling {
  id: string
  vegetableId: string
  quantity: number
  sowDate: string    // ISO — fecha de siembra en semillero
  notes: string
  isActive: boolean
}

export interface AppState {
  gardens: Garden[]
  plantedCrops: PlantedCrop[]
  notifications: Notification[]
  customVegetables: Vegetable[]
  seedlings: Seedling[]
}

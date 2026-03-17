import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type {
  Garden,
  GardenBed,
  PlantedCrop,
  Notification,
  AppState,
  GrowthStage,
  StageRecord,
  Vegetable,
} from '../types'
import { VEGETABLES, GROWTH_STAGES } from '../data/vegetables'
import { DB } from '../db/database'

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_GARDEN'; payload: Omit<Garden, 'id' | 'createdAt'> }
  | { type: 'UPDATE_GARDEN'; payload: Garden }
  | { type: 'DELETE_GARDEN'; payload: string }
  | { type: 'ADD_BED'; payload: { gardenId: string; bed: Omit<GardenBed, 'id'> } }
  | { type: 'PLANT_CROP'; payload: Omit<PlantedCrop, 'id' | 'stageHistory' | 'isActive'> }
  | { type: 'ADVANCE_STAGE'; payload: { cropId: string; notes?: string } }
  | { type: 'UPDATE_CROP_NOTES'; payload: { cropId: string; notes: string } }
  | { type: 'FINISH_CROP'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'CHECK_STAGE_TRANSITIONS' }
  | { type: 'ADD_CUSTOM_VEGETABLE'; payload: Vegetable }
  | { type: 'DELETE_CUSTOM_VEGETABLE'; payload: string }


const initialState: AppState = {
  gardens: [],
  plantedCrops: [],
  notifications: [],
  customVegetables: [],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getNextStage(current: GrowthStage): GrowthStage | null {
  const stages: GrowthStage[] = [
    'semillero',
    'trasplante',
    'crecimiento',
    'floración',
    'fructificación',
    'cosecha',
    'finalizado',
  ]
  const idx = stages.indexOf(current)
  if (idx === -1 || idx >= stages.length - 1) return null
  return stages[idx + 1]
}

// ── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return {
        ...initialState,
        ...action.payload,
        customVegetables: action.payload.customVegetables ?? [],
      }

    case 'ADD_GARDEN': {
      const newGarden: Garden = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      }
      return { ...state, gardens: [...state.gardens, newGarden] }
    }

    case 'UPDATE_GARDEN':
      return {
        ...state,
        gardens: state.gardens.map(g =>
          g.id === action.payload.id ? action.payload : g
        ),
      }

    case 'DELETE_GARDEN':
      return {
        ...state,
        gardens: state.gardens.filter(g => g.id !== action.payload),
        plantedCrops: state.plantedCrops.filter(
          c => c.gardenId !== action.payload
        ),
      }

    case 'ADD_BED': {
      const bed: GardenBed = {
        ...action.payload.bed,
        id: uuidv4(),
      }
      return {
        ...state,
        gardens: state.gardens.map(g =>
          g.id === action.payload.gardenId
            ? { ...g, beds: [...g.beds, bed] }
            : g
        ),
      }
    }

    case 'PLANT_CROP': {
      const newCrop: PlantedCrop = {
        ...action.payload,
        id: uuidv4(),
        isActive: true,
        stageHistory: [
          {
            stage: action.payload.currentStage,
            date: new Date().toISOString(),
          },
        ],
      }
      // Add to bed's crop history
      const veg = [...VEGETABLES, ...(state.customVegetables ?? [])].find(
        v => v.id === action.payload.vegetableId
      )
      const updatedGardens = state.gardens.map(g => {
        if (g.id !== action.payload.gardenId) return g
        const beds = g.beds.map((b, idx) => {
          if (idx !== action.payload.bedIndex) return b
          return {
            ...b,
            cropHistory: [...b.cropHistory, action.payload.vegetableId],
          }
        })
        return { ...g, beds }
      })

      // Create notification
      const notification: Notification = {
        id: uuidv4(),
        plantedCropId: newCrop.id,
        gardenId: action.payload.gardenId,
        title: `${veg?.icon} Nuevo cultivo plantado`,
        message: `Has plantado ${veg?.name} en fase de ${action.payload.currentStage}`,
        date: new Date().toISOString(),
        read: false,
        type: 'stage_change',
      }

      return {
        ...state,
        gardens: updatedGardens,
        plantedCrops: [...state.plantedCrops, newCrop],
        notifications: [notification, ...state.notifications],
      }
    }

    case 'ADVANCE_STAGE': {
      const crop = state.plantedCrops.find(c => c.id === action.payload.cropId)
      if (!crop) return state

      const nextStage = getNextStage(crop.currentStage)
      if (!nextStage) return state

      const veg = [...VEGETABLES, ...(state.customVegetables ?? [])].find(
        v => v.id === crop.vegetableId
      )
      const stageInfo = GROWTH_STAGES.find(s => s.id === nextStage)

      const newRecord: StageRecord = {
        stage: nextStage,
        date: new Date().toISOString(),
        notes: action.payload.notes,
      }

      const notification: Notification = {
        id: uuidv4(),
        plantedCropId: crop.id,
        gardenId: crop.gardenId,
        title: `${stageInfo?.icon} ${veg?.name} - ${stageInfo?.name}`,
        message: `Tu ${veg?.name} ha avanzado a la fase de ${stageInfo?.name}. ${stageInfo?.description}`,
        date: new Date().toISOString(),
        read: false,
        type: 'stage_change',
      }

      return {
        ...state,
        plantedCrops: state.plantedCrops.map(c =>
          c.id === action.payload.cropId
            ? {
                ...c,
                currentStage: nextStage,
                stageHistory: [...c.stageHistory, newRecord],
                isActive: nextStage !== 'finalizado',
              }
            : c
        ),
        notifications: [notification, ...state.notifications],
      }
    }

    case 'UPDATE_CROP_NOTES':
      return {
        ...state,
        plantedCrops: state.plantedCrops.map(c =>
          c.id === action.payload.cropId
            ? { ...c, notes: action.payload.notes }
            : c
        ),
      }

    case 'FINISH_CROP':
      return {
        ...state,
        plantedCrops: state.plantedCrops.map(c =>
          c.id === action.payload
            ? { ...c, isActive: false, currentStage: 'finalizado' as GrowthStage }
            : c
        ),
      }

    case 'ADD_NOTIFICATION': {
      const notif: Notification = { ...action.payload, id: uuidv4() }
      return { ...state, notifications: [notif, ...state.notifications] }
    }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      }

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      }

    case 'CHECK_STAGE_TRANSITIONS': {
      const now = new Date()
      const newNotifications: Notification[] = []
      const allVegetables = [...VEGETABLES, ...(state.customVegetables ?? [])]

      const updatedCrops = state.plantedCrops.map(crop => {
        if (!crop.isActive) return crop
        const veg = allVegetables.find(v => v.id === crop.vegetableId)
        if (!veg) return crop

        const plantedDate = new Date(crop.plantedDate)
        const daysSincePlanted = Math.floor(
          (now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        let expectedStage: GrowthStage = 'semillero'
        if (daysSincePlanted >= veg.daysToHarvest) expectedStage = 'cosecha'
        else if (daysSincePlanted >= veg.daysToFlowering) expectedStage = 'fructificación'
        else if (daysSincePlanted >= veg.daysToFlowering - 10) expectedStage = 'floración'
        else if (daysSincePlanted >= veg.daysToTransplant + 14) expectedStage = 'crecimiento'
        else if (daysSincePlanted >= veg.daysToTransplant) expectedStage = 'trasplante'

        const stageOrder: GrowthStage[] = [
          'semillero', 'trasplante', 'crecimiento', 'floración', 'fructificación', 'cosecha',
        ]
        const currentIdx = stageOrder.indexOf(crop.currentStage)
        const expectedIdx = stageOrder.indexOf(expectedStage)

        if (expectedIdx > currentIdx) {
          const stageInfo = GROWTH_STAGES.find(s => s.id === expectedStage)
          newNotifications.push({
            id: uuidv4(),
            plantedCropId: crop.id,
            gardenId: crop.gardenId,
            title: `⏰ ${veg.icon} ${veg.name} debería estar en ${stageInfo?.name}`,
            message: `Han pasado ${daysSincePlanted} días desde la siembra. Revisa si tu ${veg.name} ha avanzado de fase.`,
            date: now.toISOString(),
            read: false,
            type: 'reminder',
          })
        }

        return crop
      })

      if (newNotifications.length === 0) return state

      return {
        ...state,
        plantedCrops: updatedCrops,
        notifications: [...newNotifications, ...state.notifications],
      }
    }

    case 'ADD_CUSTOM_VEGETABLE': {
      // Avoid duplicates by id
      const exists = state.customVegetables.some(v => v.id === action.payload.id)
      if (exists) {
        return {
          ...state,
          customVegetables: state.customVegetables.map(v =>
            v.id === action.payload.id ? action.payload : v
          ),
        }
      }
      return {
        ...state,
        customVegetables: [...state.customVegetables, action.payload],
      }
    }

    case 'DELETE_CUSTOM_VEGETABLE':
      return {
        ...state,
        customVegetables: state.customVegetables.filter(v => v.id !== action.payload),
      }

    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<Action>
  dbReady: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [dbReady, setDbReady] = useState(false)

  // ── Carga inicial desde IndexedDB (con migración desde localStorage) ───────
  useEffect(() => {
    async function init() {
      try {
        await DB.migrateFromLocalStorage()
        const saved = await DB.loadAll()
        dispatch({ type: 'LOAD_STATE', payload: saved as AppState })
      } catch (e) {
        console.error('[AppContext] Error al cargar desde DB:', e)
      } finally {
        setDbReady(true)
      }
    }
    init()
  }, [])

  // ── Persiste en IndexedDB cada vez que cambia el estado ───────────────────
  useEffect(() => {
    if (!dbReady) return
    DB.saveAll(state).catch(e =>
      console.error('[AppContext] Error al guardar en DB:', e)
    )
  }, [state, dbReady])

  // ── Comprueba transiciones de etapa cada hora ──────────────────────────────
  useEffect(() => {
    dispatch({ type: 'CHECK_STAGE_TRANSITIONS' })
    const interval = setInterval(() => {
      dispatch({ type: 'CHECK_STAGE_TRANSITIONS' })
    }, 1000 * 60 * 60)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, dbReady }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

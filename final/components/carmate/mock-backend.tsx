"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"

import {
  maintenanceGroups,
  serviceRecords,
  vehicle,
  type Diagnosis,
  type Part,
  type PartKey,
  type Status,
  type Vehicle,
} from "@/lib/carmate-data"

export type MaintenanceTask = {
  id: string
  name: string
  detail: string
  status: Status
  progress: number
  partKey?: PartKey
}

export type ServiceRecord = {
  id: string
  date: string
  mileage: string
  service: string
  shop: string
  notes: string
}

export type Appointment = {
  id: string
  shop: string
  partName: string
  date: string
  time: string
}

export type SavedEstimate = {
  id: string
  partKey: PartKey
  partName: string
  estimate: string
  savedAt: string
}

type BackendState = {
  vehicle: Vehicle
  maintenanceTasks: MaintenanceTask[]
  serviceRecords: ServiceRecord[]
  appointments: Appointment[]
  savedEstimates: SavedEstimate[]
  remindersEnabled: boolean
  lastUpdated: string
}

type BackendContextValue = BackendState & {
  updateVehicle: (vehicle: Vehicle) => void
  setRemindersEnabled: (enabled: boolean) => void
  completeMaintenanceTask: (taskId: string) => void
  rescheduleMaintenanceTask: (taskId: string) => void
  addServiceRecord: (record: Omit<ServiceRecord, "id">) => void
  deleteServiceRecord: (recordId: string) => void
  saveDiagnosis: (diagnosis: Diagnosis) => void
  addAppointment: (appointment: Omit<Appointment, "id">) => void
  saveEstimate: (part: Part) => void
  removeEstimate: (estimateId: string) => void
}

type BackendAction =
  | { type: "replace"; state: BackendState }
  | { type: "updateVehicle"; vehicle: Vehicle }
  | { type: "setRemindersEnabled"; enabled: boolean }
  | { type: "completeMaintenanceTask"; taskId: string }
  | { type: "rescheduleMaintenanceTask"; taskId: string }
  | { type: "addServiceRecord"; record: Omit<ServiceRecord, "id"> }
  | { type: "deleteServiceRecord"; recordId: string }
  | { type: "saveDiagnosis"; diagnosis: Diagnosis }
  | { type: "addAppointment"; appointment: Omit<Appointment, "id"> }
  | { type: "saveEstimate"; part: Part }
  | { type: "removeEstimate"; estimateId: string }

const STORAGE_KEY = "carmate:mock-backend"

const MockBackendContext = createContext<BackendContextValue | null>(null)

const initialState: BackendState = {
  vehicle,
  maintenanceTasks: maintenanceGroups.flatMap((group) =>
    group.items.map((item) => ({
      id: slugify(item.name),
      name: item.name,
      detail: item.detail,
      status: item.status,
      progress: item.progress,
      partKey: inferPartKey(item.name),
    }))
  ),
  serviceRecords: serviceRecords.map((record) => ({
    id: slugify(`${record.date}-${record.service}`),
    ...record,
  })),
  appointments: [],
  savedEstimates: [],
  remindersEnabled: true,
  lastUpdated: "Today",
}

export function MockBackendProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(backendReducer, initialState)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)

    if (stored) {
      dispatch({ type: "replace", state: sanitizeState(JSON.parse(stored)) })
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo<BackendContextValue>(
    () => ({
      ...state,
      updateVehicle: (nextVehicle) =>
        dispatch({ type: "updateVehicle", vehicle: nextVehicle }),
      setRemindersEnabled: (enabled) =>
        dispatch({ type: "setRemindersEnabled", enabled }),
      completeMaintenanceTask: (taskId) =>
        dispatch({ type: "completeMaintenanceTask", taskId }),
      rescheduleMaintenanceTask: (taskId) =>
        dispatch({ type: "rescheduleMaintenanceTask", taskId }),
      addServiceRecord: (record) => dispatch({ type: "addServiceRecord", record }),
      deleteServiceRecord: (recordId) =>
        dispatch({ type: "deleteServiceRecord", recordId }),
      saveDiagnosis: (diagnosis) => dispatch({ type: "saveDiagnosis", diagnosis }),
      addAppointment: (appointment) => dispatch({ type: "addAppointment", appointment }),
      saveEstimate: (part) => dispatch({ type: "saveEstimate", part }),
      removeEstimate: (estimateId) =>
        dispatch({ type: "removeEstimate", estimateId }),
    }),
    [state]
  )

  return (
    <MockBackendContext.Provider value={value}>
      {children}
    </MockBackendContext.Provider>
  )
}

export function useMockBackend() {
  const context = useContext(MockBackendContext)

  if (!context) {
    throw new Error("useMockBackend must be used inside MockBackendProvider")
  }

  return context
}

function backendReducer(state: BackendState, action: BackendAction): BackendState {
  switch (action.type) {
    case "replace":
      return action.state
    case "updateVehicle":
      return touch({ ...state, vehicle: action.vehicle })
    case "setRemindersEnabled":
      return touch({ ...state, remindersEnabled: action.enabled })
    case "completeMaintenanceTask": {
      const task = state.maintenanceTasks.find((item) => item.id === action.taskId)

      return touch({
        ...state,
        maintenanceTasks: state.maintenanceTasks.map((item) =>
          item.id === action.taskId
            ? {
                ...item,
                status: "done",
                progress: 100,
                detail: `Completed at ${state.vehicle.mileage} miles.`,
              }
            : item
        ),
        serviceRecords: task
          ? [
              createRecord({
                date: today(),
                mileage: state.vehicle.mileage,
                service: task.name,
                shop: "Owner update",
                notes: task.detail,
              }),
              ...state.serviceRecords,
            ]
          : state.serviceRecords,
      })
    }
    case "rescheduleMaintenanceTask":
      return touch({
        ...state,
        maintenanceTasks: state.maintenanceTasks.map((item) =>
          item.id === action.taskId
            ? {
                ...item,
                status: "soon",
                progress: Math.min(item.progress, 68),
                detail: `${item.detail} Rescheduled for the next service window.`,
              }
            : item
        ),
      })
    case "addServiceRecord":
      return touch({
        ...state,
        serviceRecords: [createRecord(action.record), ...state.serviceRecords],
      })
    case "deleteServiceRecord":
      return touch({
        ...state,
        serviceRecords: state.serviceRecords.filter(
          (record) => record.id !== action.recordId
        ),
      })
    case "saveDiagnosis": {
      const relatedTask: MaintenanceTask = {
        id: uniqueId(`diagnosis-${action.diagnosis.relatedPart}`),
        name: action.diagnosis.title,
        detail: action.diagnosis.next,
        status: action.diagnosis.urgency === "healthy" ? "soon" : action.diagnosis.urgency,
        progress: action.diagnosis.urgency === "urgent" ? 92 : 64,
        partKey: action.diagnosis.relatedPart,
      }

      return touch({
        ...state,
        maintenanceTasks: [relatedTask, ...state.maintenanceTasks],
        serviceRecords: [
          createRecord({
            date: today(),
            mileage: state.vehicle.mileage,
            service: `Diagnosis: ${action.diagnosis.title}`,
            shop: "CarMate",
            notes: `${action.diagnosis.summary} Next step: ${action.diagnosis.next}`,
          }),
          ...state.serviceRecords,
        ],
      })
    }
    case "addAppointment":
      return touch({
        ...state,
        appointments: [
          { id: uniqueId("appointment"), ...action.appointment },
          ...state.appointments,
        ],
      })
    case "saveEstimate":
      return touch({
        ...state,
        savedEstimates: [
          {
            id: uniqueId(`estimate-${action.part.key}`),
            partKey: action.part.key,
            partName: action.part.name,
            estimate: action.part.estimate,
            savedAt: today(),
          },
          ...state.savedEstimates.filter(
            (estimate) => estimate.partKey !== action.part.key
          ),
        ],
      })
    case "removeEstimate":
      return touch({
        ...state,
        savedEstimates: state.savedEstimates.filter(
          (estimate) => estimate.id !== action.estimateId
        ),
      })
    default:
      return state
  }
}

function sanitizeState(value: BackendState): BackendState {
  return {
    ...initialState,
    ...value,
    vehicle: { ...initialState.vehicle, ...value.vehicle },
    maintenanceTasks: value.maintenanceTasks?.length
      ? value.maintenanceTasks
      : initialState.maintenanceTasks,
    serviceRecords: value.serviceRecords?.length
      ? value.serviceRecords
      : initialState.serviceRecords,
    appointments: value.appointments ?? [],
    savedEstimates: value.savedEstimates ?? [],
  }
}

function touch(state: BackendState): BackendState {
  return {
    ...state,
    lastUpdated: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date()),
  }
}

function createRecord(record: Omit<ServiceRecord, "id">): ServiceRecord {
  return {
    id: uniqueId("record"),
    ...record,
  }
}

function inferPartKey(name: string): PartKey | undefined {
  const lowerName = name.toLowerCase()

  if (lowerName.includes("tire")) return "tires"
  if (lowerName.includes("brake")) return "brakes"
  if (lowerName.includes("engine") || lowerName.includes("misfire")) return "engine"
  if (lowerName.includes("fluid") || lowerName.includes("oil")) return "fluids"
  if (lowerName.includes("battery")) return "battery"

  return undefined
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

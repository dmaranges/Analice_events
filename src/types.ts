export type EventInputs = {
  totalRevenue: number
  totalInvestment: number
  totalGroupMembers: number
  activeSellersCount: number
  diasPreparacion: number
  diasVenta: number
  diasTrabajoPersona: number
}

export type EventRecord = {
  id: string
  title: string
  type: string
  modalidad: 'Pre-venta' | 'Venta Directa'
  date: string
  inputs: EventInputs
  createdAt: string
  updatedAt: string
}

export type EventForm = {
  title: string
  type: string
  customType: string
  modalidad: EventRecord['modalidad']
  date: string
  totalRevenue: string
  totalInvestment: string
  totalGroupMembers: string
  activeSellersCount: string
  diasPreparacion: string
  diasVenta: string
  diasTrabajoPersona: string
}

export type FormErrors = Partial<Record<keyof EventForm, string>>

export type EventMetrics = {
  profit: number
  roi: number | null
  profitMargin: number | null
  participationRate: number | null
  averageSalesPerSeller: number | null
  profitPerPersonDay: number | null
  categoryAverage: number | null
  previousEvent: EventRecord | null
  variation: number | null
}

const isFiniteNonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

export const isEventRecord = (value: unknown): value is EventRecord => {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Partial<EventRecord>
  const inputs = record.inputs
  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    typeof record.title === 'string' &&
    typeof record.type === 'string' &&
    (record.modalidad === 'Pre-venta' || record.modalidad === 'Venta Directa') &&
    typeof record.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.date) &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string' &&
    typeof inputs === 'object' &&
    inputs !== null &&
    isFiniteNonNegative(inputs.totalRevenue) &&
    isFiniteNonNegative(inputs.totalInvestment) &&
    Number.isInteger(inputs.totalGroupMembers) &&
    isFiniteNonNegative(inputs.totalGroupMembers) &&
    Number.isInteger(inputs.activeSellersCount) &&
    isFiniteNonNegative(inputs.activeSellersCount) &&
    inputs.activeSellersCount <= inputs.totalGroupMembers &&
    Number.isInteger(inputs.diasPreparacion) &&
    isFiniteNonNegative(inputs.diasPreparacion) &&
    Number.isInteger(inputs.diasVenta) &&
    isFiniteNonNegative(inputs.diasVenta) &&
    Number.isInteger(inputs.diasTrabajoPersona) &&
    isFiniteNonNegative(inputs.diasTrabajoPersona)
  )
}

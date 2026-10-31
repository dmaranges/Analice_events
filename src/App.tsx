import { useCallback, useMemo, useState, type FormEvent } from 'react'
import AnaliticsResume from './components/AnaliticsResume'
import AnualAnalitics from './components/AnualAnalitics'
import Navbar from './components/Navbar/Navbar'
import RegistryEvent from './components/RegistryEvent'
import { isEventRecord, type EventForm, type EventRecord, type FormErrors } from './types'

const STORAGE_KEY = 'analice-events.records.v1'
const CUSTOM_CATEGORY = '__custom_category__'

const emptyForm = (): EventForm => ({
  title: '',
  type: '',
  customType: '',
  modalidad: 'Pre-venta',
  date: '',
  totalRevenue: '',
  totalInvestment: '',
  totalGroupMembers: '',
  activeSellersCount: '',
  diasPreparacion: '',
  diasVenta: '1',
  diasTrabajoPersona: '',
})

const readSavedEvents = (): EventRecord[] => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.filter(isEventRecord) : []
  } catch {
    return []
  }
}

const validateForm = (form: EventForm): FormErrors => {
  const errors: FormErrors = {}
  if (!form.title.trim()) errors.title = 'Ingresá el nombre del evento.'
  if (form.type === CUSTOM_CATEGORY) {
    if (!form.customType.trim()) errors.customType = 'Ingresá el nombre del nuevo tipo.'
  } else if (!form.type.trim()) errors.type = 'Seleccioná una categoría.'
  if (!form.date) errors.date = 'Seleccioná la fecha del evento.'

  const amountFields = ['totalRevenue', 'totalInvestment'] as const
  amountFields.forEach((key) => {
    const value = form[key].trim() ? Number(form[key]) : Number.NaN
    if (!form[key].trim()) errors[key] = 'Este importe es obligatorio.'
    else if (!Number.isFinite(value) || value < 0) errors[key] = 'Ingresá un número válido mayor o igual a 0.'
  })

  const integerFields = ['totalGroupMembers', 'activeSellersCount', 'diasPreparacion', 'diasVenta', 'diasTrabajoPersona'] as const
  integerFields.forEach((key) => {
    const raw = form[key].trim()
    const value = raw ? Number(raw) : Number.NaN
    if (!raw) errors[key] = 'Este valor es obligatorio.'
    else if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
      errors[key] = 'Ingresá un número entero mayor o igual a 0.'
    }
  })

  const members = Number(form.totalGroupMembers)
  const sellers = Number(form.activeSellersCount)
  if (!errors.totalGroupMembers && !errors.activeSellersCount && sellers > members) {
    errors.activeSellersCount = 'Los vendedores no pueden superar el total de integrantes.'
  }
  return errors
}

const normalizeCategory = (type: string) => type.trim().toLocaleLowerCase('es-AR')

const toEventForm = (event: EventRecord): EventForm => ({
  title: event.title,
  type: event.type,
  customType: '',
  modalidad: event.modalidad,
  date: event.date,
  totalRevenue: String(event.inputs.totalRevenue),
  totalInvestment: String(event.inputs.totalInvestment),
  totalGroupMembers: String(event.inputs.totalGroupMembers),
  activeSellersCount: String(event.inputs.activeSellersCount),
  diasPreparacion: String(event.inputs.diasPreparacion),
  diasVenta: String(event.inputs.diasVenta),
  diasTrabajoPersona: String(event.inputs.diasTrabajoPersona),
})

const App = () => {
  const [events, setEvents] = useState<EventRecord[]>(readSavedEvents)
  const [filterSelectedEvents, setFilterSelectedEvents] = useState<EventRecord[] | null>(null)
  const [form, setForm] = useState<EventForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [fileNotice, setFileNotice] = useState('')
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))

  const errors = useMemo(() => validateForm(form), [form])
  const eventTypes = useMemo(
    () => [...new Map(events.map((event) => [normalizeCategory(event.type), event.type.trim()])).values()]
      .sort((a, b) => a.localeCompare(b, 'es')),
    [events],
  )
  const availableYears = useMemo(() => [...new Set([
    String(new Date().getFullYear()),
    ...events.map((event) => event.date.slice(0, 4)),
  ])].sort((a, b) => Number(b) - Number(a)), [events])
  const annualEvents = useMemo(
    () => events.filter((event) => event.date.slice(0, 4) === selectedYear),
    [events, selectedYear],
  )
  const annualAnalytics = useMemo(() => {
    const revenue = annualEvents.reduce((sum, event) => sum + event.inputs.totalRevenue, 0)
    const investment = annualEvents.reduce((sum, event) => sum + event.inputs.totalInvestment, 0)
    const profit = annualEvents.reduce((sum, event) => sum + event.inputs.totalRevenue - event.inputs.totalInvestment, 0)
    return {
      eventCount: annualEvents.length,
      revenue,
      investment,
      profit,
      averageProfit: annualEvents.length ? profit / annualEvents.length : null,
      roi: investment === 0 ? null : profit / investment * 100,
      profitMargin: revenue === 0 ? null : profit / revenue * 100,
    }
  }, [annualEvents])
  const editingEvent = events.find((event) => event.id === editingId) ?? null

  const handleFilterSelectionChange = useCallback((selectedEvents: EventRecord[]) => {
    setFilterSelectedEvents(selectedEvents)
  }, [])

  const updateEvents = (nextEvents: EventRecord[]) => {
    setEvents(nextEvents)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents))
      setStorageError('')
    } catch {
      setStorageError('No se pudo guardar en este navegador. Los cambios se perderán al recargar la página.')
    }
  }

  const handleImportFile = async (file: File) => {
    setFileNotice('')
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!Array.isArray(parsed) || !parsed.every(isEventRecord)) {
        setFileNotice('El archivo debe ser un JSON con una lista de eventos válida según el formato del gestor.')
        return
      }
      const imported = parsed as EventRecord[]
      if (new Set(imported.map((event) => event.id)).size !== imported.length) {
        setFileNotice('El archivo contiene identificadores de evento duplicados. No se importó ningún dato.')
        return
      }
      const mergedById = new Map(events.map((event) => [event.id, event]))
      imported.forEach((event) => mergedById.set(event.id, event))
      updateEvents([...mergedById.values()])
      setFileNotice(`Importación completada: ${imported.length} eventos procesados. Los identificadores existentes se actualizaron y los nuevos se agregaron.`)
    } catch {
      setFileNotice('No se pudo leer el archivo. Verificá que sea un JSON válido.')
    }
  }

  const handleClearEvents = () => {
    if (!window.confirm('¿Eliminar todos los eventos guardados por esta aplicación en este navegador? Esta acción no se puede deshacer.')) return
    updateEvents([])
    setFileNotice('Se eliminaron los eventos guardados por esta aplicación en este navegador.')
    if (editingId) resetForm()
  }

  const handleInputChange = (key: keyof EventForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validateForm(form)).length > 0) return

    const timestamp = new Date().toISOString()
    const existing = events.find((item) => item.id === editingId)
    const category = form.type === CUSTOM_CATEGORY ? form.customType.trim() : form.type.trim()
    const savedEvent: EventRecord = {
      id: existing?.id ?? (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
      title: form.title.trim(),
      type: category,
      modalidad: form.modalidad,
      date: form.date,
      inputs: {
        totalRevenue: Number(form.totalRevenue),
        totalInvestment: Number(form.totalInvestment),
        totalGroupMembers: Number(form.totalGroupMembers),
        activeSellersCount: Number(form.activeSellersCount),
        diasPreparacion: Number(form.diasPreparacion),
        diasVenta: Number(form.diasVenta),
        diasTrabajoPersona: Number(form.diasTrabajoPersona),
      },
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    const nextEvents = existing
      ? events.map((item) => item.id === existing.id ? savedEvent : item)
      : [...events, savedEvent]
    updateEvents(nextEvents.sort((first, second) =>
      second.date.localeCompare(first.date) ||
      second.createdAt.localeCompare(first.createdAt) ||
      second.id.localeCompare(first.id),
    ))
    resetForm()
  }

  const handleEdit = (event: EventRecord) => {
    setForm(toEventForm(event))
    setEditingId(event.id)
    setSubmitted(false)
    document.getElementById('event-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDelete = (event: EventRecord) => {
    if (!window.confirm(`¿Eliminar el evento “${event.title}”? Esta acción no se puede deshacer.`)) return
    updateEvents(events.filter((item) => item.id !== event.id))
    if (editingId === event.id) resetForm()
  }

  const resetForm = () => {
    setForm(emptyForm())
    setEditingId(null)
    setSubmitted(false)
  }

  const errorFor = (key: keyof EventForm) =>
    submitted || form[key].trim() !== '' ? errors[key] : undefined

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 text-left md:px-6">
      <Navbar events={events} onSelectedEventsChange={handleFilterSelectionChange} onImportFile={handleImportFile} onClearEvents={handleClearEvents} />
      <header className="mb-8">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide">Gestión de eventos</p>
        <h1 className="text-3xl font-semibold leading-tight md:text-4xl">Eventos económicos</h1>
        <p className="mt-2">Registrá los datos de cada evento y consultá sus indicadores de rendimiento.</p>
      </header>

      {storageError && <p className="mb-5 font-semibold" role="alert">{storageError}</p>}
      {fileNotice && <p className="mb-5 font-semibold" role="status">{fileNotice}</p>}

      <AnualAnalitics
        years={availableYears}
        selectedYear={selectedYear}
        analytics={annualAnalytics}
        onYearChange={setSelectedYear}
      />

      <RegistryEvent
        form={form}
        errors={errors}
        submitted={submitted}
        eventTypes={eventTypes}
        editing={Boolean(editingEvent)}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        errorFor={errorFor}
      />

      <AnaliticsResume events={events} displayedEvents={filterSelectedEvents ?? events} onEdit={handleEdit} onDelete={handleDelete} />
      <p className="text-sm">Los eventos se guardan localmente en este navegador.</p>
    </main>
  )
}

export default App
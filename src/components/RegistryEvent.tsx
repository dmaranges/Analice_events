import type { FormEvent, ReactNode } from 'react'
import type { EventForm, EventRecord, FormErrors } from '../types'

type RegistryEventProps = {
  form: EventForm
  errors: FormErrors
  submitted: boolean
  eventTypes: string[]
  editing: boolean
  onInputChange: (key: keyof EventForm, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  errorFor: (key: keyof EventForm) => string | undefined
}

const CUSTOM_CATEGORY = '__custom_category__'
const controlClass = 'min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2'
const labelClass = 'flex min-w-0 flex-col gap-1.5'
const errorClass = 'font-semibold'

const RegistryEvent = ({ form, errors, submitted, eventTypes, editing, onInputChange, onSubmit, onCancel, errorFor }: RegistryEventProps) => {
  const field = (key: keyof EventForm, label: string, control: ReactNode) => (
    <label className={labelClass} key={key}>
      <span className="font-semibold">{label}</span>
      {control}
      {errorFor(key) && <small className={errorClass} id={`error-${key}`}>{errorFor(key)}</small>}
    </label>
  )

  return (
    <section className="mb-8 rounded-lg border-2 border-[#F5D9D9] p-4 md:p-5" aria-labelledby="form-heading">
      <div className="mb-5 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <h2 className="text-xl font-semibold" id="form-heading">{editing ? 'Editar evento' : 'Registrar evento'}</h2>
          <p className="mt-1">Completá los datos del evento. Los campos marcados son obligatorios.</p>
        </div>
        {editing && <button type="button" className="min-h-9 rounded border-2 border-[#F5D9D9] px-2.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2" onClick={onCancel}>Cancelar edición</button>}
      </div>

      <form id="event-form" onSubmit={onSubmit} noValidate>
        <fieldset className="mb-5 rounded-md border-2 border-[#F5D9D9] p-4">
          <legend className="px-1 font-bold">Identificación y modalidad</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field('title', 'Nombre del evento *', <input className={controlClass} value={form.title} onChange={(event) => onInputChange('title', event.target.value)} aria-invalid={Boolean(errorFor('title'))} aria-describedby={errorFor('title') ? 'error-title' : undefined} />)}
            {field('type', 'Tipo / categoría *', <select className={controlClass} value={form.type} onChange={(event) => {
              onInputChange('type', event.target.value)
              if (event.target.value !== CUSTOM_CATEGORY) onInputChange('customType', '')
            }} aria-invalid={Boolean(errorFor('type'))} aria-describedby={errorFor('type') ? 'error-type' : undefined}>
              <option value="">Seleccioná un tipo</option>
              {eventTypes.map((type) => <option key={type.toLocaleLowerCase('es-AR')} value={type}>{type}</option>)}
              <option value={CUSTOM_CATEGORY}>+ Crear tipo personalizado</option>
            </select>)}
            {form.type === CUSTOM_CATEGORY && field('customType', 'Nuevo tipo / categoría *', <input className={controlClass} value={form.customType} onChange={(event) => onInputChange('customType', event.target.value)} aria-invalid={Boolean(errorFor('customType'))} aria-describedby={errorFor('customType') ? 'error-customType' : undefined} />)}
            {field('date', 'Fecha del evento *', <input className={controlClass} type="date" value={form.date} onChange={(event) => onInputChange('date', event.target.value)} aria-invalid={Boolean(errorFor('date'))} aria-describedby={errorFor('date') ? 'error-date' : undefined} />)}
            {field('modalidad', 'Modalidad de venta *', <select className={controlClass} value={form.modalidad} onChange={(event) => onInputChange('modalidad', event.target.value as EventRecord['modalidad'])}>
              <option value="Pre-venta">Pre-venta</option>
              <option value="Venta Directa">Venta Directa</option>
            </select>)}
          </div>
        </fieldset>

        <fieldset className="mb-5 rounded-md border-2 border-[#F5D9D9] p-4">
          <legend className="px-1 font-bold">Datos financieros</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field('totalInvestment', 'Inversión total *', <input className={controlClass} type="number" min="0" step="any" inputMode="decimal" value={form.totalInvestment} onChange={(event) => onInputChange('totalInvestment', event.target.value)} aria-invalid={Boolean(errorFor('totalInvestment'))} aria-describedby={errorFor('totalInvestment') ? 'error-totalInvestment' : undefined} />)}
            {field('totalRevenue', 'Ingresos totales *', <input className={controlClass} type="number" min="0" step="any" inputMode="decimal" value={form.totalRevenue} onChange={(event) => onInputChange('totalRevenue', event.target.value)} aria-invalid={Boolean(errorFor('totalRevenue'))} aria-describedby={errorFor('totalRevenue') ? 'error-totalRevenue' : undefined} />)}
          </div>
        </fieldset>

        <fieldset className="mb-5 rounded-md border-2 border-[#F5D9D9] p-4">
          <legend className="px-1 font-bold">Participación y esfuerzo</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field('totalGroupMembers', 'Integrantes totales *', <input className={controlClass} type="number" min="0" step="1" inputMode="numeric" value={form.totalGroupMembers} onChange={(event) => onInputChange('totalGroupMembers', event.target.value)} aria-invalid={Boolean(errorFor('totalGroupMembers'))} aria-describedby={errorFor('totalGroupMembers') ? 'error-totalGroupMembers' : undefined} />)}
            {field('activeSellersCount', 'Integrantes vendedores *', <input className={controlClass} type="number" min="0" step="1" inputMode="numeric" value={form.activeSellersCount} onChange={(event) => onInputChange('activeSellersCount', event.target.value)} aria-invalid={Boolean(errorFor('activeSellersCount'))} aria-describedby={errorFor('activeSellersCount') ? 'error-activeSellersCount' : undefined} />)}
            {field('diasPreparacion', 'Días de preparación *', <input className={controlClass} type="number" min="0" step="1" inputMode="numeric" value={form.diasPreparacion} onChange={(event) => onInputChange('diasPreparacion', event.target.value)} aria-invalid={Boolean(errorFor('diasPreparacion'))} aria-describedby={errorFor('diasPreparacion') ? 'error-diasPreparacion' : undefined} />)}
            {field('diasVenta', 'Días de venta *', <input className={controlClass} type="number" min="0" step="1" inputMode="numeric" value={form.diasVenta} onChange={(event) => onInputChange('diasVenta', event.target.value)} aria-invalid={Boolean(errorFor('diasVenta'))} aria-describedby={errorFor('diasVenta') ? 'error-diasVenta' : undefined} />)}
            {field('diasTrabajoPersona', 'Días de trabajo-persona *', <input className={controlClass} type="number" min="0" step="1" inputMode="numeric" value={form.diasTrabajoPersona} onChange={(event) => onInputChange('diasTrabajoPersona', event.target.value)} aria-invalid={Boolean(errorFor('diasTrabajoPersona'))} aria-describedby={errorFor('diasTrabajoPersona') ? 'error-diasTrabajoPersona' : undefined} />)}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-start gap-4">
          <button className="min-h-10 rounded border-2 border-[#F5D9D9] px-3.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" type="submit">{editing ? 'Guardar cambios' : 'Guardar evento'}</button>
          {submitted && Object.keys(errors).length > 0 && <p className="font-semibold" role="alert">Revisá los campos indicados antes de guardar.</p>}
        </div>
      </form>
    </section>
  )
}

export default RegistryEvent

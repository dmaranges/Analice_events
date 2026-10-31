import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { EventRecord } from '../../types'

export type ExportMode = 'all' | 'year' | 'range'
type FilterType = 'period' | 'category' | 'events'

type FilterResult = {
	selectedEvents: EventRecord[]
	exportDescription: string
	fileSuffix: string
	invalidRange: boolean
}

type FilterProps = {
	events: EventRecord[]
	onSelectionChange: (selectedEvents: EventRecord[]) => void
	children: (result: FilterResult) => ReactNode
}

const controlClass = 'min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2'
const normalizeCategory = (category: string) => category.trim().toLocaleLowerCase('es-AR')
const toFilenamePart = (value: string) => value
	.normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '')
	.toLocaleLowerCase('es-AR')
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/^-|-$/g, '')

const Filter = ({ events, onSelectionChange, children }: FilterProps) => {
	const [filterType, setFilterType] = useState<FilterType | ''>('')
	const [exportMode, setExportMode] = useState<ExportMode>('all')
	const [exportYear, setExportYear] = useState(String(new Date().getFullYear()))
	const [fromDate, setFromDate] = useState('')
	const [toDate, setToDate] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [selectedEventIds, setSelectedEventIds] = useState<string[]>([])
	const [eventToAdd, setEventToAdd] = useState('')

	const years = useMemo(() => [...new Set([
		String(new Date().getFullYear()),
		...events.map((event) => event.date.slice(0, 4)),
	])].sort((a, b) => Number(b) - Number(a)), [events])
	const categories = useMemo(() => [...new Map(events
		.filter((event) => event.type.trim())
		.map((event) => [normalizeCategory(event.type), event.type.trim()])).values()]
		.sort((a, b) => a.localeCompare(b, 'es')),
	[events])
	const invalidRange = filterType === 'period' && exportMode === 'range' && (!fromDate || !toDate || fromDate > toDate)
	const candidateEvents = useMemo(() => events.filter((event) => {
		if (filterType === 'period' && exportMode === 'year' && event.date.slice(0, 4) !== exportYear) return false
		if (filterType === 'period' && exportMode === 'range') {
			if (invalidRange || event.date < fromDate || event.date > toDate) return false
		}
		if (filterType === 'category' && (!selectedCategory || normalizeCategory(event.type) !== selectedCategory)) return false
		return true
	}), [events, filterType, exportMode, exportYear, fromDate, toDate, invalidRange, selectedCategory])
	const selectedEvents = useMemo(() => {
		if (filterType === 'events' && selectedEventIds.length === 0) return []
		const eventIds = new Set(selectedEventIds)
		return candidateEvents.filter((event) => filterType !== 'events' || eventIds.has(event.id))
	}, [candidateEvents, filterType, selectedEventIds])
	useEffect(() => {
		onSelectionChange(selectedEvents)
	}, [onSelectionChange, selectedEvents])
	const selectedEventDetails = useMemo(() => {
		const eventsById = new Map(events.map((event) => [event.id, event]))
		return selectedEventIds.flatMap((id) => {
			const event = eventsById.get(id)
			return event ? [event] : []
		})
	}, [events, selectedEventIds])
	const exportDescription = filterType === 'period'
		? exportMode === 'year' ? `año ${exportYear}` :
			exportMode === 'range' ? (invalidRange ? 'rango de fechas no válido' : `${fromDate} a ${toDate}`) :
			'todos los eventos'
		: filterType === 'category'
			? categories.find((category) => normalizeCategory(category) === selectedCategory) ?? 'ninguna categoría seleccionada'
			: filterType === 'events'
				? `${selectedEventIds.length} eventos seleccionados`
				: 'todos los eventos'
	const fileSuffix = [
		filterType === 'period'
			? exportMode === 'year' ? `-${exportYear}` :
				exportMode === 'range' && !invalidRange ? `-${fromDate}-to-${toDate}` :
				exportMode === 'range' ? '-rango-invalido' : '-todos'
			: filterType === 'category'
				? `-${toFilenamePart(selectedCategory || 'sin-categoria')}`
				: filterType === 'events'
					? `-${selectedEventIds.length}-eventos-seleccionados`
					: '-todos',
	].join('')

	const addEvent = () => {
		if (!eventToAdd || selectedEventIds.includes(eventToAdd)) return
		setSelectedEventIds((current) => [...current, eventToAdd])
		setEventToAdd('')
	}

	const removeEvent = (id: string) => {
		setSelectedEventIds((current) => current.filter((eventId) => eventId !== id))
	}

	return (
		<>
			<div className="mb-4 rounded-md border-2 border-[#F5D9D9] p-3" aria-label="Filtros de exportación">
				<label className="flex max-w-xl flex-col gap-1.5">
					<span className="font-semibold">Tipo de filtro</span>
					<select className={controlClass} value={filterType} onChange={(event) => setFilterType(event.target.value as FilterType | '')}>
						<option value="">Seleccioná qué filtro querés usar</option>
						<option value="period">Por período</option>
						<option value="category">Por categoría</option>
						<option value="events">Por eventos específicos</option>
					</select>
				</label>

				{filterType === 'period' && <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<strong className="sm:col-span-2 lg:col-span-4">Filtro por período</strong>
					<label className="flex min-w-0 flex-col gap-1.5">
						<span className="font-semibold">Qué exportar</span>
						<select className={controlClass} value={exportMode} onChange={(event) => setExportMode(event.target.value as ExportMode)}>
							<option value="all">Todos los eventos</option>
							<option value="year">Un año específico</option>
							<option value="range">Rango de fechas</option>
						</select>
					</label>
					{exportMode === 'year' && <label className="flex min-w-0 flex-col gap-1.5">
						<span className="font-semibold">Año</span>
						<select className={controlClass} value={exportYear} onChange={(event) => setExportYear(event.target.value)}>
							{years.map((year) => <option key={year} value={year}>{year}</option>)}
						</select>
					</label>}
					{exportMode === 'range' && <>
						<label className="flex min-w-0 flex-col gap-1.5">
							<span className="font-semibold">Desde</span>
							<input className={controlClass} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
						</label>
						<label className="flex min-w-0 flex-col gap-1.5">
							<span className="font-semibold">Hasta</span>
							<input className={controlClass} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
						</label>
					</>}
				</div>}

				{filterType === 'category' && <div className="mt-4 max-w-xl">
					<strong className="mb-3 block">Filtro por categoría</strong>
					<label className="flex min-w-0 flex-col gap-1.5">
						<span className="font-semibold">Categoría</span>
						<select className={controlClass} value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
							<option value="">Seleccioná una categoría</option>
							{categories.map((category) => <option key={normalizeCategory(category)} value={normalizeCategory(category)}>{category}</option>)}
						</select>
					</label>
				</div>}

				{filterType === 'events' && <div className="mt-4 flex min-w-0 flex-col gap-3">
					<strong>Seleccionar eventos específicos</strong>
					<p className="text-sm">Agregá los eventos uno por uno; solo se incluirán los eventos seleccionados.</p>
					<div className="flex flex-col gap-2 sm:flex-row">
						<label className="flex min-w-0 flex-1 flex-col gap-1.5">
							<span className="font-semibold">Evento</span>
							<select className={controlClass} value={eventToAdd} onChange={(event) => setEventToAdd(event.target.value)}>
								<option value="">Seleccioná un evento para agregar</option>
								{candidateEvents.filter((event) => !selectedEventIds.includes(event.id)).map((event) => (
									<option key={event.id} value={event.id}>{event.title} · {event.date} · {event.type}</option>
								))}
							</select>
						</label>
						<button className="min-h-10 self-end rounded border-2 border-[#F5D9D9] px-3.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={addEvent} disabled={!eventToAdd}>Agregar evento</button>
					</div>
					{selectedEventDetails.length > 0 && <ul className="flex flex-wrap gap-2" aria-label="Eventos seleccionados">
						{selectedEventDetails.map((event) => <li key={event.id} className="flex items-center gap-2 rounded border border-[#F5D9D9] px-2.5 py-1.5">
							<span>{event.title} · {event.date}</span>
							<button className="font-bold focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={() => removeEvent(event.id)} aria-label={`Quitar ${event.title}`}>×</button>
						</li>)}
					</ul>}
					{selectedEventIds.length > 0 && <button className="self-start text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={() => setSelectedEventIds([])}>Quitar todos los eventos seleccionados</button>}
					{selectedEventIds.length === 0 && <p className="font-semibold" role="status">Agregá al menos un evento para aplicar este filtro.</p>}
				</div>}
				{filterType === 'category' && !selectedCategory && <p className="mt-3 font-semibold" role="status">Seleccioná una categoría para aplicar este filtro.</p>}
				{invalidRange && <p className="mt-3 font-semibold" role="alert">Seleccioná un rango válido: ambas fechas son obligatorias y la fecha inicial no puede ser posterior a la final.</p>}
			</div>
			{children({ selectedEvents, exportDescription, fileSuffix, invalidRange })}
		</>
	)
}

export default Filter

import { useMemo, useState } from 'react'
import type { EventRecord } from '../types'

type AnaliticsResumeProps = {
	events: EventRecord[]
	displayedEvents?: EventRecord[]
	onEdit: (event: EventRecord) => void
	onDelete: (event: EventRecord) => void
}

const amountFormatter = new Intl.NumberFormat('es-AR', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})
const percentFormatter = new Intl.NumberFormat('es-AR', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
})

const normalizeCategory = (type: string) => type.trim().toLocaleLowerCase('es-AR')
const netProfit = (event: EventRecord) => event.inputs.totalRevenue - event.inputs.totalInvestment
const formatAmount = (value: number | null) => value === null ? '—' : amountFormatter.format(value)
const formatPercent = (value: number | null) => value === null ? '—' : `${percentFormatter.format(value)}%`

const AnaliticsResume = ({ events, displayedEvents = events, onEdit, onDelete }: AnaliticsResumeProps) => {
	const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [selectedType, setSelectedType] = useState('')
	const invalidDateRange = Boolean(startDate && endDate && startDate > endDate)

	const eventTypes = useMemo(
		() => [...new Map(events.map((event) => [normalizeCategory(event.type), event.type.trim()])).values()]
			.sort((a, b) => a.localeCompare(b, 'es')),
		[events],
	)
	const filteredEvents = useMemo(() => displayedEvents
		.filter((event) => {
			if (invalidDateRange) return false
			if (startDate && event.date < startDate) return false
			if (endDate && event.date > endDate) return false
			if (selectedType && normalizeCategory(event.type) !== selectedType) return false
			return true
		})
		.sort((a, b) => {
			const order = a.date.localeCompare(b.date) ||
				a.createdAt.localeCompare(b.createdAt) ||
				a.id.localeCompare(b.id)
			return sortOrder === 'newest' ? -order : order
		}), [displayedEvents, invalidDateRange, selectedType, startDate, endDate, sortOrder])
	const chronologicalFilteredEvents = useMemo(() => [...filteredEvents].sort((a, b) =>
		a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
	), [filteredEvents])
	const immediatelyPreviousEvents = useMemo(() => new Map(chronologicalFilteredEvents.map((event, index) => [
		event.id,
		index > 0 ? chronologicalFilteredEvents[index - 1] : null,
	])), [chronologicalFilteredEvents])

	const analytics = useMemo(() => {
		const chronological = [...events].sort((a, b) =>
			a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
		)

		return new Map(events.map((event) => {
			const sameCategory = events.filter(
				(candidate) => normalizeCategory(candidate.type) === normalizeCategory(event.type),
			)
			const categoryAverage = sameCategory.length
				? sameCategory.reduce((sum, candidate) => sum + netProfit(candidate), 0) / sameCategory.length
				: null
			const position = chronological.findIndex((candidate) => candidate.id === event.id)
			const previousEvent = chronological.slice(0, position).reverse().find(
				(candidate) => normalizeCategory(candidate.type) === normalizeCategory(event.type),
			) ?? null
			const profit = netProfit(event)
			const previousProfit = previousEvent ? netProfit(previousEvent) : null

			return [event.id, {
				profit,
				roi: event.inputs.totalInvestment === 0 ? null : profit / event.inputs.totalInvestment * 100,
				profitMargin: event.inputs.totalRevenue === 0 ? null : profit / event.inputs.totalRevenue * 100,
				participationRate: event.inputs.totalGroupMembers === 0
					? null
					: event.inputs.activeSellersCount / event.inputs.totalGroupMembers * 100,
				averageSalesPerSeller: event.inputs.activeSellersCount === 0
					? null
					: event.inputs.totalRevenue / event.inputs.activeSellersCount,
				profitPerPersonDay: event.inputs.diasTrabajoPersona === 0
					? null
					: profit / event.inputs.diasTrabajoPersona,
				categoryAverage,
				previousEvent,
				variation: previousProfit === null || previousProfit === 0
					? null
					: (profit - previousProfit) / previousProfit * 100,
			}] as const
		}))
	}, [events])

	return (
		<section className="mb-8" aria-labelledby="events-heading">
			<div className="mb-5 flex items-center justify-between gap-4">
				<div>
					<h2 className="text-xl font-semibold" id="events-heading">Resumen de análisis</h2>
					<p className="mt-1">{filteredEvents.length} de {events.length} eventos registrados</p>
				</div>
			</div>

			<div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filtros y orden de eventos">
				<label className="flex min-w-0 flex-col gap-1.5">
					<span className="font-semibold">Ordenar por fecha</span>
					<select className="min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'newest' | 'oldest')}>
						<option value="newest">Más recientes primero</option>
						<option value="oldest">Más antiguos primero</option>
					</select>
				</label>
				<label className="flex min-w-0 flex-col gap-1.5">
					<span className="font-semibold">Desde</span>
					<input className="min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
				</label>
				<label className="flex min-w-0 flex-col gap-1.5">
					<span className="font-semibold">Hasta</span>
					<input className="min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
				</label>
				<label className="flex min-w-0 flex-col gap-1.5">
					<span className="font-semibold">Tipo de evento</span>
					<select className="min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
						<option value="">Todos los tipos</option>
						{eventTypes.map((type) => <option key={normalizeCategory(type)} value={normalizeCategory(type)}>{type}</option>)}
					</select>
				</label>
			</div>
			{invalidDateRange && <p className="font-semibold" role="alert">La fecha inicial no puede ser posterior a la fecha final.</p>}

			{filteredEvents.length === 0 ? (
				<p className="mt-4 rounded-lg border-2 border-[#F5D9D9] p-5">{events.length === 0 ? 'Todavía no hay eventos guardados.' : 'No hay eventos que coincidan con estos filtros.'}</p>
			) : (
				<div className="mt-4 grid gap-4">
					{filteredEvents.map((event) => {
						const metrics = analytics.get(event.id)
						if (!metrics) return null
						const immediatelyPreviousEvent = immediatelyPreviousEvents.get(event.id) ?? null
						const immediatelyPreviousProfit = immediatelyPreviousEvent ? netProfit(immediatelyPreviousEvent) : null
						const immediatelyPreviousVariation = immediatelyPreviousProfit === null || immediatelyPreviousProfit === 0
							? null
							: (metrics.profit - immediatelyPreviousProfit) / Math.abs(immediatelyPreviousProfit) * 100
						return (
							<article className="rounded-lg border-2 border-[#F5D9D9] p-4 md:p-5" key={event.id}>
								<div className="mb-5 flex items-start justify-between gap-4 max-sm:flex-col">
									<div>
										<p className="mb-1 text-xs font-bold uppercase tracking-wide">{event.type} · {event.modalidad}</p>
										<h3 className="text-lg font-semibold">{event.title}</h3>
										<p>{new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${event.date}T00:00:00Z`))}</p>
									</div>
									<div className="flex shrink-0 items-center gap-3 max-sm:w-full">
										<button type="button" className="min-h-9 rounded border-2 border-[#F5D9D9] px-2.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => onEdit(event)}>Editar</button>
										<button type="button" className="min-h-9 rounded border-2 border-[#F5D9D9] px-2.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => onDelete(event)}>Eliminar</button>
									</div>
								</div>

								<dl className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Ingresos</dt><dd className="mt-1 wrap-break-word font-bold">{formatAmount(event.inputs.totalRevenue)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Inversión</dt><dd className="mt-1 wrap-break-word font-bold">{formatAmount(event.inputs.totalInvestment)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Integrantes / vendedores</dt><dd className="mt-1 wrap-break-word font-bold">{event.inputs.totalGroupMembers} / {event.inputs.activeSellersCount}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Preparación / venta (días)</dt><dd className="mt-1 wrap-break-word font-bold">{event.inputs.diasPreparacion} / {event.inputs.diasVenta}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Días-persona</dt><dd className="mt-1 wrap-break-word font-bold">{event.inputs.diasTrabajoPersona}</dd></div>
								</dl>

								<h4 className="font-semibold">Indicadores</h4>
								<dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Ganancia neta</dt><dd className="mt-1 wrap-break-word font-bold">{formatAmount(metrics.profit)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">ROI</dt><dd className="mt-1 wrap-break-word font-bold">{formatPercent(metrics.roi)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Margen de ganancia</dt><dd className="mt-1 wrap-break-word font-bold">{formatPercent(metrics.profitMargin)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Participación</dt><dd className="mt-1 wrap-break-word font-bold">{formatPercent(metrics.participationRate)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Venta promedio por vendedor</dt><dd className="mt-1 wrap-break-word font-bold">{formatAmount(metrics.averageSalesPerSeller)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Ganancia por día-persona</dt><dd className="mt-1 wrap-break-word font-bold">{formatAmount(metrics.profitPerPersonDay)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5"><dt className="text-sm">Ganancia promedio de la categoría</dt><dd className="mt-1 wrap-break-word font-bold">{formatAmount(metrics.categoryAverage)}</dd></div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5">
										<dt>Variación vs. evento anterior del tipo</dt>
										<dd className="mt-1 wrap-break-word font-bold">{formatPercent(metrics.variation)}</dd>
										{metrics.previousEvent && metrics.variation === null && <small className="mt-1 block">Ganancia del evento anterior igual a 0; variación no disponible.</small>}
										{!metrics.previousEvent && <small className="mt-1 block">Sin evento anterior de esta categoría.</small>}
									</div>
									<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-2.5">
										<dt>Variación vs. evento inmediatamente anterior</dt>
										<dd className="mt-1 wrap-break-word font-bold">{formatPercent(immediatelyPreviousVariation)}</dd>
										{immediatelyPreviousEvent
											? <small className="mt-1 block">Comparado con: {immediatelyPreviousEvent.title} ({new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(`${immediatelyPreviousEvent.date}T00:00:00Z`))}).</small>
											: <small className="mt-1 block">No hay un evento anterior.</small>}
										{immediatelyPreviousEvent && immediatelyPreviousVariation === null && <small className="mt-1 block">La ganancia del evento anterior es 0; variación no disponible.</small>}
									</div>
								</dl>
							</article>
						)
					})}
				</div>
			)}
		</section>
	)
}

export default AnaliticsResume

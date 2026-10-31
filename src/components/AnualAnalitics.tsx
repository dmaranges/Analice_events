type AnnualAnalyticsProps = {
	years: string[]
	selectedYear: string
	analytics: {
		eventCount: number
		revenue: number
		investment: number
		profit: number
		averageProfit: number | null
		roi: number | null
		profitMargin: number | null
	}
	onYearChange: (year: string) => void
}

const amountFormatter = new Intl.NumberFormat('es-AR', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})
const percentFormatter = new Intl.NumberFormat('es-AR', {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
})

const formatAmount = (value: number | null) => value === null ? '—' : amountFormatter.format(value)
const formatPercent = (value: number | null) => value === null ? '—' : `${percentFormatter.format(value)}%`

const AnualAnalitics = ({ years, selectedYear, analytics, onYearChange }: AnnualAnalyticsProps) => {
	return (
		<section className="mb-8 rounded-lg border-2 border-[#F5D9D9] p-4 md:p-5" aria-labelledby="annual-heading">
			<div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<h2 id="annual-heading">Análisis anual</h2>
					<p>Totales y promedios de todos los eventos registrados para el año seleccionado.</p>
				</div>
				<label className="flex min-w-0 flex-col gap-1.5 sm:w-36">
					<span className="font-semibold">Año</span>
					<select className="min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2" value={selectedYear} onChange={(event) => onYearChange(event.target.value)}>
						{years.map((year) => <option key={year} value={year}>{year}</option>)}
					</select>
				</label>
			</div>
			<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-3"><dt className="text-sm">Eventos</dt><dd className="mt-1 wrap-break-word font-bold">{analytics.eventCount}</dd></div>
				<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-3"><dt className="text-sm">Ingresos totales</dt><dd className="mt-1 wrap-break-word text-lg font-bold">{formatAmount(analytics.revenue)}</dd></div>
				<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-3"><dt className="text-sm">Inversión total</dt><dd className="mt-1 wrap-break-word text-lg font-bold">{formatAmount(analytics.investment)}</dd></div>
				<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-3"><dt className="text-sm">Ganancia neta total</dt><dd className="mt-1 wrap-break-word text-lg font-bold">{formatAmount(analytics.profit)}</dd></div>
				<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-3"><dt className="text-sm">Ganancia promedio por evento</dt><dd className="mt-1 wrap-break-word text-lg font-bold">{formatAmount(analytics.averageProfit)}</dd></div>
				<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-3"><dt className="text-sm">ROI anual agregado</dt><dd className="mt-1 wrap-break-word text-lg font-bold">{formatPercent(analytics.roi)}</dd></div>
				<div className="min-w-0 rounded border-2 border-[#F5D9D9] p-3"><dt className="text-sm">Margen anual agregado</dt><dd className="mt-1 wrap-break-word text-lg font-bold">{formatPercent(analytics.profitMargin)}</dd></div>
			</dl>
			<p className="mt-4 text-sm">ROI = ganancia neta total ÷ inversión total; margen = ganancia neta total ÷ ingresos totales. Si el denominador es 0, se muestra como no disponible.</p>
		</section>
	)
}

export default AnualAnalitics

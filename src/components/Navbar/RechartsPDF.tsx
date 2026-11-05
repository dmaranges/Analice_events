import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EventRecord } from '../../types'

type GraphType = 'bar' | 'line' | 'area'
type Metric = 'roi' | 'margin' | 'profit'

type RechartsControllerProps = {
  events: EventRecord[]
  exportDescription: string
  fileSuffix: string
}

type ChartDatum = {
  id: string
  title: string
  date: string
  revenue: number
  investment: number
  profit: number
  roi: number | null
  margin: number | null
  roiPlot: number
  marginPlot: number
  profitPlot: number
  roiLabel: string
  marginLabel: string
  profitLabel: string
}

const amountFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
const percentFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})
const controlClass = 'min-h-10 w-full rounded border-2 border-[#F5D9D9] bg-transparent px-2.5 py-2'

const formatAmount = (value: number) => amountFormatter.format(value)
const formatPercent = (value: number | null) => value === null ? 'N/A' : `${percentFormatter.format(value)}%`
const defaultEventId = (event: EventRecord, index: number) => {
  const date = event.date.replace(/\D/g, '') || 'sin_fecha'
  const title = event.title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-AR')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 32) || 'evento'
  return `evt_${date}_${title}_${String(index + 1).padStart(3, '0')}`
}
const tooltipFormatter = (metric: Metric) => (
  _value: unknown,
  _name: unknown,
  item: { payload?: unknown },
) => {
  if (typeof item.payload !== 'object' || item.payload === null) return 'N/A'
  const value = (item.payload as ChartDatum)[metric]
  return metric === 'profit' ? formatAmount(value ?? 0) : formatPercent(value)
}
const formatDate = (date: string) => new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeZone: 'UTC',
}).format(new Date(`${date}T00:00:00Z`))
const timestampForFilename = () => {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
}

const getPageSlices = (report: HTMLElement, canvas: HTMLCanvasElement, maxPageHeight: number) => {
  const reportTop = report.getBoundingClientRect().top
  const scaleY = canvas.height / report.scrollHeight
  const keepTogetherBlocks = Array.from(report.querySelectorAll<HTMLElement>('[data-pdf-keep-together]'))
    .map((element) => {
      const bounds = element.getBoundingClientRect()
      return {
        top: Math.max(0, Math.round((bounds.top - reportTop) * scaleY)),
        bottom: Math.min(canvas.height, Math.round((bounds.bottom - reportTop) * scaleY)),
      }
    })
    .filter((block) => block.bottom > block.top)

  const slices: Array<{ y: number; height: number }> = []
  let sourceY = 0
  while (sourceY < canvas.height) {
    const pageEnd = Math.min(sourceY + maxPageHeight, canvas.height)
    const crossingBlocks = keepTogetherBlocks.filter((block) => block.top < pageEnd && block.bottom > pageEnd)
    let sliceEnd = pageEnd

    if (crossingBlocks.length > 0) {
      const earliestBlockTop = Math.min(...crossingBlocks.map((block) => block.top))
      if (earliestBlockTop > sourceY) {
        sliceEnd = earliestBlockTop
      } else {
        // Put a single block taller than a page on its own page and scale it to fit.
        const oversizedBlock = crossingBlocks.find((block) => block.bottom - sourceY > maxPageHeight)
        if (oversizedBlock) sliceEnd = oversizedBlock.bottom
      }
    }

    if (sliceEnd <= sourceY) sliceEnd = pageEnd
    slices.push({ y: sourceY, height: sliceEnd - sourceY })
    sourceY = sliceEnd
  }
  return slices
}

const renderChart = (metric: Metric, graphType: GraphType, data: ChartDatum[]) => {
  const dataKey = metric === 'roi' ? 'roiPlot' : metric === 'margin' ? 'marginPlot' : 'profitPlot'
  const labelKey = metric === 'roi' ? 'roiLabel' : metric === 'margin' ? 'marginLabel' : 'profitLabel'
  const stroke = '#416B82'

  if (graphType === 'line') {
    return <LineChart data={data} margin={{ top: 24, right: 28, left: 8, bottom: 70 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="title" interval={0} angle={-32} textAnchor="end" height={90} />
      <YAxis unit="%" />
      <Tooltip formatter={tooltipFormatter(metric)} labelFormatter={(label: string | number) => String(label)} />
      <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={{ r: 4 }}>
        <LabelList dataKey={labelKey} position="top" />
      </Line>
    </LineChart>
  }

  if (graphType === 'area') {
    return <AreaChart data={data} margin={{ top: 24, right: 28, left: 8, bottom: 70 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="title" interval={0} angle={-32} textAnchor="end" height={90} />
      <YAxis unit="%" />
      <Tooltip formatter={tooltipFormatter(metric)} labelFormatter={(label: string | number) => String(label)} />
      <Area type="monotone" dataKey={dataKey} stroke={stroke} fill="#A8C1CF" fillOpacity={0.55}>
        <LabelList dataKey={labelKey} position="top" />
      </Area>
    </AreaChart>
  }

  return <BarChart data={data} layout="vertical" margin={{ top: 24, right: 72, left: 8, bottom: 24 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" unit={metric === 'profit' ? undefined : '%'} tickFormatter={metric === 'profit' ? (value: number) => formatAmount(value) : undefined} />
    <YAxis type="category" dataKey="title" width={160} interval={0} />
    <Tooltip formatter={tooltipFormatter(metric)} labelFormatter={(label: string | number) => String(label)} />
    <Bar dataKey={dataKey} fill={stroke}>
      <LabelList dataKey={labelKey} position="right" />
    </Bar>
  </BarChart>
}

const Graph = ({ metric, graphType, data, height = 300 }: { metric: Metric; graphType: GraphType; data: ChartDatum[]; height?: number }) => (
  <ResponsiveContainer width="100%" height={height}>
    {renderChart(metric, graphType, data)}
  </ResponsiveContainer>
)

const RechartsController = ({ events, exportDescription, fileSuffix }: RechartsControllerProps) => {
  const reportRef = useRef<HTMLDivElement>(null)
  const [roiGraph, setRoiGraph] = useState<GraphType>('bar')
  const [marginGraph, setMarginGraph] = useState<GraphType>('bar')
  const [isExporting, setIsExporting] = useState(false)
  const [notice, setNotice] = useState('')

  const chartData = useMemo<ChartDatum[]>(() => events.map((event, index) => {
    const profit = event.inputs.totalRevenue - event.inputs.totalInvestment
    const roi = event.inputs.totalInvestment === 0 ? null : profit / event.inputs.totalInvestment * 100
    const margin = event.inputs.totalRevenue === 0 ? null : profit / event.inputs.totalRevenue * 100
    return {
      id: event.id?.trim() || defaultEventId(event, index),
      title: event.title,
      date: event.date,
      revenue: event.inputs.totalRevenue,
      investment: event.inputs.totalInvestment,
      profit,
      roi,
      margin,
      roiPlot: roi ?? 0,
      marginPlot: margin ?? 0,
      profitPlot: profit,
      roiLabel: formatPercent(roi),
      marginLabel: formatPercent(margin),
      profitLabel: formatAmount(profit),
    }
  }), [events])
  const yearlyProfitData = useMemo<ChartDatum[]>(() => {
    const profitsByYear = new Map<string, number>()
    chartData.forEach((event) => {
      const year = event.date.slice(0, 4)
      if (!/^\d{4}$/.test(year)) return
      profitsByYear.set(year, (profitsByYear.get(year) ?? 0) + event.profit)
    })

    return Array.from(profitsByYear, ([year, profit]) => ({
      id: `year_${year}`,
      title: year,
      date: '',
      revenue: 0,
      investment: 0,
      profit,
      roi: null,
      margin: null,
      roiPlot: 0,
      marginPlot: 0,
      profitPlot: profit,
      roiLabel: 'N/A',
      marginLabel: 'N/A',
      profitLabel: formatAmount(profit),
    })).sort((first, second) => first.title.localeCompare(second.title))
  }, [chartData])
  const profitTimelineData = useMemo(
    () => [...chartData].sort((first, second) => first.date.localeCompare(second.date)),
    [chartData],
  )
  const reportSummary = useMemo(() => {
    const revenue = chartData.reduce((sum, event) => sum + event.revenue, 0)
    const investment = chartData.reduce((sum, event) => sum + event.investment, 0)
    const profit = chartData.reduce((sum, event) => sum + event.profit, 0)
    return {
      revenue,
      investment,
      profit,
      roi: investment === 0 ? null : profit / investment * 100,
      margin: revenue === 0 ? null : profit / revenue * 100,
    }
  }, [chartData])

  const handlePdfExport = async () => {
    if (events.length === 0) {
      setNotice('No hay eventos para generar el informe PDF.')
      return
    }
    const report = reportRef.current
    if (!report) return

    setIsExporting(true)
    setNotice('Generando PDF…')
    try {
      await document.fonts.ready
      const canvas = await html2canvas(report, {
        backgroundColor: '#EBF1F5',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1000,
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const margin = 10
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2
      const maxPageSliceHeight = Math.floor(canvas.width * pageHeight / pageWidth)
      const pageSlices = getPageSlices(report, canvas, maxPageSliceHeight)

      pageSlices.forEach(({ y, height }, pageIndex) => {
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = height
        const context = pageCanvas.getContext('2d')
        if (!context) throw new Error('Could not create a PDF page canvas.')
        context.fillStyle = '#EBF1F5'
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        context.drawImage(canvas, 0, y, canvas.width, height, 0, 0, canvas.width, height)

        if (pageIndex > 0) pdf.addPage()
        const scale = Math.min(pageWidth / canvas.width, pageHeight / height)
        const imageWidth = canvas.width * scale
        const imageHeight = height * scale
        const imageX = (pdf.internal.pageSize.getWidth() - imageWidth) / 2
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', imageX, margin, imageWidth, imageHeight)
      })

      pdf.save(`${timestampForFilename()}-event-gestor${fileSuffix}-analitica.pdf`)
      setNotice(`PDF descargado con ${events.length} eventos (${exportDescription}).`)
    } catch {
      setNotice('No se pudo generar el PDF. Intentá nuevamente con menos eventos seleccionados.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-md border-2 border-[#F5D9D9] p-3 lg:col-span-3" aria-labelledby="graph-export-heading">
      <div>
        <h3 className="font-bold" id="graph-export-heading">Exportar análisis en PDF</h3>
        <p className="mt-1 text-sm">Se incluirán {events.length} eventos ({exportDescription}).</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="font-semibold">Gráfico de ROI</span>
          <select className={controlClass} value={roiGraph} onChange={(event) => setRoiGraph(event.target.value as GraphType)}>
            <option value="bar">Barras</option>
            <option value="line">Líneas</option>
            <option value="area">Área</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="font-semibold">Gráfico de margen</span>
          <select className={controlClass} value={marginGraph} onChange={(event) => setMarginGraph(event.target.value as GraphType)}>
            <option value="bar">Barras</option>
            <option value="line">Líneas</option>
            <option value="area">Área</option>
          </select>
        </label>
      </div>
      <p className="text-sm">Si inversión o ingresos son 0, ese indicador figura como N/A; se conserva el evento y el gráfico representa el valor como 0 para mantenerlo visible.</p>
      <button className="min-h-10 rounded border-2 border-[#F5D9D9] px-3.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={handlePdfExport} disabled={isExporting || events.length === 0}>
        {isExporting ? 'Generando PDF…' : 'Descargar informe PDF'}
      </button>
      {notice && <p className="font-semibold" role="status">{notice}</p>}

      <div ref={reportRef} className="pointer-events-none fixed left-[-10000px] top-0 w-240 bg-[#EBF1F5] p-10 text-slate-900" aria-hidden="true">
        <div data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-8 border-b-2 border-[#F5D9D9] pb-5">
          <p className="text-xs font-bold uppercase tracking-wide">Gestor de eventos</p>
          <h1 className="mt-2 text-3xl font-bold">Informe de análisis económico</h1>
          <p className="mt-2">Período: {exportDescription}</p>
          <p>{events.length} eventos · Generado el {new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date())}</p>
        </div>

        <section data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Resumen del período</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded border-2 border-[#F5D9D9] p-4"><p className="text-sm">Eventos</p><p className="mt-1 text-lg font-bold">{events.length}</p></div>
            <div className="rounded border-2 border-[#F5D9D9] p-4"><p className="text-sm">Ingresos</p><p className="mt-1 text-lg font-bold">{formatAmount(reportSummary.revenue)}</p></div>
            <div className="rounded border-2 border-[#F5D9D9] p-4"><p className="text-sm">Inversión</p><p className="mt-1 text-lg font-bold">{formatAmount(reportSummary.investment)}</p></div>
            <div className="rounded border-2 border-[#F5D9D9] p-4"><p className="text-sm">Ganancia neta</p><p className="mt-1 text-lg font-bold">{formatAmount(reportSummary.profit)}</p></div>
            <div className="rounded border-2 border-[#F5D9D9] p-4"><p className="text-sm">ROI agregado</p><p className="mt-1 text-lg font-bold">{formatPercent(reportSummary.roi)}</p></div>
            <div className="rounded border-2 border-[#F5D9D9] p-4"><p className="text-sm">Margen agregado</p><p className="mt-1 text-lg font-bold">{formatPercent(reportSummary.margin)}</p></div>
          </div>
        </section>

        <section data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Ingresos en el tiempo</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={profitTimelineData} margin={{ top: 16, right: 24, left: 24, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" interval={0} tickFormatter={(value: string) => formatDate(value)} angle={-32} textAnchor="end" height={60} />
              <YAxis tickFormatter={(value: number) => formatAmount(value)} />
              <Tooltip
                labelFormatter={(label: string | number) => formatDate(String(label))}
                formatter={(value: number) => [formatAmount(value), 'Ingresos']}
              />
              <Line type="monotone" dataKey="profit" name="Ingresos" stroke="#416B82" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                <LabelList dataKey="profit" position="top" formatter={(value: number) => formatAmount(value)} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </section>

        {yearlyProfitData.length > 1 && <section data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Ganancia neta por año</h2>
          <Graph metric="profit" graphType="bar" data={yearlyProfitData} />
        </section>}

        <section data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-8">
          <h2 className="mb-3 text-xl font-bold">ROI por evento</h2>
          <Graph metric="roi" graphType={roiGraph} data={chartData} />
        </section>
        <section data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Margen de ganancia por evento</h2>
          <Graph metric="margin" graphType={marginGraph} data={chartData} />
        </section>

        <section data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-8">
          <h2 className="mb-3 text-xl font-bold">Ganancia neta por evento</h2>
          <Graph metric="profit" graphType="bar" data={chartData} height={Math.max(300, chartData.length * 38)} />
        </section>

        <section>
          <h2 data-pdf-keep-together style={{ breakInside: 'avoid' }} className="mb-3 text-xl font-bold">Detalle de eventos</h2>
          <div className="grid grid-cols-2 gap-3">
            {chartData.map((event) => (
              <article key={event.id} data-pdf-keep-together style={{ breakInside: 'avoid' }} className="rounded border-2 border-[#F5D9D9] p-4">
                <h3 className="font-bold">{event.title}</h3>
                <p className="text-sm">{formatDate(event.date)}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <dt>Ingresos</dt><dd>{formatAmount(event.revenue)}</dd>
                  <dt>Inversión</dt><dd>{formatAmount(event.investment)}</dd>
                  <dt>Ganancia neta</dt><dd>{formatAmount(event.profit)}</dd>
                  <dt>ROI</dt><dd>{formatPercent(event.roi)}</dd>
                  <dt>Margen</dt><dd>{formatPercent(event.margin)}</dd>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default RechartsController

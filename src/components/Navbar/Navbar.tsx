import { useRef, useState, type ChangeEvent } from 'react'
import RechartsController from './RechartsPDF'
import Filter from './Filter'
import type { EventRecord } from '../../types'

type NavbarProps = {
	events: EventRecord[]
	onSelectedEventsChange: (selectedEvents: EventRecord[]) => void
	onImportFile: (file: File) => void
	onClearEvents: () => void
}

const Navbar = ({ events, onSelectedEventsChange, onImportFile, onClearEvents }: NavbarProps) => {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [notice, setNotice] = useState('')

	const handleImportSelection = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) onImportFile(file)
		event.target.value = ''
	}

	return (
		<nav className="mb-8 border-b border-[#F5D9D9] pb-5" aria-label="Importar, exportar y administrar eventos">
			<div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-baseline">
				<strong>Datos de eventos</strong>
				<span className="text-sm">{events.length} guardados en este navegador</span>
			</div>
			<Filter events={events} onSelectionChange={onSelectedEventsChange}>{({ selectedEvents, exportDescription, fileSuffix, invalidRange }) => {
				const handleExport = () => {
					if (invalidRange) {
						setNotice('Seleccioná un rango válido antes de exportar.')
						return
					}
					if (selectedEvents.length === 0) {
						setNotice('No hay eventos para exportar con los filtros seleccionados.')
						return
					}

					const now = new Date()
					const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
					const blob = new Blob([JSON.stringify(selectedEvents, null, 2)], { type: 'application/json' })
					const url = URL.createObjectURL(blob)
					const link = document.createElement('a')
					link.href = url
					link.download = `${timestamp}-event-gestor${fileSuffix}.json`
					document.body.append(link)
					link.click()
					link.remove()
					URL.revokeObjectURL(url)
					setNotice(`Exportados ${selectedEvents.length} eventos.`)
				}

				return <>
				<div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<fieldset className="flex min-w-0 flex-wrap items-end gap-3 rounded-md border-2 border-[#F5D9D9] p-3 max-md:flex-col max-md:items-stretch">
					<legend className="px-1 font-bold">Exportar eventos</legend>
					<p className="mt-1 text-sm">Se incluirán {selectedEvents.length} eventos ({exportDescription}).</p>
					<button className="min-h-10 rounded border-2 border-[#F5D9D9] px-3.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={handleExport}>Descargar JSON</button>
				</fieldset>

				<fieldset className="flex min-w-0 flex-col justify-center gap-3 rounded-md border-2 border-[#F5D9D9] p-3">
					<legend className="px-1 font-bold">Almacenamiento local</legend>
					<button className="min-h-9 rounded border-2 border-[#F5D9D9] px-2.5 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={onClearEvents}>Limpiar eventos guardados</button>
					<small className="leading-snug">Solo elimina los datos de eventos de esta aplicación.</small>
				</fieldset>

				<fieldset className="flex min-w-0 flex-col justify-center gap-3 rounded-md border-2 border-[#F5D9D9] p-3">
					<legend className="px-1 font-bold">Importar archivo JSON</legend>
					<input ref={fileInputRef} className="sr-only" type="file" accept=".json,application/json" onChange={handleImportSelection} />
					<button className="min-h-10 rounded border-2 border-[#F5D9D9] px-3.5 py-2 focus-visible:outline-2 focus-visible:outline-offset-2" type="button" onClick={() => fileInputRef.current?.click()}>Seleccionar archivo</button>
					<small className="leading-snug">Combina los eventos por identificador; los IDs coincidentes se actualizan.</small>
				</fieldset>
				<RechartsController
					events={selectedEvents}
					exportDescription={exportDescription}
					fileSuffix={fileSuffix}
				/>
			</div>
				{notice && <p className="mt-3 font-semibold" role="status">{notice}</p>}
				</>
			}}</Filter>
		</nav>
	)
}

export default Navbar

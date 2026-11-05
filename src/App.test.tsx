import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { EventRecord } from './types'

vi.mock('./components/Navbar/Navbar', () => ({
  default: () => null,
}))

const STORAGE_KEY = 'analice-events.records.v1'

const fillEventForm = async (user: ReturnType<typeof userEvent.setup>, title: string) => {
  await user.type(screen.getByLabelText(/Nombre del evento/), title)
  await user.selectOptions(screen.getByLabelText(/Tipo \/ categoría/), '__custom_category__')
  await user.type(screen.getByLabelText(/Nuevo tipo \/ categoría/), 'Feria')
  fireEvent.change(screen.getByLabelText(/Fecha del evento/), { target: { value: '2026-03-15' } })
  await user.type(screen.getByLabelText(/Inversión total/), '40')
  await user.type(screen.getByLabelText(/Ingresos totales/), '100')
  await user.type(screen.getByLabelText(/Integrantes totales/), '10')
  await user.type(screen.getByLabelText(/Integrantes vendedores/), '6')
  await user.type(screen.getByLabelText(/Días de preparación/), '2')
  await user.type(screen.getByLabelText(/Días de venta/), '1')
  await user.type(screen.getByLabelText(/Días de trabajo-persona/), '8')
}

describe('event registration workflow', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves an event, calculates its profit, and restores it after remount', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)

    await fillEventForm(user, 'Festival')
    await user.click(screen.getByRole('button', { name: 'Guardar evento' }))

    expect(await screen.findByRole('heading', { name: 'Festival' })).toBeInTheDocument()
    const savedEvents = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]') as EventRecord[]
    expect(savedEvents).toHaveLength(1)
    expect(savedEvents[0]).toMatchObject({
      title: 'Festival',
      type: 'Feria',
      inputs: { totalRevenue: 100, totalInvestment: 40 },
    })

    const eventCard = screen.getByRole('heading', { name: 'Festival' }).closest('article')
    expect(eventCard).not.toBeNull()
    const profitMetric = within(eventCard as HTMLElement).getByText('Ganancia neta').parentElement
    expect(profitMetric).not.toBeNull()
    expect(within(profitMetric as HTMLElement).getByText('60,00')).toBeInTheDocument()

    firstRender.unmount()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Festival' })).toBeInTheDocument()
  })

  it('blocks saving when active sellers exceed total group members', async () => {
    const user = userEvent.setup()
    render(<App />)
    await fillEventForm(user, 'Evento inválido')
    await user.clear(screen.getByLabelText(/Integrantes totales/))
    await user.type(screen.getByLabelText(/Integrantes totales/), '2')
    await user.clear(screen.getByLabelText(/Integrantes vendedores/))
    await user.type(screen.getByLabelText(/Integrantes vendedores/), '3')

    await user.click(screen.getByRole('button', { name: 'Guardar evento' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Revisá los campos indicados antes de guardar.')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
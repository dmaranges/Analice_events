import { describe, expect, it } from 'vitest'
import { isEventRecord } from './types'
import type { EventRecord } from './types'

const validEvent: EventRecord = {
  id: 'event-1',
  title: 'Festival',
  type: 'Feria',
  modalidad: 'Pre-venta',
  date: '2026-03-15',
  inputs: {
    totalRevenue: 100,
    totalInvestment: 40,
    totalGroupMembers: 10,
    activeSellersCount: 6,
    diasPreparacion: 2,
    diasVenta: 1,
    diasTrabajoPersona: 8,
  },
  createdAt: '2026-03-15T12:00:00.000Z',
  updatedAt: '2026-03-15T12:00:00.000Z',
}

describe('isEventRecord', () => {
  it('accepts a valid event record', () => {
    expect(isEventRecord(validEvent)).toBe(true)
  })

  it.each([
    ['a non-object value', null],
    ['a malformed date', { ...validEvent, date: '15/03/2026' }],
    ['negative revenue', { ...validEvent, inputs: { ...validEvent.inputs, totalRevenue: -1 } }],
    ['more sellers than group members', {
      ...validEvent,
      inputs: { ...validEvent.inputs, activeSellersCount: 11 },
    }],
  ])('rejects %s', (_description, value) => {
    expect(isEventRecord(value)).toBe(false)
  })
})
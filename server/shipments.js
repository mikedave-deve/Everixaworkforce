import { SHIPMENT_STAGES } from './domain.js'

/** What an employee (or the public tracker) is allowed to see about a shipment. */
export function shipmentView(s) {
  return {
    id: String(s._id),
    tracking: s.tracking,
    reference: s.reference ?? '',
    service: s.service ?? '',
    weightKg: s.weightKg ?? null,
    from: s.from ?? {},
    to: s.to ?? {},
    stages: SHIPMENT_STAGES,
    stage: s.stage ?? 0,
    paused: Boolean(s.paused),
    pauseReason: s.paused ? s.pauseReason ?? '' : '',
    pausedAt: s.paused ? s.pausedAt ?? null : null,
    status: s.paused ? 'Paused' : SHIPMENT_STAGES[s.stage ?? 0],
    estimatedDelivery: s.estimatedDelivery ?? null,
    lastUpdated: s.updatedAt ?? s.createdAt,
    history: (s.history ?? []).slice(-12).reverse(),
  }
}

export const normalizeTracking = (v) => String(v ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40)

export function newTracking() {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')
  return `EW${digits}`
}

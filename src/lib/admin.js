import { api } from './api'

/** Tells the admin sidebar to refresh its counts after something changes. */
export const adminChanged = () => window.dispatchEvent(new Event('everixa:admin-changed'))

export const TYPE_LABEL = {
  account: 'Account request', timesheet: 'Timesheet', timeoff: 'Time off', tax: 'Tax form', benefits: 'Benefits', identity: 'Identity',
}

export const decideApproval = async (type, id, decision, note) => {
  await api.post(`/admin/approvals/${type}/${id}`, { decision, note })
  adminChanged()
}

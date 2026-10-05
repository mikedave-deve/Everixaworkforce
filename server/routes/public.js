import { getDb, oid } from '../db.js'
import { bad, email as vEmail, phone as vPhone, rateLimit, readBody, readJson, str } from '../http.js'
import { notifyCompany } from '../mailer.js'
import { adminNotice } from '../emails.js'
import { saveFile } from '../storage.js'

/** Website forms (Contact, Apply Now, Submit Resume) — no login, rate-limited, honeypot-protected. */
async function record(type, data, fileId) {
  const db = await getDb()
  const { insertedId } = await db.collection('submissions').insertOne({
    type, data, fileId: fileId ? oid(fileId) : null, createdAt: new Date(), handled: false,
  })
  return insertedId
}

export function registerPublic(r) {
  r.post('/public/upload', async (ctx) => {
    rateLimit(`pub-upload:${ctx.ip}`, { limit: 10, windowMs: 3600e3 })
    const buffer = await readBody(ctx.req, 4 * 1024 * 1024)
    const name = decodeURIComponent(String(ctx.req.headers['x-filename'] ?? 'resume'))
    const file = await saveFile({ buffer, name, kind: 'resume', allowed: 'doc' })
    return { id: file.id }
  })

  r.post('/public/contact', async (ctx) => {
    rateLimit(`contact:${ctx.ip}`, { limit: 6, windowMs: 3600e3 })
    const b = await readJson(ctx.req)
    if (b.website) return ctx.ok({ ok: true, success: true })
    const data = {
      firstName: str(b.firstName, { field: 'First name', min: 1, max: 60 }),
      lastName: str(b.lastName, { field: 'Last name', min: 1, max: 60 }),
      email: vEmail(b.email),
      phone: b.phone ? vPhone(b.phone) : '',
      inquiryType: str(b.inquiryType, { field: 'Inquiry type', min: 1, max: 40 }),
      company: str(b.company, { max: 120 }),
      message: str(b.message, { field: 'Message', min: 3, max: 4000 }),
    }
    await record('contact', data)
    await notifyCompany(adminNotice({
      eyebrow: 'Contact form',
      title: `${data.firstName} ${data.lastName} sent a message`,
      fields: [['Name', `${data.firstName} ${data.lastName}`], ['Email', data.email], ['Phone', data.phone], ['Inquiry', data.inquiryType], ['Company', data.company], ['Message', data.message]],
      link: '/admin/inbox',
    }))
    ctx.ok({ ok: true, success: true })
  })

  r.post('/public/apply', async (ctx) => {
    rateLimit(`apply:${ctx.ip}`, { limit: 6, windowMs: 3600e3 })
    const b = await readJson(ctx.req)
    if (b.website) return ctx.ok({ ok: true, success: true })
    const data = {
      fullName: str(b.fullName, { field: 'Full name', min: 2, max: 120 }),
      email: vEmail(b.email),
      phone: vPhone(b.phone),
      dob: str(b.dob, { field: 'Date of birth', min: 6, max: 20 }),
      address: str(b.address, { field: 'Home address', min: 4, max: 250 }),
      jobPosition: str(b.jobPosition, { field: 'Job position', min: 1, max: 120 }),
      additionalInfo: str(b.additionalInfo, { max: 500 }),
      availability: str(b.availability, { field: 'Availability', min: 1, max: 40 }),
      workDuration: str(b.workDuration, { field: 'Work duration', min: 1, max: 60 }),
      message: str(b.message, { max: 3000 }),
    }
    await record('apply', data)
    await notifyCompany(adminNotice({
      eyebrow: 'Job application',
      title: `${data.fullName} applied for ${data.jobPosition}`,
      fields: [['Name', data.fullName], ['Email', data.email], ['Phone', data.phone], ['Date of birth', data.dob], ['Address', data.address], ['Position', data.jobPosition], ['Availability', data.availability], ['Duration', data.workDuration], ['Additional info', data.additionalInfo], ['Message', data.message]],
      link: '/admin/inbox',
    }))
    ctx.ok({ ok: true, success: true })
  })

  r.post('/public/resume', async (ctx) => {
    rateLimit(`resume:${ctx.ip}`, { limit: 6, windowMs: 3600e3 })
    const b = await readJson(ctx.req)
    if (b.website) return ctx.ok({ ok: true, success: true })
    const db = await getDb()
    const file = await db.collection('files').findOne({ _id: oid(b.fileId), kind: 'resume' })
    if (!file) throw bad('Please attach your resume before submitting.')
    const data = {
      firstName: str(b.firstName, { field: 'First name', min: 1, max: 60 }),
      lastName: str(b.lastName, { field: 'Last name', min: 1, max: 60 }),
      email: vEmail(b.email),
      phone: vPhone(b.phone),
      industry: str(b.industry, { field: 'Industry', min: 1, max: 80 }),
      message: str(b.message, { max: 3000 }),
      fileName: file.name,
    }
    await record('resume', data, b.fileId)
    await notifyCompany(adminNotice({
      eyebrow: 'Resume submission',
      title: `${data.firstName} ${data.lastName} submitted a resume`,
      intro: 'The resume file can be downloaded from the admin portal inbox.',
      fields: [['Name', `${data.firstName} ${data.lastName}`], ['Email', data.email], ['Phone', data.phone], ['Industry', data.industry], ['Resume file', data.fileName], ['Message', data.message]],
      link: '/admin/inbox',
    }))
    ctx.ok({ ok: true, success: true })
  })
}

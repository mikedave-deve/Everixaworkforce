import { createRouter } from './http.js'
import { registerAuth } from './routes/auth.js'
import { registerPublic } from './routes/public.js'
import { registerEmployee } from './routes/employee.js'
import { registerAdmin } from './routes/admin.js'

const router = createRouter()
registerAuth(router)
registerPublic(router)
registerEmployee(router)
registerAdmin(router)

/** Single entry point shared by the Vercel function and the local dev servers. */
export const handle = (req, res) => router.handle(req, res)

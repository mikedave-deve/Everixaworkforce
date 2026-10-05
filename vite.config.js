import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

/**
 * Serves the API from the same dev server as the frontend, so `npm run dev` is the
 * only command needed. In production the same handler runs as a Vercel Function
 * (see api/[...route].js).
 */
function localApi(mode) {
  return {
    name: 'everixa-local-api',
    apply: 'serve',
    config() {
      // Make .env visible to the server code (Vite only exposes VITE_* to the browser).
      const env = loadEnv(mode, process.cwd(), '')
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) return next()
        try {
          const { handle } = await server.ssrLoadModule('/server/app.js')
          await handle(req, res)
        } catch (err) {
          console.error('[api]', err)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Server error while starting the API. Check the terminal.' }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(mode)],
}))

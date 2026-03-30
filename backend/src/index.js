/**
 * index.js  —  Servidor Express para HuertoApp
 *
 * Variables de entorno requeridas (en Render: Environment → Add variables):
 *   MONGODB_URI    Connection string de MongoDB Atlas
 *   MONGODB_DB     Nombre de la BD (por defecto "huerto")
 *   API_SECRET     Secreto para proteger los endpoints (opcional pero recomendado)
 *   ALLOWED_ORIGIN URL del frontend en Vercel, p.ej. https://huerto-app.vercel.app
 *                  Acepta * para desarrollo, o varias URLs separadas por coma.
 */
require('dotenv').config()

const express = require('express')
const cors    = require('cors')

const syncRouter   = require('./routes/sync')
const healthRouter = require('./routes/health')

const app  = express()
const PORT = process.env.PORT ?? 4000

// ── CORS ──────────────────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGIN ?? '*'
const allowedOrigins = rawOrigins.split(',').map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (curl, Postman, mismo servidor)
    if (!origin) return callback(null, true)
    // Permitir si hay un '*' en la lista o el origin está en la lista
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error(`CORS: origen no permitido → ${origin}`))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Api-Secret'],
}))

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))

// ── Auth middleware ───────────────────────────────────────────────────────────
app.use('/api/sync', (req, res, next) => {
  const secret = process.env.API_SECRET
  if (!secret) return next()                        // sin secreto → sin restricción
  const provided = req.headers['x-api-secret']
  if (provided !== secret) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  next()
})

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/api/sync',   syncRouter)
app.use('/api/health', healthRouter)

app.get('/', (_req, res) =>
  res.json({ service: 'HuertoApp API', status: 'ok' })
)

// ── Arranque ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Escuchando en http://localhost:${PORT}`)
})

/**
 * routes/sync.js
 *
 * GET  /api/sync?collection=<nombre>   → devuelve todos los docs de esa colección
 * POST /api/sync?collection=<nombre>   → reemplaza toda la colección (body: array JSON)
 *
 * Colecciones válidas: gardens | crops | notifications | customVegetables | seedlings
 */
const { Router } = require('express')
const { getDb }  = require('../mongo')

const router = Router()

const ALLOWED = new Set(['gardens', 'crops', 'notifications', 'customVegetables', 'seedlings'])

// Middleware: valida nombre de colección
function validateCollection(req, res, next) {
  const col = req.query.collection
  if (!ALLOWED.has(col)) {
    return res.status(400).json({ error: `Colección inválida: "${col}". Valores posibles: ${[...ALLOWED].join(', ')}` })
  }
  next()
}

// GET /api/sync?collection=gardens
router.get('/', validateCollection, async (req, res) => {
  try {
    const db   = await getDb()
    const docs = await db
      .collection(req.query.collection)
      .find({}, { projection: { _id: 0 } })
      .toArray()
    res.json(docs)
  } catch (err) {
    console.error('[sync GET]', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/sync?collection=gardens   body: [ {...}, {...} ]
router.post('/', validateCollection, async (req, res) => {
  const body = req.body
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: 'El cuerpo debe ser un array JSON' })
  }
  try {
    const db  = await getDb()
    const col = db.collection(req.query.collection)

    await col.deleteMany({})
    if (body.length > 0) {
      await col.insertMany(body, { ordered: false })
    }
    res.json({ ok: true, upserted: body.length })
  } catch (err) {
    console.error('[sync POST]', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

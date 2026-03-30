/**
 * routes/health.js
 * GET /api/health  →  comprueba conexión a MongoDB Atlas
 */
const { Router } = require('express')
const { getDb }  = require('../mongo')

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const db = await getDb()
    await db.command({ ping: 1 })
    res.json({ ok: true, db: db.databaseName, ts: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

module.exports = router

/**
 * mongo.js
 * Conexión singleton a MongoDB Atlas.
 * Se reutiliza entre peticiones para no abrir una conexión nueva cada vez.
 */
const { MongoClient } = require('mongodb')

const URI     = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB ?? 'huerto'

if (!URI) throw new Error('Falta la variable de entorno MONGODB_URI')

let client = null

async function getDb() {
  if (!client) {
    client = new MongoClient(URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10_000,
    })
    await client.connect()
    console.log(`[MongoDB] Conectado a "${DB_NAME}"`)
  }
  return client.db(DB_NAME)
}

module.exports = { getDb }

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

let autoSeeded = false

async function ensureSeedData() {
  if (autoSeeded) return
  autoSeeded = true
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL
  if (!uri) {
    throw new Error('Please define MONGODB_URI or DATABASE_URL in Vercel Environment Variables.')
  }

  if (cached.conn) {
    await ensureSeedData()
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'kisan_portal'
    }

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m
    })
  }

  try {
    cached.conn = await cached.promise
    await ensureSeedData()
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

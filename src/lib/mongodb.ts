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
  try {
    const User = mongoose.models.User || mongoose.model('User')
    const userCount = await User.countDocuments()
    if (userCount === 0) {
      console.log('No users found in database. Auto-seeding demo accounts...')
      const passwordHash = bcrypt.hashSync('password123', 10)
      
      await User.create({
        name: 'Rajesh Kumar (HQ Procurement Officer)',
        phoneNumber: '9876543212',
        passwordHash,
        role: 'ADMIN',
        language: 'en'
      })

      await User.create({
        name: 'Suresh Verma (Supervisor)',
        phoneNumber: '9876543211',
        passwordHash,
        role: 'WORKER',
        language: 'hi'
      })

      await User.create({
        name: 'Ramesh Singh',
        phoneNumber: '9876543210',
        passwordHash,
        role: 'FARMER',
        language: 'hi'
      })
      console.log('✅ Auto-seed demo accounts finished successfully!')
    }
    autoSeeded = true
  } catch (err) {
    console.error('Auto-seed check warning:', err)
  }
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

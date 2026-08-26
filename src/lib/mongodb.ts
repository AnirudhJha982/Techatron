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
    const FarmerProfile = mongoose.models.FarmerProfile || mongoose.model('FarmerProfile')
    const WorkerProfile = mongoose.models.WorkerProfile || mongoose.model('WorkerProfile')
    const AdminProfile = mongoose.models.AdminProfile || mongoose.model('AdminProfile')
    const ProcurementCentre = mongoose.models.ProcurementCentre || mongoose.model('ProcurementCentre')

    const passwordHash = bcrypt.hashSync('password123', 10)

    // Ensure Procurement Centres exist
    const centreCount = await ProcurementCentre.countDocuments()
    let defaultCentreId = null
    if (centreCount === 0) {
      const centre = await ProcurementCentre.create({
        name: 'Mandi Samiti - Karnal Main',
        state: 'Haryana',
        district: 'Karnal',
        address: 'GT Road, Near Grain Market, Karnal - 132001',
        capacityPerDay: 500,
        isActive: true
      })
      defaultCentreId = centre._id
    } else {
      const c: any = await ProcurementCentre.findOne().lean()
      defaultCentreId = c?._id
    }

    // Demo Farmers Data (10 Accounts)
    const farmerAccounts = [
      { name: 'Ramesh Singh', phone: '9876543210', village: 'Nilokheri', district: 'Karnal', state: 'Haryana', acres: 8.5, lang: 'hi' },
      { name: 'Gurpreet Singh', phone: '9876543201', village: 'Jagraon', district: 'Ludhiana', state: 'Punjab', acres: 12.0, lang: 'pa' },
      { name: 'Baldev Sharma', phone: '9876543202', village: 'Ladwa', district: 'Kurukshetra', state: 'Haryana', acres: 6.0, lang: 'hi' },
      { name: 'Harpreet Dhillon', phone: '9876543203', village: 'Khanna', district: 'Ludhiana', state: 'Punjab', acres: 15.5, lang: 'pa' },
      { name: 'Ramotar Yadav', phone: '9876543204', village: 'Ramganj', district: 'Kota', state: 'Rajasthan', acres: 5.0, lang: 'hi' },
      { name: 'Vikas Patil', phone: '9876543205', village: 'Niphad', district: 'Nashik', state: 'Maharashtra', acres: 9.2, lang: 'mr' },
      { name: 'Satish Verma', phone: '9876543206', village: 'Nawabganj', district: 'Bareilly', state: 'Uttar Pradesh', acres: 7.0, lang: 'hi' },
      { name: 'Manjeet Kaur', phone: '9876543207', village: 'Samrala', district: 'Ludhiana', state: 'Punjab', acres: 10.0, lang: 'pa' },
      { name: 'Devendra Choudhary', phone: '9876543208', village: 'Sangod', district: 'Kota', state: 'Rajasthan', acres: 4.5, lang: 'hi' },
      { name: 'Anil Deshmukh', phone: '9876543209', village: 'Dindori', district: 'Nashik', state: 'Maharashtra', acres: 11.0, lang: 'mr' }
    ]

    for (const f of farmerAccounts) {
      let user = await User.findOne({ phoneNumber: f.phone })
      if (!user) {
        user = await User.create({
          name: f.name,
          phoneNumber: f.phone,
          passwordHash,
          role: 'FARMER',
          language: f.lang
        })
      }
      const existingProfile = await FarmerProfile.findOne({ userId: user._id })
      if (!existingProfile) {
        await FarmerProfile.create({
          userId: user._id,
          address: `Village ${f.village}, ${f.district}, ${f.state}`,
          village: f.village,
          district: f.district,
          state: f.state,
          landSizeAcres: f.acres,
          farmerId: `KF-${f.phone.slice(-6)}`,
          mobileVerified: true,
          farmerIdVerified: true,
          kycStatus: 'VERIFIED',
          bankAccountName: f.name,
          bankName: 'State Bank of India',
          bankAccountMasked: `XXXX-XXXX-${f.phone.slice(-4)}`,
          ifscCode: 'SBIN0001245',
          bankDetailsVerified: true,
          bookingEligible: true,
          verificationCompletedAt: new Date()
        })
      }
    }

    // Unverified Level 1 Basic Farmer Accounts (2 Accounts)
    const unverifiedAccounts = [
      { name: 'Sohan Lal (Unverified Basic Farmer)', phone: '9876543200', village: 'Nilokheri', district: 'Karnal', state: 'Haryana', acres: 4.0, lang: 'hi' },
      { name: 'Kishan Kumar (Unverified Basic Farmer)', phone: '9876543299', village: 'Samrala', district: 'Ludhiana', state: 'Punjab', acres: 3.5, lang: 'pa' }
    ]

    for (const f of unverifiedAccounts) {
      let user = await User.findOne({ phoneNumber: f.phone })
      if (!user) {
        user = await User.create({
          name: f.name,
          phoneNumber: f.phone,
          passwordHash,
          role: 'FARMER',
          language: f.lang
        })
      }
      const existingProfile = await FarmerProfile.findOne({ userId: user._id })
      if (!existingProfile) {
        await FarmerProfile.create({
          userId: user._id,
          address: `Village ${f.village}, ${f.district}, ${f.state}`,
          village: f.village,
          district: f.district,
          state: f.state,
          landSizeAcres: f.acres,
          mobileVerified: true,
          farmerIdVerified: false,
          kycStatus: 'NOT_VERIFIED',
          bankDetailsVerified: false,
          bookingEligible: false
        })
      }
    }

    // Demo Worker Accounts (5 Accounts)
    const workerAccounts = [
      { name: 'Suresh Verma (Supervisor)', phone: '9876543211' },
      { name: 'Harminder Singh (Supervisor)', phone: '9876543221' },
      { name: 'Mukesh Meena (Supervisor)', phone: '9876543222' },
      { name: 'Ganesh Shinde (Supervisor)', phone: '9876543223' },
      { name: 'Rakesh Gangwar (Supervisor)', phone: '9876543224' }
    ]
    for (const w of workerAccounts) {
      let user = await User.findOne({ phoneNumber: w.phone })
      if (!user) {
        user = await User.create({
          name: w.name,
          phoneNumber: w.phone,
          passwordHash,
          role: 'WORKER',
          language: 'hi'
        })
      }
      const existingProfile = await WorkerProfile.findOne({ userId: user._id })
      if (!existingProfile) {
        await WorkerProfile.create({
          userId: user._id,
          centreId: defaultCentreId
        })
      }
    }

    // Demo Admin Accounts (5 Accounts)
    const adminAccounts = [
      { name: 'Rajesh Kumar (HQ Officer)', phone: '9876543212' },
      { name: 'Sunil Grover (Commissioner)', phone: '9876543231' },
      { name: 'Pooja Sharma (Auditor)', phone: '9876543232' },
      { name: 'Vikramaditya Roy (Director)', phone: '9876543233' },
      { name: 'Anita Deshpande (IT Lead)', phone: '9876543234' }
    ]
    for (const a of adminAccounts) {
      let user = await User.findOne({ phoneNumber: a.phone })
      if (!user) {
        user = await User.create({
          name: a.name,
          phoneNumber: a.phone,
          passwordHash,
          role: 'ADMIN',
          language: 'en'
        })
      }
      const existingProfile = await AdminProfile.findOne({ userId: user._id })
      if (!existingProfile) {
        await AdminProfile.create({
          userId: user._id,
          department: 'HQ Procurement'
        })
      }
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

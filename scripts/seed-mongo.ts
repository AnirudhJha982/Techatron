import fs from 'fs'
import path from 'path'

// Read .env manually for standalone script execution
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8')
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const val = valueParts.join('=').replace(/^["']|["']$/g, '')
        process.env[key.trim()] = val.trim()
      }
    }
  }
}

import { connectToDatabase } from '../src/lib/mongodb'
import {
  User,
  FarmerProfile,
  WorkerProfile,
  AdminProfile,
  ProcurementCentre,
  Slot,
  Booking,
  Procurement,
  Payment,
  Notification,
  Grievance,
  AuditLog
} from '../src/models'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Seeding MongoDB database with 10 Farmers, 5 Workers, and 5 Admins...')
  await connectToDatabase()

  // Clear existing collections
  await AuditLog.deleteMany({})
  await Notification.deleteMany({})
  await Grievance.deleteMany({})
  await Payment.deleteMany({})
  await Procurement.deleteMany({})
  await Booking.deleteMany({})
  await Slot.deleteMany({})
  await WorkerProfile.deleteMany({})
  await FarmerProfile.deleteMany({})
  await AdminProfile.deleteMany({})
  await ProcurementCentre.deleteMany({})
  await User.deleteMany({})

  const passwordHash = bcrypt.hashSync('password123', 10)

  // NOTE: Procurement Centres are managed via the Admin page — not seeded here.

  // 2. Administrators (5 Admins)
  const adminData = [
    { name: 'Rajesh Kumar (HQ Procurement Officer)', phone: '9876543212', dept: 'HQ Agricultural Procurement' },
    { name: 'Sunil Grover (Deputy Commissioner)', phone: '9876543231', dept: 'State Operations & Monitoring' },
    { name: 'Pooja Sharma (Chief Financial Auditor)', phone: '9876543232', dept: 'DBT Payment Disbursal Cell' },
    { name: 'Vikramaditya Roy (Director APMC)', phone: '9876543233', dept: 'Market Intelligence & Mandi Board' },
    { name: 'Anita Deshpande (Systems Lead)', phone: '9876543234', dept: 'National AgTech IT Infrastructure' }
  ]

  const adminUsers = []
  for (const a of adminData) {
    const user = await User.create({
      name: a.name,
      phoneNumber: a.phone,
      passwordHash,
      role: 'ADMIN',
      language: 'en'
    })
    await AdminProfile.create({
      userId: user._id,
      department: a.dept
    })
    adminUsers.push(user)
  }

  // 3. Workers / Supervisors (5 Workers — centreId assigned later via Admin page)
  const workerData = [
    { name: 'Suresh Verma (Supervisor)', phone: '9876543211', lang: 'hi' },
    { name: 'Harminder Singh (Supervisor)', phone: '9876543221', lang: 'pa' },
    { name: 'Mukesh Meena (Supervisor)', phone: '9876543222', lang: 'hi' },
    { name: 'Ganesh Shinde (Supervisor)', phone: '9876543223', lang: 'mr' },
    { name: 'Rakesh Gangwar (Supervisor)', phone: '9876543224', lang: 'hi' }
  ]

  const workerProfiles = []
  for (const w of workerData) {
    const user = await User.create({
      name: w.name,
      phoneNumber: w.phone,
      passwordHash,
      role: 'WORKER',
      language: w.lang
    })
    const profile = await WorkerProfile.create({
      userId: user._id
      // centreId: assigned later via admin page
    })
    workerProfiles.push(profile)
  }

  // 4. Farmers (10 Farmers)
  const farmerData = [
    { name: 'Ramesh Singh', phone: '9876543210', village: 'Nilokheri', district: 'Karnal', state: 'Haryana', acres: 8.5, lang: 'hi' },
    { name: 'Gurpreet Singh', phone: '9876543201', village: 'Jagraon', district: 'Ludhiana', state: 'Punjab', acres: 12.0, lang: 'pa' },
    { name: 'Baldev Sharma', phone: '9876543202', village: 'Ladwa', district: 'Kurukshetra', state: 'Haryana', acres: 6.0, lang: 'hi' },
    { name: 'Harpreet Dhillon', phone: '9876543203', village: 'Khanna', district: 'Ludhiana', state: 'Punjab', acres: 15.5, lang: 'pa' },
    { name: 'Ramotar Yadav', phone: '9876543204', village: 'Ramganj', district: 'Kota', state: 'Rajasthan', acres: 5.0, lang: 'hi' },
    { name: 'Vikas Patil', phone: '9876543205', village: 'Niphad', district: 'Nashik', state: 'Maharashtra', acres: 9.2, lang: 'mr' },
    { name: 'Satish Verma', phone: '9876543206', village: 'Nawabganj', district: 'Bareilly', state: 'Uttar Pradesh', acres: 7.0, lang: 'hi' },
    { name: 'Manjeet Kaur', phone: '9876543207', village: 'Samrala', district: 'Ludhiana', state: 'Punjab', acres: 10.0, lang: 'pa' },
    { name: 'Devendra Choudhary', phone: '9876543208', village: 'Sangod', district: 'Kota', state: 'Rajasthan', acres: 4.5, lang: 'hi' },
    { name: 'Anil Deshmukh', phone: '9876543209', village: 'Dindori', district: 'Nashik', state: 'Maharashtra', acres: 11.0, lang: 'mr' },
    { name: 'Anil Kapoor', phone: '1232145321', village: 'Nilokheri', district: 'Karnal', state: 'Haryana', acres: 8.0, lang: 'hi', password: '@anijha987' }
  ]

  const farmerProfiles = []
  for (const f of farmerData) {
    const accPasswordHash = (f as any).password ? bcrypt.hashSync((f as any).password, 10) : passwordHash
    const user = await User.create({
      name: f.name,
      phoneNumber: f.phone,
      passwordHash: accPasswordHash,
      role: 'FARMER',
      language: f.lang
    })
    const profile = await FarmerProfile.create({
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
    farmerProfiles.push(profile)
  }

  // NOTE: Slots, Bookings, and Procurements are created organically via the live app flow.

  // 5. Notifications
  await Notification.create({
    userId: farmerProfiles[0].userId,
    title: 'Token Generated Successfully',
    message: 'Your token pass TKN-8472 for Mandi Samiti - Karnal Main has been generated.',
    category: 'TOKEN',
    isRead: false
  })

  // 9. Audit Logs
  await AuditLog.create({
    userId: adminUsers[0]._id,
    action: 'SYSTEM_INITIALIZATION',
    details: 'MongoDB database seeded with 10 Farmers, 5 Workers, and 5 Administrators.'
  })

  console.log('✅ MongoDB Seeding completed! (10 Farmers, 5 Workers, 5 Administrators created)')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})

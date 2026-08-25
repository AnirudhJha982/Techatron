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

  // 1. Procurement Centres (5 Centres)
  const centreKarnal = await ProcurementCentre.create({
    name: 'Mandi Samiti - Karnal Main',
    state: 'Haryana',
    district: 'Karnal',
    address: 'GT Road, Near Grain Market, Karnal - 132001',
    capacityPerDay: 500,
    isActive: true
  })

  const centreLudhiana = await ProcurementCentre.create({
    name: 'Anaj Mandi - Ludhiana East',
    state: 'Punjab',
    district: 'Ludhiana',
    address: 'Ferozepur Road, Ludhiana - 141001',
    capacityPerDay: 600,
    isActive: true
  })

  const centreKota = await ProcurementCentre.create({
    name: 'Krishi Upaj Mandi - Kota Central',
    state: 'Rajasthan',
    district: 'Kota',
    address: 'Industrial Area, Kota - 324005',
    capacityPerDay: 450,
    isActive: true
  })

  const centreNashik = await ProcurementCentre.create({
    name: 'APMC Mandi - Nashik Road',
    state: 'Maharashtra',
    district: 'Nashik',
    address: 'Panchavati, Nashik - 422003',
    capacityPerDay: 400,
    isActive: true
  })

  const centreBareilly = await ProcurementCentre.create({
    name: 'Mandi Parishad - Bareilly City',
    state: 'Uttar Pradesh',
    district: 'Bareilly',
    address: 'Pilibhit Bypass Road, Bareilly - 243006',
    capacityPerDay: 500,
    isActive: true
  })

  const centres = [centreKarnal, centreLudhiana, centreKota, centreNashik, centreBareilly]

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

  // 3. Workers / Supervisors (5 Workers - 1 per centre)
  const workerData = [
    { name: 'Suresh Verma (Supervisor)', phone: '9876543211', centreId: centreKarnal._id, lang: 'hi' },
    { name: 'Harminder Singh (Supervisor)', phone: '9876543221', centreId: centreLudhiana._id, lang: 'pa' },
    { name: 'Mukesh Meena (Supervisor)', phone: '9876543222', centreId: centreKota._id, lang: 'hi' },
    { name: 'Ganesh Shinde (Supervisor)', phone: '9876543223', centreId: centreNashik._id, lang: 'mr' },
    { name: 'Rakesh Gangwar (Supervisor)', phone: '9876543224', centreId: centreBareilly._id, lang: 'hi' }
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
      userId: user._id,
      centreId: w.centreId
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
    { name: 'Anil Deshmukh', phone: '9876543209', village: 'Dindori', district: 'Nashik', state: 'Maharashtra', acres: 11.0, lang: 'mr' }
  ]

  const farmerProfiles = []
  for (const f of farmerData) {
    const user = await User.create({
      name: f.name,
      phoneNumber: f.phone,
      passwordHash,
      role: 'FARMER',
      language: f.lang
    })
    const profile = await FarmerProfile.create({
      userId: user._id,
      address: `Village ${f.village}, ${f.district}, ${f.state}`,
      village: f.village,
      district: f.district,
      state: f.state,
      landSizeAcres: f.acres
    })
    farmerProfiles.push(profile)
  }

  // 5. Time Slots for Centres
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const slotsData = [
    { timeSlot: '08:00 AM - 10:00 AM', capacity: 30, bookedCount: 5 },
    { timeSlot: '10:00 AM - 12:00 PM', capacity: 35, bookedCount: 12 },
    { timeSlot: '01:00 PM - 03:00 PM', capacity: 35, bookedCount: 8 },
    { timeSlot: '03:00 PM - 05:00 PM', capacity: 25, bookedCount: 2 }
  ]

  const createdSlots = []
  for (const c of centres) {
    for (const s of slotsData) {
      const slot = await Slot.create({
        centreId: c._id,
        date: today,
        timeSlot: s.timeSlot,
        capacity: s.capacity,
        bookedCount: s.bookedCount
      })
      createdSlots.push(slot)
    }
  }

  // 6. Seed Sample Bookings & Procurements
  const booking1 = await Booking.create({
    farmerId: farmerProfiles[0]._id,
    centreId: centreKarnal._id,
    slotId: createdSlots[1]._id,
    date: today,
    tokenNumber: 'TKN-8472',
    queuePosition: 1,
    status: 'ARRIVED'
  })

  const booking2 = await Booking.create({
    farmerId: farmerProfiles[1]._id,
    centreId: centreLudhiana._id,
    slotId: createdSlots[4]._id,
    date: today,
    tokenNumber: 'TKN-1094',
    queuePosition: 2,
    status: 'COMPLETED'
  })

  // 7. Procurements & Payments
  const procurement2 = await Procurement.create({
    bookingId: booking2._id,
    workerId: workerProfiles[1]._id,
    crop: 'Wheat (Sharbati)',
    quantity: 45.5,
    qualityGrade: 'Grade A',
    moistureLevel: 11.8,
    status: 'APPROVED',
    paymentStatus: 'COMPLETED',
    remarks: 'Grain quality tested. Moisture within limits.'
  })

  await Payment.create({
    procurementId: procurement2._id,
    farmerId: farmerProfiles[1]._id,
    amount: 103512.5,
    mspRatePerQuintal: 2275.0,
    bankAccountMasked: 'XXXX-XXXX-4892',
    ifscCode: 'SBIN0001245',
    transactionId: 'TXN-9847102948',
    status: 'SUCCESS',
    paymentDate: new Date()
  })

  // 8. Notifications
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

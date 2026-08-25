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
  console.log('Seeding MongoDB database with demonstration accounts and procurement data...')
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

  // 1. Admins
  const adminUser = await User.create({
    name: 'Rajesh Kumar (HQ Procurement Officer)',
    phoneNumber: '9876543212',
    passwordHash,
    role: 'ADMIN',
    language: 'en'
  })

  await AdminProfile.create({
    userId: adminUser._id,
    department: 'Department of Agricultural Procurement, Govt of India'
  })

  // 2. Procurement Centres
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

  await ProcurementCentre.create({
    name: 'Krishi Upaj Mandi - Kota Central',
    state: 'Rajasthan',
    district: 'Kota',
    address: 'Industrial Area, Kota - 324005',
    capacityPerDay: 450,
    isActive: true
  })

  await ProcurementCentre.create({
    name: 'APMC Mandi - Nashik Road',
    state: 'Maharashtra',
    district: 'Nashik',
    address: 'Panchavati, Nashik - 422003',
    capacityPerDay: 400,
    isActive: true
  })

  await ProcurementCentre.create({
    name: 'Mandi Parishad - Bareilly City',
    state: 'Uttar Pradesh',
    district: 'Bareilly',
    address: 'Pilibhit Bypass Road, Bareilly - 243006',
    capacityPerDay: 500,
    isActive: true
  })

  // 3. Worker User
  const workerUser = await User.create({
    name: 'Suresh Verma (Supervisor)',
    phoneNumber: '9876543211',
    passwordHash,
    role: 'WORKER',
    language: 'hi'
  })

  const workerProfile = await WorkerProfile.create({
    userId: workerUser._id,
    centreId: centreKarnal._id
  })

  // 4. Farmer Users
  const farmer1User = await User.create({
    name: 'Ramesh Singh',
    phoneNumber: '9876543210',
    passwordHash,
    role: 'FARMER',
    language: 'hi'
  })

  const farmer1Profile = await FarmerProfile.create({
    userId: farmer1User._id,
    address: 'House 42, Village Nilokheri',
    village: 'Nilokheri',
    district: 'Karnal',
    state: 'Haryana',
    landSizeAcres: 8.5
  })

  const farmer2User = await User.create({
    name: 'Gurpreet Singh',
    phoneNumber: '9876543219',
    passwordHash,
    role: 'FARMER',
    language: 'pa'
  })

  const farmer2Profile = await FarmerProfile.create({
    userId: farmer2User._id,
    address: 'Pind Jagraon, District Ludhiana',
    village: 'Jagraon',
    district: 'Ludhiana',
    state: 'Punjab',
    landSizeAcres: 12.0
  })

  // 5. Time Slots
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const slotsData = [
    { timeSlot: '08:00 AM - 10:00 AM', capacity: 30, bookedCount: 5 },
    { timeSlot: '10:00 AM - 12:00 PM', capacity: 35, bookedCount: 12 },
    { timeSlot: '01:00 PM - 03:00 PM', capacity: 35, bookedCount: 8 },
    { timeSlot: '03:00 PM - 05:00 PM', capacity: 25, bookedCount: 2 }
  ]

  const createdSlots = []
  for (const s of slotsData) {
    const slot = await Slot.create({
      centreId: centreKarnal._id,
      date: today,
      timeSlot: s.timeSlot,
      capacity: s.capacity,
      bookedCount: s.bookedCount
    })
    createdSlots.push(slot)

    // Also seed slots for Ludhiana
    await Slot.create({
      centreId: centreLudhiana._id,
      date: today,
      timeSlot: s.timeSlot,
      capacity: s.capacity,
      bookedCount: 0
    })
  }

  // 6. Bookings
  const booking1 = await Booking.create({
    farmerId: farmer1Profile._id,
    centreId: centreKarnal._id,
    slotId: createdSlots[1]._id,
    date: today,
    tokenNumber: 'TKN-8472',
    queuePosition: 1,
    status: 'ARRIVED'
  })

  const booking2 = await Booking.create({
    farmerId: farmer2Profile._id,
    centreId: centreLudhiana._id,
    slotId: createdSlots[0]._id,
    date: today,
    tokenNumber: 'TKN-1094',
    queuePosition: 2,
    status: 'COMPLETED'
  })

  // 7. Procurements & Payments
  const procurement2 = await Procurement.create({
    bookingId: booking2._id,
    workerId: workerProfile._id,
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
    farmerId: farmer2Profile._id,
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
    userId: farmer1User._id,
    title: 'Token Generated Successfully',
    message: 'Your token pass TKN-8472 for Mandi Samiti - Karnal Main has been generated.',
    category: 'TOKEN',
    isRead: false
  })

  await Notification.create({
    userId: farmer2User._id,
    title: 'Payment Credited',
    message: 'Payment of ₹103,512.50 for Procurement #TXN-9847102948 has been credited to your bank account.',
    category: 'PAYMENT',
    isRead: true
  })

  // 9. Grievances
  await Grievance.create({
    userId: farmer1User._id,
    category: 'Slot Availability',
    description: 'Requested additional morning slots during peak harvest week.',
    status: 'UNDER_REVIEW',
    response: 'Mandi supervisor is reviewing capacity addition.'
  })

  // 10. Audit Logs
  await AuditLog.create({
    userId: adminUser._id,
    action: 'SYSTEM_INITIALIZATION',
    details: 'MongoDB database initialized with seed data.'
  })

  console.log('✅ MongoDB Seeding completed successfully!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})

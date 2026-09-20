import fs from 'fs'
import path from 'path'

// Read .env manually
const envPath = path.resolve(process.cwd(), '.env')
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
import { User, FarmerProfile, WorkerProfile, AdminProfile } from '../src/models'
import bcrypt from 'bcryptjs'

async function run() {
  await connectToDatabase()
  console.log('Connected to DB')

  const defaultPassword = '@ani123'
  const passwordHash = await bcrypt.hash(defaultPassword, 10)

  // 1. Admin: 8789887942
  let admin = await User.findOne({ phoneNumber: '8789887942' })
  if (!admin) {
    admin = await User.create({
      name: 'Anirudh Jha (Chief Administrator)',
      phoneNumber: '8789887942',
      passwordHash,
      role: 'ADMIN',
      language: 'en',
      isActive: true
    })
    await AdminProfile.create({
      userId: admin._id,
      department: 'Central AgTech Headquarters'
    })
    console.log('Created Admin:', admin.phoneNumber)
  } else {
    admin.passwordHash = passwordHash
    admin.role = 'ADMIN'
    admin.isActive = true
    await admin.save()
    console.log('Updated Admin password:', admin.phoneNumber)
  }

  // 2. Worker: W001
  let worker = await User.findOne({ username: 'W001' })
  if (!worker) {
    worker = await User.create({
      name: 'Ramesh Sharma (Mandi Supervisor)',
      username: 'W001',
      phoneNumber: '9876543220',
      passwordHash,
      role: 'WORKER',
      language: 'hi',
      isActive: true
    })
    await WorkerProfile.create({
      userId: worker._id,
      state: 'Haryana'
    })
    console.log('Created Worker:', worker.username)
  } else {
    worker.passwordHash = passwordHash
    worker.role = 'WORKER'
    worker.isActive = true
    await worker.save()
    console.log('Updated Worker password:', worker.username)
  }

  // 3. Farmer: 7856060773
  let farmer = await User.findOne({ phoneNumber: '7856060773' })
  if (!farmer) {
    farmer = await User.create({
      name: 'Rajendra Prasad',
      phoneNumber: '7856060773',
      passwordHash,
      role: 'FARMER',
      language: 'hi',
      isActive: true
    })
    await FarmerProfile.create({
      userId: farmer._id,
      address: 'Village Nilokheri, Karnal, Haryana',
      village: 'Nilokheri',
      district: 'Karnal',
      state: 'Haryana',
      landSizeAcres: 5.0,
      farmerId: 'KF-785606',
      mobileVerified: true,
      farmerIdVerified: true,
      kycStatus: 'VERIFIED',
      bankAccountName: 'Rajendra Prasad',
      bankName: 'State Bank of India',
      bankAccountMasked: 'XXXX-XXXX-0773',
      ifscCode: 'SBIN0001245',
      bankDetailsVerified: true,
      bookingEligible: true,
      verificationCompletedAt: new Date()
    })
    console.log('Created Farmer:', farmer.phoneNumber)
  } else {
    farmer.passwordHash = passwordHash
    farmer.role = 'FARMER'
    farmer.isActive = true
    await farmer.save()
    console.log('Updated Farmer password:', farmer.phoneNumber)
  }

  console.log('✅ Default users verified successfully!')
  process.exit(0)
}

run().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})

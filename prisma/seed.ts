import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Kisan Portal database with demonstration accounts and regional data...')

  // Clear existing data in correct dependency order
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.grievance.deleteMany()
  await prisma.procurement.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.workerProfile.deleteMany()
  await prisma.farmerProfile.deleteMany()
  await prisma.adminProfile.deleteMany()
  await prisma.procurementCentre.deleteMany()
  await prisma.user.deleteMany()

  // Dynamically hash "password123" using bcryptjs to guarantee 100% hash match
  const passwordHash = bcrypt.hashSync("password123", 10)

  // 1. Create Admins
  const adminUser = await prisma.user.create({
    data: {
      name: "Rajesh Kumar (HQ Procurement Officer)",
      phoneNumber: "9876543212",
      passwordHash,
      role: "ADMIN",
      language: "en",
      adminProfile: {
        create: {
          department: "Department of Agricultural Procurement, Govt of India"
        }
      }
    }
  })

  // Backup admin
  await prisma.user.create({
    data: {
      name: "Dr. Anjali Sharma (Directorate)",
      phoneNumber: "9999999999",
      passwordHash,
      role: "ADMIN",
      language: "hi",
      adminProfile: {
        create: {
          department: "Ministry of Agriculture & Farmers Welfare"
        }
      }
    }
  })

  // 2. Create Procurement Centres
  const centreKarnal = await prisma.procurementCentre.create({
    data: {
      name: "Mandi Samiti - Karnal Main",
      state: "Haryana",
      district: "Karnal",
      address: "GT Road, Near Grain Market Yard, Karnal - 132001",
      capacityPerDay: 200,
      isActive: true,
    }
  })

  const centreNashik = await prisma.procurementCentre.create({
    data: {
      name: "APMC Sub-Market Yard - Nashik",
      state: "Maharashtra",
      district: "Nashik",
      address: "Panchavati Dindori Highway, Nashik - 422003",
      capacityPerDay: 160,
      isActive: true,
    }
  })

  const centreBathinda = await prisma.procurementCentre.create({
    data: {
      name: "State Mandi Yard - Bathinda",
      state: "Punjab",
      district: "Bathinda",
      address: "Mansa Road Bypass, Bathinda - 151001",
      capacityPerDay: 250,
      isActive: true,
    }
  })

  const centreGuntur = await prisma.procurementCentre.create({
    data: {
      name: "Agricultural Market Committee - Guntur",
      state: "Andhra Pradesh",
      district: "Guntur",
      address: "Mirchi Yard Road, Guntur - 522004",
      capacityPerDay: 180,
      isActive: true,
    }
  })

  const centreIndore = await prisma.procurementCentre.create({
    data: {
      name: "State Warehousing Centre - Indore",
      state: "Madhya Pradesh",
      district: "Indore",
      address: "Sanwer Road Industrial Area, Indore - 452015",
      capacityPerDay: 220,
      isActive: true,
    }
  })

  // 3. Create Workers
  const worker1User = await prisma.user.create({
    data: {
      name: "Ramesh Sharma (Centre Supervisor)",
      phoneNumber: "9876543211",
      passwordHash,
      role: "WORKER",
      language: "en",
      workerProfile: {
        create: {
          centreId: centreKarnal.id
        }
      }
    }
  })

  const worker2User = await prisma.user.create({
    data: {
      name: "Sanjay Patil (Grade Inspector)",
      phoneNumber: "8888888888",
      passwordHash,
      role: "WORKER",
      language: "hi",
      workerProfile: {
        create: {
          centreId: centreNashik.id
        }
      }
    }
  })

  // 4. Create Farmers
  const farmer1User = await prisma.user.create({
    data: {
      name: "Kisan Singh",
      phoneNumber: "9876543210",
      passwordHash,
      role: "FARMER",
      language: "hi",
      farmerProfile: {
        create: {
          address: "House 42, Green Avenue, Nisang",
          village: "Nisang",
          district: "Karnal",
          state: "Haryana",
          landSizeAcres: 8.5
        }
      }
    }
  })

  const farmer2User = await prisma.user.create({
    data: {
      name: "Gurpreet Singh",
      phoneNumber: "7777777777",
      passwordHash,
      role: "FARMER",
      language: "en",
      farmerProfile: {
        create: {
          address: "Village Phul",
          village: "Phul",
          district: "Bathinda",
          state: "Punjab",
          landSizeAcres: 12.0
        }
      }
    }
  })

  const farmer3User = await prisma.user.create({
    data: {
      name: "Vijay Deshmukh",
      phoneNumber: "7777777775",
      passwordHash,
      role: "FARMER",
      language: "hi",
      farmerProfile: {
        create: {
          address: "Farm Road, Dindori",
          village: "Dindori",
          district: "Nashik",
          state: "Maharashtra",
          landSizeAcres: 6.2
        }
      }
    }
  })

  // 5. Create Time Slots for Today and Tomorrow
  const today = new Date()
  today.setHours(0,0,0,0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const timeSlots = ["08:00-10:00", "10:00-12:00", "13:00-15:00", "15:00-17:00"]
  const createdSlots: any[] = []

  for (const centre of [centreKarnal, centreNashik, centreBathinda, centreGuntur, centreIndore]) {
    for (const d of [today, tomorrow]) {
      for (const ts of timeSlots) {
        const slot = await prisma.slot.create({
          data: {
            centreId: centre.id,
            date: d,
            timeSlot: ts,
            capacity: 35
          }
        })
        createdSlots.push(slot)
      }
    }
  }

  // Fetch farmer profiles
  const farmer1Profile = await prisma.farmerProfile.findUnique({ where: { userId: farmer1User.id } })
  const farmer2Profile = await prisma.farmerProfile.findUnique({ where: { userId: farmer2User.id } })
  const farmer3Profile = await prisma.farmerProfile.findUnique({ where: { userId: farmer3User.id } })
  const worker1Profile = await prisma.workerProfile.findUnique({ where: { userId: worker1User.id } })

  // 6. Create Active & Past Bookings
  // Booking 1: Kisan Singh Today - ARRIVED
  const booking1 = await prisma.booking.create({
    data: {
      farmerId: farmer1Profile!.id,
      centreId: centreKarnal.id,
      slotId: createdSlots[0].id,
      date: today,
      tokenNumber: "TKN-KAR-124",
      queuePosition: 3,
      status: "ARRIVED"
    }
  })

  // Booking 2: Kisan Singh Past - COMPLETED with Procurement & Payment
  const pastDate = new Date(today)
  pastDate.setDate(pastDate.getDate() - 3)

  const pastSlot = await prisma.slot.create({
    data: {
      centreId: centreKarnal.id,
      date: pastDate,
      timeSlot: "08:00-10:00",
      capacity: 35
    }
  })

  const booking2 = await prisma.booking.create({
    data: {
      farmerId: farmer1Profile!.id,
      centreId: centreKarnal.id,
      slotId: pastSlot.id,
      date: pastDate,
      tokenNumber: "TKN-KAR-088",
      queuePosition: 1,
      status: "COMPLETED"
    }
  })

  // Procurement for Booking 2
  await prisma.procurement.create({
    data: {
      bookingId: booking2.id,
      workerId: worker1Profile!.id,
      crop: "Wheat (Sharbati Grade A)",
      quantity: 45.5, // 45.5 Quintals
      qualityGrade: "Grade A",
      moistureLevel: 11.2,
      status: "APPROVED",
      paymentStatus: "COMPLETED",
      remarks: "Excellent grain quality, moisture well within 12% limit. MSP rate applied: ₹2,275/Quintal."
    }
  })

  // Additional queue tokens for Karnal Today
  const queueTokens = ["TKN-KAR-120", "TKN-KAR-121", "TKN-KAR-122", "TKN-KAR-123"]
  for (let i = 0; i < queueTokens.length; i++) {
    await prisma.booking.create({
      data: {
        farmerId: farmer2Profile!.id,
        centreId: centreKarnal.id,
        slotId: createdSlots[0].id,
        date: today,
        tokenNumber: queueTokens[i],
        queuePosition: i + 1,
        status: i === 0 ? "PROCESSING" : "ARRIVED"
      }
    })
  }

  // 7. Create Grievances
  await prisma.grievance.create({
    data: {
      userId: farmer1User.id,
      category: "Payment Inquiry",
      description: "Payment confirmation message received for ₹1,03,512. Verified bank account tail digits XXXX4321.",
      status: "RESOLVED",
      response: "Bank transfer processed successfully via PFMS gateway ref #PFMS99882211."
    }
  })

  await prisma.grievance.create({
    data: {
      userId: farmer3User.id,
      category: "Slot Availability",
      description: "Requesting additional slot allocations for Paddy harvest in Nashik APMC next Monday.",
      status: "UNDER_REVIEW",
      response: "Under review by District Agricultural Officer."
    }
  })

  // 8. Create Notifications
  await prisma.notification.create({
    data: {
      userId: farmer1User.id,
      title: "Procurement Payment Disbursed",
      message: "₹1,03,512 has been credited directly to your Aadhaar-linked bank account for Wheat procurement TKN-KAR-088.",
      category: "PAYMENT",
      isRead: false
    }
  })

  await prisma.notification.create({
    data: {
      userId: farmer1User.id,
      title: "Turn Approaching",
      message: "Token TKN-KAR-124 is position #3 in queue at Mandi Samiti - Karnal Main. Please be ready at Gate 2.",
      category: "TOKEN",
      isRead: false
    }
  })

  // 9. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: "SYSTEM_INITIALIZE",
      details: "Procurement platform database initialized with 5 regional centres and demo credentials."
    }
  })

  await prisma.auditLog.create({
    data: {
      userId: worker1User.id,
      action: "PROCUREMENT_VERIFIED",
      details: "Verified 45.5 Quintals Wheat for Farmer Kisan Singh (Token: TKN-KAR-088)."
    }
  })

  console.log('Finished seeding database with dynamically hashed demo accounts!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

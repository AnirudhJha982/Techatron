import { connectToDatabase } from "@/lib/mongodb"
import { User, FarmerProfile, ProcurementCentre, Slot, Booking, Procurement, Grievance, Notification } from "@/models"
import { getCentres, getSlots, createBooking } from "@/app/actions/booking"
import { createGrievanceAction } from "@/app/actions/farmerActions"
import mongoose from "mongoose"

// ----------------------------------------------------
// MSP RATES DATA
// ----------------------------------------------------
export const MSP_RATES = [
  { key: 'wheatSharbati', crop: 'Wheat (Sharbati Grade A)', msp: '₹ 2,275 / Qtl' },
  { key: 'wheatStandard', crop: 'Wheat (Standard)', msp: '₹ 2,125 / Qtl' },
  { key: 'paddyCommon', crop: 'Paddy (Common)', msp: '₹ 2,183 / Qtl' },
  { key: 'paddyGradeA', crop: 'Paddy (Grade A)', msp: '₹ 2,203 / Qtl' },
  { key: 'mustard', crop: 'Mustard', msp: '₹ 5,650 / Qtl' },
  { key: 'chana', crop: 'Chana (Gram)', msp: '₹ 5,440 / Qtl' }
]

// ----------------------------------------------------
// CONTROLLED TOOL HANDLER IMPLEMENTATIONS
// ----------------------------------------------------

export async function handleGetFarmerProfile(userId: string) {
  await connectToDatabase()
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { error: "Unauthenticated farmer" }
  }
  const user = await User.findById(userId).lean()
  const profile = await FarmerProfile.findOne({ userId }).lean()
  return {
    name: user?.name || "Farmer",
    phone: user?.phoneNumber || "",
    village: profile?.village || "Nilokheri",
    district: profile?.district || "Karnal",
    state: profile?.state || "Haryana",
    landSizeAcres: profile?.landSizeAcres || 5.0
  }
}

export async function handleSearchCentres(query?: string) {
  const centres = await getCentres()
  if (!query) return centres
  const q = query.toLowerCase()
  return centres.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.district.toLowerCase().includes(q) || 
    c.state.toLowerCase().includes(q)
  )
}

export async function handleGetAvailableSlots(centreId: string, dateStr: string) {
  return await getSlots(centreId, dateStr)
}

export async function handleBookSlot(slotId: string, centreId: string, dateStr: string) {
  // Reuses existing atomic booking business logic
  const booking = await createBooking(slotId, centreId, dateStr)
  return booking
}

export async function handleGetQueueStatus(userId: string) {
  await connectToDatabase()
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { hasBooking: false, message: "No active queue booking." }
  }
  const farmerProfile = await FarmerProfile.findOne({ userId })
  if (!farmerProfile) return { hasBooking: false }

  const activeBooking = await Booking.findOne({
    farmerId: farmerProfile._id,
    status: { $in: ['SCHEDULED', 'ARRIVED', 'PROCESSING'] }
  }).sort({ date: 1 }).lean()

  if (!activeBooking) return { hasBooking: false }

  const centre = await ProcurementCentre.findById(activeBooking.centreId).lean()
  return {
    hasBooking: true,
    tokenNumber: activeBooking.tokenNumber,
    status: activeBooking.status,
    queuePosition: activeBooking.queuePosition || 1,
    estimatedWaitMinutes: 25,
    centreName: centre?.name || "Mandi Samiti"
  }
}

export async function handleGetProcurementStatus(userId: string) {
  await connectToDatabase()
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { records: [] }
  }
  const farmerProfile = await FarmerProfile.findOne({ userId })
  if (!farmerProfile) return { records: [] }

  const farmerBookings = await Booking.find({ farmerId: farmerProfile._id }).lean()
  const bookingIds = farmerBookings.map(b => b._id)

  const procurements = await Procurement.find({ bookingId: { $in: bookingIds } }).sort({ createdAt: -1 }).lean()
  return {
    records: procurements.map(p => ({
      crop: p.crop,
      quantity: p.quantity,
      grade: (p as any).qualityGrade || 'Grade A',
      moisture: (p as any).moistureLevel || 12.5,
      paymentStatus: p.paymentStatus
    }))
  }
}

export async function handleGetPaymentStatus(userId: string) {
  await connectToDatabase()
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { totalReceived: 0, pending: 0 }
  }
  const farmerProfile = await FarmerProfile.findOne({ userId })
  if (!farmerProfile) return { totalReceived: 0, pending: 0 }

  const farmerBookings = await Booking.find({ farmerId: farmerProfile._id }).lean()
  const bookingIds = farmerBookings.map(b => b._id)
  const procurements = await Procurement.find({ bookingId: { $in: bookingIds } }).lean()

  const totalReceived = procurements
    .filter(p => (p.paymentStatus as string) === 'COMPLETED' || (p.paymentStatus as string) === 'SUCCESS')
    .reduce((sum, p) => sum + Math.round(p.quantity * 2275), 0)

  const pending = procurements
    .filter(p => (p.paymentStatus as string) !== 'COMPLETED' && (p.paymentStatus as string) !== 'SUCCESS')
    .reduce((sum, p) => sum + Math.round(p.quantity * 2275), 0)

  return {
    totalReceived: `₹ ${totalReceived.toLocaleString('en-IN')}`,
    pendingAmount: `₹ ${pending.toLocaleString('en-IN')}`,
    account: "State Bank of India (Aadhaar Linked)"
  }
}

export async function handleGetNotifications(userId: string) {
  await connectToDatabase()
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return []
  const list = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(5).lean()
  return list.map(n => ({ title: n.title, message: n.message, isRead: n.isRead }))
}

export async function handleGetMSPInformation() {
  return MSP_RATES
}

export async function handleCreateGrievance(category: string, description: string) {
  return await createGrievanceAction(category, description)
}

// ----------------------------------------------------
// GEMINI TOOL DECLARATIONS SCHEMA
// ----------------------------------------------------
export const GEMINI_TOOLS_SCHEMA = [
  {
    functionDeclarations: [
      {
        name: "getFarmerProfile",
        description: "Get authenticated farmer details including village, district, state, and land area.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "searchProcurementCentres",
        description: "Search for active Mandi procurement centres by district, state, or name.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Search query like district name or state" }
          }
        }
      },
      {
        name: "getAvailableSlots",
        description: "Check available procurement time slots for a specific Mandi centre and date.",
        parameters: {
          type: "OBJECT",
          properties: {
            centreId: { type: "STRING", description: "Mandi procurement centre ID" },
            dateStr: { type: "STRING", description: "Date string in YYYY-MM-DD format" }
          },
          required: ["centreId", "dateStr"]
        }
      },
      {
        name: "bookProcurementSlot",
        description: "Book an appointment slot for crop procurement after explicit user confirmation.",
        parameters: {
          type: "OBJECT",
          properties: {
            slotId: { type: "STRING", description: "Time slot ID" },
            centreId: { type: "STRING", description: "Mandi procurement centre ID" },
            dateStr: { type: "STRING", description: "Date string in YYYY-MM-DD format" }
          },
          required: ["slotId", "centreId", "dateStr"]
        }
      },
      {
        name: "getQueueStatus",
        description: "Get live token status, queue position, and estimated waiting time for active booking.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getProcurementStatus",
        description: "Get crop procurement records, weighed quantity, quality grade, and moisture percentage.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getPaymentStatus",
        description: "Get Direct Benefit Transfer (DBT) payment status and credited amounts.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getNotifications",
        description: "Get recent system notifications and booking alerts for the farmer.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getMSPInformation",
        description: "Get government Minimum Support Price (MSP) rates for crops.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "createGrievance",
        description: "Submit an official grievance ticket regarding payment, slot, or quality dispute after confirmation.",
        parameters: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING", description: "Category: PAYMENT_DELAY, SLOT_ISSUE, QUALITY_DISPUTE, STAFF_ISSUE, OTHER" },
            description: { type: "STRING", description: "Detailed description of the issue" }
          },
          required: ["category", "description"]
        }
      }
    ]
  }
]

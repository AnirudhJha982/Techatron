"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { ProcurementCentre, Slot, Booking, FarmerProfile, Notification } from "@/models"
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getCentres() {
  try {
    const session = await auth()
    await connectToDatabase()
    
    let query: any = { isActive: true }
    
    // Apply strict state-based filtering for Farmers
    if (!session || session.user.role !== 'FARMER') throw new Error('Unauthorized');
    if (session.user.role === 'FARMER') {
      const farmerProfile = await FarmerProfile.findOne({ userId: session.user.id })
      if (!farmerProfile || !farmerProfile.state) {
        return [] // Block access if farmer has no registered state
      }
      query.state = { $regex: new RegExp(`^${farmerProfile.state.trim()}$`, 'i') }
      if (farmerProfile.district) {
        query.district = { $regex: new RegExp(`^${farmerProfile.district.trim()}$`, 'i') }
      }
    }

    const centres = await ProcurementCentre.find(query).lean()

    return centres.map(c => ({
      id: c._id.toString(),
      name: c.name,
      district: c.district,
      state: c.state,
      address: c.address,
      capacityPerDay: c.capacityPerDay || 500
    }))
  } catch (err) {
    console.error("Error in getCentres:", err)
    return []
  }
}

export async function getSlots(centreId: string, dateStr: string) {
  try {
    await connectToDatabase()
    const validDate = dateStr && !isNaN(Date.parse(dateStr)) ? dateStr : new Date().toISOString().split('T')[0]
    const dateObj = new Date(validDate + 'T00:00:00.000Z')

    let slots = await Slot.find({
      centreId,
      date: dateObj
    }).lean()

    // Auto-provision standard time slots if none exist for the selected date
    if (!slots || slots.length === 0) {
      const defaultSlots = [
        { timeSlot: '08:00 AM - 10:00 AM', capacity: 30, bookedCount: 0 },
        { timeSlot: '10:00 AM - 12:00 PM', capacity: 35, bookedCount: 0 },
        { timeSlot: '01:00 PM - 03:00 PM', capacity: 35, bookedCount: 0 },
        { timeSlot: '03:00 PM - 05:00 PM', capacity: 25, bookedCount: 0 }
      ]

      for (const s of defaultSlots) {
        await Slot.create({
          centreId,
          date: dateObj,
          timeSlot: s.timeSlot,
          capacity: s.capacity,
          bookedCount: s.bookedCount
        })
      }

      slots = await Slot.find({
        centreId,
        date: dateObj
      }).lean()
    }

    return slots.map(s => ({
      id: s._id.toString(),
      timeSlot: s.timeSlot,
      capacity: s.capacity,
      booked: s.bookedCount,
      available: Math.max(0, s.capacity - s.bookedCount)
    }))
  } catch (err) {
    console.error("Error in getSlots:", err)
    return [
      { id: "s1", timeSlot: '08:00 AM - 10:00 AM', capacity: 30, booked: 0, available: 30 },
      { id: "s2", timeSlot: '10:00 AM - 12:00 PM', capacity: 35, booked: 0, available: 35 }
    ]
  }
}

export async function createBooking(slotId: string, centreId: string, dateStr: string, operationId?: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized. Please login first.")
  }

  await connectToDatabase()

  const validDate = dateStr && !isNaN(Date.parse(dateStr)) ? dateStr : new Date().toISOString().split('T')[0]
  const dateObj = new Date(validDate + 'T00:00:00.000Z')

  if (operationId) {
    const existing = await Booking.findOne({ operationId });
    if (existing) {
      return {
        _id: existing._id.toString(),
        tokenNumber: existing.tokenNumber,
        queuePosition: existing.queuePosition,
        date: validDate,
        status: existing.status
      };
    }
  }

  let farmerProfile = await FarmerProfile.findOne({ userId: session.user.id })
  if (!farmerProfile || !farmerProfile.bookingEligible || farmerProfile.kycStatus !== 'VERIFIED') {
    return { error: "Slot booking is restricted to verified farmers. Please complete your Farmer Verification (KYC) on your profile first." }
  }

  if (!farmerProfile.state) {
    return { error: "Your state information is missing. Please contact the administrator." }
  }

  const centre = await ProcurementCentre.findById(centreId)
  if (!centre) {
    return { error: "Procurement centre not found." }
  }

  if (farmerProfile.state.trim().toLowerCase() !== centre.state.trim().toLowerCase()) {
    return { error: "Selected procurement centre is not available for your state." }
  }

  // Prevent duplicate bookings on the same date
  const existingActiveBooking = await Booking.findOne({
    farmerId: farmerProfile._id,
    date: dateObj,
    status: { $in: ['SCHEDULED', 'ARRIVED', 'PROCESSING'] }
  })
  
  if (existingActiveBooking) {
    return { error: "You already have an active booking for this date." }
  }

  // ATOMIC CONCURRENCY CONTROL:
  let updatedSlot = null
  if (slotId && slotId.length === 24) {
    updatedSlot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        $expr: { $lt: ["$bookedCount", "$capacity"] }
      },
      { $inc: { bookedCount: 1 } },
      { new: true }
    )
  }
  
  if (!updatedSlot) {
    return { error: "Selected slot is already full or no longer available." }
  }

  // Generate Token Number e.g. TKN-8472
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const tokenNumber = `TKN-${randomNum}`

  // Count existing bookings for queue position
  const existingCount = await Booking.countDocuments({ centreId, date: dateObj })

  const booking = await Booking.create({
    farmerId: farmerProfile._id,
    centreId,
    slotId: updatedSlot._id,
    date: dateObj,
    tokenNumber,
    queuePosition: existingCount + 1,
    status: "SCHEDULED",
    operationId
  })

  // Create notification
  await Notification.create({
    userId: session.user.id,
    title: "Slot Booking Confirmed",
    message: `Your appointment token ${tokenNumber} for ${validDate} has been successfully generated.`,
    category: "BOOKING"
  })

  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/queue')
  revalidatePath('/farmer/history')
  revalidatePath('/farmer/token')

  return {
    _id: booking._id.toString(),
    tokenNumber: booking.tokenNumber,
    queuePosition: booking.queuePosition,
    date: validDate,
    status: booking.status
  }
}

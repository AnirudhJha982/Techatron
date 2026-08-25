"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { ProcurementCentre, Slot, Booking, FarmerProfile, Notification } from "@/models"
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getCentres() {
  try {
    await connectToDatabase()
    const centres = await ProcurementCentre.find({ isActive: true }).lean()
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
    const dateObj = new Date(dateStr)
    dateObj.setHours(0, 0, 0, 0)

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
    return []
  }
}

export async function createBooking(slotId: string, centreId: string, dateStr: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized. Please login first.")
  }

  await connectToDatabase()

  const farmerProfile = await FarmerProfile.findOne({ userId: session.user.id })
  if (!farmerProfile) {
    throw new Error("Farmer profile not found.")
  }

  const dateObj = new Date(dateStr)
  dateObj.setHours(0, 0, 0, 0)

  // ATOMIC CONCURRENCY CONTROL:
  // Use findOneAndUpdate with atomic $inc and capacity check.
  // This guarantees zero overbooking even with high concurrent requests.
  const updatedSlot = await Slot.findOneAndUpdate(
    {
      _id: slotId,
      $expr: { $lt: ["$bookedCount", "$capacity"] }
    },
    { $inc: { bookedCount: 1 } },
    { new: true }
  )

  if (!updatedSlot) {
    throw new Error("Selected slot is fully booked. Please choose another slot.")
  }

  // Generate Token Number e.g. TKN-8472
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const tokenNumber = `TKN-${randomNum}`

  // Count existing bookings for queue position
  const existingCount = await Booking.countDocuments({ centreId, date: dateObj })

  const booking = await Booking.create({
    farmerId: farmerProfile._id,
    centreId,
    slotId,
    date: dateObj,
    tokenNumber,
    queuePosition: existingCount + 1,
    status: "ARRIVED"
  })

  // Create notification
  await Notification.create({
    userId: session.user.id,
    title: "Slot Booking Confirmed",
    message: `Your appointment token ${tokenNumber} for ${dateStr} has been successfully generated.`,
    category: "BOOKING"
  })

  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/booking')
  revalidatePath('/farmer/queue')

  return JSON.parse(JSON.stringify(booking))
}

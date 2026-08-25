"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { ProcurementCentre, Slot, Booking, FarmerProfile, Notification } from "@/models"
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getCentres() {
  await connectToDatabase()
  const centres = await ProcurementCentre.find({ isActive: true }).lean()
  return centres.map(c => ({
    id: c._id.toString(),
    name: c.name,
    district: c.district,
    state: c.state
  }))
}

export async function getSlots(centreId: string, dateStr: string) {
  await connectToDatabase()
  const dateObj = new Date(dateStr)
  dateObj.setHours(0, 0, 0, 0)

  const slots = await Slot.find({
    centreId,
    date: dateObj
  }).lean()

  return slots.map(s => ({
    id: s._id.toString(),
    timeSlot: s.timeSlot,
    capacity: s.capacity,
    booked: s.bookedCount,
    available: Math.max(0, s.capacity - s.bookedCount)
  }))
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

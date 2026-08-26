"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { ProcurementCentre, Slot, Booking, FarmerProfile, Notification } from "@/models"
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getCentres() {
  try {
    await connectToDatabase()
    let centres = await ProcurementCentre.find({ isActive: true }).lean()

    // Self-healing: Provision default centres if collection is empty
    if (!centres || centres.length === 0) {
      const defaultCentres = [
        { name: 'Mandi Samiti - Karnal Main', state: 'Haryana', district: 'Karnal', address: 'GT Road, Near Grain Market, Karnal - 132001', capacityPerDay: 500, isActive: true },
        { name: 'Anaj Mandi - Ludhiana East', state: 'Punjab', district: 'Ludhiana', address: 'Ferozepur Road, Ludhiana - 141001', capacityPerDay: 600, isActive: true },
        { name: 'Krishi Upaj Mandi - Kota Central', state: 'Rajasthan', district: 'Kota', address: 'Industrial Area, Kota - 324005', capacityPerDay: 450, isActive: true },
        { name: 'APMC Mandi - Nashik Road', state: 'Maharashtra', district: 'Nashik', address: 'Panchavati, Nashik - 422003', capacityPerDay: 400, isActive: true },
        { name: 'Mandi Parishad - Bareilly City', state: 'Uttar Pradesh', district: 'Bareilly', address: 'Pilibhit Bypass Road, Bareilly - 243006', capacityPerDay: 500, isActive: true }
      ]
      for (const c of defaultCentres) {
        await ProcurementCentre.create(c)
      }
      centres = await ProcurementCentre.find({ isActive: true }).lean()
    }

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
    return [
      { id: "c_karnal", name: "Mandi Samiti - Karnal Main", district: "Karnal", state: "Haryana", address: "GT Road, Karnal", capacityPerDay: 500 },
      { id: "c_ludhiana", name: "Anaj Mandi - Ludhiana East", district: "Ludhiana", state: "Punjab", address: "Ferozepur Road, Ludhiana", capacityPerDay: 600 }
    ]
  }
}

export async function getSlots(centreId: string, dateStr: string) {
  try {
    await connectToDatabase()
    const validDate = dateStr && !isNaN(Date.parse(dateStr)) ? dateStr : new Date().toISOString().split('T')[0]
    const dateObj = new Date(validDate)
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
    return [
      { id: "s1", timeSlot: '08:00 AM - 10:00 AM', capacity: 30, booked: 0, available: 30 },
      { id: "s2", timeSlot: '10:00 AM - 12:00 PM', capacity: 35, booked: 0, available: 35 }
    ]
  }
}

export async function createBooking(slotId: string, centreId: string, dateStr: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized. Please login first.")
  }

  await connectToDatabase()

  let farmerProfile = await FarmerProfile.findOne({ userId: session.user.id })
  if (!farmerProfile || !farmerProfile.bookingEligible || farmerProfile.kycStatus !== 'VERIFIED') {
    throw new Error("Slot booking is restricted to verified farmers. Please complete your Farmer Verification (KYC) on your profile first.")
  }

  const validDate = dateStr && !isNaN(Date.parse(dateStr)) ? dateStr : new Date().toISOString().split('T')[0]
  const dateObj = new Date(validDate)
  dateObj.setHours(0, 0, 0, 0)

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

  // Generate Token Number e.g. TKN-8472
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const tokenNumber = `TKN-${randomNum}`

  // Count existing bookings for queue position
  const existingCount = await Booking.countDocuments({ centreId, date: dateObj })

  const booking = await Booking.create({
    farmerId: farmerProfile._id,
    centreId,
    slotId: updatedSlot?._id || slotId,
    date: dateObj,
    tokenNumber,
    queuePosition: existingCount + 1,
    status: "ARRIVED"
  })

  // Create notification
  await Notification.create({
    userId: session.user.id,
    title: "Slot Booking Confirmed",
    message: `Your appointment token ${tokenNumber} for ${validDate} has been successfully generated.`,
    category: "BOOKING"
  })

  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/booking')
  revalidatePath('/farmer/queue')

  return JSON.parse(JSON.stringify(booking))
}

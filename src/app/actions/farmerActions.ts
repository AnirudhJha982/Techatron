"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { User, FarmerProfile, Grievance, Notification, AuditLog, Slot, Booking } from "@/models"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createGrievanceAction(category: string, description: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  await connectToDatabase()

  const grievance = await Grievance.create({
    userId: session.user.id,
    category,
    description,
    status: "SUBMITTED"
  })

  // Create audit log
  await AuditLog.create({
    userId: session.user.id,
    action: "GRIEVANCE_RAISED",
    details: `Grievance #${grievance._id.toString().slice(-6)} raised under category ${category}`
  })

  revalidatePath('/farmer/grievances')
  return { success: true, id: grievance._id.toString() }
}

export async function updateFarmerProfileAction(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  await connectToDatabase()

  const name = formData.get("name") as string
  const village = formData.get("village") as string
  const district = formData.get("district") as string
  const state = formData.get("state") as string
  const landSizeAcres = parseFloat(formData.get("landSizeAcres") as string || "0")

  // Update user name
  if (name) {
    await User.findByIdAndUpdate(session.user.id, { name })
  }

  // Update or create profile
  await FarmerProfile.findOneAndUpdate(
    { userId: session.user.id },
    {
      userId: session.user.id,
      village,
      district,
      state,
      landSizeAcres,
      address: `${village || ''}, ${district || ''}, ${state || ''}`
    },
    { upsert: true, new: true }
  )

  revalidatePath('/farmer/profile')
  revalidatePath('/farmer/dashboard')
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth()
  if (!session || !session.user) return

  await connectToDatabase()
  await Notification.findByIdAndUpdate(notificationId, { isRead: true })

  revalidatePath('/farmer/notifications')
  revalidatePath('/farmer/dashboard')
}

export async function createBookingAction(centreId: string, slotId: string, crop: string, dateStr: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  await connectToDatabase()

  let farmerProfile = await FarmerProfile.findOne({ userId: session.user.id })
  if (!farmerProfile) {
    farmerProfile = await FarmerProfile.create({
      userId: session.user.id,
      village: "Default Village",
      district: "Karnal",
      state: "Haryana",
      landSizeAcres: 5.0
    })
  }

  const bookingDate = new Date(dateStr)
  bookingDate.setHours(0, 0, 0, 0)

  // ATOMIC CONCURRENCY CONTROL:
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

  // Calculate queue count & token number
  const countToday = await Booking.countDocuments({ centreId, date: bookingDate })
  const tokenNum = `TKN-${centreId.slice(-3).toUpperCase()}-${String(countToday + 101).padStart(3, '0')}`

  const booking = await Booking.create({
    farmerId: farmerProfile._id,
    centreId,
    slotId,
    date: bookingDate,
    tokenNumber: tokenNum,
    queuePosition: countToday + 1,
    status: "SCHEDULED"
  })

  // Create notification
  await Notification.create({
    userId: session.user.id,
    title: "Procurement Slot Booked!",
    message: `Token ${tokenNum} confirmed for ${crop} on ${bookingDate.toLocaleDateString()}. Queue position #${countToday + 1}.`,
    category: "BOOKING"
  })

  // Create audit log
  await AuditLog.create({
    userId: session.user.id,
    action: "BOOKING_CREATED",
    details: `Slot booked at centre ${centreId} with token ${tokenNum}`
  })

  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/booking')
  revalidatePath('/farmer/queue')
  revalidatePath('/farmer/token')
  return { success: true, bookingId: booking._id.toString(), tokenNumber: tokenNum }
}

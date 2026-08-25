"use server"

import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function createGrievanceAction(category: string, description: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  const grievance = await prisma.grievance.create({
    data: {
      userId: session.user.id,
      category,
      description,
      status: "SUBMITTED"
    }
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "GRIEVANCE_RAISED",
      details: `Grievance #${grievance.id.slice(-6)} raised under category ${category}`
    }
  })

  revalidatePath('/farmer/grievances')
  return { success: true, id: grievance.id }
}

export async function updateFarmerProfileAction(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const village = formData.get("village") as string
  const district = formData.get("district") as string
  const state = formData.get("state") as string
  const landSizeAcres = parseFloat(formData.get("landSizeAcres") as string || "0")

  // Update user name
  if (name) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name }
    })
  }

  // Check or upsert profile
  await prisma.farmerProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      village,
      district,
      state,
      landSizeAcres,
      address: `${village || ''}, ${district || ''}, ${state || ''}`
    },
    update: {
      village,
      district,
      state,
      landSizeAcres,
      address: `${village || ''}, ${district || ''}, ${state || ''}`
    }
  })

  revalidatePath('/farmer/profile')
  revalidatePath('/farmer/dashboard')
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth()
  if (!session || !session.user) return

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true }
  })

  revalidatePath('/farmer/notifications')
  revalidatePath('/farmer/dashboard')
}

export async function createBookingAction(centreId: string, slotId: string, crop: string, dateStr: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  let farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!farmerProfile) {
    farmerProfile = await prisma.farmerProfile.create({
      data: {
        userId: session.user.id,
        village: "Default Village",
        district: "Karnal",
        state: "Haryana",
        landSizeAcres: 5.0
      }
    })
  }

  const bookingDate = new Date(dateStr)
  
  // Calculate queue count & token number
  const countToday = await prisma.booking.count({
    where: {
      centreId,
      date: bookingDate
    }
  })

  const tokenNum = `TKN-${centreId.slice(-3).toUpperCase()}-${String(countToday + 101).padStart(3, '0')}`

  const booking = await prisma.booking.create({
    data: {
      farmerId: farmerProfile.id,
      centreId,
      slotId,
      date: bookingDate,
      tokenNumber: tokenNum,
      queuePosition: countToday + 1,
      status: "SCHEDULED"
    }
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Procurement Slot Booked!",
      message: `Token ${tokenNum} confirmed for ${crop} on ${bookingDate.toLocaleDateString()}. Queue position #${countToday + 1}.`,
      category: "BOOKING"
    }
  })

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "BOOKING_CREATED",
      details: `Slot booked at centre ${centreId} with token ${tokenNum}`
    }
  })

  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/booking')
  revalidatePath('/farmer/queue')
  revalidatePath('/farmer/token')
  return { success: true, bookingId: booking.id, tokenNumber: tokenNum }
}

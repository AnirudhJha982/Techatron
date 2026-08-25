"use server"

import { prisma } from "@/lib/prisma"
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function getCentres() {
  return await prisma.procurementCentre.findMany({
    where: { isActive: true },
    select: { id: true, name: true, district: true, state: true }
  })
}

export async function getSlots(centreId: string, dateStr: string) {
  const dateObj = new Date(dateStr)
  dateObj.setHours(0, 0, 0, 0)

  const slots = await prisma.slot.findMany({
    where: {
      centreId,
      date: dateObj
    },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  })

  return slots.map(s => ({
    id: s.id,
    timeSlot: s.timeSlot,
    capacity: s.capacity,
    booked: s._count.bookings,
    available: s.capacity - s._count.bookings
  }))
}

export async function createBooking(slotId: string, centreId: string, dateStr: string) {
  const session = await auth()
  if (!session || !session.user) {
    throw new Error("Unauthorized. Please login first.")
  }

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!farmerProfile) {
    throw new Error("Farmer profile not found.")
  }

  const dateObj = new Date(dateStr)
  dateObj.setHours(0,0,0,0)

  // Generate Token Number e.g. TKN-8472
  const randomNum = Math.floor(100 + Math.random() * 900)
  const tokenNumber = `TKN-${randomNum}`

  // Count existing bookings for queue position
  const existingCount = await prisma.booking.count({
    where: { centreId, date: dateObj }
  })

  const booking = await prisma.booking.create({
    data: {
      farmerId: farmerProfile.id,
      centreId,
      slotId,
      date: dateObj,
      tokenNumber,
      queuePosition: existingCount + 1,
      status: "ARRIVED"
    }
  })

  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/booking')
  revalidatePath('/farmer/queue')

  return booking
}

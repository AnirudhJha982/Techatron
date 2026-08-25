"use server"

import { PrismaClient } from '@prisma/client'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function getCentres() {
  return await prisma.procurementCentre.findMany({
    where: { isActive: true },
    select: { id: true, name: true, district: true, state: true }
  })
}

export async function getSlots(centreId: string, dateStr: string) {
  // Find slots for a centre on a given date string (YYYY-MM-DD)
  const startDate = new Date(dateStr)
  startDate.setHours(0,0,0,0)
  
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 1)

  const slots = await prisma.slot.findMany({
    where: {
      centreId,
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      _count: {
        select: { bookings: true }
      }
    }
  })

  return slots.map(slot => ({
    id: slot.id,
    timeSlot: slot.timeSlot,
    capacity: slot.capacity,
    booked: slot._count.bookings,
    available: slot.capacity - slot._count.bookings
  }))
}

export async function createBooking(slotId: string, centreId: string, dateStr: string) {
  const session = await auth()
  if (!session || session.user.role !== 'FARMER') throw new Error("Unauthorized")

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!farmerProfile) throw new Error("Farmer profile not found")

  const date = new Date(dateStr)
  date.setHours(0,0,0,0)

  // Generate Token Number e.g. A-042
  const totalBookings = await prisma.booking.count({
    where: { centreId, date }
  })
  
  const tokenNumber = `TKN-${centreId.substring(0, 3).toUpperCase()}-${(totalBookings + 1).toString().padStart(3, '0')}`
  const queuePosition = totalBookings + 1

  const booking = await prisma.booking.create({
    data: {
      farmerId: farmerProfile.id,
      centreId,
      slotId,
      date,
      tokenNumber,
      queuePosition,
      status: 'SCHEDULED'
    }
  })

  revalidatePath('/farmer/dashboard')
  return booking
}

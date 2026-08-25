"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateQueueStatusAction(bookingId: string, status: string) {
  return updateBookingStatusAction(bookingId, status)
}

export async function updateBookingStatusAction(bookingId: string, status: string) {
  const session = await auth()
  if (!session || !session.user || (session.user.role !== 'WORKER' && session.user.role !== 'ADMIN')) {
    throw new Error("Unauthorized")
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { farmer: { include: { user: true } } }
  })

  // Create notification for farmer
  await prisma.notification.create({
    data: {
      userId: booking.farmer.userId,
      title: `Token Status: ${status}`,
      message: `Your token ${booking.tokenNumber} status has been updated to ${status}.`,
      category: "TOKEN"
    }
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "BOOKING_STATUS_CHANGED",
      details: `Token ${booking.tokenNumber} updated to ${status}`
    }
  })

  revalidatePath('/worker/dashboard')
  revalidatePath('/worker/queue')
  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/queue')
  return { success: true }
}

export async function submitProcurementAction(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || !session.user || (session.user.role !== 'WORKER' && session.user.role !== 'ADMIN')) {
    throw new Error("Unauthorized")
  }

  const bookingId = formData.get("bookingId") as string
  const crop = formData.get("crop") as string
  const grossWeight = parseFloat(formData.get("grossWeight") as string || "0")
  const tareWeight = parseFloat(formData.get("tareWeight") as string || "0")
  const quantityInput = parseFloat(formData.get("quantity") as string || "0")
  const quantity = grossWeight > 0 ? Math.max(0, grossWeight - tareWeight) : (quantityInput || 45.5)
  const qualityGrade = formData.get("qualityGrade") as string || "Grade A"
  const moistureLevel = parseFloat(formData.get("moistureLevel") as string || "11.2")
  const remarks = formData.get("remarks") as string

  await processProcurementAction({
    bookingId,
    crop,
    quantity,
    qualityGrade,
    moistureLevel,
    remarks
  })
}

export async function processProcurementAction(data: {
  bookingId: string
  crop: string
  quantity: number
  qualityGrade: string
  moistureLevel: number
  remarks?: string
}) {
  const session = await auth()
  if (!session || !session.user || (session.user.role !== 'WORKER' && session.user.role !== 'ADMIN')) {
    throw new Error("Unauthorized")
  }

  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id }
  })

  if (!workerProfile) {
    throw new Error("Worker profile not found")
  }

  // Create or update procurement record
  const procurement = await prisma.procurement.upsert({
    where: { bookingId: data.bookingId },
    create: {
      bookingId: data.bookingId,
      workerId: workerProfile.id,
      crop: data.crop,
      quantity: data.quantity,
      qualityGrade: data.qualityGrade,
      moistureLevel: data.moistureLevel,
      status: "APPROVED",
      paymentStatus: "PROCESSING",
      remarks: data.remarks || "Grade approved according to standard MSP criteria."
    },
    update: {
      quantity: data.quantity,
      qualityGrade: data.qualityGrade,
      moistureLevel: data.moistureLevel,
      status: "APPROVED",
      remarks: data.remarks || "Grade approved according to standard MSP criteria."
    }
  })

  // Update booking status to COMPLETED
  const booking = await prisma.booking.update({
    where: { id: data.bookingId },
    data: { status: "COMPLETED" },
    include: { farmer: { include: { user: true } } }
  })

  const mspRate = 2275 // Wheat MSP Rate
  const totalAmount = Math.round(data.quantity * mspRate)

  // Send payment notification to farmer
  await prisma.notification.create({
    data: {
      userId: booking.farmer.userId,
      title: "Procurement Verified & Payment Initiated",
      message: `${data.quantity} Qtl of ${data.crop} verified. Total amount ₹${totalAmount.toLocaleString('en-IN')} queued for DBT credit within 48h.`,
      category: "PAYMENT"
    }
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "PROCUREMENT_PROCESSED",
      details: `Processed ${data.quantity} Qtl for Token ${booking.tokenNumber} (Farmer: ${booking.farmer.user.name})`
    }
  })

  revalidatePath('/worker/dashboard')
  revalidatePath('/worker/procurement')
  revalidatePath('/worker/queue')
  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/procurement')
  revalidatePath('/farmer/payments')
  return { success: true, procurementId: procurement.id }
}

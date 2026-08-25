"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { Booking, Procurement, Payment, WorkerProfile, FarmerProfile, User, Notification, AuditLog } from "@/models"
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

  await connectToDatabase()

  const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true })
  if (!booking) {
    throw new Error("Booking not found")
  }

  const farmerProfile = await FarmerProfile.findById(booking.farmerId)
  if (farmerProfile) {
    // Create notification for farmer
    await Notification.create({
      userId: farmerProfile.userId,
      title: `Token Status: ${status}`,
      message: `Your token ${booking.tokenNumber} status has been updated to ${status}.`,
      category: "TOKEN"
    })
  }

  // Audit log
  await AuditLog.create({
    userId: session.user.id,
    action: "BOOKING_STATUS_CHANGED",
    details: `Token ${booking.tokenNumber} updated to ${status}`
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

  await connectToDatabase()

  let workerProfile = await WorkerProfile.findOne({ userId: session.user.id })
  if (!workerProfile) {
    // Fallback if super admin processes
    const anyWorker = await WorkerProfile.findOne({})
    if (anyWorker) workerProfile = anyWorker
    else throw new Error("Worker profile not found")
  }

  // Create or update procurement record
  let procurement = await Procurement.findOne({ bookingId: data.bookingId })
  if (!procurement) {
    procurement = await Procurement.create({
      bookingId: data.bookingId,
      workerId: workerProfile._id,
      crop: data.crop,
      quantity: data.quantity,
      qualityGrade: data.qualityGrade,
      moistureLevel: data.moistureLevel,
      status: "APPROVED",
      paymentStatus: "PROCESSING",
      remarks: data.remarks || "Grade approved according to standard MSP criteria."
    })
  } else {
    procurement.quantity = data.quantity
    procurement.qualityGrade = data.qualityGrade
    procurement.moistureLevel = data.moistureLevel
    procurement.status = "APPROVED"
    procurement.remarks = data.remarks || "Grade approved according to standard MSP criteria."
    await procurement.save()
  }

  // Update booking status to COMPLETED
  const booking = await Booking.findByIdAndUpdate(data.bookingId, { status: "COMPLETED" }, { new: true })
  if (!booking) {
    throw new Error("Booking not found")
  }

  const farmerProfile = await FarmerProfile.findById(booking.farmerId)
  const farmerUser = farmerProfile ? await User.findById(farmerProfile.userId) : null

  const mspRate = 2275 // Wheat MSP Rate
  const totalAmount = Math.round(data.quantity * mspRate)

  // Upsert Payment Record
  let payment = await Payment.findOne({ procurementId: procurement._id })
  if (!payment && farmerProfile) {
    const randomTxn = `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`
    payment = await Payment.create({
      procurementId: procurement._id,
      farmerId: farmerProfile._id,
      amount: totalAmount,
      mspRatePerQuintal: mspRate,
      bankAccountMasked: "XXXX-XXXX-4892",
      ifscCode: "SBIN0001245",
      transactionId: randomTxn,
      status: "SUCCESS",
      paymentDate: new Date()
    })
  }

  if (farmerProfile) {
    // Send payment notification to farmer
    await Notification.create({
      userId: farmerProfile.userId,
      title: "Procurement Verified & Payment Initiated",
      message: `${data.quantity} Qtl of ${data.crop} verified. Total amount ₹${totalAmount.toLocaleString('en-IN')} queued for DBT credit within 48h.`,
      category: "PAYMENT"
    })
  }

  // Audit log
  await AuditLog.create({
    userId: session.user.id,
    action: "PROCUREMENT_PROCESSED",
    details: `Processed ${data.quantity} Qtl for Token ${booking.tokenNumber} (Farmer: ${farmerUser?.name || 'Farmer'})`
  })

  revalidatePath('/worker/dashboard')
  revalidatePath('/worker/procurement')
  revalidatePath('/worker/queue')
  revalidatePath('/farmer/dashboard')
  revalidatePath('/farmer/procurement')
  revalidatePath('/farmer/payments')
  return { success: true, procurementId: procurement._id.toString() }
}

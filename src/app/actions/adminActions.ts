"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { ProcurementCentre, Slot, Grievance, Notification, AuditLog, User } from "@/models"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createCentreAction(formData: FormData): Promise<void> {
  return createProcurementCentreAction(formData)
}

export async function updateCentreStatusAction(centreId: string, isActive: boolean) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized Admin Action")
  }

  await connectToDatabase()
  await ProcurementCentre.findByIdAndUpdate(centreId, { isActive })

  revalidatePath('/admin/centres')
  revalidatePath('/centres')
  return { success: true }
}

export async function broadcastNotificationAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const targetRole = formData.get("targetRole") as string || undefined

  await sendBroadcastNotificationAction(title, message, targetRole)
}

export async function createProcurementCentreAction(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized Admin Action")
  }

  await connectToDatabase()

  const name = formData.get("name") as string
  const state = formData.get("state") as string
  const district = formData.get("district") as string
  const address = formData.get("address") as string
  const capacityPerDay = parseInt(formData.get("capacityPerDay") as string || "150", 10)

  const centre = await ProcurementCentre.create({
    name,
    state,
    district,
    address,
    capacityPerDay,
    isActive: true
  })

  // Create default time slots for today & tomorrow
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const defaultSlots = ["08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "01:00 PM - 03:00 PM", "03:00 PM - 05:00 PM"]
  for (const d of [today, tomorrow]) {
    for (const ts of defaultSlots) {
      await Slot.create({
        centreId: centre._id,
        date: d,
        timeSlot: ts,
        capacity: Math.floor(capacityPerDay / 4),
        bookedCount: 0
      })
    }
  }

  await AuditLog.create({
    userId: session.user.id,
    action: "CENTRE_CREATED",
    details: `New Procurement Centre '${name}' created in ${district}, ${state}`
  })

  revalidatePath('/admin/centres')
  revalidatePath('/centres')
}

export async function respondGrievanceAction(grievanceId: string, response: string, status: string) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized Admin Action")
  }

  await connectToDatabase()

  const grievance = await Grievance.findByIdAndUpdate(
    grievanceId,
    { response, status },
    { new: true }
  )

  if (grievance) {
    // Notify user
    await Notification.create({
      userId: grievance.userId,
      title: `Grievance Status: ${status}`,
      message: `Response to your grievance #${grievance._id.toString().slice(-6)}: "${response}"`,
      category: "GENERAL"
    })
  }

  await AuditLog.create({
    userId: session.user.id,
    action: "GRIEVANCE_RESOLVED",
    details: `Grievance #${grievanceId.slice(-6)} updated to ${status}`
  })

  revalidatePath('/admin/grievances')
  revalidatePath('/farmer/grievances')
  return { success: true }
}

export async function sendBroadcastNotificationAction(title: string, message: string, targetRole?: string) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized Admin Action")
  }

  await connectToDatabase()

  const query = targetRole ? { role: targetRole } : {}
  const users = await User.find(query, { _id: 1 })

  for (const u of users) {
    await Notification.create({
      userId: u._id,
      title,
      message,
      category: "GENERAL"
    })
  }

  await AuditLog.create({
    userId: session.user.id,
    action: "BROADCAST_NOTIFICATION_SENT",
    details: `Broadcast notification '${title}' sent to ${users.length} users`
  })

  revalidatePath('/admin/notifications')
  revalidatePath('/farmer/notifications')
  return { success: true, count: users.length }
}

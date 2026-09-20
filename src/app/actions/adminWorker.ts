"use server"

import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { User, WorkerProfile, ProcurementCentre } from '@/models'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import mongoose from 'mongoose'
import { validatePhone, isValidState, PHONE_ERROR_MESSAGE } from '@/lib/constants/india'

export async function createWorker(data: {
  name: string
  phoneNumber?: string
  username: string
  passwordHash?: string // Pre-hashed or we hash it here if it's plaintext
  password?: string
  state: string
  centreId?: string
  isActive?: boolean
}) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access required.')
  }

  await connectToDatabase()

  if (!data.username) {
    throw new Error('Worker ID (Username) is required.')
  }

  // ── Backend phone validation ─────────────────────────────────────────────
  if (data.phoneNumber && !validatePhone(data.phoneNumber)) {
    throw new Error(PHONE_ERROR_MESSAGE)
  }

  // ── Backend state validation ─────────────────────────────────────────────
  if (data.state && !isValidState(data.state)) {
    throw new Error('Please select a valid Indian state from the dropdown.')
  }

  // Check if username exists
  const existingUsername = await User.findOne({ username: data.username })
  if (existingUsername) {
    throw new Error('Worker ID already exists. Please choose a different one.')
  }

  // Check if phone number exists
  if (data.phoneNumber) {
    const existingPhone = await User.findOne({ phoneNumber: data.phoneNumber })
    if (existingPhone) {
      throw new Error('Phone number already in use.')
    }
  }

  let finalPasswordHash = data.passwordHash
  if (data.password) {
    finalPasswordHash = await bcrypt.hash(data.password, 10)
  }

  if (!finalPasswordHash) {
    throw new Error('Password is required.')
  }

  const sessionDB = await mongoose.startSession()
  sessionDB.startTransaction()
  try {
    const user = await User.create([{
      name: data.name,
      phoneNumber: data.phoneNumber || undefined,
      username: data.username,
      passwordHash: finalPasswordHash,
      role: 'WORKER',
      isActive: data.isActive !== undefined ? data.isActive : true
    }], { session: sessionDB })

    await WorkerProfile.create([{
      userId: user[0]._id,
      state: data.state,
      centreId: data.centreId ? new mongoose.Types.ObjectId(data.centreId) : undefined
    }], { session: sessionDB })

    await sessionDB.commitTransaction()
    revalidatePath('/admin/workers')
    return { success: true }
  } catch (err: any) {
    await sessionDB.abortTransaction()
    throw new Error(err.message || 'Failed to create worker.')
  } finally {
    sessionDB.endSession()
  }
}

export async function toggleWorkerStatus(userId: string, currentStatus: boolean) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access required.')
  }

  await connectToDatabase()
  
  await User.findByIdAndUpdate(userId, {
    isActive: !currentStatus
  })

  revalidatePath('/admin/workers')
  return { success: true }
}

export async function resetWorkerPassword(userId: string, newPassword: string) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access required.')
  }

  await connectToDatabase()
  
  const passwordHash = await bcrypt.hash(newPassword, 10)
  
  await User.findByIdAndUpdate(userId, {
    passwordHash
  })

  return { success: true }
}

export async function deleteWorker(userId: string) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized. Admin access required.')
  }

  await connectToDatabase()

  await WorkerProfile.deleteMany({ userId: new mongoose.Types.ObjectId(userId) })
  await User.findByIdAndDelete(userId)

  revalidatePath('/admin/workers')
  return { success: true }
}


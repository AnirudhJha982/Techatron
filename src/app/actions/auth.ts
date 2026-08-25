"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const phoneNumber = formData.get("phoneNumber") as string
    const password = formData.get("password") as string

    if (!phoneNumber || !password) {
      return 'Please enter phone number and password.'
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    })

    if (!user) {
      return 'Invalid credentials. User phone number not registered.'
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordsMatch) {
      return 'Invalid credentials. Password incorrect.'
    }

    const role = user.role.toLowerCase()
    const locale = user.language || 'en'
    const targetDashboard = `/${locale}/${role}/dashboard`

    await signIn('credentials', {
      phoneNumber,
      password,
      redirectTo: targetDashboard
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials. Please check your phone number and password.'
        default:
          return 'Something went wrong during sign in.'
      }
    }
    throw error
  }
}

export async function registerFarmer(formData: FormData) {
  const name = formData.get("name") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const password = formData.get("password") as string
  const village = formData.get("village") as string
  const district = formData.get("district") as string
  const state = formData.get("state") as string
  const landSizeAcres = parseFloat(formData.get("landSizeAcres") as string || "0")

  if (!name || !phoneNumber || !password) {
    return { error: "Name, phone number, and password are required." }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber }
  })

  if (existingUser) {
    return { error: "An account with this phone number already exists." }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  // Create User + FarmerProfile
  const user = await prisma.user.create({
    data: {
      name,
      phoneNumber,
      passwordHash,
      role: "FARMER",
      language: "en",
      farmerProfile: {
        create: {
          village: village || "Not specified",
          district: district || "Not specified",
          state: state || "Not specified",
          landSizeAcres: landSizeAcres || 1.0,
          address: `${village}, ${district}, ${state}`
        }
      },
      notifications: {
        create: {
          title: "Welcome to Kisan Portal",
          message: "Your registration as a registered farmer is complete. You can now book procurement slots.",
          category: "GENERAL"
        }
      }
    }
  })

  return { success: true, user }
}

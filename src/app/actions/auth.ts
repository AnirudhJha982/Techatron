"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { User, FarmerProfile, Notification } from "@/models"
import bcrypt from "bcryptjs"

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const rawPhone = formData.get("phoneNumber") as string
    const password = formData.get("password") as string
    const phoneNumber = rawPhone ? rawPhone.trim() : ""

    if (!phoneNumber || !password) {
      return 'Please enter phone number and password.'
    }

    await connectToDatabase()
    const user = await User.findOne({ phoneNumber })

    if (!user) {
      return 'Invalid credentials. User phone number not registered.'
    }

    const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordsMatch) {
      return 'Invalid credentials. Password incorrect.'
    }

    let farmerProfile = null
    if (user.role === 'FARMER') {
      farmerProfile = await FarmerProfile.findOne({ userId: user._id }).lean()
    }

    const { resolveUserEffectiveLanguage } = await import('@/lib/languageResolver')
    const effectiveLang = resolveUserEffectiveLanguage(user, farmerProfile)
    const role = user.role.toLowerCase()
    const targetDashboard = `/${effectiveLang}/${role}/dashboard`

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
  const rawPhone = formData.get("phoneNumber") as string
  const password = formData.get("password") as string
  const village = formData.get("village") as string
  const district = formData.get("district") as string
  const state = formData.get("state") as string
  const landSizeAcres = parseFloat(formData.get("landSizeAcres") as string || "0")
  const phoneNumber = rawPhone ? rawPhone.trim() : ""

  if (!name || !phoneNumber || !password) {
    return { error: "Name, phone number, and password are required." }
  }

  await connectToDatabase()

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber })
  if (existingUser) {
    return { error: "An account with this phone number already exists." }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  // Create User
  const user = await User.create({
    name,
    phoneNumber,
    passwordHash,
    role: "FARMER",
    language: "en",
    isManualLanguage: false
  })

  // Create FarmerProfile
  await FarmerProfile.create({
    userId: user._id,
    village: village || "Not specified",
    district: district || "Not specified",
    state: state || "Not specified",
    landSizeAcres: landSizeAcres || 1.0,
    address: `${village}, ${district}, ${state}`
  })

  // Create Welcome Notification
  await Notification.create({
    userId: user._id,
    title: "Welcome to Kisan Portal",
    message: "Your registration as a registered farmer is complete. You can now book procurement slots.",
    category: "GENERAL"
  })

  return { success: true, userId: user._id.toString() }
}

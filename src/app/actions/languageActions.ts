"use server"

import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function saveUserLanguagePreferenceAction(newLang: string) {
  const session = await auth()
  const cookieStore = await cookies()

  // Set HTTP cookie so next-intl reads immediate locale preference
  cookieStore.set('NEXT_LOCALE', newLang, { path: '/', maxAge: 31536000 })

  if (session?.user?.id) {
    await connectToDatabase()
    await User.findByIdAndUpdate(session.user.id, {
      language: newLang,
      preferredLanguage: newLang,
      isManualLanguage: true
    })
  }

  revalidatePath('/[locale]', 'layout')
  return { success: true, newLang }
}

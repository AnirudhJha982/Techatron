import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const rawPhone = credentials?.phoneNumber as string
        const password = credentials?.password as string
        const phoneNumber = rawPhone ? rawPhone.trim() : ""

        if (!phoneNumber || !password) {
          return null
        }
        await connectToDatabase()
        const user = await User.findOne({ phoneNumber })
        if (!user) return null
        
        const passwordsMatch = await bcrypt.compare(
          password,
          user.passwordHash
        )
        if (passwordsMatch) {
          return {
            id: user._id.toString(),
            name: user.name,
            role: user.role,
            language: user.language || 'en',
            isManualLanguage: !!user.isManualLanguage,
            preferredLanguage: user.preferredLanguage || user.language
          }
        }
        return null
      }
    })
  ],
})

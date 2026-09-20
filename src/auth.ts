import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { User, FarmerProfile } from "@/models"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginId: { label: "Login ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) return null

        try {
          await connectToDatabase()
          const user = await User.findOne({ 
            $or: [
              { phoneNumber: credentials.loginId },
              { username: credentials.loginId },
              { aadhaarNumber: credentials.loginId }
            ]
          }).lean()

          if (!user) return null
          
          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            (user as any).passwordHash || (user as any).password
          )

          if (passwordsMatch) {
            return {
              id: user._id.toString(),
              name: user.name,
              role: user.role,
              language: user.language || 'en',
              isManualLanguage: user.isManualLanguage || false,
              preferredLanguage: user.preferredLanguage,
              centreId: (user as any).centreId
            }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ]
})

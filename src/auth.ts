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
        loginId: { label: "Mobile Number / Worker ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const rawLoginId = credentials?.loginId as string
        const password = credentials?.password as string
        const loginId = rawLoginId ? rawLoginId.trim() : ""

        if (!loginId || !password) {
          return null
        }
        await connectToDatabase()
        
        const user = await User.findOne({ 
          $or: [{ phoneNumber: loginId }, { username: loginId }]
        })
        
        if (!user) return null

        if (user.role === 'WORKER' && user.isActive === false) {
          throw new Error("Worker account is deactivated.")
        }
        
        const passwordsMatch = await bcrypt.compare(
          password,
          user.passwordHash
        )
        
        if (passwordsMatch) {
          let centreId = undefined
          if (user.role === 'WORKER') {
            const { WorkerProfile } = await import('@/models/WorkerProfile')
            const wp = await WorkerProfile.findOne({ userId: user._id })
            if (wp && wp.centreId) centreId = wp.centreId.toString()
            if (!centreId) throw new Error("Worker is not assigned to a Mandi.")
          }

          return {
            id: user._id.toString(),
            name: user.name,
            role: user.role,
            language: user.language || 'en',
            isManualLanguage: !!user.isManualLanguage,
            preferredLanguage: user.preferredLanguage || user.language,
            centreId: centreId
          }
        }
        return null
      }
    })
  ],
})

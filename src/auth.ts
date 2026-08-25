import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
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
        if (!credentials?.phoneNumber || !credentials?.password) {
          return null
        }
        const user = await prisma.user.findUnique({
          where: { phoneNumber: credentials.phoneNumber as string }
        })
        if (!user) return null
        
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            role: user.role,
            language: user.language
          }
        }
        return null
      }
    })
  ],
})

import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.language = user.language
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.language = token.language as string
        session.user.id = token.sub as string
      }
      return session
    }
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig

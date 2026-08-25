import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { PrismaClient } from "@prisma/client"
import { getTranslations } from 'next-intl/server'

const prisma = new PrismaClient()

export default async function WorkerLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== "WORKER") {
    const { locale } = await params
    redirect(`/${locale}/login`)
  }

  const { locale } = await params

  const tWorker = await getTranslations({ locale, namespace: 'Worker' })
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    include: { centre: true }
  })

  const navItems = [
    { label: tWorker('dashboard'), href: `/${locale}/worker/dashboard`, icon: "📊" },
    { label: tWorker('queue'), href: `/${locale}/worker/queue`, icon: "⏳" },
    { label: tWorker('farmers'), href: `/${locale}/worker/farmers`, icon: "🔍" },
    { label: tWorker('procurementForm'), href: `/${locale}/worker/procurement`, icon: "⚖️" },
    { label: tWorker('history'), href: `/${locale}/worker/history`, icon: "📜" },
    { label: tWorker('profile'), href: `/${locale}/worker/profile`, icon: "👤" }
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white shadow-md sticky top-0 z-50 border-b border-amber-500">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-green-900 rounded-full flex items-center justify-center font-black text-yellow-400 border-2 border-white shadow">
                🏢
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-tight">{tWorker('portalName')}</h1>
                <p className="text-[10px] text-amber-100 font-semibold">{workerProfile?.centre?.name || 'Procurement Centre'}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            <div className="hidden sm:flex items-center space-x-2 bg-amber-800/80 px-3 py-1.5 rounded-lg border border-amber-500">
              <div className="w-7 h-7 rounded-full bg-green-900 text-yellow-400 font-bold flex items-center justify-center text-xs">
                {session.user.name?.[0] || 'W'}
              </div>
              <span className="text-xs font-bold text-white">{session.user.name}</span>
            </div>

            <form action={async () => {
              "use server"
              await signOut({ redirectTo: `/${locale}/login` })
            }}>
              <Button variant="secondary" type="submit" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-8">
                {tCommon('logout')}
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Body layout */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex-shrink-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
            {tWorker('staffControl')}
          </div>
          <nav className="space-y-1">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 hover:text-amber-400 transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

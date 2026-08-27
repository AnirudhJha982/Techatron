import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { connectToDatabase } from "@/lib/mongodb"
import { WorkerProfile, ProcurementCentre } from "@/models"
import mongoose from "mongoose"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import MandiMargLogo from "@/components/MandiMargLogo"
import { getTranslations } from 'next-intl/server'

export default async function WorkerLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  let session = null
  try {
    session = await auth()
  } catch (e) {
    session = null
  }

  if (!session || session.user?.role !== "WORKER") {
    redirect(`/${locale}/login`)
  }

  const tWorker = await getTranslations({ locale, namespace: 'Worker' })
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  await connectToDatabase()
  let workerProfile = null
  let centre = null
  if (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
    workerProfile = await WorkerProfile.findOne({ userId: session.user.id })
    if (workerProfile?.centreId && mongoose.Types.ObjectId.isValid(workerProfile.centreId)) {
      centre = await ProcurementCentre.findById(workerProfile.centreId).lean()
    }
  }

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
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <MandiMargLogo size="sm" variant="dark" />
              <span className="text-xs text-amber-200 font-bold bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">Worker Portal</span>
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

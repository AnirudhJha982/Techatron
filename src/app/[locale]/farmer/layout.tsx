import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { connectToDatabase } from "@/lib/mongodb"
import { Notification } from "@/models"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { getTranslations } from 'next-intl/server'

export default async function FarmerLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== "FARMER") {
    const { locale } = await params
    redirect(`/${locale}/login`)
  }

  const { locale } = await params

  const tFarmer = await getTranslations({ locale, namespace: 'Farmer' })
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  // Unread notifications count from MongoDB
  await connectToDatabase()
  const unreadCount = await Notification.countDocuments({ userId: session.user.id, isRead: false })

  const navItems = [
    { label: tFarmer('dashboard'), href: `/${locale}/farmer/dashboard`, icon: "📊" },
    { label: tFarmer('slotBooking'), href: `/${locale}/farmer/booking`, icon: "📅" },
    { label: tFarmer('digitalToken'), href: `/${locale}/farmer/token`, icon: "🎫" },
    { label: tFarmer('liveQueue'), href: `/${locale}/farmer/queue`, icon: "⏳" },
    { label: tFarmer('procurement'), href: `/${locale}/farmer/procurement`, icon: "🌾" },
    { label: tFarmer('payments'), href: `/${locale}/farmer/payments`, icon: "💳" },
    { label: tFarmer('history'), href: `/${locale}/farmer/history`, icon: "📜" },
    { label: tFarmer('notifications'), href: `/${locale}/farmer/notifications`, icon: "🔔", badge: unreadCount },
    { label: tFarmer('profile'), href: `/${locale}/farmer/profile`, icon: "👤" },
    { label: tFarmer('grievance'), href: `/${locale}/farmer/grievances`, icon: "⚠️" }
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-green-950 via-green-900 to-green-950 text-white shadow-md sticky top-0 z-50 border-b border-green-800">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-black text-green-950 border-2 border-white shadow">
                🌾
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-tight">{tFarmer('portalName')}</h1>
                <p className="text-[10px] text-green-200">{tCommon('department')}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            <Link href={`/${locale}/farmer/notifications`} className="relative p-1.5 bg-green-900 hover:bg-green-800 rounded-lg text-white">
              <span>🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center space-x-2 bg-green-900/60 px-3 py-1.5 rounded-lg border border-green-800">
              <div className="w-7 h-7 rounded-full bg-yellow-500 text-green-950 font-bold flex items-center justify-center text-xs">
                {session.user.name?.[0] || 'K'}
              </div>
              <span className="text-xs font-bold text-white">{session.user.name}</span>
            </div>

            <form action={async () => {
              "use server"
              await signOut({ redirectTo: `/${locale}/login` })
            }}>
              <Button variant="secondary" type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-8">
                {tCommon('logout')}
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Body layout: Sidebar + Main Content */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex-shrink-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
            {tFarmer('portalName')}
          </div>
          <nav className="space-y-1">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 hover:text-yellow-400 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

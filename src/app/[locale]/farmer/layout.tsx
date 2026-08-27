import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { connectToDatabase } from "@/lib/mongodb"
import { Notification } from "@/models"
import mongoose from "mongoose"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import MandiMargLogo from "@/components/MandiMargLogo"
import { getTranslations } from 'next-intl/server'

export default async function FarmerLayout({
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

  if (!session || session.user?.role !== "FARMER") {
    redirect(`/${locale}/login`)
  }

  const tFarmer = await getTranslations({ locale, namespace: 'Farmer' })
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  // Unread notifications count from MongoDB
  await connectToDatabase()
  let unreadCount = 0
  if (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
    unreadCount = await Notification.countDocuments({ userId: session.user.id, isRead: false })
  }

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
    <div className="min-h-screen bg-[#f7f5ee] flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Sidebar Navigation - Deep Forest Green (#0c3823) */}
      <aside className="w-full md:w-64 bg-[#0c3823] text-emerald-100 flex-shrink-0 flex flex-col justify-between border-r border-[#08291a] shadow-xl">
        <div>
          {/* Mandi Marg Branding Banner */}
          <div className="p-5 border-b border-emerald-900/60 bg-[#082b1b] flex items-center justify-between">
            <Link href={`/${locale}`}>
              <MandiMargLogo size="md" variant="dark" />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all hover:bg-[#154a30] hover:text-yellow-300 group"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-amber-400 text-[#0c3823] font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* AI Voice Assistant Footer Banner */}
        <div className="p-4 border-t border-emerald-900/60 bg-[#082b1b]/80 m-3 rounded-2xl">
          <div className="flex items-center space-x-3 text-xs text-yellow-300 font-bold mb-1">
            <span className="text-lg">🎙️</span>
            <span>AI Voice Assistant</span>
          </div>
          <p className="text-[10px] text-emerald-200 leading-snug">Ask anything in your spoken regional language</p>
        </div>
      </aside>

      {/* Main Content Area with Top Header */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="bg-[#f7f5ee] border-b border-[#e2decb] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#0c3823] bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
              Government of India • Ministry of Agriculture
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            <Link href={`/${locale}/farmer/notifications`} className="relative p-2 bg-white hover:bg-slate-50 border border-[#dcd6c5] rounded-xl text-slate-700 shadow-sm transition-colors">
              <span>🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-[#0c3823] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-2.5 bg-white px-3 py-1.5 rounded-xl border border-[#dcd6c5] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-[#0c3823] font-black flex items-center justify-center text-xs border border-white shadow-sm">
                {session.user.name?.[0] || 'F'}
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-[#0c3823] leading-tight">{session.user.name}</p>
                <p className="text-[9px] font-bold text-slate-500">Farmer Account</p>
              </div>
            </div>

            <form action={async () => {
              "use server"
              await signOut({ redirectTo: `/${locale}/login` })
            }}>
              <Button variant="outline" type="submit" size="sm" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 font-bold text-xs h-9 rounded-xl">
                {tCommon('logout')}
              </Button>
            </form>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

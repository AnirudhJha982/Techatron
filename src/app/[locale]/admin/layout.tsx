import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { getTranslations } from 'next-intl/server'

export default async function AdminLayout({
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

  if (!session || session.user?.role !== "ADMIN") {
    redirect(`/${locale}/login`)
  }

  const tAdmin = await getTranslations({ locale, namespace: 'Admin' })
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  const navItems = [
    { label: tAdmin('dashboard'), href: `/${locale}/admin/dashboard`, icon: "🏛️" },
    { label: tAdmin('farmers'), href: `/${locale}/admin/farmers`, icon: "👥" },
    { label: tAdmin('workers'), href: `/${locale}/admin/workers`, icon: "👔" },
    { label: tAdmin('centres'), href: `/${locale}/admin/centres`, icon: "🏬" },
    { label: tAdmin('bookings'), href: `/${locale}/admin/bookings`, icon: "📅" },
    { label: tAdmin('procurement'), href: `/${locale}/admin/procurement`, icon: "⚖️" },
    { label: tAdmin('payments'), href: `/${locale}/admin/payments`, icon: "💳" },
    { label: tAdmin('grievances'), href: `/${locale}/admin/grievances`, icon: "⚠️" },
    { label: tAdmin('reports'), href: `/${locale}/admin/reports`, icon: "📊" },
    { label: tAdmin('notifications'), href: `/${locale}/admin/notifications`, icon: "📢" },
    { label: tAdmin('auditLogs'), href: `/${locale}/admin/audit-logs`, icon: "🛡️" }
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-slate-950 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-black text-yellow-400 border border-slate-700 shadow">
                🏛️
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-tight">{tAdmin('portalName')}</h1>
                <p className="text-[10px] text-slate-400 font-semibold">{tAdmin('nationalControl')}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            <div className="hidden sm:flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-yellow-400 font-bold flex items-center justify-center text-xs">
                {session.user.name?.[0] || 'A'}
              </div>
              <span className="text-xs font-bold text-slate-200">{session.user.name}</span>
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

      {/* Body layout */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-4 border-r border-slate-800 flex-shrink-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-3">
            {tAdmin('nationalControl')}
          </div>
          <nav className="space-y-1">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 hover:text-yellow-400 transition-colors"
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

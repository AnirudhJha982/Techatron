"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from "./LanguageSwitcher"

export default function PublicHeader({ session }: { session?: any }) {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const t = useTranslations("Common")

  return (
    <header className="bg-gradient-to-r from-green-950 via-green-900 to-green-950 text-white shadow-lg sticky top-0 z-50 border-b border-green-800">
      {/* Top Banner Notice */}
      <div className="bg-green-950 text-green-200 text-xs py-1.5 px-4 border-b border-green-800/60 flex justify-between items-center container mx-auto">
        <div className="flex items-center space-x-2">
          <span className="bg-yellow-500 text-green-950 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{t('demoNotice')}</span>
          <span className="font-medium text-slate-200">{t('department')}</span>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-xs text-slate-300">
          <span>{t('tollFree')}: <strong className="text-yellow-400 font-mono">1800-180-1551</strong></span>
          <span className="text-green-300 font-semibold">MSP Season 2025-26</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center space-x-3 group">
          <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center font-black text-green-950 border-2 border-white shadow-md group-hover:scale-105 transition-transform text-xl">
            🌾
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-xl font-black tracking-tight leading-none text-white">{t('appName')}</h1>
              <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded border border-yellow-400/30">GOV</span>
            </div>
            <p className="text-xs text-green-200 font-medium">{t('department')}</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold">
          <Link href={`/${locale}`} className={`hover:text-yellow-300 transition-colors ${pathname === `/${locale}` ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-0.5' : 'text-green-100'}`}>
            {t('home')}
          </Link>
          <Link href={`/${locale}/how-it-works`} className={`hover:text-yellow-300 transition-colors ${pathname.includes('/how-it-works') ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-0.5' : 'text-green-100'}`}>
            {t('howItWorks')}
          </Link>
          <Link href={`/${locale}/services`} className={`hover:text-yellow-300 transition-colors ${pathname.includes('/services') ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-0.5' : 'text-green-100'}`}>
            {t('services')}
          </Link>
          <Link href={`/${locale}/centres`} className={`hover:text-yellow-300 transition-colors ${pathname.includes('/centres') ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-0.5' : 'text-green-100'}`}>
            {t('centres')}
          </Link>
          <Link href={`/${locale}/help`} className={`hover:text-yellow-300 transition-colors ${pathname.includes('/help') ? 'text-yellow-400 font-bold border-b-2 border-yellow-400 pb-0.5' : 'text-green-100'}`}>
            {t('help')}
          </Link>
        </nav>

        {/* Actions & Controls */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />

          {session?.user ? (
            <Link href={`/${locale}/${session.user.role.toLowerCase()}/dashboard`}>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-green-950 font-bold shadow border-none">
                {t('dashboard')} ({session.user.role})
              </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href={`/${locale}/login`}>
                <Button size="sm" variant="ghost" className="text-white hover:bg-green-800/60 font-semibold">
                  {t('login')}
                </Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black shadow border-none">
                  {t('register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

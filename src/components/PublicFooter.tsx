"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

export default function PublicFooter() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] || 'en'
  const tCommon = useTranslations("Common")

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-black text-slate-950 text-lg">
                🌾
              </div>
              <span className="text-lg font-black text-white">{tCommon('appName')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official digital procurement portal designed for transparent crop purchasing, MSP rate verification, and direct bank transfers to Indian farmers.
            </p>
            <div className="text-[11px] bg-slate-900 p-2.5 rounded border border-slate-800 text-yellow-400 font-semibold">
              ⚠️ Demonstration & Prototype Platform — Govt. of India
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Quick Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href={`/${locale}`} className="hover:text-yellow-400 transition-colors">{tCommon('home')}</Link></li>
              <li><Link href={`/${locale}/how-it-works`} className="hover:text-yellow-400 transition-colors">{tCommon('howItWorks')}</Link></li>
              <li><Link href={`/${locale}/services`} className="hover:text-yellow-400 transition-colors">{tCommon('services')}</Link></li>
              <li><Link href={`/${locale}/centres`} className="hover:text-yellow-400 transition-colors">{tCommon('centres')}</Link></li>
              <li><Link href={`/${locale}/help`} className="hover:text-yellow-400 transition-colors">{tCommon('help')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Farmer Portals */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Role Access</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href={`/${locale}/login`} className="hover:text-yellow-400 transition-colors">Farmer Login</Link></li>
              <li><Link href={`/${locale}/login`} className="hover:text-yellow-400 transition-colors">Mandi Supervisor Login</Link></li>
              <li><Link href={`/${locale}/login`} className="hover:text-yellow-400 transition-colors">HQ Officer Login</Link></li>
              <li><Link href={`/${locale}/register`} className="hover:text-yellow-400 transition-colors">{tCommon('register')}</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Helpline */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Kisan Helpline</h3>
            <p className="text-xs text-slate-300 mb-2">Toll-Free National Support (24x7):</p>
            <p className="text-xl font-black text-yellow-400 tracking-wider">1800-180-1551</p>
            <p className="text-[11px] text-slate-500 mt-2">Department of Agriculture & Farmers Welfare, Krishi Bhawan, New Delhi - 110001</p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 Mandi Marg — Department of Agricultural Procurement. Government Platform.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms of Service</Link>
            <Link href="#" className="hover:underline">Accessibility Statement</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

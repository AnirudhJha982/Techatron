import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { translateCentre, translateState } from "@/lib/translateEntity";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  const t = await getTranslations({ locale, namespace: 'Landing' });
  const tCommon = await getTranslations({ locale, namespace: 'Common' });

  // Fetch real statistics from database
  const totalFarmers = await prisma.user.count({ where: { role: 'FARMER' } });
  const totalCentres = await prisma.procurementCentre.count({ where: { isActive: true } });
  const totalBookings = await prisma.booking.count();
  const recentCentres = await prisma.procurementCentre.findMany({
    take: 3,
    where: { isActive: true }
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PublicHeader session={session} />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-green-950 via-green-900 to-green-950 text-white py-20 overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

          <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>MSP Rabi & Kharif Procurement Portal 2025-26</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              {t('heroTitle')}
            </h1>

            <p className="text-base md:text-xl text-green-100 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link href={`/${locale}/farmer/booking`}>
                <Button size="lg" className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black shadow-lg text-lg px-8 h-14 border-none">
                  {t('bookSlot')}
                </Button>
              </Link>
              <Link href={`/${locale}/centres`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-green-400/50 hover:bg-green-800 text-lg px-8 h-14 bg-green-950/40 backdrop-blur-sm">
                  {t('findCentre')}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Statistics Bar */}
        <section className="bg-white border-b border-gray-200 py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 border-r border-gray-100 last:border-0">
                <p className="text-3xl sm:text-4xl font-black text-green-800 tracking-tight">{totalFarmers.toLocaleString()}</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 uppercase tracking-wider">{t('totalFarmers')}</p>
              </div>
              <div className="p-4 border-r border-gray-100 last:border-0">
                <p className="text-3xl sm:text-4xl font-black text-yellow-600 tracking-tight">{totalCentres}</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 uppercase tracking-wider">{t('activeCentres')}</p>
              </div>
              <div className="p-4 border-r border-gray-100 last:border-0">
                <p className="text-3xl sm:text-4xl font-black text-green-800 tracking-tight">{totalBookings.toLocaleString()}</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 uppercase tracking-wider">{t('totalProcured')}</p>
              </div>
              <div className="p-4">
                <p className="text-3xl sm:text-4xl font-black text-blue-700 tracking-tight">₹ 2,275 / Qtl</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 uppercase tracking-wider">Current Wheat MSP Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Direct Services */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('servicesTitle')}</h2>
              <p className="text-gray-600 mt-2">{t('servicesSubtitle')}</p>
              <div className="w-16 h-1 bg-green-700 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: t('bookSlot'), desc: "Select your crop, date, and preferred time slot at nearby Mandis.", icon: "📅", href: `/${locale}/farmer/booking`, color: "border-t-green-600" },
                { title: t('checkToken'), desc: "View real-time token numbers and estimate waiting time before visiting.", icon: "🎫", href: `/${locale}/farmer/queue`, color: "border-t-yellow-500" },
                { title: t('checkStatus'), desc: "Track Direct Benefit Transfer payment credit status for your crop sales.", icon: "💳", href: `/${locale}/farmer/payments`, color: "border-t-blue-600" },
                { title: "Raise Grievance", desc: "Submit complaints regarding slot, moisture grading, or delayed payment.", icon: "⚠️", href: `/${locale}/farmer/grievances`, color: "border-t-red-500" },
              ].map((s, idx) => (
                <Link key={idx} href={s.href} className="group">
                  <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-t-4 ${s.color} hover:shadow-lg transition-all flex flex-col h-full`}>
                    <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-800 transition-colors mb-2">{s.title}</h3>
                    <p className="text-sm text-gray-600 flex-grow">{s.desc}</p>
                    <span className="text-xs font-bold text-green-700 mt-4 group-hover:underline flex items-center">
                      Access Service →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4-Step How It Works */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('howItWorksTitle')}</h2>
              <p className="text-gray-600 mt-2">{t('howItWorksSubtitle')}</p>
              <div className="w-16 h-1 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Register Account", desc: "Register using your mobile number and farmer details." },
                { step: "2", title: "Book a Time Slot", desc: "Choose your nearest procurement centre, date, and convenient time." },
                { step: "3", title: "Receive Digital Token", desc: "Get a digital token pass with queue position on your smartphone." },
                { step: "4", title: "Drop Produce & Get Paid", desc: "Visit centre at your slot time, complete grading, and receive DBT payment." }
              ].map((item, idx) => (
                <div key={idx} className="relative bg-slate-50 p-6 rounded-xl border border-slate-200 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-800 text-yellow-400 font-extrabold text-xl flex items-center justify-center mb-4 shadow-md">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href={`/${locale}/how-it-works`}>
                <Button variant="outline" className="border-green-700 text-green-800 hover:bg-green-50 font-bold px-6">
                  View Detailed Step-by-Step Guide →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Procurement Centres Preview */}
        <section className="py-16 bg-slate-100 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Active Procurement Centres</h2>
                <p className="text-gray-600 mt-1">Check availability and book slots at government accredited centres</p>
              </div>
              <Link href={`/${locale}/centres`} className="mt-4 md:mt-0">
                <Button className="bg-green-800 hover:bg-green-700 text-white font-bold">
                  View All Centres ({totalCentres})
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentCentres.map(c => (
                <div key={c.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded">Active Mandi</span>
                    <span className="text-xs font-semibold text-gray-500">{c.district}, {translateState(c.state, locale)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{translateCentre(c.name, locale)}</h3>
                  <p className="text-sm text-gray-600 mb-4">{c.address}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span>Daily Capacity: <strong>{c.capacityPerDay} Qtl</strong></span>
                    <Link href={`/${locale}/farmer/booking?centreId=${c.id}`} className="text-green-700 font-bold hover:underline">
                      Book Slot →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Official Announcements Banner */}
        <section className="py-12 bg-amber-500 text-green-950">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="bg-green-950 text-yellow-400 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider mb-2 inline-block">Official Notice</span>
              <h3 className="text-2xl font-black tracking-tight">{t('mspRateNotice')}</h3>
              <p className="text-sm text-green-950 font-medium mt-1">{t('dbtNotice')}</p>
            </div>
            <Link href={`/${locale}/register`}>
              <Button className="bg-green-950 hover:bg-green-900 text-white font-bold px-6 h-12 shadow-lg">
                {t('registerNow')}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

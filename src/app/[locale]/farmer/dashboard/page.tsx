import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, Procurement, Notification, ProcurementCentre, Slot } from "@/models"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'
import {
  FarmerHeroIllustration,
  GrainSackIllustration,
  DBTPaymentIllustration,
  QueuePathIllustration,
  TokenPassIllustration
} from "@/components/illustrations/AgriIllustrations"

export default async function FarmerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const tFarmer = await getTranslations({ locale, namespace: 'Farmer' })
  const tCommon = await getTranslations({ locale, namespace: 'Common' })

  await connectToDatabase()

  const farmerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await FarmerProfile.findOne({ userId: session.user.id })
    : null

  // Active Booking
  let activeBookingData: any = null
  if (farmerProfile) {
    const rawBooking = await Booking.findOne({
      farmerId: farmerProfile._id,
      status: { $in: ['SCHEDULED', 'ARRIVED', 'PROCESSING'] }
    }).sort({ date: 1 }).lean()

    if (rawBooking) {
      const centre = await ProcurementCentre.findById(rawBooking.centreId).lean()
      const slot = await Slot.findById(rawBooking.slotId).lean()
      activeBookingData = {
        id: rawBooking._id.toString(),
        tokenNumber: rawBooking.tokenNumber,
        status: rawBooking.status,
        queuePosition: rawBooking.queuePosition || 4,
        date: rawBooking.date,
        centreName: centre?.name || 'Mandi Samiti',
        timeSlot: slot?.timeSlot || '10:00 AM - 11:00 AM'
      }
    }
  }

  // Completed Procurements Total
  let totalQuantity = 0
  let totalReceived = 0
  let procurementsList: any[] = []
  if (farmerProfile) {
    const farmerBookings = await Booking.find({ farmerId: farmerProfile._id }).lean()
    const bookingIds = farmerBookings.map(b => b._id)
    const procurements = await Procurement.find({ bookingId: { $in: bookingIds } }).sort({ createdAt: -1 }).lean()

    totalQuantity = procurements.reduce((acc, p) => acc + p.quantity, 0)
    totalReceived = procurements
      .filter(p => (p.paymentStatus as string) === 'COMPLETED' || (p.paymentStatus as string) === 'SUCCESS')
      .reduce((acc, p) => acc + Math.round(p.quantity * 2275), 0)

    procurementsList = procurements.slice(0, 3)
  }

  // Recent Notifications
  const rawNotifications = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await Notification.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()
    : []

  const isVerified = farmerProfile?.kycStatus === 'VERIFIED' && farmerProfile?.bookingEligible === true

  return (
    <div className="space-y-8 font-sans">
      {/* 🌾 HERO WELCOME BANNER (Design 1 Reference Theme) */}
      <div className="relative bg-gradient-to-r from-[#faf6e9] via-[#f7f0dc] to-[#faf6e9] p-6 sm:p-8 rounded-3xl border-2 border-[#ebd9a2] shadow-sm flex flex-col md:flex-row justify-between items-center overflow-hidden">
        <div className="z-10 space-y-3 max-w-xl text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {isVerified ? (
              <span className="text-[11px] font-black bg-[#15803d] text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                <span>🟢</span>
                <span>{tFarmer('verifiedAccount')}</span>
              </span>
            ) : (
              <span className="text-[11px] font-black bg-amber-600 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                <span>🔴</span>
                <span>LEVEL 1 BASIC ACCOUNT</span>
              </span>
            )}
            <span className="text-xs text-amber-900 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Farmer ID: {farmerProfile?.farmerId || 'KF-847291'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#0c3823] tracking-tight leading-tight">
            {tFarmer('welcomeUser')}, {session?.user.name}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Village: <strong className="text-[#0c3823]">{farmerProfile?.village || 'Nilokheri'}</strong>, {farmerProfile?.district || 'Karnal'} • Land Size: <strong className="text-[#0c3823]">{farmerProfile?.landSizeAcres || 8.5} Acres</strong>
          </p>

          <div className="pt-2">
            <Link href={`/${locale}/farmer/booking`}>
              <Button className="bg-gradient-to-r from-[#eab308] via-amber-500 to-[#ca8a04] hover:from-amber-400 hover:to-amber-600 text-[#0c3823] font-black shadow-lg px-8 py-3.5 h-auto text-sm rounded-2xl border-2 border-white hover:scale-105 active:scale-95 transition-all">
                📅 BOOK A MANDI SLOT →
              </Button>
            </Link>
          </div>
        </div>

        {/* Agricultural Hero Illustration */}
        <div className="mt-6 md:mt-0 z-10">
          <FarmerHeroIllustration />
        </div>
      </div>

      {/* 📊 4 KPI STAT CARDS (Design 1 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Token Card */}
        <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              {tFarmer('activeToken')}
            </CardTitle>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Live</span>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-[#0c3823]">
                {activeBookingData ? activeBookingData.tokenNumber : "T-004"}
              </p>
              <p className="text-xs text-slate-600 mt-1 font-bold">
                {activeBookingData ? activeBookingData.centreName : "Karnal Main APMC"}
              </p>
              <p className="text-[11px] text-slate-500">10:00 AM - 11:00 AM</p>
            </div>
            <TokenPassIllustration />
          </CardContent>
        </Card>

        {/* Quantity Sold Card */}
        <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              {tFarmer('totalSold')}
            </CardTitle>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Harvest</span>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-[#0c3823]">
                {totalQuantity > 0 ? totalQuantity.toFixed(1) : "124.5"} <span className="text-sm font-bold text-amber-700">Qtl</span>
              </p>
              <p className="text-xs text-slate-600 mt-1 font-medium">Accumulated quantity</p>
              <p className="text-[11px] text-slate-500">Wheat & Paddy MSP</p>
            </div>
            <GrainSackIllustration />
          </CardContent>
        </Card>

        {/* Amount Received Card */}
        <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              {tFarmer('totalReceived')}
            </CardTitle>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">DBT Credit</span>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-[#0c3823]">
                ₹ {totalReceived > 0 ? totalReceived.toLocaleString('en-IN') : "2,48,500"}
              </p>
              <p className="text-xs text-slate-600 mt-1 font-medium">Credited via DBT</p>
              <p className="text-[11px] text-emerald-700 font-bold">Direct Bank Transfer</p>
            </div>
            <DBTPaymentIllustration />
          </CardContent>
        </Card>

        {/* Live Queue Position Card */}
        <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              {tFarmer('queuePos')}
            </CardTitle>
            <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Real-time</span>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black text-[#0c3823]">
                #{activeBookingData?.queuePosition ? activeBookingData.queuePosition : "04"}
              </p>
              <p className="text-xs text-slate-600 mt-1 font-medium">Est. wait time</p>
              <p className="text-[11px] text-purple-700 font-bold">35 minutes</p>
            </div>
            <QueuePathIllustration />
          </CardContent>
        </Card>
      </div>

      {/* MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Booking & Procurement Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* CURRENT BOOKING STATUS CARD */}
          <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-[#faf8f2] border-b border-[#e2decb] p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-[#0c3823]">Current Booking Status</CardTitle>
                <CardDescription className="text-xs text-slate-500">Scheduled procurement appointment</CardDescription>
              </div>
              <Link href={`/${locale}/farmer/token`}>
                <Button size="sm" className="bg-[#0c3823] hover:bg-emerald-900 text-yellow-400 font-bold text-xs rounded-xl shadow-sm">
                  View Digital Token →
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#faf8f2] p-5 rounded-2xl border border-[#e2decb]">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-medium">Crop:</span>
                    <strong className="text-slate-900 font-bold">Wheat (Sharbati)</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-medium">Mandi:</span>
                    <strong className="text-slate-900 font-bold">{activeBookingData ? activeBookingData.centreName : "Karnal Main APMC"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-500 font-medium">Date:</span>
                    <strong className="text-slate-900 font-bold">{activeBookingData ? new Date(activeBookingData.date).toLocaleDateString() : "26 Aug 2026"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Time Slot:</span>
                    <strong className="text-slate-900 font-bold">{activeBookingData ? activeBookingData.timeSlot : "10:00 AM - 11:00 AM"}</strong>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center p-4 bg-white rounded-xl border border-[#e2decb] text-center shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">TOKEN NUMBER</span>
                  <p className="text-3xl font-black text-[#0c3823] my-1">{activeBookingData ? activeBookingData.tokenNumber : "T-004"}</p>
                  <span className="inline-flex items-center space-x-1 text-xs font-bold bg-green-100 text-green-900 px-3 py-1 rounded-full">
                    <span>🟢</span>
                    <span>STATUS: Confirmed</span>
                  </span>
                </div>
              </div>

              {/* Booking Progress Timeline */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Procurement Workflow Timeline</p>
                <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-bold">
                  <div className="bg-emerald-100 text-emerald-950 p-2 rounded-lg border border-emerald-300">1. Booked ✓</div>
                  <div className="bg-emerald-100 text-emerald-950 p-2 rounded-lg border border-emerald-300">2. Arrived ✓</div>
                  <div className="bg-yellow-400 text-emerald-950 p-2 rounded-lg border border-yellow-500 font-black animate-pulse">3. In Queue</div>
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-lg border border-slate-200">4. Quality</div>
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-lg border border-slate-200">5. Weighing</div>
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-lg border border-slate-200">6. Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RECENT PROCUREMENT & DBT PAYMENTS */}
          <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-[#faf8f2] border-b border-[#e2decb] p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-[#0c3823]">Recent Procurement & DBT Payments</CardTitle>
                <CardDescription className="text-xs text-slate-500">Government MSP credit logs</CardDescription>
              </div>
              <Link href={`/${locale}/farmer/history`}>
                <Button size="sm" variant="ghost" className="text-xs font-bold text-[#0c3823] hover:underline">
                  View History →
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f4f1e8] text-slate-700 uppercase font-black border-b border-[#e2decb]">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Crop</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">MSP (₹/Qtl)</th>
                    <th className="p-3.5">Amount (₹)</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3.5 font-medium">26 Aug 2026</td>
                    <td className="p-3.5 font-bold text-slate-900">Wheat (Sharbati)</td>
                    <td className="p-3.5 font-bold">42 Qtl</td>
                    <td className="p-3.5">2,275</td>
                    <td className="p-3.5 font-black text-[#0c3823]">95,550</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold text-[10px]">Completed ✓</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3.5 font-medium">15 Aug 2026</td>
                    <td className="p-3.5 font-bold text-slate-900">Wheat (Desi)</td>
                    <td className="p-3.5 font-bold">38 Qtl</td>
                    <td className="p-3.5">2,275</td>
                    <td className="p-3.5 font-black text-[#0c3823]">86,450</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold text-[10px]">Completed ✓</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Mandi Queue & DBT Status (1 col) */}
        <div className="space-y-8">
          {/* LIVE MANDI QUEUE CARD */}
          <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-[#faf8f2] border-b border-[#e2decb] p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-[#0c3823]">Live Mandi Queue</CardTitle>
                <CardDescription className="text-xs text-slate-500">Real-time token sequence</CardDescription>
              </div>
              <Link href={`/${locale}/farmer/queue`}>
                <span className="text-xs font-bold text-emerald-800 hover:underline">View Full Queue →</span>
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Now Serving</span>
                  <strong className="text-base font-black text-slate-900 block mt-0.5">T-001</strong>
                </div>
                <div className="bg-amber-100 p-2.5 rounded-xl border border-amber-300">
                  <span className="text-[10px] text-amber-900 font-bold block uppercase">Your Token</span>
                  <strong className="text-base font-black text-amber-950 block mt-0.5">T-004</strong>
                </div>
                <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">People Ahead</span>
                  <strong className="text-base font-black text-slate-900 block mt-0.5">3</strong>
                </div>
                <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  <span className="text-[10px] text-purple-900 font-bold block uppercase">Est. Wait</span>
                  <strong className="text-base font-black text-purple-950 block mt-0.5">25 min</strong>
                </div>
              </div>

              {/* Node Sequence Line */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-black">1</span>
                  <span className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-black">2</span>
                  <span className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center font-black">3</span>
                  <span className="w-8 h-8 rounded-full bg-yellow-400 text-[#0c3823] flex items-center justify-center font-black ring-4 ring-yellow-200 scale-110 shadow-md">4 YOU</span>
                  <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">5</span>
                  <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">6</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DBT PAYMENT STATUS CARD */}
          <Card className="bg-white border border-[#e2decb] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="bg-[#faf8f2] border-b border-[#e2decb] p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-[#0c3823]">DBT Payment Status</CardTitle>
                <CardDescription className="text-xs text-slate-500">Direct Bank Transfer</CardDescription>
              </div>
              <Link href={`/${locale}/farmer/payments`}>
                <span className="text-xs font-bold text-emerald-800 hover:underline">View History →</span>
              </Link>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Last Amount:</span>
                <strong className="text-xl font-black text-[#0c3823]">₹ 95,550</strong>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Disbursement Status:</span>
                <span className="bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <span>Credited</span>
                  <span>✅</span>
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Aadhaar Bank Account:</span>
                <strong className="text-slate-800">XXXX-XXXX-4892</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Transaction Reference:</span>
                <strong className="text-slate-800 font-mono text-[10px]">DBT202608260041</strong>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

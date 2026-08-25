import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function FarmerDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session?.user.id }
  })

  // Active Booking
  const activeBooking = await prisma.booking.findFirst({
    where: {
      farmerId: farmerProfile?.id,
      status: { in: ['SCHEDULED', 'ARRIVED', 'PROCESSING'] }
    },
    include: {
      centre: true,
      slot: true,
      procurement: true
    },
    orderBy: { date: 'asc' }
  })

  // Completed Procurements Total
  const procurements = await prisma.procurement.findMany({
    where: {
      booking: { farmerId: farmerProfile?.id }
    }
  })

  const totalQuantity = procurements.reduce((acc, p) => acc + p.quantity, 0)
  const totalReceived = procurements
    .filter(p => p.paymentStatus === 'COMPLETED')
    .reduce((acc, p) => acc + Math.round(p.quantity * 2275), 0)

  // Recent Notifications
  const notifications = await prisma.notification.findMany({
    take: 3,
    where: { userId: session?.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full uppercase">Verified Farmer Account</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Welcome, {session?.user.name}</h1>
          <p className="text-xs text-slate-500 mt-1">Village: {farmerProfile?.village || 'Nisang'}, {farmerProfile?.district || 'Karnal'} • Land Size: {farmerProfile?.landSizeAcres || 5.5} Acres</p>
        </div>
        <Link href={`/${locale}/farmer/booking`} className="mt-4 sm:mt-0">
          <Button className="bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black shadow-md px-6 h-12 border-none">
            📅 Book New Slot
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-t-4 border-t-yellow-500 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Token</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900">{activeBooking ? activeBooking.tokenNumber : "None"}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{activeBooking ? activeBooking.status : "No upcoming slots"}</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-600 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Quantity Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-800">{totalQuantity.toFixed(1)} <span className="text-sm font-bold text-slate-600">Qtl</span></p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Accumulated MSP Sales</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-600 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Amount Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-blue-900">₹ {totalReceived.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Credited via DBT</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-600 shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 tracking-wider">Live Queue Position</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-purple-900">{activeBooking?.queuePosition ? `#${activeBooking.queuePosition}` : "--"}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{activeBooking ? "Est. wait ~30 mins" : "No queue active"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Booking Card (2 cols) */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-extrabold text-slate-900">Current Booking Status</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">Your upcoming or in-progress Mandi slot</CardDescription>
              </div>
              {activeBooking && (
                <Link href={`/${locale}/farmer/token`}>
                  <Button size="sm" variant="outline" className="text-green-800 border-green-300 font-bold text-xs">
                    View Digital Pass →
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {activeBooking ? (
              <div className="space-y-6">
                {/* Digital Token Display */}
                <div className="bg-gradient-to-r from-green-900 to-green-800 text-white rounded-xl p-6 shadow-md border-2 border-yellow-400 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <span className="text-[10px] bg-yellow-400 text-green-950 font-black px-2 py-0.5 rounded uppercase">Official Token</span>
                      <h3 className="text-4xl font-black tracking-tight text-white mt-1">{activeBooking.tokenNumber}</h3>
                      <p className="text-xs text-green-200 mt-1">Centre: <strong>{activeBooking.centre.name}</strong></p>
                    </div>
                    <div className="mt-4 sm:mt-0 text-left sm:text-right bg-green-950/60 p-3 rounded-lg border border-green-700">
                      <p className="text-xs text-green-200">Date: <strong className="text-white">{activeBooking.date.toLocaleDateString()}</strong></p>
                      <p className="text-xs text-green-200">Slot: <strong className="text-white">{activeBooking.slot.timeSlot}</strong></p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-yellow-400 text-green-950 text-xs font-black rounded-full">
                        Status: {activeBooking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Queue Progress Bar */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                    <span>Queue Progress</span>
                    <span>Position #{activeBooking.queuePosition || 1} in queue</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-yellow-400 to-green-600 h-full rounded-full w-3/4"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Gate 2 Queue moving smoothly. Please keep your crop documents ready.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="text-5xl mb-3">🌾</div>
                <h3 className="text-lg font-bold text-slate-800">No Active Slot Bookings</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">You currently do not have any upcoming procurement slots booked. Select a centre to reserve your slot.</p>
                <Link href={`/${locale}/farmer/booking`}>
                  <Button className="bg-green-800 hover:bg-green-700 text-white font-bold px-6">
                    Book Slot Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications & Quick Actions Column */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-bold text-slate-900">Recent Notifications</CardTitle>
                <Link href={`/${locale}/farmer/notifications`} className="text-xs font-bold text-green-800 hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800 mb-0.5">{n.title}</p>
                    <p className="text-slate-600 leading-snug">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">{n.createdAt.toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/${locale}/farmer/booking`}>
              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-600 bg-white text-center cursor-pointer">
                <span className="text-2xl block mb-1">📅</span>
                <span className="text-xs font-bold text-slate-800 block">Book Slot</span>
              </Card>
            </Link>
            <Link href={`/${locale}/farmer/queue`}>
              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-yellow-500 bg-white text-center cursor-pointer">
                <span className="text-2xl block mb-1">⏳</span>
                <span className="text-xs font-bold text-slate-800 block">Live Queue</span>
              </Card>
            </Link>
            <Link href={`/${locale}/farmer/payments`}>
              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-600 bg-white text-center cursor-pointer">
                <span className="text-2xl block mb-1">💳</span>
                <span className="text-xs font-bold text-slate-800 block">DBT Payments</span>
              </Card>
            </Link>
            <Link href={`/${locale}/farmer/grievances`}>
              <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-red-500 bg-white text-center cursor-pointer">
                <span className="text-2xl block mb-1">⚠️</span>
                <span className="text-xs font-bold text-slate-800 block">Grievance</span>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

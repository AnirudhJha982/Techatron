import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, ProcurementCentre, User } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function FarmerQueuePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  await connectToDatabase()

  const farmerProfile = await FarmerProfile.findOne({ userId: session?.user.id })

  let activeBookingData: any = null
  let queueList: any[] = []

  if (farmerProfile) {
    const rawBooking = await Booking.findOne({
      farmerId: farmerProfile._id,
      status: { $in: ['SCHEDULED', 'ARRIVED', 'PROCESSING'] }
    }).sort({ date: 1 }).lean()

    if (rawBooking) {
      const centre = await ProcurementCentre.findById(rawBooking.centreId).lean()
      activeBookingData = {
        id: rawBooking._id.toString(),
        tokenNumber: rawBooking.tokenNumber,
        status: rawBooking.status,
        queuePosition: rawBooking.queuePosition,
        centreName: centre?.name || 'Mandi Samiti'
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const rawQueue = await Booking.find({
        centreId: rawBooking.centreId,
        date: { $gte: today },
        status: { $in: ['SCHEDULED', 'ARRIVED', 'PROCESSING'] }
      }).sort({ tokenNumber: 1 }).lean()

      queueList = await Promise.all(
        rawQueue.map(async (item) => {
          const fProfile = await FarmerProfile.findById(item.farmerId).lean()
          const fUser = fProfile ? await User.findById(fProfile.userId).lean() : null
          return {
            id: item._id.toString(),
            tokenNumber: item.tokenNumber,
            status: item.status,
            farmerName: fUser?.name || 'Farmer'
          }
        })
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Queue Status</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time Mandi token progression and queue movement</p>
        </div>
        <Link href={`/${locale}/farmer/dashboard`}>
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
      </div>

      {activeBookingData ? (
        <div className="space-y-6">
          {/* Active Queue Summary Banner */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-green-950 p-6 rounded-2xl shadow-md border-2 border-yellow-300 flex flex-col sm:flex-row justify-between items-center">
            <div>
              <span className="bg-green-950 text-yellow-400 text-xs font-black px-2.5 py-0.5 rounded uppercase">Your Active Booking</span>
              <h2 className="text-3xl font-black tracking-tight mt-1">{activeBookingData.tokenNumber}</h2>
              <p className="text-xs font-semibold text-green-950 mt-0.5">Centre: {activeBookingData.centreName}</p>
            </div>
            <div className="mt-4 sm:mt-0 text-center sm:text-right bg-green-950 text-white p-4 rounded-xl shadow-inner">
              <p className="text-xs text-green-200">Current Position in Queue</p>
              <p className="text-3xl font-black text-yellow-400">#{activeBookingData.queuePosition || 1}</p>
              <p className="text-[10px] text-green-300 mt-0.5">Est. Wait: ~25 Minutes</p>
            </div>
          </div>

          {/* Queue Visualization Cards */}
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-900">Live Mandi Token Queue Progression</CardTitle>
              <CardDescription className="text-xs text-slate-500">Showing order of tokens currently waiting or being served at Gate 2</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {queueList.length === 0 ? (
                  <p className="col-span-full text-center text-sm text-slate-500 py-6">No queue tokens active right now.</p>
                ) : (
                  queueList.map((item) => {
                    const isYou = item.id === activeBookingData.id
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border-2 text-center transition-transform ${
                          isYou
                            ? 'border-yellow-500 bg-yellow-50 shadow-md ring-2 ring-yellow-400 scale-105'
                            : item.status === 'PROCESSING'
                            ? 'border-green-600 bg-green-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          isYou ? 'bg-yellow-500 text-green-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isYou ? '👈 YOU' : item.status}
                        </span>

                        <p className={`text-2xl font-black mt-2 ${isYou ? 'text-green-950' : 'text-slate-800'}`}>
                          {item.tokenNumber}
                        </p>

                        <p className="text-xs text-slate-500 font-medium mt-1 truncate">
                          {item.farmerName}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Notification Preference */}
              <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">SMS / WhatsApp Queue Alerts</h4>
                    <p className="text-xs text-slate-500">We will notify your mobile number when your turn is 2 tokens away.</p>
                  </div>
                </div>
                <Button size="sm" className="bg-green-800 hover:bg-green-700 text-white font-bold text-xs">
                  ✓ SMS Alerts Active
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center bg-white border-dashed border-2">
          <span className="text-5xl mb-3 block">⏳</span>
          <h3 className="text-xl font-bold text-slate-800">No Active Queue Booking</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">Book a procurement slot to track live Mandi token movement.</p>
          <Link href={`/${locale}/farmer/booking`}>
            <Button className="bg-green-800 hover:bg-green-700 text-white font-bold px-6">
              Book Procurement Slot
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}

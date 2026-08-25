import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { WorkerProfile, ProcurementCentre, Booking, FarmerProfile, User, Slot, Procurement } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import mongoose from "mongoose"

export default async function WorkerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  await connectToDatabase()

  const workerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await WorkerProfile.findOne({ userId: session.user.id })
    : null

  const centre = workerProfile ? await ProcurementCentre.findById(workerProfile.centreId).lean() : null

  if (!workerProfile || !centre) {
    return <div className="p-8 text-red-600 font-bold">Worker profile or Procurement Centre not configured.</div>
  }

  // Today's bookings for this centre
  const today = new Date()
  today.setHours(0,0,0,0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const rawBookings = await Booking.find({
    centreId: workerProfile.centreId,
    date: { $gte: today, $lt: tomorrow }
  }).sort({ tokenNumber: 1 }).lean()

  const todaysBookings = await Promise.all(
    rawBookings.map(async (b) => {
      const farmerProfile = await FarmerProfile.findById(b.farmerId).lean()
      const farmerUser = farmerProfile ? await User.findById(farmerProfile.userId).lean() : null
      const slot = await Slot.findById(b.slotId).lean()
      const procurement = await Procurement.findOne({ bookingId: b._id }).lean()

      return {
        id: b._id.toString(),
        tokenNumber: b.tokenNumber,
        status: b.status,
        farmerName: farmerUser?.name || 'Farmer',
        farmerPhone: farmerUser?.phoneNumber || 'N/A',
        timeSlot: slot?.timeSlot || 'Morning',
        procurementQuantity: procurement?.quantity || 0
      }
    })
  )

  const totalScheduled = todaysBookings.length
  const arrived = todaysBookings.filter(b => b.status === 'ARRIVED').length
  const processing = todaysBookings.filter(b => b.status === 'PROCESSING').length
  const completed = todaysBookings.filter(b => b.status === 'COMPLETED').length

  const totalQuantityToday = todaysBookings.reduce((acc, b) => acc + b.procurementQuantity, 0)

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full uppercase">Centre Supervisor Control Panel</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{centre.name}</h1>
          <p className="text-xs text-slate-500 mt-1">{centre.address} • Daily Capacity: {centre.capacityPerDay} Qtl</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href={`/${locale}/worker/queue`}>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5">
              ⏳ Manage Token Queue
            </Button>
          </Link>
          <Link href={`/${locale}/worker/procurement`}>
            <Button className="bg-green-800 hover:bg-green-700 text-white font-bold px-5">
              ⚖️ New Procurement Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <Card className="border-t-4 border-t-blue-600 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Scheduled Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-blue-900">{totalScheduled}</p>
            <p className="text-xs text-slate-500 mt-1">Total Token Passholders</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-yellow-500 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Waiting in Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-yellow-900">{arrived}</p>
            <p className="text-xs text-slate-500 mt-1">Arrived at Gate 2</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-600 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Processing Now</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-900">{processing}</p>
            <p className="text-xs text-slate-500 mt-1">At Weighbridge / Grading</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-600 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Completed Produce</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-900">{totalQuantityToday.toFixed(1)} <span className="text-sm font-bold text-slate-600">Qtl</span></p>
            <p className="text-xs text-slate-500 mt-1">{completed} Farmers Served</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Today Queue Table */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Today's Token Queue Log</CardTitle>
              <CardDescription className="text-xs text-slate-500">Real-time status of farmers at this centre</CardDescription>
            </div>
            <Link href={`/${locale}/worker/queue`}>
              <Button size="sm" variant="outline" className="text-amber-800 border-amber-300 font-bold text-xs">
                Full Control Board →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {todaysBookings.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No token bookings scheduled for today.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">Token Pass</th>
                    <th className="p-3">Farmer Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Slot Window</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaysBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-black text-slate-900">{b.tokenNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{b.farmerName}</td>
                      <td className="p-3 text-slate-600">{b.farmerPhone}</td>
                      <td className="p-3">{b.timeSlot}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          b.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'ARRIVED' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {b.status !== 'COMPLETED' && (
                          <Link href={`/${locale}/worker/procurement?bookingId=${b.id}`}>
                            <Button size="sm" className="bg-green-800 hover:bg-green-700 text-white font-bold text-[11px] h-7">
                              Process Produce 秤️
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { WorkerProfile, Booking, FarmerProfile, User } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateQueueStatusAction } from "@/app/actions/workerActions"
import Link from "next/link"

export default async function WorkerQueuePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  await connectToDatabase()

  const workerProfile = await WorkerProfile.findOne({ userId: session?.user.id })

  const today = new Date()
  today.setHours(0,0,0,0)

  let queueBookings: any[] = []
  if (workerProfile) {
    const rawQueue = await Booking.find({
      centreId: workerProfile.centreId,
      date: { $gte: today }
    }).sort({ tokenNumber: 1 }).lean()

    queueBookings = await Promise.all(
      rawQueue.map(async (b) => {
        const farmerProfile = await FarmerProfile.findById(b.farmerId).lean()
        const farmerUser = farmerProfile ? await User.findById(farmerProfile.userId).lean() : null
        return {
          id: b._id.toString(),
          tokenNumber: b.tokenNumber,
          status: b.status,
          farmerName: farmerUser?.name || 'Farmer',
          farmerPhone: farmerUser?.phoneNumber || 'N/A'
        }
      })
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Token Queue Control Board</h1>
          <p className="text-sm text-slate-500 mt-1">Manage live queue positions, call next token, and mark arrivals</p>
        </div>
        <Link href={`/${locale}/worker/dashboard`}>
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">Active Mandi Queue Control</CardTitle>
          <CardDescription className="text-xs text-slate-500">Call tokens or change statuses in real time</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {queueBookings.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No active queue tokens.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">Token Pass</th>
                    <th className="p-3">Farmer Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Change Status / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queueBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-black text-base text-slate-900">{b.tokenNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{b.farmerName}</td>
                      <td className="p-3 text-slate-600">{b.farmerPhone}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          b.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800' :
                          b.status === 'ARRIVED' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        {b.status === 'SCHEDULED' && (
                          <form action={async () => {
                            "use server"
                            await updateQueueStatusAction(b.id, "ARRIVED")
                          }}>
                            <Button size="sm" variant="outline" className="text-xs font-bold border-yellow-400 text-yellow-800 hover:bg-yellow-50 h-7">
                              Mark Arrived Gate 2
                            </Button>
                          </form>
                        )}

                        {b.status === 'ARRIVED' && (
                          <form action={async () => {
                            "use server"
                            await updateQueueStatusAction(b.id, "PROCESSING")
                          }}>
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-7">
                              📣 Call Next Token
                            </Button>
                          </form>
                        )}

                        {b.status === 'PROCESSING' && (
                          <Link href={`/${locale}/worker/procurement?bookingId=${b.id}`}>
                            <Button size="sm" className="bg-green-800 hover:bg-green-700 text-white font-bold text-xs h-7">
                              ⚖️ Record Weighing & Quality
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

import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { WorkerProfile, Procurement, Booking, FarmerProfile, User } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function WorkerHistoryPage() {
  const session = await auth()

  await connectToDatabase()

  const workerProfile = await WorkerProfile.findOne({ userId: session?.user.id })

  let procurementsData: any[] = []
  if (workerProfile) {
    const rawProcurements = await Procurement.find({ workerId: workerProfile._id })
      .sort({ createdAt: -1 })
      .lean()

    procurementsData = await Promise.all(
      rawProcurements.map(async (p) => {
        const booking = await Booking.findById(p.bookingId).lean()
        const farmerProfile = booking ? await FarmerProfile.findById(booking.farmerId).lean() : null
        const farmerUser = farmerProfile ? await User.findById(farmerProfile.userId).lean() : null

        return {
          id: p._id.toString(),
          crop: p.crop,
          quantity: p.quantity,
          qualityGrade: p.qualityGrade,
          moistureLevel: p.moistureLevel,
          createdAt: p.createdAt,
          farmerName: farmerUser?.name || 'Farmer'
        }
      })
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Processed Procurements History</h1>
        <p className="text-sm text-slate-500 mt-1">Audit log of all crop weighings and quality grades processed by you</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Centre Processing Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {procurementsData.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No processed procurements found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">Receipt Ref</th>
                    <th className="p-3">Farmer Name</th>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Net Quantity</th>
                    <th className="p-3">Grade & Moisture</th>
                    <th className="p-3">MSP Amount</th>
                    <th className="p-3">Date Processed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {procurementsData.map((p) => {
                    const val = Math.round(p.quantity * 2275)
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">#{p.id.slice(-6)}</td>
                        <td className="p-3 font-bold text-slate-800">{p.farmerName}</td>
                        <td className="p-3">{p.crop}</td>
                        <td className="p-3 font-black text-slate-900">{p.quantity} Qtl</td>
                        <td className="p-3">{p.qualityGrade} ({p.moistureLevel || 11.2}%)</td>
                        <td className="p-3 font-black text-green-800">₹ {val.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

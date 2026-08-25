import { connectToDatabase } from "@/lib/mongodb"
import { Procurement, Booking, FarmerProfile, User, ProcurementCentre, WorkerProfile } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminProcurementPage() {
  await connectToDatabase()

  const rawProcurements = await Procurement.find({}).sort({ createdAt: -1 }).lean()

  const procurements = await Promise.all(
    rawProcurements.map(async (p) => {
      const booking = await Booking.findById(p.bookingId).lean()
      const farmerProfile = booking ? await FarmerProfile.findById(booking.farmerId).lean() : null
      const farmerUser = farmerProfile ? await User.findById(farmerProfile.userId).lean() : null
      const centre = booking ? await ProcurementCentre.findById(booking.centreId).lean() : null
      const workerProfile = await WorkerProfile.findById(p.workerId).lean()
      const workerUser = workerProfile ? await User.findById(workerProfile.userId).lean() : null

      return {
        id: p._id.toString(),
        crop: p.crop,
        quantity: p.quantity,
        qualityGrade: p.qualityGrade,
        moistureLevel: p.moistureLevel,
        farmerName: farmerUser?.name || 'Farmer',
        centreName: centre?.name || 'Mandi Samiti',
        workerName: workerUser?.name || 'Supervisor'
      }
    })
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Master Procurement Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">Verified weighbridge transactions, crop grades, and MSP calculations</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Procurement Receipts Log ({procurements.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Mandi Yard</th>
                  <th className="p-3">Commodity</th>
                  <th className="p-3">Net Quantity</th>
                  <th className="p-3">Quality Grade</th>
                  <th className="p-3">Calculated Value</th>
                  <th className="p-3">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {procurements.map((p) => {
                  const totalVal = Math.round(p.quantity * 2275)
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">#{p.id.slice(-6)}</td>
                      <td className="p-3 font-bold text-slate-800">{p.farmerName}</td>
                      <td className="p-3">{p.centreName}</td>
                      <td className="p-3 font-semibold">{p.crop}</td>
                      <td className="p-3 font-black text-slate-900">{p.quantity} Qtl</td>
                      <td className="p-3">{p.qualityGrade} ({p.moistureLevel || 11.5}%)</td>
                      <td className="p-3 font-black text-green-800">₹ {totalVal.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-slate-500">{p.workerName}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

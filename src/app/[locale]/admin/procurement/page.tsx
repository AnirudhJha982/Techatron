import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const prisma = new PrismaClient()

export default async function AdminProcurementPage() {
  const procurements = await prisma.procurement.findMany({
    include: {
      booking: {
        include: {
          farmer: { include: { user: true } },
          centre: true
        }
      },
      worker: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

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
                      <td className="p-3 font-bold text-slate-800">{p.booking.farmer.user.name}</td>
                      <td className="p-3">{p.booking.centre.name}</td>
                      <td className="p-3 font-semibold">{p.crop}</td>
                      <td className="p-3 font-black text-slate-900">{p.quantity} Qtl</td>
                      <td className="p-3">{p.qualityGrade} ({p.moistureLevel || 11.5}%)</td>
                      <td className="p-3 font-black text-green-800">₹ {totalVal.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-slate-500">{p.worker.user.name}</td>
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

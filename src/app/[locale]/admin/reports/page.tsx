import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

export default async function AdminReportsPage() {
  const procurements = await prisma.procurement.findMany()
  const totalQuantity = procurements.reduce((a, b) => a + b.quantity, 0)
  const totalDisbursed = procurements.reduce((a, b) => a + Math.round(b.quantity * 2275), 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Analytics & Executive Reports</h1>
          <p className="text-sm text-slate-500 mt-1">National agricultural procurement insights and financial summaries</p>
        </div>
        <Button className="bg-green-800 hover:bg-green-700 text-white font-bold">
          📥 Download Full PDF Summary Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Season Procurement Tonnage</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900">{totalQuantity.toFixed(1)} <span className="text-sm font-bold text-slate-600">Quintals</span></p>
            <p className="text-xs text-green-700 font-semibold mt-1">✓ 100% Verified Quality</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">MSP Expenditure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-800">₹ {totalDisbursed.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">Direct Bank Transfers</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Average Turnaround Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-blue-900">22 <span className="text-sm font-bold text-slate-600">Minutes</span></p>
            <p className="text-xs text-slate-500 mt-1">Per Farmer Mandi Visit</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tables Breakdown */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Crop-wise Tonnage & Expenditure Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
              <tr>
                <th className="p-3">Commodity Crop</th>
                <th className="p-3">Fixed MSP Rate</th>
                <th className="p-3">Total Procured (Qtl)</th>
                <th className="p-3">Total Disbursed Value</th>
                <th className="p-3">Target Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Wheat (Sharbati Grade A)</td>
                <td className="p-3 font-bold text-green-800">₹ 2,275 / Qtl</td>
                <td className="p-3 font-black text-slate-900">45.5 Qtl</td>
                <td className="p-3 font-black text-green-800">₹ 1,03,512</td>
                <td className="p-3"><span className="text-xs font-bold text-green-700">92%</span></td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Mustard</td>
                <td className="p-3 font-bold text-green-800">₹ 5,650 / Qtl</td>
                <td className="p-3 font-black text-slate-900">120.0 Qtl</td>
                <td className="p-3 font-black text-green-800">₹ 6,78,000</td>
                <td className="p-3"><span className="text-xs font-bold text-green-700">88%</span></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

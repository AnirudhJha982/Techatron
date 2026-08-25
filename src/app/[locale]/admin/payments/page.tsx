import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

export default async function AdminPaymentsPage() {
  const procurements = await prisma.procurement.findMany({
    include: {
      booking: {
        include: {
          farmer: { include: { user: true } },
          centre: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">DBT Payment Disbursal Management</h1>
        <p className="text-sm text-slate-500 mt-1">PFMS Direct Benefit Transfer approvals and disbursement logs</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Payment Batch Transactions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Receipt Token</th>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Aadhaar Bank Account</th>
                  <th className="p-3">Net Quantity</th>
                  <th className="p-3">Disbursement Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {procurements.map((p) => {
                  const val = Math.round(p.quantity * 2275)
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{p.booking.tokenNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{p.booking.farmer.user.name}</td>
                      <td className="p-3 text-slate-600 font-mono">State Bank of India (XXXX4321)</td>
                      <td className="p-3 font-bold text-slate-900">{p.quantity} Qtl</td>
                      <td className="p-3 font-black text-green-800">₹ {val.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button size="sm" className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-[10px] h-6">
                          Trigger PFMS Disbursal
                        </Button>
                      </td>
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

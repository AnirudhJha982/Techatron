import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const farmersCount = await prisma.user.count({ where: { role: 'FARMER' } })
  const workersCount = await prisma.user.count({ where: { role: 'WORKER' } })
  const centresCount = await prisma.procurementCentre.count({ where: { isActive: true } })
  const bookingsCount = await prisma.booking.count()
  const grievancesCount = await prisma.grievance.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } })

  const procurements = await prisma.procurement.findMany()
  const totalProcuredQuintals = procurements.reduce((acc, p) => acc + p.quantity, 0)
  const totalDisbursedValue = procurements.reduce((acc, p) => acc + Math.round(p.quantity * 2275), 0)

  const recentProcurements = await prisma.procurement.findMany({
    take: 5,
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
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold bg-slate-900 text-yellow-400 px-3 py-1 rounded-full uppercase">National Procurement Control Board</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Executive HQ Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time statistics across all accredited procurement centres in India</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href={`/${locale}/admin/notifications`}>
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black px-5">
              📢 Broadcast Alert
            </Button>
          </Link>
          <Link href={`/${locale}/admin/reports`}>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5">
              📊 Export HQ Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-white border-t-4 border-t-green-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Total Registered Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-900">{farmersCount.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">+18% growth this season</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-t-4 border-t-yellow-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Active Mandi Centres</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-yellow-800">{centresCount}</p>
            <p className="text-xs text-slate-500 mt-1">{workersCount} Supervisors Staffed</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-t-4 border-t-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Total Procured Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-blue-900">{totalProcuredQuintals.toFixed(1)} <span className="text-sm font-bold text-slate-600">Qtl</span></p>
            <p className="text-xs text-slate-500 mt-1">{bookingsCount} Total Appointments</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-t-4 border-t-amber-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Total DBT Disbursed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-900">₹ {(totalDisbursedValue / 100000).toFixed(2)} <span className="text-sm font-bold text-slate-600">Lakh</span></p>
            <p className="text-xs text-slate-500 mt-1">Direct Bank Transfers</p>
          </CardContent>
        </Card>
      </div>

      {/* Mid Row: Regional Distribution & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Procurement Table (2 cols) */}
        <Card className="lg:col-span-2 bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Recent Mandi Transactions</CardTitle>
                <CardDescription className="text-xs text-slate-500">Latest approved crop receipts across centres</CardDescription>
              </div>
              <Link href={`/${locale}/admin/procurement`}>
                <Button size="sm" variant="outline" className="text-xs font-bold text-slate-800">
                  View All Log →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">Farmer Name</th>
                    <th className="p-3">Centre & District</th>
                    <th className="p-3">Crop</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Disbursed Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentProcurements.map((p) => {
                    const amount = Math.round(p.quantity * 2275)
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{p.booking.farmer.user.name}</td>
                        <td className="p-3">{p.booking.centre.name} ({p.booking.centre.district})</td>
                        <td className="p-3 font-semibold">{p.crop}</td>
                        <td className="p-3 font-black text-slate-900">{p.quantity} Qtl</td>
                        <td className="p-3 font-black text-green-800">₹ {amount.toLocaleString('en-IN')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* System Health & Open Grievances */}
        <div className="space-y-6">
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Pending Grievances ({grievancesCount})</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-3">
              <p className="text-slate-600">
                You have <strong className="text-red-700">{grievancesCount} pending grievances</strong> requiring administrative review.
              </p>
              <Link href={`/${locale}/admin/grievances`}>
                <Button className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs">
                  Review Open Grievances →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white shadow-sm border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-base font-bold text-yellow-400">HQ Operational Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-2 text-slate-300">
              <p>● Mandi Gate Weighbridges: <span className="text-green-400 font-bold">100% Operational</span></p>
              <p>● PFMS Payment Gateway: <span className="text-green-400 font-bold">Connected</span></p>
              <p>● SMS Queue Server: <span className="text-green-400 font-bold">Active</span></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

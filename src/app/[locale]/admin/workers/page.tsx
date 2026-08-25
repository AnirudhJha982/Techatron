import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const prisma = new PrismaClient()

export default async function AdminWorkersPage() {
  const workers = await prisma.user.findMany({
    where: { role: 'WORKER' },
    include: {
      workerProfile: {
        include: { centre: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procurement Centre Staff Management</h1>
        <p className="text-sm text-slate-500 mt-1">Directory of Mandi supervisors and quality grading personnel</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Staff Members Directory ({workers.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Mobile Number</th>
                  <th className="p-3">Assigned Procurement Mandi</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{w.name}</td>
                    <td className="p-3 font-mono text-slate-600">{w.phoneNumber}</td>
                    <td className="p-3 font-bold text-amber-900">{w.workerProfile?.centre.name}</td>
                    <td className="p-3">{w.workerProfile?.centre.district}, {w.workerProfile?.centre.state}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ● On Duty
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

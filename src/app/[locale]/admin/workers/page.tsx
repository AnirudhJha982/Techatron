import { connectToDatabase } from "@/lib/mongodb"
import { User, WorkerProfile, ProcurementCentre } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminWorkersPage() {
  await connectToDatabase()

  const rawWorkers = await User.find({ role: 'WORKER' }).sort({ createdAt: -1 }).lean()

  const workers = await Promise.all(
    rawWorkers.map(async (w) => {
      const profile = await WorkerProfile.findOne({ userId: w._id }).lean()
      const centre = profile ? await ProcurementCentre.findById(profile.centreId).lean() : null
      return {
        id: w._id.toString(),
        name: w.name,
        phoneNumber: w.phoneNumber,
        centreName: centre?.name || 'Mandi Samiti',
        district: centre?.district || 'Karnal',
        state: centre?.state || 'Haryana'
      }
    })
  )

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
                    <td className="p-3 font-bold text-amber-900">{w.centreName}</td>
                    <td className="p-3">{w.district}, {w.state}</td>
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

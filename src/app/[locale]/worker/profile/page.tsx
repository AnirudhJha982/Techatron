import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { User, WorkerProfile, ProcurementCentre } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function WorkerProfilePage() {
  const session = await auth()

  await connectToDatabase()

  const user = session?.user?.id ? await User.findById(session.user.id).lean() : null
  const workerProfile = user ? await WorkerProfile.findOne({ userId: user._id }).lean() : null
  const centre = workerProfile ? await ProcurementCentre.findById(workerProfile.centreId).lean() : null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Worker Staff Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Details of assigned Mandi procurement centre and staff credentials</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">Official Identity Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-sm">
          <div>
            <span className="text-slate-500 text-xs block">Staff Member Name:</span>
            <strong className="text-slate-900 font-bold text-base">{user?.name}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">Mobile Number (Login ID):</span>
            <strong className="font-mono text-slate-800">{user?.phoneNumber}</strong>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">Assigned Mandi Centre:</span>
            <strong className="text-amber-900 font-bold text-base">{centre?.name || 'Mandi Samiti'}</strong>
            <p className="text-xs text-slate-500">{centre?.address || 'N/A'}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">System Role:</span>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-1">
              CENTRE WORKER / SUPERVISOR
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

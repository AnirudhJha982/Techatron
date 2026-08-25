import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const prisma = new PrismaClient()

export default async function WorkerProfilePage() {
  const session = await auth()

  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    include: {
      workerProfile: {
        include: { centre: true }
      }
    }
  })

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
            <strong className="text-amber-900 font-bold text-base">{user?.workerProfile?.centre.name}</strong>
            <p className="text-xs text-slate-500">{user?.workerProfile?.centre.address}</p>
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

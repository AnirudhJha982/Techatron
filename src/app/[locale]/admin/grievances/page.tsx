import { connectToDatabase } from "@/lib/mongodb"
import { Grievance, User } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { respondGrievanceAction } from "@/app/actions/adminActions"

export default async function AdminGrievancesPage() {
  await connectToDatabase()

  const rawGrievances = await Grievance.find({}).sort({ createdAt: -1 }).lean()

  const grievances = await Promise.all(
    rawGrievances.map(async (g) => {
      const user = await User.findById(g.userId).lean()
      return {
        id: g._id.toString(),
        category: g.category,
        description: g.description,
        status: g.status,
        response: g.response,
        userName: user?.name || 'Farmer',
        userPhone: user?.phoneNumber || 'N/A'
      }
    })
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grievance & Dispute Resolution Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Review farmer complaints, assign statuses, and write official responses</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Submitted Grievances ({grievances.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {grievances.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No grievances submitted.</p>
          ) : (
            grievances.map((g) => (
              <div key={g.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <span className="bg-yellow-400 text-green-950 text-xs font-black px-2.5 py-0.5 rounded">{g.category}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">Farmer: {g.userName} ({g.userPhone})</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] mt-2 sm:mt-0 ${
                    g.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {g.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200">
                  {g.description}
                </p>

                {g.response ? (
                  <div className="bg-green-50 p-3 rounded border border-green-200 text-xs text-green-900">
                    <strong>Official Officer Response:</strong> {g.response}
                  </div>
                ) : (
                  <form action={async (formData) => {
                    "use server"
                    const resp = formData.get("response") as string
                    await respondGrievanceAction(g.id, "RESOLVED", resp)
                  }} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      name="response"
                      required
                      placeholder="Write official resolution response to farmer..."
                      className="flex-grow border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-slate-800 focus:outline-none"
                    />
                    <Button size="sm" type="submit" className="bg-green-800 hover:bg-green-700 text-white font-bold text-xs">
                      Submit Response & Resolve ✓
                    </Button>
                  </form>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

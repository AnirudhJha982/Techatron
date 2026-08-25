import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createGrievanceAction } from "@/app/actions/farmerActions"

const prisma = new PrismaClient()

export default async function FarmerGrievancesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const grievances = await prisma.grievance.findMany({
    where: { userId: session?.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grievance & Complaint Redressal</h1>
        <p className="text-sm text-slate-500 mt-1">Submit issues regarding slot allocation, moisture grading, or delayed DBT payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Column */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold text-slate-900">Raise New Grievance</CardTitle>
            <CardDescription className="text-xs text-slate-500">Official ticket will be assigned to Officer</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={async (formData) => {
              "use server"
              const cat = formData.get("category") as string
              const desc = formData.get("description") as string
              await createGrievanceAction(cat, desc)
            }} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <select id="category" name="category" required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-green-600 focus:outline-none">
                  <option value="Payment Inquiry">Payment / DBT Delay</option>
                  <option value="Slot Availability">Slot Booking Issue</option>
                  <option value="Moisture & Quality Grade">Quality Grading Dispute</option>
                  <option value="Mandi Facility">Centre Staff / Infrastructure</option>
                  <option value="Other">Other Query</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Issue Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
                ></textarea>
              </div>

              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white font-bold h-11">
                Submit Official Grievance ⚠️
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Grievances Column */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg font-bold text-slate-900">Your Submitted Tickets</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {grievances.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">No open or resolved grievances.</p>
            ) : (
              grievances.map((g) => (
                <div key={g.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{g.category}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      g.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{g.description}</p>
                  {g.response && (
                    <div className="bg-green-50 p-2.5 rounded border border-green-200 text-xs text-green-900 mt-2">
                      <strong>Officer Response:</strong> {g.response}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 block pt-1">{g.createdAt.toLocaleDateString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

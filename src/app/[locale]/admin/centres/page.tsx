import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCentreAction, updateCentreStatusAction } from "@/app/actions/adminActions"

const prisma = new PrismaClient()

export default async function AdminCentresPage() {
  const centres = await prisma.procurementCentre.findMany({
    include: {
      _count: {
        select: { bookings: true, workers: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procurement Centres Directory & Capacity</h1>
        <p className="text-sm text-slate-500 mt-1">Add new Mandi procurement yards and configure daily quota capacities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Centre Form */}
        <Card className="bg-white shadow-sm border-slate-200 col-span-1">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-900">Add New Mandi Centre</CardTitle>
            <CardDescription className="text-xs text-slate-500">Register new government grain yard</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form action={async (formData) => {
              "use server"
              await createCentreAction(formData)
            }} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Centre / Mandi Name *</Label>
                <Input id="name" name="name" required placeholder="e.g. APMC Market Yard" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="district">District *</Label>
                  <Input id="district" name="district" required placeholder="e.g. Karnal" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" required placeholder="e.g. Haryana" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Full Address *</Label>
                <Input id="address" name="address" required placeholder="Full street address..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacityPerDay">Daily Procurement Capacity (Quintals)</Label>
                <Input id="capacityPerDay" name="capacityPerDay" type="number" defaultValue="200" required />
              </div>

              <Button type="submit" className="w-full bg-green-800 hover:bg-green-700 text-white font-bold h-11">
                ➕ Add Mandi Centre
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Centres List */}
        <Card className="bg-white shadow-sm border-slate-200 lg:col-span-2">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-900">Active Procurement Centres ({centres.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">Centre Name</th>
                    <th className="p-3">District & State</th>
                    <th className="p-3">Daily Capacity</th>
                    <th className="p-3">Staff / Bookings</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Toggle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {centres.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3">{c.district}, {c.state}</td>
                      <td className="p-3 font-black text-slate-900">{c.capacityPerDay} Qtl</td>
                      <td className="p-3 text-slate-600">{c._count.workers} Staff • {c._count.bookings} Slots</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <form action={async () => {
                          "use server"
                          await updateCentreStatusAction(c.id, !c.isActive)
                        }}>
                          <Button size="sm" variant="outline" type="submit" className="text-[10px] font-bold h-6">
                            {c.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

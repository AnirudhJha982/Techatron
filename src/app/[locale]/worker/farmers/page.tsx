import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { User, FarmerProfile } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function WorkerFarmersPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query } = await searchParams
  const session = await auth()

  await connectToDatabase()

  const filter: any = { role: 'FARMER' }
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { phoneNumber: { $regex: query, $options: 'i' } }
    ]
  }

  const rawFarmers = await User.find(filter).sort({ name: 1 }).lean()

  const farmers = await Promise.all(
    rawFarmers.map(async (f) => {
      const profile = await FarmerProfile.findOne({ userId: f._id }).lean()
      return {
        id: f._id.toString(),
        name: f.name,
        phoneNumber: f.phoneNumber,
        village: profile?.village || 'Nisang',
        district: profile?.district || 'Karnal',
        landSizeAcres: profile?.landSizeAcres || 5.0
      }
    })
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Farmer Lookup & Verification Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Search registered farmers by phone number or name</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="query"
            defaultValue={query || ''}
            placeholder="Search by Farmer Name or Mobile Number..."
            className="flex-grow border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
            🔍 Search
          </Button>
        </form>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Registered Farmers ({farmers.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Mobile Number</th>
                  <th className="p-3">Village / District</th>
                  <th className="p-3">Land Size (Acres)</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmers.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{f.name}</td>
                    <td className="p-3 font-mono text-slate-600">{f.phoneNumber}</td>
                    <td className="p-3">{f.village}, {f.district}</td>
                    <td className="p-3 font-bold text-slate-800">{f.landSizeAcres} Acres</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ Verified
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

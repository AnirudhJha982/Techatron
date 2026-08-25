import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

export default async function AdminFarmersPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query } = await searchParams

  const farmers = await prisma.user.findMany({
    where: {
      role: 'FARMER',
      ...(query ? {
        OR: [
          { name: { contains: query } },
          { phoneNumber: { contains: query } }
        ]
      } : {})
    },
    include: {
      farmerProfile: {
        include: { bookings: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registered Farmers Management</h1>
        <p className="text-sm text-slate-500 mt-1">Directory of registered agricultural producers across India</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="query"
            defaultValue={query || ''}
            placeholder="Search by Farmer Name or Phone..."
            className="flex-grow border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none"
          />
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
            🔍 Filter Farmers
          </Button>
        </form>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Registered Farmers Directory ({farmers.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Mobile Number</th>
                  <th className="p-3">Village / District</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Land Size</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmers.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{f.name}</td>
                    <td className="p-3 font-mono text-slate-600">{f.phoneNumber}</td>
                    <td className="p-3">{f.farmerProfile?.village}, {f.farmerProfile?.district}</td>
                    <td className="p-3 font-semibold">{f.farmerProfile?.state}</td>
                    <td className="p-3 font-bold text-slate-800">{f.farmerProfile?.landSizeAcres || 5.0} Acres</td>
                    <td className="p-3 font-black text-green-800">{f.farmerProfile?.bookings.length || 0} Slots</td>
                    <td className="p-3 text-slate-500">{f.createdAt.toLocaleDateString()}</td>
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

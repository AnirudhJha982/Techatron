import { connectToDatabase } from "@/lib/mongodb"
import { User, FarmerProfile, Booking } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toggleUserStatusAction, deleteFarmerAction } from "@/app/actions/adminActions"
import AdminDeleteButton from "@/components/admin/AdminDeleteButton"

export default async function AdminFarmersPage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query } = await searchParams

  await connectToDatabase()

  const filter: any = { role: 'FARMER' }
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { phoneNumber: { $regex: query, $options: 'i' } }
    ]
  }

  const rawFarmers = await User.find(filter).sort({ createdAt: -1 }).lean()

  const farmers = await Promise.all(
    rawFarmers.map(async (f) => {
      const profile = await FarmerProfile.findOne({ userId: f._id }).lean()
      const bookingsCount = profile ? await Booking.countDocuments({ farmerId: profile._id }) : 0
      return {
        id: f._id.toString(),
        name: f.name,
        phoneNumber: f.phoneNumber,
        village: profile?.village || '—',
        district: profile?.district || '—',
        state: profile?.state || '—',
        landSizeAcres: profile?.landSizeAcres || 0,
        kycStatus: profile?.kycStatus || 'NOT_VERIFIED',
        bookingEligible: profile?.bookingEligible || false,
        bookingsCount,
        isActive: f.isActive !== false,
        createdAt: f.createdAt
      }
    })
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Registered Farmers Management</h1>
        <p className="text-sm text-slate-500 mt-1">Activate or deactivate farmer accounts across all states</p>
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

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm font-bold text-green-800">
          ✅ Active: {farmers.filter(f => f.isActive).length}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm font-bold text-red-800">
          🚫 Deactivated: {farmers.filter(f => !f.isActive).length}
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-700">
          👥 Total: {farmers.length}
        </div>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Farmers Directory ({farmers.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Village / District</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Land</th>
                  <th className="p-3">KYC</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmers.map((f) => (
                  <tr key={f.id} className={`hover:bg-slate-50 ${!f.isActive ? 'opacity-60' : ''}`}>
                    <td className="p-3 font-bold text-slate-900">{f.name}</td>
                    <td className="p-3 font-mono text-slate-600">{f.phoneNumber}</td>
                    <td className="p-3">{f.village}, {f.district}</td>
                    <td className="p-3 font-semibold">{f.state}</td>
                    <td className="p-3 font-bold text-slate-800">{f.landSizeAcres} Ac</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        f.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        f.kycStatus === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
                        f.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {f.kycStatus}
                      </span>
                    </td>
                    <td className="p-3 font-black text-green-800">{f.bookingsCount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        f.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <form action={async () => {
                          "use server"
                          await toggleUserStatusAction(f.id, !f.isActive)
                        }}>
                          <Button
                            size="sm"
                            variant="outline"
                            type="submit"
                            className={`text-[10px] font-bold h-6 ${
                              f.isActive
                                ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                : 'border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {f.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </form>
                        <AdminDeleteButton
                          itemType="farmer"
                          itemName={f.name}
                          onDelete={async () => {
                            "use server"
                            await deleteFarmerAction(f.id)
                          }}
                        />
                      </div>
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

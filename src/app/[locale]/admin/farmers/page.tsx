import { connectToDatabase } from "@/lib/mongodb"
import { User, FarmerProfile, Booking } from "@/models"
import { Button } from "@/components/ui/button"
import FarmerTable from "./FarmerTable"

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

      <FarmerTable farmers={farmers} />
    </div>
  )
}


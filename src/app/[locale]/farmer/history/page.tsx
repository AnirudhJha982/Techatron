import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, ProcurementCentre, Slot, Procurement } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function FarmerHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  await connectToDatabase()

  const farmerProfile = await FarmerProfile.findOne({ userId: session?.user.id })

  let bookingsData: any[] = []
  if (farmerProfile) {
    const rawBookings = await Booking.find({ farmerId: farmerProfile._id })
      .sort({ createdAt: -1 })
      .lean()

    bookingsData = await Promise.all(
      rawBookings.map(async (b) => {
        const centre = await ProcurementCentre.findById(b.centreId).lean()
        const slot = await Slot.findById(b.slotId).lean()
        const procurement = await Procurement.findOne({ bookingId: b._id }).lean()
        return {
          id: b._id.toString(),
          tokenNumber: b.tokenNumber,
          date: b.date,
          status: b.status,
          centreName: centre?.name || 'Mandi Samiti',
          timeSlot: slot?.timeSlot || 'Morning',
          quantity: procurement?.quantity ? `${procurement.quantity} Qtl` : '--'
        }
      })
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procurement & Booking History</h1>
        <p className="text-sm text-slate-500 mt-1">Complete historical record of all your Mandi appointments and crop sales</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">Historical Records</CardTitle>
          <CardDescription className="text-xs text-slate-500">Filtered by creation date</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {bookingsData.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No booking history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">Token Pass</th>
                    <th className="p-3">Date & Slot</th>
                    <th className="p-3">Procurement Mandi</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Produce Quantity</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookingsData.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{b.tokenNumber}</td>
                      <td className="p-3">{new Date(b.date).toLocaleDateString()} ({b.timeSlot})</td>
                      <td className="p-3">{b.centreName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          b.status === 'ARRIVED' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {b.quantity}
                      </td>
                      <td className="p-3">
                        <button className="text-green-800 font-bold hover:underline text-xs">
                          Download Receipt 📄
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

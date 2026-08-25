import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, ProcurementCentre, Slot } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'

export default async function FarmerHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const tHistory = await getTranslations({ locale, namespace: 'History' })

  await connectToDatabase()

  const farmerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await FarmerProfile.findOne({ userId: session.user.id })
    : null

  let historyData: any[] = []
  if (farmerProfile) {
    const rawBookings = await Booking.find({ farmerId: farmerProfile._id })
      .sort({ createdAt: -1 })
      .lean()

    historyData = await Promise.all(
      rawBookings.map(async (b) => {
        const centre = await ProcurementCentre.findById(b.centreId).lean()
        const slot = await Slot.findById(b.slotId).lean()
        return {
          id: b._id.toString(),
          tokenNumber: b.tokenNumber,
          status: b.status,
          date: new Date(b.date).toLocaleDateString(),
          timeSlot: slot?.timeSlot || '08:00 AM - 10:00 AM',
          centreName: centre?.name || 'Mandi Samiti',
          quantity: 45
        }
      })
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tHistory('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{tHistory('subtitle')}</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">{tHistory('logTitle')}</CardTitle>
          <CardDescription className="text-xs text-slate-500">{tHistory('logSub')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {historyData.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">{tHistory('noHistory')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">{tHistory('tokenPass')}</th>
                    <th className="p-3">{tHistory('dateSlot')}</th>
                    <th className="p-3">{tHistory('procurementMandi')}</th>
                    <th className="p-3">{tHistory('status')}</th>
                    <th className="p-3">{tHistory('produceQuantity')}</th>
                    <th className="p-3">{tHistory('action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyData.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{h.tokenNumber}</td>
                      <td className="p-3 font-medium">{h.date} ({h.timeSlot})</td>
                      <td className="p-3">{h.centreName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          h.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{h.quantity} Qtl</td>
                      <td className="p-3">
                        <button className="text-xs font-bold text-green-800 hover:underline">
                          {tHistory('downloadReceipt')}
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

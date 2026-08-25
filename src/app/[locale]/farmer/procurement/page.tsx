import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, Procurement, ProcurementCentre } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'

export default async function FarmerProcurementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const tProcurement = await getTranslations({ locale, namespace: 'Procurement' })

  await connectToDatabase()

  const farmerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await FarmerProfile.findOne({ userId: session.user.id })
    : null

  let procurementsData: any[] = []
  if (farmerProfile) {
    const farmerBookings = await Booking.find({ farmerId: farmerProfile._id }).lean()
    const bookingIds = farmerBookings.map(b => b._id)

    const rawProcurements = await Procurement.find({ bookingId: { $in: bookingIds } })
      .sort({ createdAt: -1 })
      .lean()

    procurementsData = await Promise.all(
      rawProcurements.map(async (p) => {
        const booking = await Booking.findById(p.bookingId).lean()
        const centre = booking ? await ProcurementCentre.findById(booking.centreId).lean() : null
        return {
          id: p._id.toString(),
          crop: p.crop,
          quantity: p.quantity,
          moisture: (p as any).moistureLevel || (p as any).moisture || 12.5,
          grade: p.qualityGrade,
          paymentStatus: p.paymentStatus,
          remarks: p.remarks || 'Produce verified and stored at central silo.',
          tokenNumber: booking?.tokenNumber || 'TKN-0000',
          centreName: centre?.name || 'Mandi Samiti',
          date: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Today'
        }
      })
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tProcurement('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{tProcurement('subtitle')}</p>
      </div>

      {procurementsData.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2">
          <span className="text-5xl mb-3 block">🌾</span>
          <h3 className="text-xl font-bold text-slate-800">{tProcurement('noRecordsTitle')}</h3>
          <p className="text-sm text-slate-500 mt-1">{tProcurement('noRecordsSub')}</p>
        </Card>
      ) : (
        procurementsData.map((item) => (
          <Card key={item.id} className="bg-white shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b flex flex-row justify-between items-center py-4">
              <div>
                <span className="bg-green-800 text-yellow-400 text-xs font-black px-2.5 py-0.5 rounded uppercase">{item.tokenNumber}</span>
                <CardTitle className="text-lg font-bold text-slate-900 mt-1">{item.crop} - {item.quantity} Qtl</CardTitle>
                <CardDescription className="text-xs text-slate-500">{item.centreName} • {item.date}</CardDescription>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-300">
                {tProcurement('procurementApproved')}
              </span>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{tProcurement('netQtl')}</p>
                  <p className="text-xl font-black text-slate-900">{item.quantity} Qtl</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{tProcurement('qualityGrade')}</p>
                  <p className="text-xl font-black text-green-800">{item.grade}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{tProcurement('moistureLevel')}</p>
                  <p className="text-xl font-black text-amber-700">{item.moisture}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{tProcurement('paymentStatus')}</p>
                  <p className="text-sm font-black text-blue-800 mt-1">{item.paymentStatus}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">{tProcurement('lifecycleTitle')}</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded border border-green-200">{tProcurement('stepSlotBooked')}</span>
                  <span className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded border border-green-200">{tProcurement('stepArrived')}</span>
                  <span className="bg-green-50 text-green-800 font-semibold px-2.5 py-1 rounded border border-green-200">{tProcurement('stepQualityApproved')}</span>
                  <span className="bg-yellow-50 text-yellow-800 font-semibold px-2.5 py-1 rounded border border-yellow-300">{tProcurement('stepDbtDisbursed')}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-600">
                <strong>{tProcurement('inspectorRemarks')}:</strong> {item.remarks}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

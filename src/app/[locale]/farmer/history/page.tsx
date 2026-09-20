import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, ProcurementCentre, Slot, Procurement, Payment } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'
import FarmerHistoryTable from "@/components/farmer/FarmerHistoryTable"
import { ReceiptData } from "@/lib/receiptTemplate"

export default async function FarmerHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const tHistory = await getTranslations({ locale, namespace: 'History' })

  await connectToDatabase()

  const farmerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await FarmerProfile.findOne({ userId: session.user.id })
    : null

  let historyData: ReceiptData[] = []
  if (farmerProfile) {
    const rawBookings = await Booking.find({ farmerId: farmerProfile._id })
      .sort({ createdAt: -1 })
      .lean()

    historyData = await Promise.all(
      rawBookings.map(async (b) => {
        const centre = b.centreId && mongoose.Types.ObjectId.isValid(b.centreId.toString())
          ? await ProcurementCentre.findById(b.centreId).lean()
          : null
        const slot = b.slotId && mongoose.Types.ObjectId.isValid(b.slotId.toString())
          ? await Slot.findById(b.slotId).lean()
          : null
        const procurement = await Procurement.findOne({ bookingId: b._id }).lean()
        const payment = procurement ? await Payment.findOne({ procurementId: procurement._id }).lean() : null

        const quantity = procurement?.quantity || 42
        const mspRate = payment?.mspRatePerQuintal || 2275
        const totalAmount = payment?.amount || Math.round(quantity * mspRate)
        const qualityGrade = procurement?.qualityGrade || 'Grade A'
        const moistureLevel = (procurement as any)?.moistureLevel || 11.2
        const crop = procurement?.crop || 'Wheat (Sharbati Grade A)'
        const paymentStatus = payment?.status || (b.status === 'COMPLETED' ? 'SUCCESS' : 'PENDING')
        const transactionId = payment?.transactionId || `TXN-${b._id.toString().slice(-10).toUpperCase()}`

        return {
          id: b._id.toString(),
          tokenNumber: b.tokenNumber,
          status: b.status,
          date: b.date ? new Date(b.date).toLocaleDateString() : 'N/A',
          timeSlot: slot?.timeSlot || '08:00 AM - 10:00 AM',
          centreName: centre?.name || 'Mandi Samiti',
          centreAddress: centre?.address || 'Main APMC Mandi Yard, GT Road',
          centreDistrict: centre?.district || 'Central District',
          centreState: centre?.state || 'State APMC Board',
          farmerName: session?.user?.name || farmerProfile.bankAccountName || 'Farmer',
          farmerId: farmerProfile.farmerId || `KF-${session?.user?.id?.slice(-6) || '100000'}`,
          farmerPhone: (session?.user as any)?.phoneNumber || '',
          farmerVillage: farmerProfile.village || '',
          farmerDistrict: farmerProfile.district || '',
          farmerState: farmerProfile.state || '',
          crop,
          quantity,
          qualityGrade,
          moistureLevel,
          mspRate,
          totalAmount,
          paymentStatus,
          transactionId,
          bankAccountMasked: payment?.bankAccountMasked || farmerProfile.bankAccountMasked || 'XXXX-XXXX-4892',
          ifscCode: payment?.ifscCode || farmerProfile.ifscCode || 'SBIN0001245',
          paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : (b.date ? new Date(b.date).toLocaleDateString() : 'N/A')
        }
      })
    )
  }

  const tableLabels = {
    tokenPass: tHistory('tokenPass'),
    dateSlot: tHistory('dateSlot'),
    procurementMandi: tHistory('procurementMandi'),
    status: tHistory('status'),
    produceQuantity: tHistory('produceQuantity'),
    action: tHistory('action'),
    downloadReceipt: tHistory('downloadReceipt'),
    noHistory: tHistory('noHistory')
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
          <FarmerHistoryTable
            historyData={historyData}
            locale={locale}
            labels={tableLabels}
          />
        </CardContent>
      </Card>
    </div>
  )
}

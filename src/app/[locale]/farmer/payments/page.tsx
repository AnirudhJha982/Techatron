import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, Procurement, Payment, ProcurementCentre } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'
import { translateCentre } from "@/lib/translateEntity"

export default async function FarmerPaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const tPayments = await getTranslations({ locale, namespace: 'Payments' })

  await connectToDatabase()

  const farmerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await FarmerProfile.findOne({ userId: session.user.id })
    : null

  let paymentsList: any[] = []
  if (farmerProfile) {
    const rawPayments = await Payment.find({ farmerId: farmerProfile._id })
      .sort({ createdAt: -1 })
      .lean()

    if (rawPayments.length > 0) {
      paymentsList = await Promise.all(
        rawPayments.map(async (pay) => {
          const procurement = await Procurement.findById(pay.procurementId).lean()
          const booking = procurement ? await Booking.findById(procurement.bookingId).lean() : null
          const centre = booking ? await ProcurementCentre.findById(booking.centreId).lean() : null
          return {
            id: pay._id.toString(),
            crop: procurement?.crop || 'Wheat (Sharbati)',
            quantity: procurement?.quantity || 42,
            amount: pay.amount,
            status: pay.status,
            tokenNumber: booking?.tokenNumber || 'TKN-0000',
            centreName: centre?.name || 'Mandi Samiti',
            transactionId: pay.transactionId,
            bankAccountMasked: pay.bankAccountMasked
          }
        })
      )
    } else {
      const farmerBookings = await Booking.find({ farmerId: farmerProfile._id }).lean()
      const bookingIds = farmerBookings.map(b => b._id)

      const rawProcurements = await Procurement.find({ bookingId: { $in: bookingIds } })
        .sort({ createdAt: -1 })
        .lean()

      paymentsList = await Promise.all(
        rawProcurements.map(async (p) => {
          const booking = await Booking.findById(p.bookingId).lean()
          const centre = booking ? await ProcurementCentre.findById(booking.centreId).lean() : null
          return {
            id: p._id.toString(),
            crop: p.crop,
            quantity: p.quantity,
            amount: Math.round(p.quantity * 2275),
            status: p.paymentStatus === 'COMPLETED' ? 'SUCCESS' : p.paymentStatus,
            tokenNumber: booking?.tokenNumber || 'TKN-0000',
            centreName: centre?.name || 'Mandi Samiti',
            transactionId: `TXN-${p._id.toString().slice(-10).toUpperCase()}`,
            bankAccountMasked: farmerProfile.bankAccountMasked || 'XXXX-XXXX-4892'
          }
        })
      )
    }
  }

  const totalDisbursed = paymentsList
    .filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED')
    .reduce((acc, p) => acc + p.amount, 0)

  const pendingDisbursal = paymentsList
    .filter(p => p.status !== 'SUCCESS' && p.status !== 'COMPLETED')
    .reduce((acc, p) => acc + p.amount, 0)

  const bankAccount = farmerProfile?.bankAccountMasked || 'XXXX-XXXX-4892'
  const bankName = farmerProfile?.bankName || 'State Bank of India'

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tPayments('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{tPayments('subtitle')}</p>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white border-t-4 border-t-green-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">{tPayments('totalDbtReceived')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-800">₹ {totalDisbursed.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">{tPayments('creditedToAadhaar')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-t-4 border-t-amber-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">{tPayments('pendingProcessing')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-800">₹ {pendingDisbursal.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">{tPayments('underPfmsVerification')}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-t-4 border-t-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">{tPayments('linkedBankAccount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-slate-900">{bankName}</p>
            <p className="text-xs text-slate-500 font-medium">A/C: {bankAccount} ({tPayments('aadhaarVerified')})</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Transactions Table */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">{tPayments('disbursementLogTitle')}</CardTitle>
          <CardDescription className="text-xs text-slate-500">{tPayments('disbursementLogSub')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {paymentsList.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">{tPayments('noPaymentRecords')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">{tPayments('refToken')}</th>
                    <th className="p-3">{tPayments('commodityQty')}</th>
                    <th className="p-3">{tPayments('mandiCentre')}</th>
                    <th className="p-3">{tPayments('totalAmount')}</th>
                    <th className="p-3">{tPayments('paymentStatus')}</th>
                    <th className="p-3">{tPayments('pfmsRef')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{p.tokenNumber}</td>
                      <td className="p-3">{p.crop} ({p.quantity} Qtl)</td>
                      <td className="p-3">{translateCentre(p.centreName, locale)}</td>
                      <td className="p-3 font-black text-green-800">₹ {p.amount.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.status === 'COMPLETED' || p.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[10px]">{p.transactionId}</td>
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


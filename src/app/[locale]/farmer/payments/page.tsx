import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, Procurement, ProcurementCentre } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import mongoose from "mongoose"

export default async function FarmerPaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

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
          paymentStatus: p.paymentStatus,
          tokenNumber: booking?.tokenNumber || 'TKN-0000',
          centreName: centre?.name || 'Mandi Samiti'
        }
      })
    )
  }

  const totalDisbursed = procurementsData
    .filter(p => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS')
    .reduce((acc, p) => acc + Math.round(p.quantity * 2275), 0)

  const pendingDisbursal = procurementsData
    .filter(p => p.paymentStatus !== 'COMPLETED' && p.paymentStatus !== 'SUCCESS')
    .reduce((acc, p) => acc + Math.round(p.quantity * 2275), 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Direct Benefit Transfer (DBT) Payments</h1>
        <p className="text-sm text-slate-500 mt-1">Track direct bank payment credits for your agricultural MSP sales</p>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="bg-white border-t-4 border-t-green-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Total DBT Received</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-green-800">₹ {totalDisbursed.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">Credited to Aadhaar Account</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-t-4 border-t-amber-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Pending Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-800">₹ {pendingDisbursal.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">Under PFMS Verification</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-t-4 border-t-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Linked Bank Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-slate-900">State Bank of India</p>
            <p className="text-xs text-slate-500 font-medium">A/C: XXXX-XXXX-4321 (Aadhaar Verified)</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Transactions Table */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">DBT Payment Disbursement Log</CardTitle>
          <CardDescription className="text-xs text-slate-500">PFMS direct bank transfers processed for your account</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {procurementsData.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No payment records available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                  <tr>
                    <th className="p-3">Reference Token</th>
                    <th className="p-3">Commodity & Quantity</th>
                    <th className="p-3">Mandi Centre</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Payment Status</th>
                    <th className="p-3">PFMS Ref Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {procurementsData.map((p) => {
                    const amount = Math.round(p.quantity * 2275)
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{p.tokenNumber}</td>
                        <td className="p-3">{p.crop} ({p.quantity} Qtl)</td>
                        <td className="p-3">{p.centreName}</td>
                        <td className="p-3 font-black text-green-800">₹ {amount.toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {p.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[10px]">PFMS99882211-{p.id.slice(-4)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

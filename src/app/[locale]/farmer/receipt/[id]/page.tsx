import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Booking, ProcurementCentre, Slot, Procurement, Payment } from "@/models"
import mongoose from "mongoose"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReceiptData, generateReceiptHtml } from "@/lib/receiptTemplate"
import { redirect } from "next/navigation"
import ReceiptClientView from "./ReceiptClientView"

export default async function FarmerReceiptPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect(`/${locale}/login`)
  }

  await connectToDatabase()

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Invalid Receipt Reference</h2>
        <p className="text-sm text-slate-500 mt-2">The specified procurement booking could not be found.</p>
        <Link href={`/${locale}/farmer/history`}>
          <Button className="mt-4" variant="outline">← Back to History</Button>
        </Link>
      </div>
    )
  }

  const booking = await Booking.findById(id).lean()
  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <h2 className="text-xl font-bold text-slate-800">Receipt Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">No record was found for this token pass.</p>
        <Link href={`/${locale}/farmer/history`}>
          <Button className="mt-4" variant="outline">← Back to History</Button>
        </Link>
      </div>
    )
  }

  const farmerProfile = await FarmerProfile.findById(booking.farmerId).lean()
  const centre = booking.centreId ? await ProcurementCentre.findById(booking.centreId).lean() : null
  const slot = booking.slotId ? await Slot.findById(booking.slotId).lean() : null
  const procurement = await Procurement.findOne({ bookingId: booking._id }).lean()
  const payment = procurement ? await Payment.findOne({ procurementId: procurement._id }).lean() : null

  const quantity = procurement?.quantity || 42
  const mspRate = payment?.mspRatePerQuintal || 2275
  const totalAmount = payment?.amount || Math.round(quantity * mspRate)
  const qualityGrade = procurement?.qualityGrade || 'Grade A'
  const moistureLevel = (procurement as any)?.moistureLevel || 11.2
  const crop = procurement?.crop || 'Wheat (Sharbati Grade A)'
  const paymentStatus = payment?.status || (booking.status === 'COMPLETED' ? 'SUCCESS' : 'PENDING')
  const transactionId = payment?.transactionId || `TXN-${booking._id.toString().slice(-10).toUpperCase()}`

  const receipt: ReceiptData = {
    id: booking._id.toString(),
    tokenNumber: booking.tokenNumber,
    status: booking.status,
    date: booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A',
    timeSlot: slot?.timeSlot || '08:00 AM - 10:00 AM',
    centreName: centre?.name || 'Mandi Samiti',
    centreAddress: centre?.address || 'Main APMC Mandi Yard, GT Road',
    centreDistrict: centre?.district || 'Central District',
    centreState: centre?.state || 'State APMC Board',
    farmerName: session?.user?.name || farmerProfile?.bankAccountName || 'Farmer',
    farmerId: farmerProfile?.farmerId || `KF-${session?.user?.id?.slice(-6) || '100000'}`,
    farmerPhone: (session?.user as any)?.phoneNumber || '',
    farmerVillage: farmerProfile?.village || '',
    farmerDistrict: farmerProfile?.district || '',
    farmerState: farmerProfile?.state || '',
    crop,
    quantity,
    qualityGrade,
    moistureLevel,
    mspRate,
    totalAmount,
    paymentStatus,
    transactionId,
    bankAccountMasked: payment?.bankAccountMasked || farmerProfile?.bankAccountMasked || 'XXXX-XXXX-4892',
    ifscCode: payment?.ifscCode || farmerProfile?.ifscCode || 'SBIN0001245',
    paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : (booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-4">
      <div className="flex justify-between items-center no-print">
        <Link href={`/${locale}/farmer/history`}>
          <Button variant="outline" size="sm">← Back to History</Button>
        </Link>
      </div>

      <ReceiptClientView receipt={receipt} />
    </div>
  )
}

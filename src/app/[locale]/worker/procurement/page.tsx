import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { WorkerProfile, ProcurementCentre, Booking, FarmerProfile, User } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { submitProcurementAction } from "@/app/actions/workerActions"
import Link from "next/link"

export default async function WorkerProcurementFormPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ bookingId?: string }> }) {
  const { locale } = await params
  const { bookingId } = await searchParams
  const session = await auth()

  await connectToDatabase()

  const workerProfile = await WorkerProfile.findOne({ userId: session?.user.id })
  const centre = workerProfile ? await ProcurementCentre.findById(workerProfile.centreId).lean() : null

  // Fetch active bookings for selection
  let bookings: any[] = []
  if (workerProfile) {
    const rawBookings = await Booking.find({
      centreId: workerProfile.centreId,
      status: { $in: ['ARRIVED', 'PROCESSING', 'SCHEDULED'] }
    }).lean()

    bookings = await Promise.all(
      rawBookings.map(async (b) => {
        const farmerProfile = await FarmerProfile.findById(b.farmerId).lean()
        const farmerUser = farmerProfile ? await User.findById(farmerProfile.userId).lean() : null
        return {
          id: b._id.toString(),
          tokenNumber: b.tokenNumber,
          farmerName: farmerUser?.name || 'Farmer',
          farmerPhone: farmerUser?.phoneNumber || 'N/A'
        }
      })
    )
  }

  const selectedBooking = bookingId ? bookings.find(b => b.id === bookingId) || bookings[0] : bookings[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procurement Entry & Quality Grading</h1>
          <p className="text-sm text-slate-500 mt-1">Record gross weight, tare weight, moisture %, and calculate MSP total</p>
        </div>
        <Link href={`/${locale}/worker/dashboard`}>
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">Official Produce Receipt Form</CardTitle>
          <CardDescription className="text-xs text-slate-500">{centre?.name || 'Mandi Centre'}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={async (formData) => {
            "use server"
            await submitProcurementAction(formData)
          }} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="bookingId">Select Farmer Token *</Label>
              <select
                id="bookingId"
                name="bookingId"
                defaultValue={selectedBooking?.id || ''}
                required
                className="w-full border border-slate-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-green-600 focus:outline-none font-bold"
              >
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.tokenNumber} - {b.farmerName} ({b.farmerPhone})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="crop">Crop / Commodity Type *</Label>
              <select
                id="crop"
                name="crop"
                required
                className="w-full border border-slate-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-green-600 focus:outline-none font-semibold"
              >
                <option value="Wheat (Sharbati Grade A)">Wheat (Sharbati Grade A) - MSP ₹2,275/Qtl</option>
                <option value="Wheat (Standard)">Wheat (Standard) - MSP ₹2,125/Qtl</option>
                <option value="Paddy (Common)">Paddy (Common) - MSP ₹2,183/Qtl</option>
                <option value="Paddy (Grade A)">Paddy (Grade A) - MSP ₹2,203/Qtl</option>
                <option value="Mustard">Mustard - MSP ₹5,650/Qtl</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="grossWeight">Gross Weight (Quintals) *</Label>
                <Input id="grossWeight" name="grossWeight" type="number" step="0.1" required defaultValue="52.0" placeholder="e.g. 52.0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tareWeight">Vehicle / Bag Tare Weight (Quintals) *</Label>
                <Input id="tareWeight" name="tareWeight" type="number" step="0.1" required defaultValue="6.5" placeholder="e.g. 6.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="qualityGrade">Quality Grade *</Label>
                <select id="qualityGrade" name="qualityGrade" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white">
                  <option value="Grade A">Grade A (Superior)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Fair Average)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="moistureLevel">Moisture Level (%) *</Label>
                <Input id="moistureLevel" name="moistureLevel" type="number" step="0.1" defaultValue="11.2" placeholder="Max 12.0%" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="remarks">Inspector Remarks</Label>
              <Input id="remarks" name="remarks" defaultValue="Grain sample verified. Moisture well within 12% limit. MSP rate applied." />
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Calculated MSP Summary:</p>
              <p>Net Produce Weight: <strong>45.5 Quintals</strong></p>
              <p>Applied Rate: <strong>₹ 2,275 / Quintal</strong></p>
              <p className="text-sm font-black text-green-800 pt-1">Total Payment Payable: ₹ 1,03,512 (Will initiate DBT to Farmer)</p>
            </div>

            <Button type="submit" className="w-full bg-green-800 hover:bg-green-700 text-white font-bold h-12 text-base">
              Submit Procurement & Initiate DBT Payment ⚖️
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

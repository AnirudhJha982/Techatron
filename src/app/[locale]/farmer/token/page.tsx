import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function FarmerTokenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session?.user.id }
  })

  const activeBooking = await prisma.booking.findFirst({
    where: {
      farmerId: farmerProfile?.id,
      status: { in: ['SCHEDULED', 'ARRIVED', 'PROCESSING'] }
    },
    include: {
      centre: true,
      slot: true
    },
    orderBy: { date: 'asc' }
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Digital Token Pass</h1>
          <p className="text-sm text-slate-500 mt-1">Official Gate Pass for Procurement Entry</p>
        </div>
        <Link href={`/${locale}/farmer/dashboard`}>
          <Button variant="outline" size="sm">← Back to Dashboard</Button>
        </Link>
      </div>

      {activeBooking ? (
        <Card className="shadow-lg border-2 border-yellow-400 overflow-hidden">
          <div className="bg-gradient-to-r from-green-950 via-green-900 to-green-950 text-white p-8">
            <div className="flex justify-between items-center mb-4">
              <span className="bg-yellow-400 text-green-950 text-xs font-black px-3 py-1 rounded uppercase">Valid Entry Pass</span>
              <span className="text-xs text-green-200">Date: {activeBooking.date.toLocaleDateString()}</span>
            </div>

            <div className="text-center py-6 border-y border-green-800 my-4 bg-green-950/50 rounded-xl">
              <p className="text-xs uppercase text-green-300 tracking-widest font-bold">Token Number</p>
              <p className="text-5xl font-black text-yellow-400 tracking-tighter my-2">{activeBooking.tokenNumber}</p>
              <span className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-400/40">
                Current Status: {activeBooking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-green-100 pt-2">
              <div>
                <p className="text-green-300">Farmer Name:</p>
                <p className="font-bold text-white text-sm">{session?.user.name}</p>
              </div>
              <div>
                <p className="text-green-300">Procurement Mandi:</p>
                <p className="font-bold text-white text-sm">{activeBooking.centre.name}</p>
              </div>
              <div>
                <p className="text-green-300">Allocated Time Slot:</p>
                <p className="font-bold text-white text-sm">{activeBooking.slot.timeSlot}</p>
              </div>
              <div>
                <p className="text-green-300">Queue Position:</p>
                <p className="font-bold text-yellow-300 text-sm">#{activeBooking.queuePosition || 1}</p>
              </div>
            </div>

            {/* Simulated QR Barcode */}
            <div className="mt-8 text-center pt-6 border-t border-green-800">
              <div className="w-32 h-32 bg-white rounded-xl mx-auto p-2 flex items-center justify-center shadow-inner">
                <div className="w-full h-full border-4 border-black bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:12px_12px]"></div>
              </div>
              <p className="text-[10px] text-green-300 mt-2">Scan at Mandi Gate 2 for Automatic Arrival Verification</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center bg-white border-dashed border-2">
          <span className="text-5xl mb-3 block">🎫</span>
          <h3 className="text-xl font-bold text-slate-800">No Active Token Pass</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">Book a procurement slot to generate your official digital entry pass.</p>
          <Link href={`/${locale}/farmer/booking`}>
            <Button className="bg-green-800 hover:bg-green-700 text-white font-bold px-6">
              Book Procurement Slot
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}

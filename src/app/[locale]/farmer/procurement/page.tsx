import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function FarmerProcurementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const farmerProfile = await prisma.farmerProfile.findUnique({
    where: { userId: session?.user.id }
  })

  // Procurements for farmer
  const procurements = await prisma.procurement.findMany({
    where: {
      booking: { farmerId: farmerProfile?.id }
    },
    include: {
      booking: { include: { centre: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procurement Status & Quality Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Details of weighed, graded, and approved crop sales</p>
      </div>

      {procurements.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2">
          <span className="text-5xl mb-3 block">🌾</span>
          <h3 className="text-xl font-bold text-slate-800">No Procurement Records Found</h3>
          <p className="text-sm text-slate-500 mt-1">Once your produce is weighed and graded at the Mandi, details will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {procurements.map((p) => {
            const mspRate = 2275
            const totalVal = Math.round(p.quantity * mspRate)
            return (
              <Card key={p.id} className="shadow-sm border-slate-200 bg-white">
                <CardHeader className="border-b bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded">
                        Procurement Approved ✓
                      </span>
                      <CardTitle className="text-xl font-bold text-slate-900 mt-1">{p.crop}</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Token: <strong>{p.booking.tokenNumber}</strong> • Mandi: <strong>{p.booking.centre.name}</strong>
                      </CardDescription>
                    </div>
                    <div className="mt-3 sm:mt-0 text-left sm:text-right">
                      <p className="text-2xl font-black text-green-800">₹ {totalVal.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500 font-medium">Net Qtl: {p.quantity} Quintals @ ₹{mspRate}/Qtl</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Quality Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block">Quality Grade:</span>
                      <strong className="text-slate-900 text-sm">{p.qualityGrade}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Moisture Level:</span>
                      <strong className="text-slate-900 text-sm">{p.moistureLevel || 11.5}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Payment Status:</span>
                      <strong className="text-blue-700 text-sm">{p.paymentStatus}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Verification Date:</span>
                      <strong className="text-slate-900 text-sm">{p.createdAt.toLocaleDateString()}</strong>
                    </div>
                  </div>

                  {/* Visual Pipeline Progress */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Procurement & Payment Lifecycle</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      {[
                        { label: "1. Slot Booked", done: true },
                        { label: "2. Arrived & Weighed", done: true },
                        { label: "3. Quality Approved", done: true },
                        { label: "4. DBT Payment Disbursed", done: p.paymentStatus === 'COMPLETED' }
                      ].map((step, i) => (
                        <div key={i} className={`p-2.5 rounded-lg border font-bold ${
                          step.done ? 'bg-green-100 text-green-900 border-green-300' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {step.done ? '✓ ' : ''}{step.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {p.remarks && (
                    <div className="text-xs text-slate-600 bg-yellow-50/70 p-3 rounded-lg border border-yellow-200">
                      <strong>Inspector Remarks:</strong> {p.remarks}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

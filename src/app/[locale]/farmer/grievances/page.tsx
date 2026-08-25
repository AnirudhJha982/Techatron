import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, Grievance } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'

export default async function FarmerGrievancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const tGrievances = await getTranslations({ locale, namespace: 'Grievances' })

  await connectToDatabase()

  const farmerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await FarmerProfile.findOne({ userId: session.user.id })
    : null

  let grievancesData: any[] = []
  if (farmerProfile) {
    const rawList = await Grievance.find({ farmerId: farmerProfile._id })
      .sort({ createdAt: -1 })
      .lean()

    grievancesData = rawList.map(g => ({
      id: g._id.toString(),
      ticketNo: `GRV-${g._id.toString().slice(-6).toUpperCase()}`,
      category: g.category,
      description: g.description,
      status: g.status,
      resolution: (g as any).resolutionNotes || (g as any).resolution || null,
      date: new Date(g.createdAt).toLocaleDateString()
    }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tGrievances('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{tGrievances('subtitle')}</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-lg font-bold text-slate-900">{tGrievances('raiseNewTitle')}</CardTitle>
          <CardDescription className="text-xs text-slate-500">{tGrievances('raiseNewSub')}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{tGrievances('categoryLabel')}</label>
              <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none">
                <option value="PAYMENT_DELAY">{tGrievances('catPaymentDelay')}</option>
                <option value="SLOT_ISSUE">{tGrievances('catSlotIssue')}</option>
                <option value="QUALITY_DISPUTE">{tGrievances('catQualityDispute')}</option>
                <option value="STAFF_ISSUE">{tGrievances('catStaffIssue')}</option>
                <option value="OTHER">{tGrievances('catOther')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{tGrievances('descLabel')}</label>
              <textarea
                rows={4}
                placeholder={tGrievances('descPlaceholder')}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-600 focus:outline-none"
              ></textarea>
            </div>

            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 text-sm">
              {tGrievances('submitBtn')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-lg font-bold text-slate-900">{tGrievances('submittedTicketsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {grievancesData.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">{tGrievances('noGrievances')}</p>
          ) : (
            <div className="space-y-4">
              {grievancesData.map((g) => (
                <div key={g.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm">{g.ticketNo}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      g.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">{g.description}</p>
                  {g.resolution && (
                    <div className="bg-green-50 p-2.5 rounded-lg border border-green-200 text-xs text-green-900">
                      <strong>{tGrievances('officerResponse')}:</strong> {g.resolution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

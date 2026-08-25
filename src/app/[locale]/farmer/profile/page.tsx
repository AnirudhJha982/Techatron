import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, User } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'

export default async function FarmerProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const tProfile = await getTranslations({ locale, namespace: 'Profile' })

  await connectToDatabase()

  const farmerUser = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await User.findById(session.user.id).lean()
    : null

  const farmerProfile = (session?.user?.id && mongoose.Types.ObjectId.isValid(session.user.id))
    ? await FarmerProfile.findOne({ userId: session.user.id }).lean()
    : null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tProfile('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{tProfile('subtitle')}</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-lg font-bold text-slate-900">{tProfile('cardTitle')}</CardTitle>
          <CardDescription className="text-xs text-slate-500">Government Procurement Aadhaar-linked account profile</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('fullName')}</label>
              <input
                type="text"
                readOnly
                value={farmerUser?.name || session?.user.name || ''}
                className="w-full mt-1 border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('mobileNumber')}</label>
              <input
                type="text"
                readOnly
                value={farmerUser?.phoneNumber || ''}
                className="w-full mt-1 border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('village')}</label>
              <input
                type="text"
                defaultValue={farmerProfile?.village || 'Nilokheri'}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('district')}</label>
              <input
                type="text"
                defaultValue={farmerProfile?.district || 'Karnal'}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('state')}</label>
              <input
                type="text"
                defaultValue={farmerProfile?.state || 'Haryana'}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('landArea')}</label>
              <input
                type="number"
                step="0.1"
                defaultValue={farmerProfile?.landSizeAcres || 5.0}
                className="w-full mt-1 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">{tProfile('verificationStatus')}</span>
              <span className="font-bold text-green-800">{tProfile('verified')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tProfile('aadhaarStatus')}</span>
              <span className="font-bold text-green-800">{tProfile('verified')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{tProfile('khasraStatus')}</span>
              <span className="font-bold text-green-800">{tProfile('matched')}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button className="bg-green-800 hover:bg-green-700 text-white font-bold px-6">
              {tProfile('saveBtn')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

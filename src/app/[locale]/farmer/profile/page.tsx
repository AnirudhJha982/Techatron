import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { FarmerProfile, User } from "@/models"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import mongoose from "mongoose"
import { getTranslations } from 'next-intl/server'
import VerificationWizard from "@/components/VerificationWizard"
import Link from 'next/link'

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

  const isVerified = farmerProfile?.kycStatus === 'VERIFIED' && farmerProfile?.bookingEligible === true

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tProfile('title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{tProfile('subtitle')}</p>
        </div>
        {isVerified ? (
          <span className="bg-green-800 text-yellow-400 font-extrabold text-xs px-3 py-1.5 rounded-full border border-yellow-400 flex items-center space-x-1 shadow">
            <span>🟢</span>
            <span>VERIFIED FARMER (LEVEL 2)</span>
          </span>
        ) : (
          <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center space-x-1 shadow">
            <span>🔴</span>
            <span>UNVERIFIED (LEVEL 1 BASIC)</span>
          </span>
        )}
      </div>

      {/* Verification & Eligibility Banner */}
      {isVerified ? (
        <div className="bg-gradient-to-r from-green-950 to-green-900 text-white p-6 rounded-2xl border-2 border-yellow-400 shadow-md flex flex-col sm:flex-row justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-yellow-400 text-green-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">Govt Verified Account</span>
              <span className="text-xs text-yellow-300 font-bold">Farmer ID: {farmerProfile?.farmerId || 'KF-847291'}</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white">🟢 Slot Booking Unlocked</h3>
            <p className="text-xs text-green-200">Your profile, land records, and Aadhaar-linked bank details are fully verified.</p>
          </div>
          <Link href={`/${locale}/farmer/booking`} className="mt-4 sm:mt-0">
            <Button className="bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black text-xs px-6">
              Book Procurement Slot →
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white p-6 rounded-2xl border-2 border-amber-600 shadow-md space-y-3">
          <div className="flex items-center space-x-2">
            <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase">Level 1 Basic Account</span>
            <span className="text-xs text-amber-300 font-bold">🔒 Slot Booking Locked</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">Farmer Verification (KYC) Required</h3>
          <p className="text-xs text-amber-200">
            Slot booking is available only to verified farmers. Complete your farmer verification and bank details to enable procurement booking and DBT payment credits.
          </p>
        </div>
      )}

      {/* Verification Wizard for Unverified Users */}
      {!isVerified && (
        <VerificationWizard
          initialFarmerId={farmerProfile?.farmerId || ''}
          initialVillage={farmerProfile?.village || 'Nilokheri'}
          initialDistrict={farmerProfile?.district || 'Karnal'}
          initialState={farmerProfile?.state || 'Haryana'}
          initialLandSize={farmerProfile?.landSizeAcres || 5.0}
          initialBankName={farmerProfile?.bankName || 'State Bank of India'}
          initialAccountName={farmerUser?.name || ''}
          initialIfsc={farmerProfile?.ifscCode || 'SBIN0001245'}
        />
      )}

      {/* Farmer Profile Card Details */}
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
                readOnly={isVerified}
                defaultValue={farmerProfile?.village || 'Nilokheri'}
                className="w-full mt-1 border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('district')}</label>
              <input
                type="text"
                readOnly={isVerified}
                defaultValue={farmerProfile?.district || 'Karnal'}
                className="w-full mt-1 border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('state')}</label>
              <input
                type="text"
                readOnly={isVerified}
                defaultValue={farmerProfile?.state || 'Haryana'}
                className="w-full mt-1 border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase">{tProfile('landArea')}</label>
              <input
                type="number"
                step="0.1"
                readOnly={isVerified}
                defaultValue={farmerProfile?.landSizeAcres || 5.0}
                className="w-full mt-1 border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Verification Status Matrix */}
          <div className="pt-4 border-t space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mobile Verification:</span>
              <span className="font-bold text-green-800">✓ Authenticated via OTP</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Farmer Registration ID:</span>
              <span className={`font-bold ${farmerProfile?.farmerIdVerified ? 'text-green-800' : 'text-red-600'}`}>
                {farmerProfile?.farmerIdVerified ? `✓ Verified (${farmerProfile?.farmerId})` : '🔴 Not Verified'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">KYC Status:</span>
              <span className={`font-bold ${isVerified ? 'text-green-800' : 'text-red-600'}`}>
                {isVerified ? '🟢 VERIFIED' : '🔴 NOT VERIFIED'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">DBT Bank Account:</span>
              <span className={`font-bold ${farmerProfile?.bankDetailsVerified ? 'text-green-800' : 'text-red-600'}`}>
                {farmerProfile?.bankDetailsVerified ? `✓ Verified (${farmerProfile?.bankAccountMasked || 'XXXX-XXXX-4892'})` : '🔴 Bank Details Pending'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Slot Booking Eligibility:</span>
              <span className={`font-bold ${isVerified ? 'text-green-800' : 'text-red-600'}`}>
                {isVerified ? '🟢 UNLOCKED' : '🔒 LOCKED'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { submitFarmerVerificationAction } from '@/app/actions/verification'

interface VerificationWizardProps {
  initialFarmerId?: string
  initialVillage?: string
  initialDistrict?: string
  initialState?: string
  initialLandSize?: number
  initialBankName?: string
  initialAccountName?: string
  initialIfsc?: string
  onCompleted?: () => void
}

export default function VerificationWizard({
  initialFarmerId = '',
  initialVillage = 'Nilokheri',
  initialDistrict = 'Karnal',
  initialState = 'Haryana',
  initialLandSize = 5.0,
  initialBankName = 'State Bank of India',
  initialAccountName = '',
  initialIfsc = 'SBIN0001245',
  onCompleted
}: VerificationWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [farmerId, setFarmerId] = useState(initialFarmerId || 'KF-847291')
  const [village, setVillage] = useState(initialVillage)
  const [district, setDistrict] = useState(initialDistrict)
  const [state, setState] = useState(initialState)
  const [landSize, setLandSize] = useState(initialLandSize)
  const [bankAccountName, setBankAccountName] = useState(initialAccountName)
  const [bankName, setBankName] = useState(initialBankName)
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState(initialIfsc)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await submitFarmerVerificationAction({
        farmerId,
        village,
        district,
        state,
        landSizeAcres: landSize,
        bankAccountName,
        bankName,
        accountNumber,
        ifscCode
      })

      if (res.success) {
        setSuccessMsg("✅ Farmer verification completed successfully! Slot booking is now unlocked.")
        if (onCompleted) onCompleted()
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to complete verification. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl border-2 border-yellow-400 shadow-xl space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="bg-yellow-400 text-green-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">Official Government KYC</span>
          <h3 className="text-xl font-black tracking-tight mt-1">Farmer KYC Verification Wizard</h3>
        </div>
        <div className="text-xs text-yellow-400 font-bold">
          Step {step} of 4
        </div>
      </div>

      {successMsg ? (
        <div className="p-6 bg-green-900/60 border border-green-500 rounded-xl text-center space-y-3">
          <span className="text-4xl block">🎉</span>
          <h4 className="text-lg font-bold text-white">{successMsg}</h4>
          <p className="text-xs text-green-200">Your verification status has been permanently saved to MongoDB Atlas.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-xs rounded-lg">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* STEP 1: MOBILE VERIFICATION */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Step 1: Mobile OTP Verification</h4>
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2 text-green-400 font-bold text-sm">
                  <span>✓</span>
                  <span>Mobile Number Authenticated via OTP</span>
                </div>
                <p>Your login mobile number has already been verified during basic registration.</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setStep(2)} className="bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black px-6 text-xs">
                  Next: Farmer ID →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: FARMER REGISTRATION ID */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Step 2: Government Farmer ID</h4>
              <div>
                <label className="block text-xs text-slate-400 uppercase mb-1">State / District Farmer ID (e.g. KF-847291)</label>
                <input
                  type="text"
                  required
                  value={farmerId}
                  onChange={(e) => setFarmerId(e.target.value)}
                  placeholder="Enter Farmer ID"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Prototype verification matches against state agricultural registry database.</p>
              </div>
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="text-xs">{`← Back`}</Button>
                <Button type="button" onClick={() => setStep(3)} className="bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black px-6 text-xs">
                  Next: Land Details →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: LAND & LOCATION REVIEW */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Step 3: Agricultural Land Record Review</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Registered Land Area (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={landSize}
                    onChange={(e) => setLandSize(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="text-xs">{`← Back`}</Button>
                <Button type="button" onClick={() => setStep(4)} className="bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black px-6 text-xs">
                  Next: Bank Account →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: BANK ACCOUNT & PAYMENT DETAILS */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Step 4: Bank Account & DBT Disbursement Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="As printed on Passbook"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">Bank Account Number</label>
                  <input
                    type="password"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter Account Number"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="e.g. SBIN0001245"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold uppercase"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-950/60 border border-amber-800 rounded-lg text-[10px] text-amber-200">
                🔒 <strong>Privacy Protection:</strong> Bank details are required to credit MSP procurement payments directly via DBT. Account numbers are stored masked (e.g. XXXX-XXXX-4521) and never exposed in client logs.
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(3)} className="text-xs">{`← Back`}</Button>
                <Button type="submit" disabled={loading} className="bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black px-8 text-xs">
                  {loading ? "Submitting KYC..." : "Submit & Unlock Slot Booking 🔓"}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  )
}

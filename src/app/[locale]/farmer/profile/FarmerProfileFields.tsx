"use client"

import StateSelect from "@/components/ui/StateSelect"

interface ProfileFieldsProps {
  name: string
  phoneNumber: string
  village: string
  district: string
  state: string
  landSizeAcres: number
  isVerified: boolean
  labels: {
    fullName: string
    mobileNumber: string
    village: string
    district: string
    state: string
    landArea: string
  }
}

export default function FarmerProfileFields({
  name,
  phoneNumber,
  village,
  district,
  state,
  landSizeAcres,
  isVerified,
  labels,
}: ProfileFieldsProps) {
  const readOnlyClass = "w-full mt-1 border border-slate-200 bg-slate-50 rounded-lg p-2.5 font-bold text-slate-900"
  const editableClass = "w-full mt-1 border border-slate-300 bg-white rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-green-600 focus:outline-none"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      {/* Full Name — always read-only */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{labels.fullName}</label>
        <input type="text" readOnly value={name} className={readOnlyClass} />
      </div>

      {/* Mobile — always read-only */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{labels.mobileNumber}</label>
        <input type="text" readOnly value={phoneNumber} className={readOnlyClass} />
      </div>

      {/* Village */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{labels.village}</label>
        <input
          type="text"
          name="village"
          readOnly={isVerified}
          defaultValue={village}
          className={isVerified ? readOnlyClass : editableClass}
        />
      </div>

      {/* District */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{labels.district}</label>
        <input
          type="text"
          name="district"
          readOnly={isVerified}
          defaultValue={district}
          className={isVerified ? readOnlyClass : editableClass}
        />
      </div>

      {/* State — StateSelect when editable, read-only input when verified */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{labels.state}</label>
        {isVerified ? (
          <input type="text" readOnly value={state} className={readOnlyClass} />
        ) : (
          <StateSelect name="state" defaultValue={state} required className="mt-1" />
        )}
      </div>

      {/* Land Size */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase">{labels.landArea}</label>
        <input
          type="number"
          name="landSizeAcres"
          step="0.1"
          readOnly={isVerified}
          defaultValue={landSizeAcres}
          className={isVerified ? readOnlyClass : editableClass}
        />
      </div>
    </div>
  )
}

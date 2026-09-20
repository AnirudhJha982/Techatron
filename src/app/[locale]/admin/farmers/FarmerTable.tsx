"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toggleUserStatusAction, deleteFarmerAction, updateFarmerAction } from "@/app/actions/adminActions"
import StateSelect from "@/components/ui/StateSelect"
import PhoneInput from "@/components/ui/PhoneInput"
import AdminDeleteButton from "@/components/admin/AdminDeleteButton"

export interface FarmerItem {
  id: string
  name: string
  phoneNumber?: string
  village: string
  district: string
  state: string
  landSizeAcres: number
  kycStatus: string
  bookingEligible: boolean
  bookingsCount: number
  isActive: boolean
  createdAt?: any
}

export default function FarmerTable({ farmers }: { farmers: FarmerItem[] }) {
  const [loading, setLoading] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState<FarmerItem | null>(null)
  const [editPhone, setEditPhone] = useState('')

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this farmer?`)) return
    setLoading(true)
    try {
      await toggleUserStatusAction(userId, !currentStatus)
    } catch (e: any) {
      alert(e.message)
    }
    setLoading(false)
  }

  const handleUpdateFarmer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingFarmer) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateFarmerAction(editingFarmer.id, {
        name: formData.get("name") as string,
        phoneNumber: editPhone || undefined,
        village: formData.get("village") as string,
        district: formData.get("district") as string,
        state: formData.get("state") as string,
        landSizeAcres: parseFloat(formData.get("landSizeAcres") as string) || 0,
        kycStatus: formData.get("kycStatus") as any,
        bookingEligible: formData.get("bookingEligible") === "true",
        isActive: formData.get("isActive") === "true"
      })
      alert("Farmer details updated successfully!")
      setEditingFarmer(null)
    } catch (e: any) {
      alert(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Edit Farmer Card Overlay */}
      {editingFarmer && (
        <Card className="bg-white shadow-md border-emerald-300 border-2">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-emerald-950">
                Edit Farmer: {editingFarmer.name}
              </CardTitle>
              <p className="text-xs text-emerald-700 mt-0.5">
                Update personal details, land records, KYC verification, and slot eligibility
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingFarmer(null)}
              className="text-emerald-800 hover:bg-emerald-100"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleUpdateFarmer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Farmer Name *</Label>
                  <Input name="name" defaultValue={editingFarmer.name} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile Number</Label>
                  <PhoneInput
                    name="phoneNumber"
                    value={editPhone}
                    onChange={setEditPhone}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State *</Label>
                  <StateSelect name="state" defaultValue={editingFarmer.state} required />
                </div>
                <div className="space-y-1.5">
                  <Label>District *</Label>
                  <Input name="district" defaultValue={editingFarmer.district} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Village</Label>
                  <Input name="village" defaultValue={editingFarmer.village} />
                </div>
                <div className="space-y-1.5">
                  <Label>Land Area (Acres)</Label>
                  <Input
                    name="landSizeAcres"
                    type="number"
                    step="0.1"
                    defaultValue={editingFarmer.landSizeAcres}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>KYC Verification Status</Label>
                  <select
                    name="kycStatus"
                    defaultValue={editingFarmer.kycStatus}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="NOT_VERIFIED">NOT_VERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED (Level 2)</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Slot Booking Eligibility</Label>
                  <select
                    name="bookingEligible"
                    defaultValue={editingFarmer.bookingEligible ? "true" : "false"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="true">🟢 Eligible (Slot Booking Unlocked)</option>
                    <option value="false">🔒 Ineligible (Slot Booking Locked)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Account Status</Label>
                  <select
                    name="isActive"
                    defaultValue={editingFarmer.isActive ? "true" : "false"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive / Deactivated</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditingFarmer(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold"
                >
                  {loading ? 'Saving Changes...' : 'Save Farmer Details'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Farmers Directory Table */}
      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">
            Farmers Directory ({farmers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Village / District</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Land</th>
                  <th className="p-3">KYC</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {farmers.map((f) => (
                  <tr key={f.id} className={`hover:bg-slate-50 ${!f.isActive ? 'opacity-60' : ''}`}>
                    <td className="p-3 font-bold text-slate-900">{f.name}</td>
                    <td className="p-3 font-mono text-slate-600">{f.phoneNumber || '—'}</td>
                    <td className="p-3">{f.village}, {f.district}</td>
                    <td className="p-3 font-semibold">{f.state}</td>
                    <td className="p-3 font-bold text-slate-800">{f.landSizeAcres} Ac</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        f.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                        f.kycStatus === 'PENDING'  ? 'bg-yellow-100 text-yellow-800' :
                        f.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {f.kycStatus}
                      </span>
                    </td>
                    <td className="p-3 font-black text-green-800">{f.bookingsCount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        f.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] text-blue-700 border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            setEditingFarmer(f)
                            setEditPhone(f.phoneNumber || '')
                          }}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() => handleToggleStatus(f.id, f.isActive)}
                          disabled={loading}
                          className={`text-[10px] font-bold h-6 ${
                            f.isActive
                              ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                              : 'border-green-300 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {f.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <AdminDeleteButton
                          itemType="farmer"
                          itemName={f.name}
                          onDelete={async () => {
                            await deleteFarmerAction(f.id)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

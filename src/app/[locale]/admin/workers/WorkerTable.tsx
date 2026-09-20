"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toggleWorkerStatus, resetWorkerPassword, createWorker, deleteWorker } from '@/app/actions/adminWorker'
import StateSelect from '@/components/ui/StateSelect'
import PhoneInput from '@/components/ui/PhoneInput'

export default function WorkerTable({ 
  workers, 
  centres 
}: { 
  workers: any[],
  centres: any[]
}) {
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [createdCredentials, setCreatedCredentials] = useState<{username: string, password: string} | null>(null)
  const [workerPhone, setWorkerPhone] = useState('')

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this worker?`)) return
    setLoading(true)
    try {
      await toggleWorkerStatus(userId, currentStatus)
    } catch (e: any) {
      alert(e.message)
    }
    setLoading(false)
  }

  const handleDeleteWorker = async (userId: string, workerName: string) => {
    if (!confirm(`Are you sure you want to permanently delete the account for "${workerName}"? This action cannot be undone.`)) return
    setLoading(true)
    try {
      await deleteWorker(userId)
    } catch (e: any) {
      alert(e.message)
    }
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!resetId) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const newPass = formData.get("newPassword") as string
    try {
      await resetWorkerPassword(resetId, newPass)
      alert("Password reset successfully")
      setResetId(null)
    } catch (e: any) {
      alert(e.message)
    }
    setLoading(false)
  }

  const handleCreateWorker = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    
    if (password !== confirmPassword) {
      alert("Passwords do not match")
      setLoading(false)
      return
    }

    const username = formData.get("username") as string
    // Ensure validated phone is sent
    formData.set("phoneNumber", workerPhone)

    try {
      await createWorker({
        name: formData.get("name") as string,
        username,
        phoneNumber: workerPhone || undefined,
        password,
        state: formData.get("state") as string,
        centreId: (formData.get("centreId") as string) || undefined,
        isActive: formData.get("isActive") === "true"
      })
      
      setCreatedCredentials({ username, password })
      setWorkerPhone('')
    } catch (e: any) {
      alert(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procurement Centre Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Directory of Mandi supervisors and quality grading personnel</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-green-800 hover:bg-green-700 text-white font-bold">
          + Add Worker
        </Button>
      </div>

      {showCreate && !createdCredentials && (
        <Card className="bg-white shadow-md border-green-200 border-2">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-lg font-bold text-green-950">Create New Worker Account</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateWorker} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input name="name" required placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="space-y-2">
                  <Label>Worker ID (Username) *</Label>
                  <Input name="username" required placeholder="e.g. W-1001" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <PhoneInput
                    name="phoneNumber"
                    value={workerPhone}
                    onChange={setWorkerPhone}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <select name="isActive" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <Input name="confirmPassword" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label>Worker State *</Label>
                  <StateSelect name="state" required />
                </div>
                <div className="space-y-2">
                  <Label>Assign to Mandi (Optional)</Label>
                  <select name="centreId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">-- No Default Mandi --</option>
                    {centres.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.district}, {c.state})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-green-800 text-white">Create Worker</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {createdCredentials && (
        <Card className="bg-white shadow-md border-green-500 border-2 overflow-hidden">
          <div className="bg-green-600 text-white p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-2xl font-bold">Worker account created successfully</h2>
            <p className="opacity-90">Please share these credentials securely with the worker.</p>
          </div>
          <CardContent className="pt-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 mb-6">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm font-semibold text-slate-500 uppercase">Worker ID (Username)</span>
                <span className="font-mono text-lg font-black text-slate-900">{createdCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500 uppercase">Initial Password</span>
                <span className="font-mono text-lg font-black text-slate-900">{createdCredentials.password}</span>
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => { setCreatedCredentials(null); setShowCreate(false); }} className="bg-green-800 text-white font-bold w-full max-w-xs">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {resetId && (
        <Card className="bg-white shadow-md border-amber-200 border-2">
          <CardHeader className="bg-amber-50 border-b border-amber-100">
            <CardTitle className="text-lg font-bold text-amber-950">Reset Worker Password</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input name="newPassword" type="password" required />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setResetId(null)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">Update Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">Staff Members Directory ({workers.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Worker ID</th>
                  <th className="p-3">Mobile Number</th>
                  <th className="p-3">Assigned Mandi</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{w.name}</td>
                    <td className="p-3 font-mono font-bold text-blue-900">{w.username || '-'}</td>
                    <td className="p-3 font-mono text-slate-600">{w.phoneNumber || '-'}</td>
                    <td className="p-3 font-bold text-amber-900">{w.centreName}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${w.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {w.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => handleToggleStatus(w.id, w.isActive)} disabled={loading}>
                        {w.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteWorker(w.id, w.name)} disabled={loading}>
                        Delete
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => setResetId(w.id)} disabled={loading}>
                        Reset Pwd
                      </Button>
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

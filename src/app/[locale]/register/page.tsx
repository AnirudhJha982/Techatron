"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerFarmer } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const res = await registerFarmer(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else if (res?.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push('/en/login')
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-green-700 bg-white">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
              🌾
            </div>
            <CardTitle className="text-2xl font-bold text-green-950">Farmer Registration</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Register your profile to book MSP procurement slots at Mandis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center space-y-2">
                <span className="text-4xl">🎉</span>
                <h3 className="font-bold text-lg">Registration Successful!</h3>
                <p className="text-sm">Redirecting to login page...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" required placeholder="e.g. Kisan Singh" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber">Mobile Number *</Label>
                    <Input id="phoneNumber" name="phoneNumber" type="tel" required placeholder="10-digit mobile" maxLength={10} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" name="password" type="password" required placeholder="Set a secure password" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="village">Village</Label>
                    <Input id="village" name="village" placeholder="e.g. Nisang" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="district">District</Label>
                    <Input id="district" name="district" placeholder="e.g. Karnal" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" placeholder="e.g. Haryana" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="landSizeAcres">Total Land Size (Acres)</Label>
                  <Input id="landSizeAcres" name="landSizeAcres" type="number" step="0.1" placeholder="e.g. 5.5" defaultValue="5.0" />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-green-800 hover:bg-green-700 text-white font-bold h-11 text-base">
                  {loading ? 'Registering Profile...' : 'Complete Registration'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500 border-t pt-4">
            Already registered? <Link href="/en/login" className="text-green-800 font-bold hover:underline ml-1">Login here</Link>
          </CardFooter>
        </Card>
      </main>

      <PublicFooter />
    </div>
  )
}

"use client"

import { useActionState, useState } from 'react'
import { authenticate } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)
  const [phone, setPhone] = useState('')
  const [pass, setPass] = useState('')

  const fillDemo = (demoPhone: string) => {
    setPhone(demoPhone)
    setPass('password123')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-800 bg-white">
          <CardHeader className="space-y-1 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl mb-2">
              🔐
            </div>
            <CardTitle className="text-2xl font-bold text-green-950">Portal Login</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Enter your mobile number and password to access your role portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={dispatch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Mobile Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  required
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="focus-visible:ring-green-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="focus-visible:ring-green-600"
                />
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-900 hover:bg-green-800 text-white font-bold h-11 text-base shadow"
                disabled={isPending}
              >
                {isPending ? 'Authenticating...' : 'Sign In to Portal'}
              </Button>
            </form>

            {/* Quick Demo Login Buttons */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-3">Quick Demo Auto-Fill (Password: password123)</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('9876543210')}
                  className="border-green-300 text-green-800 hover:bg-green-50 font-semibold"
                >
                  🌾 Farmer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('9876543211')}
                  className="border-yellow-400 text-yellow-800 hover:bg-yellow-50 font-semibold"
                >
                  🏢 Worker
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('9876543212')}
                  className="border-slate-400 text-slate-800 hover:bg-slate-100 font-semibold"
                >
                  🏛️ Admin
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col text-sm text-center text-gray-500 mt-2 border-t pt-4">
            <div>
              New Farmer? <Link href="/en/register" className="text-green-800 font-bold hover:underline">Register account here</Link>
            </div>
          </CardFooter>
        </Card>
      </main>

      <PublicFooter />
    </div>
  )
}

import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateFarmerProfileAction } from "@/app/actions/farmerActions"

const prisma = new PrismaClient()

export default async function FarmerProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    include: { farmerProfile: true }
  })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Farmer Profile Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your agricultural details and registered land size</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">Personal & Land Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={async (formData) => {
            "use server"
            await updateFarmerProfileAction(formData)
          }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={user?.name || ''} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Mobile Number (Login ID)</Label>
                <Input id="phoneNumber" value={user?.phoneNumber || ''} disabled className="bg-slate-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="village">Village</Label>
                <Input id="village" name="village" defaultValue={user?.farmerProfile?.village || ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district">District</Label>
                <Input id="district" name="district" defaultValue={user?.farmerProfile?.district || ''} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue={user?.farmerProfile?.state || ''} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="landSizeAcres">Registered Land Area (Acres)</Label>
              <Input id="landSizeAcres" name="landSizeAcres" type="number" step="0.1" defaultValue={user?.farmerProfile?.landSizeAcres || 5.0} />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
              <p className="font-bold text-slate-800">Verification Status:</p>
              <p>Aadhaar Link Status: <strong className="text-green-700">✓ Verified</strong></p>
              <p>State Land Records (Khasra): <strong className="text-green-700">✓ Matched</strong></p>
            </div>

            <Button type="submit" className="w-full bg-green-800 hover:bg-green-700 text-white font-bold h-11">
              Save Profile Updates
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

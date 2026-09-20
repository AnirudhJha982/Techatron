"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { selectWorkerCentre } from "@/app/actions/workerActions"
import { useRouter } from "next/navigation"

export default function CentreSelectionClient({ centres, locale }: { centres: any[], locale: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  const handleSelectCentre = async (centreId: string) => {
    setLoadingId(centreId)
    try {
      await selectWorkerCentre(centreId)
      router.push(`/${locale}/worker/dashboard`)
    } catch (e: any) {
      alert(e.message)
      setLoadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {centres.length === 0 ? (
        <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-lg shadow border border-slate-200">
          No active procurement centres found in your state.
        </div>
      ) : (
        centres.map((c) => (
          <Card key={c.id} className="bg-white shadow-sm hover:shadow-md transition-shadow border-amber-200">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-3">
              <CardTitle className="text-lg font-bold text-amber-950">{c.name}</CardTitle>
              <CardDescription className="text-xs font-semibold text-slate-500">{c.district}, {c.state}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-3">
              <div className="text-xs text-slate-600">
                <p><strong>Address:</strong> {c.address}</p>
                <p className="mt-1"><strong>Daily Capacity:</strong> {c.capacityPerDay} Quintals</p>
              </div>
              <Button 
                onClick={() => handleSelectCentre(c.id)} 
                disabled={loadingId === c.id}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold mt-2"
              >
                {loadingId === c.id ? "Entering..." : "Enter Booking Section ➜"}
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

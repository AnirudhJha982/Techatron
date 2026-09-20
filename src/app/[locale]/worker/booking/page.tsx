import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { WorkerProfile, ProcurementCentre } from "@/models"
import { redirect } from "next/navigation"
import mongoose from "mongoose"
import CentreSelectionClient from "./CentreSelectionClient"

export default async function WorkerBookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  if (!session || session.user?.role !== "WORKER") {
    redirect(`/${locale}/login`)
  }

  await connectToDatabase()

  if (!session.user.id || !mongoose.Types.ObjectId.isValid(session.user.id)) {
    return <div className="p-8 text-red-600 font-bold">Invalid worker session.</div>
  }

  const workerProfile = await WorkerProfile.findOne({ userId: session.user.id })
  if (!workerProfile) {
    return <div className="p-8 text-red-600 font-bold">Worker profile not configured.</div>
  }

  // Get active centres for the worker's state (case-insensitive match)
  const rawCentres = await ProcurementCentre.find({ 
    isActive: true,
    state: { $regex: new RegExp(`^${workerProfile.state}$`, 'i') } 
  }).lean()

  const centres = rawCentres.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    district: c.district,
    state: c.state,
    address: c.address,
    capacityPerDay: c.capacityPerDay
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Worker Booking Section</h1>
        <p className="text-sm text-slate-500 mt-1">Select a procurement centre in {workerProfile.state} to access its booking and queue information.</p>
      </div>

      <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg text-sm font-semibold">
        📍 You are authorized to manage procurement centres in <span className="font-black uppercase">{workerProfile.state}</span>.
      </div>

      <CentreSelectionClient centres={centres} locale={locale} />
    </div>
  )
}

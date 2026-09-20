import { connectToDatabase } from "@/lib/mongodb"
import { User, WorkerProfile, ProcurementCentre } from "@/models"
import WorkerTable from "./WorkerTable"

export default async function AdminWorkersPage() {
  await connectToDatabase()

  const rawWorkers = await User.find({ role: 'WORKER' }).sort({ createdAt: -1 }).lean()
  const rawCentres = await ProcurementCentre.find({ isActive: true }).lean()

  const centres = rawCentres.map(c => ({
    id: c._id.toString(),
    name: c.name,
    district: c.district,
    state: c.state
  }))

  const workers = await Promise.all(
    rawWorkers.map(async (w) => {
      const profile = await WorkerProfile.findOne({ userId: w._id }).lean()
      const centre = profile ? await ProcurementCentre.findById(profile.centreId).lean() : null
      return {
        id: w._id.toString(),
        name: w.name,
        username: w.username || '',
        phoneNumber: w.phoneNumber || '',
        isActive: w.isActive !== false,
        centreName: centre?.name || 'Unassigned',
        centreId: profile?.centreId ? profile.centreId.toString() : '',
        district: centre?.district || '',
        state: profile?.state || centre?.state || ''
      }
    })
  )

  return (
    <WorkerTable workers={workers} centres={centres} />
  )
}

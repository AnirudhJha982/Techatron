import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const prisma = new PrismaClient()

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      farmer: { include: { user: true } },
      centre: true,
      slot: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Bookings Directory</h1>
        <p className="text-sm text-slate-500 mt-1">Master appointment ledger across all regional Mandis</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900">All Appointments ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b">
                <tr>
                  <th className="p-3">Token Pass</th>
                  <th className="p-3">Farmer Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Mandi Centre</th>
                  <th className="p-3">Date & Time Slot</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3 font-black text-slate-900">{b.tokenNumber}</td>
                    <td className="p-3 font-bold text-slate-800">{b.farmer.user.name}</td>
                    <td className="p-3 text-slate-600">{b.farmer.user.phoneNumber}</td>
                    <td className="p-3">{b.centre.name}</td>
                    <td className="p-3">{b.date.toLocaleDateString()} ({b.slot.timeSlot})</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        b.status === 'ARRIVED' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
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

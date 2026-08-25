import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Notification } from "@/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { markNotificationReadAction } from "@/app/actions/farmerActions"

export default async function FarmerNotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await auth()

  await connectToDatabase()

  const rawNotifications = await Notification.find({ userId: session?.user.id })
    .sort({ createdAt: -1 })
    .lean()

  const notifications = rawNotifications.map(n => ({
    id: n._id.toString(),
    title: n.title,
    message: n.message,
    category: n.category,
    isRead: n.isRead,
    createdAt: n.createdAt
  }))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notification Center</h1>
        <p className="text-sm text-slate-500 mt-1">Official alerts regarding your token, queue position, and DBT payments</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">Notifications Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-8">No notifications received yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`py-4 flex items-start justify-between ${n.isRead ? 'opacity-70' : 'bg-green-50/40 p-3 rounded-lg'}`}>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">
                    {n.category === 'PAYMENT' ? '💳' : n.category === 'TOKEN' ? '🎫' : '🔔'}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {!n.isRead && (
                  <form action={async () => {
                    "use server"
                    await markNotificationReadAction(n.id)
                  }}>
                    <Button size="sm" variant="ghost" type="submit" className="text-xs text-green-800 font-bold hover:bg-green-100">
                      Mark Read ✓
                    </Button>
                  </form>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { broadcastNotificationAction } from "@/app/actions/adminActions"

export default async function AdminNotificationsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Broadcast System Alerts & Announcements</h1>
        <p className="text-sm text-slate-500 mt-1">Send official broadcast messages directly to registered Farmers and Staff</p>
      </div>

      <Card className="bg-white shadow-sm border-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-bold text-slate-900">Send New Broadcast Notification</CardTitle>
          <CardDescription className="text-xs text-slate-500">Delivered instantly to user mobile portals</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={broadcastNotificationAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="targetRole">Target Recipient Role *</Label>
              <select id="targetRole" name="targetRole" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white font-semibold">
                <option value="FARMER">All Registered Farmers</option>
                <option value="WORKER">All Mandi Staff / Workers</option>
                <option value="ALL">All System Users</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Notification Title *</Label>
              <Input id="title" name="title" required placeholder="e.g. MSP Season Rate Revision Announcement" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Broadcast Message Content *</Label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Write clear notification text..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none"
              ></textarea>
            </div>

            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black h-12 text-base">
              📢 Broadcast Notification Now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { auth } from "@/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  const services = [
    {
      title: "Online Slot Booking",
      desc: "Reserve a specific time slot at your preferred Mandi/Procurement Centre to drop off crops without waiting.",
      action: "Book Slot",
      link: `/${locale}/farmer/booking`,
      badge: "Farmer Service"
    },
    {
      title: "Digital Token & Live Queue Tracker",
      desc: "Track real-time token numbers and queue movement directly from your mobile phone.",
      action: "Track Queue",
      link: `/${locale}/farmer/queue`,
      badge: "Live Status"
    },
    {
      title: "Procurement Centre Locator",
      desc: "Search active Mandi procurement centres by State, District, capacity, and current operational status.",
      action: "Locate Centres",
      link: `/${locale}/centres`,
      badge: "Directory"
    },
    {
      title: "DBT Payment Status Tracking",
      desc: "Track Direct Benefit Transfer credits to your Aadhaar-linked bank account for completed procurements.",
      action: "Check Payments",
      link: `/${locale}/farmer/payments`,
      badge: "Financial"
    },
    {
      title: "Grievance Redressal Portal",
      desc: "Submit issues regarding slot allocation, quality grading, moisture disputes, or delayed payments.",
      action: "Raise Grievance",
      link: `/${locale}/farmer/grievances`,
      badge: "Support"
    },
    {
      title: "Centre Worker Portal",
      desc: "Dedicated interface for Mandi supervisors to manage token queues, verify weight, grade crops, and issue receipts.",
      action: "Worker Access",
      link: `/${locale}/worker/dashboard`,
      badge: "Staff Only"
    },
    {
      title: "Admin Headquarters Dashboard",
      desc: "System-wide procurement analytics, centre management, worker assignment, and broadcast alerts.",
      action: "Admin Access",
      link: `/${locale}/admin/dashboard`,
      badge: "HQ Portal"
    },
    {
      title: "Help Center & FAQs",
      desc: "Comprehensive helpline contacts, user guides, MSP rate lists, and frequently asked questions.",
      action: "Get Support",
      link: `/${locale}/help`,
      badge: "Information"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader session={session} />

      <main className="flex-grow py-12 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-green-950 tracking-tight">Kisan Portal Services Overview</h1>
          <p className="text-gray-600 mt-2 text-lg">Complete suite of digital services for farmers, mandi staff, and agricultural administrators</p>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow border-slate-200 flex flex-col justify-between">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{s.badge}</span>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{s.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-2">{s.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href={s.link}>
                  <Button className="w-full bg-green-900 hover:bg-green-800 text-white font-bold">
                    {s.action} →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader session={session} />

      <main className="flex-grow py-12 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-green-950 tracking-tight">How Kisan Portal Works</h1>
          <p className="text-gray-600 mt-2 text-lg">Comprehensive step-by-step guide for farmers to book slots, track tokens, and receive MSP payments.</p>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-12">
          {[
            {
              step: "Step 1",
              title: "Farmer Registration & Profile Setup",
              desc: "Register using your mobile number. Enter basic details including village, district, state, and registered land size in acres. Your phone number becomes your login ID.",
              details: ["Instant SMS OTP simulation", "Aadhaar / Land record linking optional for demo", "Select preferred regional language"],
              icon: "📝"
            },
            {
              step: "Step 2",
              title: "Slot Booking at Nearest Procurement Centre",
              desc: "Choose your crop type (Wheat, Paddy, Mustard, etc.), select your nearest Mandi/Procurement Centre, pick an available date, and choose a convenient time slot.",
              details: ["Real-time capacity tracking (e.g., 35 quintals/slot)", "Visual slot availability indicator", "Instant booking confirmation"],
              icon: "📅"
            },
            {
              step: "Step 3",
              title: "Digital Token & Live Queue Tracker",
              desc: "Upon booking, the system generates a unique Digital Token (e.g. TKN-KAR-124). You can track the live queue on your phone to see how many tokens are ahead of you.",
              details: ["View current token being served", "Estimated wait time calculations", "SMS alert when your turn is near"],
              icon: "🎫"
            },
            {
              step: "Step 4",
              title: "Produce Drop-Off & Quality Check",
              desc: "Visit the procurement centre at your allocated slot time. Centre workers will inspect gross weight, tare weight, moisture content, and crop quality grade.",
              details: ["Official MSP rate applied automatically", "Moisture standards verification (<=12%)", "Immediate digital receipt generation"],
              icon: "🌾"
            },
            {
              step: "Step 5",
              title: "Direct Benefit Transfer (DBT) Payment",
              desc: "Once procurement is approved by centre supervisor, payment is automatically initiated directly to your Aadhaar-linked bank account within 48 hours.",
              details: ["Complete transaction history on dashboard", "Track payment status (Initiated -> Processing -> Completed)", "Grievance redressal if any delay"],
              icon: "💳"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-green-900 text-yellow-400 font-black text-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                {item.icon}
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="bg-yellow-400 text-green-950 text-xs font-black px-2.5 py-0.5 rounded uppercase">{item.step}</span>
                  <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{item.desc}</p>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Key Highlights:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                    {item.details.map((d, i) => (
                      <li key={i} className="flex items-center space-x-1">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-green-900 to-green-800 text-white rounded-2xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Ready to Book Your Procurement Slot?</h2>
          <p className="text-green-100 text-sm mb-6 max-w-xl mx-auto">Get started now to avoid long queues at the Mandi and ensure smooth, transparent procurement.</p>
          <div className="flex justify-center gap-4">
            <Link href={`/${locale}/farmer/booking`}>
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black text-base px-8 h-12">
                Book Slot Now
              </Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button variant="outline" className="text-white border-white/50 hover:bg-green-700 font-bold px-6 h-12">
                Register as Farmer
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

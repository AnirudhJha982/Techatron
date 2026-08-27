import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  const faqs = [
    {
      q: "What is Mandi Marg and who can use it?",
      a: "Mandi Marg is an official digital platform built for Indian farmers to book procurement slots at government Mandis, track live token queues, and receive direct MSP payments into their bank accounts."
    },
    {
      q: "How do I book a slot for crop procurement?",
      a: "Log in with your phone number, click 'Book Slot', select your crop type, pick your nearest procurement centre, choose a date and time slot, and confirm. A digital token pass will be generated instantly."
    },
    {
      q: "What happens if I miss my allocated time slot?",
      a: "If you arrive after your time slot, you can request the centre worker to re-queue your token or book a new slot for the next available day."
    },
    {
      q: "How is the MSP (Minimum Support Price) payment calculated?",
      a: "Payment is computed based on Net Quantity (Gross Weight - Tare Weight) multiplied by the official government MSP rate for your crop grade. For Wheat Sharbati, current MSP is ₹2,275/Quintal."
    },
    {
      q: "How long does it take for payment to reach my bank account?",
      a: "Payments are disbursed via Direct Benefit Transfer (DBT) directly into your Aadhaar-linked bank account within 24 to 48 hours of quality approval."
    },
    {
      q: "What if there is a dispute regarding moisture percentage or quality grading?",
      a: "You can submit an immediate appeal to the Centre Officer on-site or raise an online Grievance through the Portal under the 'Grievances' section."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader session={session} />

      <main className="flex-grow py-12 container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-green-950 tracking-tight">Help & Support Center</h1>
          <p className="text-gray-600 mt-2 text-lg">Frequently Asked Questions, Helplines, and Grievance Assistance</p>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Emergency Helpline Banner */}
        <div className="bg-gradient-to-r from-green-900 to-green-800 text-white rounded-2xl p-6 shadow-md mb-10 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <span className="bg-yellow-400 text-green-950 text-xs font-black px-2.5 py-0.5 rounded uppercase">24/7 Helpline</span>
            <h3 className="text-2xl font-bold mt-1">Kisan Call Center Toll-Free</h3>
            <p className="text-green-100 text-xs mt-1">Available in 22 regional languages for instant phone assistance</p>
          </div>
          <div className="mt-4 sm:mt-0 text-center sm:text-right">
            <p className="text-3xl font-black text-yellow-400">1800-180-1551</p>
            <p className="text-xs text-green-200">Free Call across India</p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                <h3 className="text-base font-bold text-green-950 mb-2">Q: {faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grievance Prompt */}
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-amber-950">Have a specific issue or delayed payment?</h3>
            <p className="text-sm text-amber-800">Raise an official online grievance and track resolution status in real time.</p>
          </div>
          <Link href={`/${locale}/farmer/grievances`} className="mt-4 sm:mt-0">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6">
              Raise Grievance →
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

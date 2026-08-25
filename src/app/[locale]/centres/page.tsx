import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ProcurementCentre, Booking, WorkerProfile } from "@/models";
import { Button } from "@/components/ui/button";
import { translateCentre, translateState } from "@/lib/translateEntity";
import Link from "next/link";

export default async function CentresPage({ params, searchParams }: { params: Promise<{ locale: string }>, searchParams: Promise<{ query?: string, state?: string }> }) {
  const { locale } = await params;
  const { query, state } = await searchParams;
  const session = await auth();

  await connectToDatabase();

  const filter: any = { isActive: true };
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { district: { $regex: query, $options: 'i' } },
      { address: { $regex: query, $options: 'i' } }
    ];
  }
  if (state) {
    filter.state = state;
  }

  const rawCentres = await ProcurementCentre.find(filter).sort({ state: 1 }).lean();

  const centres = await Promise.all(
    rawCentres.map(async (c) => {
      const bookingsCount = await Booking.countDocuments({ centreId: c._id });
      const workersCount = await WorkerProfile.countDocuments({ centreId: c._id });
      return {
        id: c._id.toString(),
        name: c.name,
        state: c.state,
        district: c.district,
        address: c.address,
        capacityPerDay: c.capacityPerDay,
        bookingsCount,
        workersCount
      };
    })
  );

  const states = ["Haryana", "Maharashtra", "Punjab", "Rajasthan", "Uttar Pradesh"];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader session={session} />

      <main className="flex-grow py-12 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-green-950 tracking-tight">Accredited Procurement Centres Directory</h1>
          <p className="text-gray-600 mt-2 text-lg">Locate government grain markets (Mandis) and check slot capacity</p>
          <div className="w-20 h-1 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Search Centre or District</label>
              <input
                type="text"
                name="query"
                defaultValue={query || ''}
                placeholder="e.g. Karnal, Nashik, GT Road..."
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Filter by State</label>
              <select
                name="state"
                defaultValue={state || ''}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none bg-white"
              >
                <option value="">All States</option>
                {states.map(s => (
                  <option key={s} value={s}>{translateState(s, locale)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full bg-green-900 hover:bg-green-800 text-white font-bold h-11">
                🔍 Filter Mandis
              </Button>
            </div>
          </form>
        </div>

        {/* Centres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centres.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-4xl mb-2">🏢</p>
              <h3 className="text-lg font-bold text-gray-800">No procurement centres found</h3>
              <p className="text-gray-500 text-sm mt-1">Try broadening your search query or selecting "All States".</p>
            </div>
          ) : (
            centres.map(c => (
              <div key={c.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-yellow-400/20 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded border border-yellow-400/40">
                      {translateState(c.state, locale)}
                    </span>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      ● Active
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1">{translateCentre(c.name, locale)}</h3>
                  <p className="text-xs text-gray-500 font-medium mb-3">District: {c.district}</p>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{c.address}</p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Daily Capacity:</span>
                      <strong className="text-gray-900">{c.capacityPerDay} Quintals</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Staff On Duty:</span>
                      <strong className="text-gray-900">{c.workersCount} Supervisors</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Bookings:</span>
                      <strong className="text-green-700">{c.bookingsCount} Farmers</strong>
                    </div>
                  </div>
                </div>

                <Link href={`/${locale}/farmer/booking?centreId=${c.id}`}>
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-green-950 font-black">
                    📅 Book Slot at this Centre
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

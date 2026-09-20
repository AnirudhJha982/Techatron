import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Booking, Procurement, FarmerProfile, WorkerProfile, ProcurementCentre } from '@/models';

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const since = parseInt(url.searchParams.get('since') || '0', 10);
  const sinceDate = new Date(since);

  try {
    await connectToDatabase();
    const data: any = {
      bookings: [],
      procurements: [],
      centres: []
    };

    if (session.user.role === 'FARMER') {
      const farmerProfile = await FarmerProfile.findOne({ userId: session.user.id });
      if (farmerProfile) {
        data.bookings = await Booking.find({
          farmerId: farmerProfile._id,
          updatedAt: { $gte: sinceDate }
        }).lean();
      }
    } else if (session.user.role === 'WORKER') {
      const workerProfile = await WorkerProfile.findOne({ userId: session.user.id });
      if (workerProfile) {
        data.procurements = await Procurement.find({
          workerId: workerProfile._id,
          updatedAt: { $gte: sinceDate }
        }).lean();
      }
    }

    // Always sync centres if needed
    data.centres = await ProcurementCentre.find({ isActive: true }).lean();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

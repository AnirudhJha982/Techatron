import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createBooking } from '@/app/actions/booking';

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const operations = body.operations || [];
    const results = [];

    for (const op of operations) {
      try {
        if (op.operation === 'CREATE' && op.entity === 'BOOKING') {
          const { slotId, centreId, date } = op.payload;
          const result = await createBooking(slotId, centreId, date, op.operationId);
          results.push({ operationId: op.operationId, status: 'SYNCED', data: result });
        } else {
          // Additional operation handlers go here...
          results.push({ operationId: op.operationId, status: 'FAILED', error: 'Unsupported operation' });
        }
      } catch (err: any) {
        console.error(`Error processing operation ${op.operationId}:`, err);
        results.push({ operationId: op.operationId, status: 'FAILED', error: err.message });
      }
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

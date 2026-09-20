import { connectToDatabase } from './src/lib/mongodb';
import { Procurement } from './src/models/Procurement';
import { Booking } from './src/models/Booking';
import { FarmerProfile } from './src/models/FarmerProfile';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  await connectToDatabase();
  console.log("Connected");
  const procs = await Procurement.find({}).lean();
  let total = 0;
  for (const p of procs) {
    total += p.quantity;
  }
  console.log("Total Procurements Quantity in DB:", total);
  
  const farmers = await FarmerProfile.find({}).lean();
  for (const f of farmers) {
    const bookings = await Booking.find({ farmerId: f._id }).lean();
    const bIds = bookings.map(b => b._id);
    const fProcs = await Procurement.find({ bookingId: { $in: bIds } }).lean();
    const fTotal = fProcs.reduce((acc, p) => acc + p.quantity, 0);
    if (fTotal > 0) {
      console.log(`Farmer ${f.farmerId} has ${fTotal} Qtl`);
    }
  }
  process.exit(0);
}
check();

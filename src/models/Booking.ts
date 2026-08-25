import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBooking extends Document {
  farmerId: mongoose.Types.ObjectId
  centreId: mongoose.Types.ObjectId
  slotId: mongoose.Types.ObjectId
  date: Date
  tokenNumber: string
  queuePosition?: number
  status: 'SCHEDULED' | 'ARRIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true, index: true },
    centreId: { type: Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true, index: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'Slot', required: true, index: true },
    date: { type: Date, required: true, index: true },
    tokenNumber: { type: String, required: true, unique: true, index: true },
    queuePosition: { type: Number },
    status: {
      type: String,
      enum: ['SCHEDULED', 'ARRIVED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      index: true
    }
  },
  { timestamps: true }
)

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)

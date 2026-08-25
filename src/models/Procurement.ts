import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProcurement extends Document {
  bookingId: mongoose.Types.ObjectId
  workerId: mongoose.Types.ObjectId
  crop: string
  quantity: number
  qualityGrade: string
  moistureLevel?: number
  status: 'PENDING' | 'GRADED' | 'APPROVED' | 'REJECTED'
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

const ProcurementSchema = new Schema<IProcurement>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile', required: true, index: true },
    crop: { type: String, required: true },
    quantity: { type: Number, required: true },
    qualityGrade: { type: String, required: true },
    moistureLevel: { type: Number },
    status: {
      type: String,
      enum: ['PENDING', 'GRADED', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    remarks: { type: String }
  },
  { timestamps: true }
)

export const Procurement: Model<IProcurement> =
  mongoose.models.Procurement || mongoose.model<IProcurement>('Procurement', ProcurementSchema)

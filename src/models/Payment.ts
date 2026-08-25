import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPayment extends Document {
  procurementId: mongoose.Types.ObjectId
  farmerId: mongoose.Types.ObjectId
  amount: number
  mspRatePerQuintal: number
  bankAccountMasked: string
  ifscCode: string
  transactionId: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  paymentDate?: Date
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    procurementId: { type: Schema.Types.ObjectId, ref: 'Procurement', required: true, unique: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true, index: true },
    amount: { type: Number, required: true },
    mspRatePerQuintal: { type: Number, required: true },
    bankAccountMasked: { type: String, required: true },
    ifscCode: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    paymentDate: { type: Date }
  },
  { timestamps: true }
)

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)

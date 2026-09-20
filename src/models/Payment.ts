import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPayment extends Document {
  procurementId: mongoose.Types.ObjectId
  farmerId: mongoose.Types.ObjectId
  amount: number
  operationId?: string
  mspRatePerQuintal: number
  bankAccountMasked: string
  ifscCode: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  transactionId?: string
  paymentDate?: Date
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    procurementId: { type: Schema.Types.ObjectId, ref: 'Procurement', required: true, unique: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: 'FarmerProfile', required: true, index: true },
    amount: { type: Number, required: true },
    operationId: { type: String, sparse: true, unique: true, index: true },
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

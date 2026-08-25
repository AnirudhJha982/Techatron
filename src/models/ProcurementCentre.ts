import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProcurementCentre extends Document {
  name: string
  state: string
  district: string
  address: string
  capacityPerDay: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ProcurementCentreSchema = new Schema<IProcurementCentre>(
  {
    name: { type: String, required: true },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    address: { type: String, required: true },
    capacityPerDay: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
)

export const ProcurementCentre: Model<IProcurementCentre> =
  mongoose.models.ProcurementCentre || mongoose.model<IProcurementCentre>('ProcurementCentre', ProcurementCentreSchema)

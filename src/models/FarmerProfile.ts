import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFarmerProfile extends Document {
  userId: mongoose.Types.ObjectId
  address?: string
  village?: string
  district?: string
  state?: string
  landSizeAcres?: number
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    address: { type: String },
    village: { type: String },
    district: { type: String },
    state: { type: String },
    landSizeAcres: { type: Number }
  },
  { timestamps: true }
)

export const FarmerProfile: Model<IFarmerProfile> =
  mongoose.models.FarmerProfile || mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema)

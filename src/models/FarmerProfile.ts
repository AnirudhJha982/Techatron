import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFarmerProfile extends Document {
  userId: mongoose.Types.ObjectId
  address?: string
  village?: string
  district?: string
  state?: string
  landSizeAcres?: number
  farmerId?: string
  mobileVerified: boolean
  farmerIdVerified: boolean
  kycStatus: 'NOT_VERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  bankAccountName?: string
  bankName?: string
  bankAccountMasked?: string
  ifscCode?: string
  bankDetailsVerified: boolean
  bookingEligible: boolean
  verificationCompletedAt?: Date
}

const FarmerProfileSchema = new Schema<IFarmerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    address: { type: String },
    village: { type: String },
    district: { type: String },
    state: { type: String },
    landSizeAcres: { type: Number },
    farmerId: { type: String },
    mobileVerified: { type: Boolean, default: true },
    farmerIdVerified: { type: Boolean, default: false },
    kycStatus: { 
      type: String, 
      enum: ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'], 
      default: 'NOT_VERIFIED' 
    },
    bankAccountName: { type: String },
    bankName: { type: String },
    bankAccountMasked: { type: String },
    ifscCode: { type: String },
    bankDetailsVerified: { type: Boolean, default: false },
    bookingEligible: { type: Boolean, default: false },
    verificationCompletedAt: { type: Date }
  },
  { timestamps: true }
)

export const FarmerProfile: Model<IFarmerProfile> =
  mongoose.models.FarmerProfile || mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema)

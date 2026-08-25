import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAdminProfile extends Document {
  userId: mongoose.Types.ObjectId
  department?: string
}

const AdminProfileSchema = new Schema<IAdminProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    department: { type: String }
  },
  { timestamps: true }
)

export const AdminProfile: Model<IAdminProfile> =
  mongoose.models.AdminProfile || mongoose.model<IAdminProfile>('AdminProfile', AdminProfileSchema)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  phoneNumber?: string
  username?: string
  passwordHash: string
  role: 'FARMER' | 'WORKER' | 'ADMIN'
  language: string
  isManualLanguage: boolean
  preferredLanguage?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, unique: true, sparse: true, index: true },
    username: { type: String, unique: true, sparse: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['FARMER', 'WORKER', 'ADMIN'], default: 'FARMER' },
    language: { type: String, default: 'en' },
    isManualLanguage: { type: Boolean, default: false },
    preferredLanguage: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

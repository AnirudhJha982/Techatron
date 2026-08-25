import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  phoneNumber: string
  passwordHash: string
  role: 'FARMER' | 'WORKER' | 'ADMIN'
  language: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['FARMER', 'WORKER', 'ADMIN'], default: 'FARMER' },
    language: { type: String, default: 'en' }
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  message: string
  category: string
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
)

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)

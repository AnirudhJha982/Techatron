import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId
  action: string
  details: string
  createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    details: { type: String, required: true }
  },
  { timestamps: true }
)

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)

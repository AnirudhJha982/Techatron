import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IGrievance extends Document {
  userId: mongoose.Types.ObjectId
  category: string
  description: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  response?: string
  createdAt: Date
  updatedAt: Date
}

const GrievanceSchema = new Schema<IGrievance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'SUBMITTED',
      index: true
    },
    response: { type: String }
  },
  { timestamps: true }
)

export const Grievance: Model<IGrievance> =
  mongoose.models.Grievance || mongoose.model<IGrievance>('Grievance', GrievanceSchema)

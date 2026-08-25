import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IWorkerProfile extends Document {
  userId: mongoose.Types.ObjectId
  centreId: mongoose.Types.ObjectId
}

const WorkerProfileSchema = new Schema<IWorkerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    centreId: { type: Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true, index: true }
  },
  { timestamps: true }
)

export const WorkerProfile: Model<IWorkerProfile> =
  mongoose.models.WorkerProfile || mongoose.model<IWorkerProfile>('WorkerProfile', WorkerProfileSchema)

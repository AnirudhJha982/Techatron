import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISlot extends Document {
  centreId: mongoose.Types.ObjectId
  date: Date
  timeSlot: string
  capacity: number
  bookedCount: number
}

const SlotSchema = new Schema<ISlot>(
  {
    centreId: { type: Schema.Types.ObjectId, ref: 'ProcurementCentre', required: true, index: true },
    date: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true },
    capacity: { type: Number, required: true, default: 35 },
    bookedCount: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
)

SlotSchema.index({ centreId: 1, date: 1, timeSlot: 1 }, { unique: true })

export const Slot: Model<ISlot> =
  mongoose.models.Slot || mongoose.model<ISlot>('Slot', SlotSchema)

import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailableDate extends Document {
  date: string;
  timeSlots: string[];
}

const AvailableDateSchema = new Schema<IAvailableDate>({
  date: { type: String, required: true, unique: true },
  timeSlots: [{ type: String, required: true }]
}, { timestamps: true });

export default mongoose.model<IAvailableDate>('AvailableDate', AvailableDateSchema);

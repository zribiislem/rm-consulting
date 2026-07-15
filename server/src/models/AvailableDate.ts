import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailableDate extends Document {
  date: Date;
  timeSlots: string[];
}

const AvailableDateSchema = new Schema<IAvailableDate>({
  date: { type: Date, required: true, unique: true },
  timeSlots: { type: [String], default: ['Matin (09:00 - 12:00)', 'Après-midi (14:00 - 17:00)'] }
}, { timestamps: true });

export default mongoose.model<IAvailableDate>('AvailableDate', AvailableDateSchema);

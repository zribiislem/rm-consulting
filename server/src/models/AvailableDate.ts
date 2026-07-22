import mongoose, { Document, Schema } from 'mongoose';

export interface IAvailableDate extends Document {
  date: string;
  startTime: string;
  endTime: string;
  timeSlots: string[];
}

const AvailableDateSchema = new Schema<IAvailableDate>({
  date: { type: String, required: true, unique: true },
  startTime: { type: String, default: '08:00' },
  endTime: { type: String, default: '18:00' },
  timeSlots: [{ type: String }]
}, { timestamps: true });

export function generateSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  while (startMin + 30 <= endMin) {
    const slotEnd = startMin + 30;
    const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    slots.push(`${fmt(startMin)} - ${fmt(slotEnd)}`);
    startMin += 60;
  }

  return slots;
}

export default mongoose.model<IAvailableDate>('AvailableDate', AvailableDateSchema);

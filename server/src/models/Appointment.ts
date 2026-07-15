import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  clientName: string;
  email: string;
  date: Date;
  timeSlot: string;
  subject: string;
  details: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const AppointmentSchema = new Schema<IAppointment>({
  clientName: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  subject: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);

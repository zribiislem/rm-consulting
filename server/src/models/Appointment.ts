import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  clientName: string;
  email: string;
  date: string;
  timeSlot: string;
  subject: string;
  details: string;
  status: string;
}

const AppointmentSchema = new Schema<IAppointment>({
  clientName: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  subject: { type: String, default: '' },
  details: { type: String, default: '' },
  status: { type: String, default: 'EN ATTENTE' }
}, { timestamps: true });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);

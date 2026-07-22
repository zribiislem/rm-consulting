import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  position: string;
  education: string;
  cvUrl: string;
  experience?: string;
  address?: string;
  coverLetterUrl?: string;
  motivationMessage?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
}

const JobApplicationSchema = new Schema<IJobApplication>({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  education: { type: String, required: true },
  cvUrl: { type: String, required: true },
  experience: { type: String, default: '' },
  address: { type: String, default: '' },
  coverLetterUrl: { type: String, default: '' },
  motivationMessage: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

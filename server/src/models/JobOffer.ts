import mongoose, { Document, Schema } from 'mongoose';

export interface IJobOffer extends Document {
  title: string;
  department: string;
  location: string;
  contractType: string;
  description: string;
  requiredSkills: string[];
  applicationDeadline: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobOfferSchema = new Schema<IJobOffer>({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  contractType: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  applicationDeadline: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IJobOffer>('JobOffer', JobOfferSchema);

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAttachment {
  filename: string;
  originalName: string;
  url: string;
  type: 'cv' | 'coverLetter' | 'certificate';
  size: number;
}

export interface INote {
  text: string;
  addedBy: string;
  createdAt: Date;
}

export type ApplicationStatus = 'new' | 'analyzing' | 'interview' | 'accepted' | 'rejected';

export interface IJobApplication extends Document {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  position: string;
  education: string;
  experience: string;
  address: string;
  motivationMessage: string;
  attachments: IAttachment[];
  status: ApplicationStatus;
  notes: INote[];
  jobOffer?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['cv', 'coverLetter', 'certificate'], required: true },
  size: { type: Number, required: true },
}, { _id: false });

const NoteSchema = new Schema<INote>({
  text: { type: String, required: true },
  addedBy: { type: String, default: 'Administrateur' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const JobApplicationSchema = new Schema<IJobApplication>({
  lastName: { type: String, required: true, trim: true },
  firstName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
  },
  phone: {
    type: String,
    required: true,
    match: [/^[\d\s+\-().]{8,20}$/, 'Numéro de téléphone invalide'],
  },
  position: { type: String, required: true },
  education: { type: String, required: true },
  experience: { type: String, default: '' },
  address: { type: String, default: '' },
  motivationMessage: { type: String, default: '' },
  attachments: { type: [AttachmentSchema], default: [] },
  status: {
    type: String,
    enum: ['new', 'analyzing', 'interview', 'accepted', 'rejected'],
    default: 'new',
  },
  notes: { type: [NoteSchema], default: [] },
  jobOffer: { type: Schema.Types.ObjectId, ref: 'JobOffer' },
}, { timestamps: true });

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

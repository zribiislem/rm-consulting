import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Candidature (collection "Candidatures").
 * - `candidate` : référence obligatoire vers la fiche candidat (collection Candidats).
 * - `attachments` : références vers les pièces jointes (collection Pièces jointes).
 * - `status` : statut courant, `statusHistory` : historique des changements de statut.
 * Les champs lastName/firstName/email/phone... sont dénormalisés pour un affichage
 * rapide dans le tableau de bord (le candidat lié reste la source de vérité).
 */

export type ApplicationStatus = 'new' | 'analyzing' | 'interview' | 'accepted' | 'rejected';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'new',
  'analyzing',
  'interview',
  'accepted',
  'rejected',
];

export interface IStatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: Date;
  note?: string;
}

export interface INote {
  text: string;
  addedBy: string;
  createdAt: Date;
}

export interface IJobApplication extends Document {
  candidate: Types.ObjectId;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  position: string;
  education: string;
  experience: string;
  address: string;
  motivationMessage: string;
  attachments: Types.ObjectId[];
  status: ApplicationStatus;
  statusHistory: IStatusHistoryEntry[];
  notes: INote[];
  jobOffer?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistoryEntrySchema = new Schema<IStatusHistoryEntry>({
  status: { type: String, enum: APPLICATION_STATUSES, required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String },
}, { _id: false });

const NoteSchema = new Schema<INote>({
  text: { type: String, required: true, maxlength: 2000 },
  addedBy: { type: String, default: 'Administrateur' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const JobApplicationSchema = new Schema<IJobApplication>({
  candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
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
  attachments: [{ type: Schema.Types.ObjectId, ref: 'Attachment' }],
  status: {
    type: String,
    enum: APPLICATION_STATUSES,
    default: 'new',
  },
  statusHistory: { type: [StatusHistoryEntrySchema], default: [] },
  notes: { type: [NoteSchema], default: [] },
  jobOffer: { type: Schema.Types.ObjectId, ref: 'JobOffer' },
}, { timestamps: true });

JobApplicationSchema.index({ createdAt: -1 });
JobApplicationSchema.index({ status: 1 });
JobApplicationSchema.index({ position: 1 });
JobApplicationSchema.index({ email: 1 });

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

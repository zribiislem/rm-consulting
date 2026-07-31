import mongoose, { Document, Schema } from 'mongoose';

/**
 * Fiche candidat (collection "Candidats").
 * Une candidature (JobApplication) est toujours liée à un candidat via `candidateId`.
 * Le profil du candidat est mis à jour à chaque nouvelle candidature (dernières infos).
 */
export interface ICandidate extends Document {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  address?: string;
  education?: string;
  experience?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    lastName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
    },
    phone: {
      type: String,
      required: true,
      match: [/^[\d\s+\-().]{8,20}$/, 'Numéro de téléphone invalide'],
    },
    address: { type: String, default: '' },
    education: { type: String, default: '' },
    experience: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);

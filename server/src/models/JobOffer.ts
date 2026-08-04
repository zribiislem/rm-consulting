import mongoose, { Document, Schema } from 'mongoose';

/**
 * Offre d'emploi (collection "OffresEmploi").
 * - `status` : brouillon (draft) / publiée (published) / fermée (closed).
 * - `publishedAt` : date de publication (mise à jour automatiquement au passage en "published").
 * - `applicationDeadline` : date d'expiration optionnelle (aucune = offre ouverte).
 */

export type OfferStatus = 'draft' | 'published' | 'closed';

export const OFFER_STATUSES: OfferStatus[] = ['draft', 'published', 'closed'];

export const OFFER_DEPARTMENTS = [
  'Expertise Comptable',
  'Audit',
  'Fiscalité',
  'Conseil',
  'Administratif',
  'Autre',
];

export const OFFER_CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];

export interface IJobOffer extends Document {
  title: string;
  department: string;
  contractType: string;
  location: string;
  description: string;
  /** Missions principales (liste de puces). */
  missions: string[];
  /** Compétences recherchées (liste de puces). */
  skills: string[];
  /** Profil recherché (texte détaillé). */
  profile: string;
  /** Niveau d'étude requis. */
  educationLevel: string;
  /** Expérience requise. */
  requiredExperience: string;
  /** Avantages (liste de puces, optionnel). */
  benefits: string[];
  status: OfferStatus;
  /** Date de publication. */
  publishedAt: Date;
  /** Date d'expiration (optionnelle). */
  applicationDeadline?: Date;
  /** Nombre de postes disponibles (optionnel). */
  openPositions?: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobOfferSchema = new Schema<IJobOffer>({
  title: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  contractType: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  missions: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  profile: { type: String, default: '' },
  educationLevel: { type: String, default: '' },
  requiredExperience: { type: String, default: '' },
  benefits: { type: [String], default: [] },
  status: { type: String, enum: OFFER_STATUSES, default: 'draft' },
  publishedAt: { type: Date, default: new Date() },
  applicationDeadline: { type: Date },
  openPositions: { type: Number, min: 0 },
}, { timestamps: true });

JobOfferSchema.index({ status: 1 });
JobOfferSchema.index({ department: 1 });

export default mongoose.model<IJobOffer>('JobOffer', JobOfferSchema);

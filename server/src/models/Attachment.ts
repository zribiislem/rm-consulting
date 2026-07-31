import mongoose, { Document, Schema } from 'mongoose';

/**
 * Pièce jointe (collection "Pièces jointes") : CV, lettre de motivation, certificats.
 * Les fichiers sont stockés sur le disque (uploads/applications) et protégés
 * par une route de téléchargement authentifiée.
 */
export type AttachmentType = 'cv' | 'coverLetter' | 'certificate';

export interface IAttachment extends Document {
  filename: string;
  originalName: string;
  url: string;
  type: AttachmentType;
  size: number;
  mimeType: string;
  createdAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['cv', 'coverLetter', 'certificate'], required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAttachment>('Attachment', AttachmentSchema);

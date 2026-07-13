import mongoose, { Document, Schema } from 'mongoose';

export interface IMission extends Document {
  title: string;
  client: string;
  department: 'Audit Légal' | 'Conseil' | 'Comptabilité' | 'Juridique' | 'Fiscalité';
  status: string;
  progression: number;
}

const MissionSchema = new Schema<IMission>({
  title: { type: String, required: true },
  client: { type: String, required: true },
  department: {
    type: String,
    required: true,
    enum: ['Audit Légal', 'Conseil', 'Comptabilité', 'Juridique', 'Fiscalité']
  },
  status: { type: String, required: true, default: 'EN PRÉPARATION' },
  progression: { type: Number, required: true, default: 0, min: 0, max: 100 }
}, { timestamps: true });

export default mongoose.model<IMission>('Mission', MissionSchema);

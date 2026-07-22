import mongoose, { Document, Schema } from 'mongoose';

export interface IParameter extends Document {
  key: string;
  value: string;
  order: number;
}

const ParameterSchema = new Schema<IParameter>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IParameter>('Parameter', ParameterSchema);
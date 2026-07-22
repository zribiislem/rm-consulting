import mongoose, { Document, Schema } from 'mongoose';

export interface IReference extends Document {
  name: string;
  category: string;
  order: number;
  imageUrl: string;
}

const ReferenceSchema = new Schema<IReference>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  order: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IReference>('Reference', ReferenceSchema);

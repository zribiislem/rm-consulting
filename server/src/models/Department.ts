import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description: string;
  head: string;
  staffCount: number;
  activeProjects: number;
  services: string[];
  imageUrl: string;
}

const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  head: { type: String, required: true },
  staffCount: { type: Number, required: true, default: 0 },
  activeProjects: { type: Number, required: true, default: 0 },
  services: [{ type: String, required: true }],
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);

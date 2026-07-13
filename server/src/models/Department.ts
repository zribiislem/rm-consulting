import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description: string;
  head: string;
  staffCount: number;
  activeProjects: number;
  services: string[];
}

const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  head: { type: String, required: true },
  staffCount: { type: Number, required: true, default: 0 },
  activeProjects: { type: Number, required: true, default: 0 },
  services: [{ type: String, required: true }]
}, { timestamps: true });

export default mongoose.model<IDepartment>('Department', DepartmentSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IProgram extends Document {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  notes: string;
}

const ProgramSchema = new Schema<IProgram>({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  description: { type: String, default: '', maxlength: 5000 },
  date: { type: String, required: true, trim: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  notes: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true });

ProgramSchema.index({ date: 1, startTime: 1 });

export default mongoose.model<IProgram>('Program', ProgramSchema);

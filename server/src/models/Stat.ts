import mongoose from 'mongoose';

const statSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
});

export default mongoose.model('Stat', statSchema);

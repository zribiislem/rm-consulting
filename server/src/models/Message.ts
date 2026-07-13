import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
  time: string;
  content: string;
  isUnread: boolean;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  role: { type: String, required: true },
  avatarUrl: { type: String },
  initials: { type: String },
  time: { type: String, required: true },
  content: { type: String, required: true },
  isUnread: { type: Boolean, required: true, default: true }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);

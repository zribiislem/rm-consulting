import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
  time: string;
  content: string;
  isUnread: boolean;
  parentId?: string;
  email?: string;
  status: 'new' | 'processing' | 'done';
  archived?: boolean;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  role: { type: String, required: true },
  avatarUrl: { type: String },
  initials: { type: String },
  time: { type: String, required: true },
  content: { type: String, required: true },
  isUnread: { type: Boolean, required: true, default: true },
  parentId: { type: String, default: null },
  email: { type: String, default: null },
  status: { type: String, enum: ['new', 'processing', 'done'], default: 'new' },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IMessage>('Message', MessageSchema);

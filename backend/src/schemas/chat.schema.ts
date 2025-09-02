import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointment?: Types.ObjectId;

  @Prop({
    type: [{
      sender: { type: Types.ObjectId, required: true },
      senderType: { type: String, enum: ['Patient', 'Doctor'], required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, required: true },
      messageType: { type: String, enum: ['text', 'image', 'file', 'audio', 'video'], default: 'text' },
      attachments: [{
        filename: String,
        path: String,
        type: String,
        size: Number
      }],
      isRead: { type: Boolean, default: false },
      isEdited: { type: Boolean, default: false },
      editedAt: Date,
      replyTo: String
    }],
    default: []
  })
  messages: Array<{
    sender: Types.ObjectId;
    senderType: 'Patient' | 'Doctor';
    message: string;
    timestamp: Date;
    messageType: 'text' | 'image' | 'file' | 'audio' | 'video';
    attachments?: Array<{
      filename: string;
      path: string;
      type: string;
      size: number;
    }>;
    isRead: boolean;
    isEdited?: boolean;
    editedAt?: Date;
    replyTo?: string;
  }>;

  @Prop({
    enum: ['Active', 'Closed', 'Archived'],
    default: 'Active'
  })
  status: string;

  @Prop({
    type: {
      content: String,
      timestamp: Date,
      sender: Types.ObjectId,
      senderType: { type: String, enum: ['Patient', 'Doctor'] }
    }
  })
  lastMessage?: {
    content: string;
    timestamp: Date;
    sender: Types.ObjectId;
    senderType: 'Patient' | 'Doctor';
  };

  @Prop({
    type: {
      patient: { type: Number, default: 0 },
      doctor: { type: Number, default: 0 }
    },
    default: { patient: 0, doctor: 0 }
  })
  unreadCount: {
    patient: number;
    doctor: number;
  };

  @Prop()
  subject?: string;

  @Prop({
    enum: ['General', 'Emergency', 'Follow-up', 'Prescription', 'Lab Results'],
    default: 'General'
  })
  category: string;

  @Prop({
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  })
  priority: string;

  @Prop({ default: false })
  isEmergency: boolean;

  @Prop()
  tags?: string[];

  @Prop()
  closedAt?: Date;

  @Prop()
  closedBy?: Types.ObjectId;

  @Prop()
  archivedAt?: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Create indexes for better performance
ChatSchema.index({ patient: 1 });
ChatSchema.index({ doctor: 1 });
ChatSchema.index({ appointment: 1 });
ChatSchema.index({ status: 1 });
ChatSchema.index({ category: 1 });
ChatSchema.index({ priority: 1 });
ChatSchema.index({ isEmergency: 1 });
ChatSchema.index({ patient: 1, doctor: 1 });
ChatSchema.index({ 'lastMessage.timestamp': -1 });
ChatSchema.index({ createdAt: -1 });

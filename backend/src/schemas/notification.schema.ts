import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, required: true })
  recipient: Types.ObjectId;

  @Prop({ 
    enum: ['Patient', 'Doctor'], 
    required: true 
  })
  recipientType: string;

  @Prop({ type: Types.ObjectId })
  sender?: Types.ObjectId;

  @Prop({ 
    enum: ['Patient', 'Doctor', 'System'], 
    default: 'System' 
  })
  senderType: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    enum: [
      'appointment_booked',
      'appointment_confirmed',
      'appointment_cancelled',
      'appointment_reminder',
      'prescription_ready',
      'message_received',
      'payment_received',
      'profile_updated',
      'system_maintenance',
      'emergency_alert',
      'video_call_request',
      'video_call_accepted',
      'video_call_rejected',
      'video_call_ended'
    ],
    required: true
  })
  type: string;

  @Prop({
    type: {
      entityType: { type: String, enum: ['Appointment', 'Prescription', 'Chat', 'MedicalRecord'] },
      entityId: Types.ObjectId
    }
  })
  relatedEntity?: {
    entityType: 'Appointment' | 'Prescription' | 'Chat' | 'MedicalRecord';
    entityId: Types.ObjectId;
  };

  @Prop({
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  })
  priority: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop({ default: false })
  isEmailSent: boolean;

  @Prop({ default: false })
  isSMSSent: boolean;

  @Prop({ default: false })
  isPushSent: boolean;

  @Prop()
  scheduledFor?: Date;

  @Prop({ default: false })
  isSent: boolean;

  @Prop()
  sentAt?: Date;

  @Prop()
  actionUrl?: string;

  @Prop()
  actionText?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Create indexes for better performance
NotificationSchema.index({ recipient: 1 });
NotificationSchema.index({ recipientType: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ isSent: 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

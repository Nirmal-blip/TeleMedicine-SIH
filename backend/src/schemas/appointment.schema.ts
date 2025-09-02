import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  time: string;

  @Prop({ 
    enum: ['Pending', 'Confirmed', 'Completed', 'Canceled', 'Rescheduled'], 
    default: 'Pending' 
  })
  status: string;

  @Prop({ required: true })
  reason: string;

  @Prop()
  notes?: string;

  @Prop({ 
    enum: ['Online', 'In-Person'], 
    default: 'Online' 
  })
  type: string;

  @Prop()
  meetingLink?: string;

  @Prop()
  prescription?: string;

  @Prop()
  diagnosis?: string;

  @Prop()
  followUpDate?: Date;

  @Prop()
  consultationFee?: number;

  @Prop({ 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  })
  paymentStatus: string;

  @Prop()
  cancelReason?: string;

  @Prop()
  rating?: number;

  @Prop()
  review?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Create indexes for better performance
AppointmentSchema.index({ doctor: 1 });
AppointmentSchema.index({ patient: 1 });
AppointmentSchema.index({ date: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ type: 1 });
AppointmentSchema.index({ paymentStatus: 1 });
AppointmentSchema.index({ doctor: 1, date: 1 });
AppointmentSchema.index({ patient: 1, date: 1 });
AppointmentSchema.index({ createdAt: -1 });

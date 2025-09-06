import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema({ timestamps: true })
export class Doctor {
  @Prop({ required: true, unique: true })
  doctorId: string;

  @Prop({ required: true })
  fullname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true, enum: ['Male', 'Female', 'Other'] })
  gender: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true, unique: true })
  medicalRegNo: string;

  @Prop({ required: true })
  specialization: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  profileImage?: string;

  @Prop()
  qualification?: string;

  @Prop()
  experience?: number; // years of experience

  @Prop()
  consultationFee?: number;

  @Prop({
    type: [{
      day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      startTime: { type: String },
      endTime: { type: String }
    }],
    default: []
  })
  availability?: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;

  @Prop()
  about?: string;

  @Prop({ default: 4.5 })
  rating?: number;

  @Prop({ default: 0 })
  totalRatings?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  lastLogin?: Date;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

// Create indexes for better performance
// Email, doctorId and medicalRegNo unique indexes are already created by @Prop({ unique: true })
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ location: 1 });
DoctorSchema.index({ isActive: 1 });
DoctorSchema.index({ isVerified: 1 });
DoctorSchema.index({ rating: -1 });
DoctorSchema.index({ consultationFee: 1 });
DoctorSchema.index({ createdAt: -1 });

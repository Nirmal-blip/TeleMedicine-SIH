import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true })
export class Patient {
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

  @Prop({ required: true })
  password: string;

  @Prop()
  profileImage?: string;

  @Prop({
    type: {
      name: String,
      phone: String,
      relationship: String
    }
  })
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  @Prop()
  bloodGroup?: string;

  @Prop([String])
  allergies?: string[];

  @Prop()
  height?: number; // in cm

  @Prop()
  weight?: number; // in kg

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

// Create indexes for better performance
// Email unique index is already created by @Prop({ unique: true })
PatientSchema.index({ phone: 1 });
PatientSchema.index({ isActive: 1 });
PatientSchema.index({ location: 1 });
PatientSchema.index({ bloodGroup: 1 });
PatientSchema.index({ createdAt: -1 });

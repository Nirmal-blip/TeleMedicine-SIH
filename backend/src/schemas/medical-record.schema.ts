import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & Document;

@Schema({ timestamps: true })
export class MedicalRecord {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointment?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  diagnosis?: string;

  @Prop()
  symptoms?: string[];

  @Prop({
    type: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      oxygenSaturation: Number
    }
  })
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
  };

  @Prop({
    type: [{
      name: { type: String },
      dosage: { type: String },
      frequency: { type: String },
      duration: { type: String }
    }],
    default: []
  })
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;

  @Prop({
    type: [{
      testName: { type: String },
      result: { type: String },
      normalRange: { type: String },
      date: { type: Date }
    }],
    default: []
  })
  labResults?: Array<{
    testName: string;
    result: string;
    normalRange: string;
    date: Date;
  }>;

  @Prop({
    type: [{
      filename: { type: String },
      path: { type: String },
      type: { type: String },
      uploadDate: { type: Date }
    }],
    default: []
  })
  attachments?: Array<{
    filename: string;
    path: string;
    type: string;
    uploadDate: Date;
  }>;

  @Prop({
    enum: ['Emergency', 'High', 'Medium', 'Low'],
    default: 'Medium'
  })
  priority: string;

  @Prop({
    enum: ['Active', 'Resolved', 'Ongoing'],
    default: 'Active'
  })
  status: string;

  @Prop()
  followUpRequired?: boolean;

  @Prop()
  followUpDate?: Date;

  @Prop()
  notes?: string;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

// Create indexes for better performance
MedicalRecordSchema.index({ patient: 1 });
MedicalRecordSchema.index({ doctor: 1 });
MedicalRecordSchema.index({ appointment: 1 });
MedicalRecordSchema.index({ status: 1 });
MedicalRecordSchema.index({ priority: 1 });
MedicalRecordSchema.index({ patient: 1, createdAt: -1 });
MedicalRecordSchema.index({ doctor: 1, createdAt: -1 });
MedicalRecordSchema.index({ createdAt: -1 });

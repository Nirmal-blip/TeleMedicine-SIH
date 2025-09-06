import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrescriptionDocument = Prescription & Document;

@Schema({ timestamps: true })
export class Prescription {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patient: Types.ObjectId;

  @Prop({ required: true })
  patientId: string; // Custom patient ID like PAT2024000001 for easy querying

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Appointment' })
  appointment?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  prescriptionNumber: string;

  @Prop({
    type: [{
      name: { type: String, required: true },
      genericName: { type: String },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      instructions: { type: String },
      quantity: { type: Number, required: true },
      refills: { type: Number }
    }],
    required: true
  })
  medications: Array<{
    name: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
    quantity: number;
    refills?: number;
  }>;

  @Prop()
  diagnosis?: string;

  @Prop()
  symptoms?: string[];

  @Prop()
  doctorNotes?: string;

  @Prop()
  patientInstructions?: string;

  @Prop({ required: true })
  issueDate: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({
    enum: ['Active', 'Completed', 'Cancelled', 'Expired'],
    default: 'Active'
  })
  status: string;

  @Prop({ default: false })
  isDispensed: boolean;

  @Prop()
  dispensedDate?: Date;

  @Prop()
  pharmacyName?: string;

  @Prop()
  pharmacistNotes?: string;

  @Prop()
  allergies?: string[];

  @Prop()
  warnings?: string[];

  @Prop({
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  })
  priority: string;

  @Prop({ default: false })
  requiresMonitoring: boolean;

  @Prop()
  monitoringInstructions?: string;

  @Prop()
  followUpRequired?: boolean;

  @Prop()
  followUpDate?: Date;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);

// Create indexes for better performance
PrescriptionSchema.index({ patient: 1 });
// Note: patientId index may be automatically created by @Prop({ required: true })
PrescriptionSchema.index({ doctor: 1 });
PrescriptionSchema.index({ appointment: 1 });
// prescriptionNumber unique index is already created by @Prop({ unique: true })
PrescriptionSchema.index({ status: 1 });
PrescriptionSchema.index({ isDispensed: 1 });
PrescriptionSchema.index({ issueDate: -1 });
PrescriptionSchema.index({ expiryDate: 1 });
PrescriptionSchema.index({ patient: 1, issueDate: -1 });
PrescriptionSchema.index({ patientId: 1, issueDate: -1 }); // Compound index for patient prescriptions by date
PrescriptionSchema.index({ doctor: 1, issueDate: -1 });
PrescriptionSchema.index({ createdAt: -1 });

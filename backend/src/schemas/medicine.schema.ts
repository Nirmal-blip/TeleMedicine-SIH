import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MedicineDocument = Medicine & Document;

@Schema({ timestamps: true })
export class Medicine {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  genericName: string;

  @Prop({ required: true, trim: true })
  manufacturer: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  mrp: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true })
  unit: string; // tablets, bottles, syrup, etc.

  @Prop({ required: true })
  packSize: string; // e.g., "10 tablets", "100ml bottle"

  @Prop()
  dosage: string;

  @Prop()
  form: string; // tablet, capsule, syrup, injection, etc.

  @Prop([String])
  activeIngredients: string[];

  @Prop([String])
  images: string[];

  @Prop()
  prescriptionRequired: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop([String])
  tags: string[];

  @Prop()
  expiryDate: Date;

  @Prop()
  batchNumber: string;

  @Prop({ min: 0, max: 5, default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop()
  sideEffects: string;

  @Prop()
  contraindications: string;

  @Prop()
  storageInstructions: string;

  @Prop({ default: 0 })
  discount: number; // percentage

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0 })
  salesCount: number;
}

export const MedicineSchema = SchemaFactory.createForClass(Medicine);

// Create indexes for better performance
MedicineSchema.index({ name: 'text', genericName: 'text', manufacturer: 'text' });
MedicineSchema.index({ category: 1 });
MedicineSchema.index({ price: 1 });
MedicineSchema.index({ isActive: 1 });
MedicineSchema.index({ prescriptionRequired: 1 });

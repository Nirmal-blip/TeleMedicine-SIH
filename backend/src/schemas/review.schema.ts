import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicineId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true })
  comment: string;

  @Prop({ default: true })
  isVerifiedPurchase: boolean;

  @Prop({ default: false })
  isReported: boolean;

  @Prop({ default: true })
  isVisible: boolean;

  @Prop()
  helpfulCount: number;

  @Prop([String])
  images: string[];

  @Prop()
  moderatedAt: Date;

  @Prop()
  moderatorNotes: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Create indexes
ReviewSchema.index({ medicineId: 1 });
ReviewSchema.index({ patientId: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ isVisible: 1 });
ReviewSchema.index({ createdAt: -1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicineId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number; // Price at the time of adding to cart

  @Prop()
  addedAt: Date;
}

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true, unique: true })
  patientId: Types.ObjectId;

  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ default: 0 })
  totalItems: number;

  @Prop()
  lastUpdated: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

// Create indexes
CartSchema.index({ patientId: 1 });
CartSchema.index({ 'items.medicineId': 1 });

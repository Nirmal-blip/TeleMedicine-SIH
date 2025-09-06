import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Medicine', required: true })
  medicineId: Types.ObjectId;

  @Prop({ required: true })
  medicineName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  totalPrice: number;
}

@Schema({ _id: false })
export class ShippingAddress {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  addressLine1: string;

  @Prop()
  addressLine2: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  postalCode: string;

  @Prop({ required: true })
  country: string;
}

@Schema({ _id: false })
export class PaymentDetails {
  @Prop({ required: true })
  method: string; // 'razorpay', 'stripe', 'cod'

  @Prop()
  transactionId: string;

  @Prop()
  paymentId: string;

  @Prop()
  razorpayOrderId: string;

  @Prop()
  razorpayPaymentId: string;

  @Prop()
  razorpaySignature: string;

  @Prop({ default: 'pending' })
  status: string; // 'pending', 'completed', 'failed', 'refunded'

  @Prop()
  paidAt: Date;

  @Prop()
  failureReason: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ default: 0 })
  shippingCharges: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ type: PaymentDetails, required: true })
  paymentDetails: PaymentDetails;

  @Prop({ 
    default: 'pending', 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] 
  })
  status: string;

  @Prop()
  estimatedDeliveryDate: Date;

  @Prop()
  actualDeliveryDate: Date;

  @Prop()
  trackingNumber: string;

  @Prop()
  courierPartner: string;

  @Prop()
  prescriptionUploaded: boolean;

  @Prop([String])
  prescriptionImages: string[];

  @Prop()
  notes: string;

  @Prop()
  cancelReason: string;

  @Prop()
  returnReason: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);
export const PaymentDetailsSchema = SchemaFactory.createForClass(PaymentDetails);

// Create indexes
OrderSchema.index({ patientId: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'paymentDetails.status': 1 });

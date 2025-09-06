import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  addressLine1: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsString()
  paymentMethod: string; // 'razorpay', 'stripe', 'cod'

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prescriptionImages?: string[];

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class PaymentVerificationDto {
  @IsString()
  razorpayOrderId: string;

  @IsString()
  razorpayPaymentId: string;

  @IsString()
  razorpaySignature: string;

  @IsMongoId()
  orderId: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  courierPartner?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelOrderDto {
  @IsString()
  reason: string;
}

export class ReturnOrderDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

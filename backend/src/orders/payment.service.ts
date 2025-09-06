import { Injectable, BadRequestException } from '@nestjs/common';
import * as Razorpay from 'razorpay';

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret',
    });
  }

  async createRazorpayOrder(orderId: string, amount: number): Promise<any> {
    try {
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: orderId,
        payment_capture: 1,
      };

      const razorpayOrder = await this.razorpay.orders.create(options);
      return razorpayOrder;
    } catch (error) {
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyWebhook(body: any, signature: string): Promise<boolean> {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  async refundPayment(paymentId: string, amount: number, reason?: string): Promise<any> {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100),
        notes: {
          reason: reason || 'Order cancelled',
        },
      });

      return refund;
    } catch (error) {
      throw new BadRequestException('Failed to process refund');
    }
  }
}

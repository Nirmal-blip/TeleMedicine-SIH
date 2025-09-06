import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schemas/order.schema';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { Medicine, MedicineDocument } from '../schemas/medicine.schema';
import { CreateOrderDto, PaymentVerificationDto, UpdateOrderStatusDto } from '../dto/order.dto';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async createOrder(patientId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Get cart
    const cart = await this.cartModel
      .findOne({ patientId })
      .populate('items.medicineId')
      .exec();

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock availability
    for (const item of cart.items) {
      const medicine = await this.medicineModel.findById(item.medicineId).exec();
      if (!medicine || medicine.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${(item.medicineId as any).name}`
        );
      }
    }

    // Calculate amounts
    const subtotal = cart.totalAmount;
    const shippingCharges = subtotal < 500 ? 50 : 0; // Free shipping above ₹500
    const tax = subtotal * 0.12; // 12% GST
    const totalAmount = subtotal + shippingCharges + tax;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = new this.orderModel({
      orderNumber,
      patientId,
      items: cart.items.map(item => ({
        medicineId: item.medicineId,
        medicineName: (item.medicineId as any).name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.price * item.quantity,
      })),
      subtotal,
      shippingCharges,
      tax,
      totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
      paymentDetails: {
        method: createOrderDto.paymentMethod,
        status: createOrderDto.paymentMethod === 'cod' ? 'pending' : 'pending',
      },
      notes: createOrderDto.notes,
      prescriptionImages: createOrderDto.prescriptionImages || [],
      prescriptionUploaded: Boolean(createOrderDto.prescriptionImages?.length),
      estimatedDeliveryDate: this.calculateEstimatedDelivery(),
    });

    const savedOrder = await order.save();

    // Reserve stock
    await this.reserveStock(cart.items);

    // Clear cart
    await this.cartModel.findOneAndUpdate(
      { patientId },
      { items: [], totalAmount: 0, totalItems: 0 }
    ).exec();

    return savedOrder;
  }

  async findOrdersByPatient(patientId: string, page = 1, limit = 10): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find({ patientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.medicineId', 'name images')
        .exec(),
      this.orderModel.countDocuments({ patientId }).exec(),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, patientId?: string): Promise<Order> {
    const filter: any = { _id: id };
    if (patientId) {
      filter.patientId = patientId;
    }

    const order = await this.orderModel
      .findOne(filter)
      .populate('items.medicineId', 'name images manufacturer')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async verifyRazorpayPayment(paymentDto: PaymentVerificationDto): Promise<Order> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = paymentDto;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Update order
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentDetails.status = 'completed';
    order.paymentDetails.razorpayOrderId = razorpayOrderId;
    order.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    order.paymentDetails.razorpaySignature = razorpaySignature;
    order.paymentDetails.paidAt = new Date();
    order.status = 'confirmed';

    return order.save();
  }

  async updateOrderStatus(id: string, updateDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = updateDto.status;
    
    if (updateDto.trackingNumber) {
      order.trackingNumber = updateDto.trackingNumber;
    }
    
    if (updateDto.courierPartner) {
      order.courierPartner = updateDto.courierPartner;
    }

    if (updateDto.status === 'delivered') {
      order.actualDeliveryDate = new Date();
    }

    return order.save();
  }

  async cancelOrder(id: string, patientId: string, reason: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: id, patientId }).exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    order.cancelReason = reason;

    // Restore stock
    await this.restoreStock(order.items);

    return order.save();
  }

  async getAllOrders(page = 1, limit = 20, status?: string): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('patientId', 'fullname email phoneNumber')
        .populate('items.medicineId', 'name')
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const prefix = `ORD${year}${month}${day}`;
    
    // Find the last order of the day
    const lastOrder = await this.orderModel
      .findOne({ orderNumber: { $regex: `^${prefix}` } })
      .sort({ orderNumber: -1 })
      .exec();

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(4, '0')}`;
  }

  private calculateEstimatedDelivery(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate;
  }

  private async reserveStock(items: any[]): Promise<void> {
    for (const item of items) {
      await this.medicineModel.findByIdAndUpdate(
        item.medicineId,
        { $inc: { stock: -item.quantity, salesCount: item.quantity } }
      ).exec();
    }
  }

  private async restoreStock(items: any[]): Promise<void> {
    for (const item of items) {
      await this.medicineModel.findByIdAndUpdate(
        item.medicineId,
        { $inc: { stock: item.quantity, salesCount: -item.quantity } }
      ).exec();
    }
  }
}

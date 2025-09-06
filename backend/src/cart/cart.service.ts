import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../schemas/cart.schema';
import { Medicine, MedicineDocument } from '../schemas/medicine.schema';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
  ) {}

  async getCart(patientId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ patientId })
      .populate({
        path: 'items.medicineId',
        model: 'Medicine',
        select: 'name genericName manufacturer price mrp images stock prescriptionRequired isActive',
      })
      .exec();

    if (!cart) {
      // Create new cart if doesn't exist
      return this.createCart(patientId);
    }

    // Filter out inactive medicines
    cart.items = cart.items.filter((item: any) => item.medicineId?.isActive);
    
    // Recalculate totals
    await this.recalculateCart(cart);
    
    return cart;
  }

  async addToCart(patientId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { medicineId, quantity } = addToCartDto;

    // Check if medicine exists and is active
    const medicine = await this.medicineModel.findById(medicineId).exec();
    if (!medicine || !medicine.isActive) {
      throw new NotFoundException('Medicine not found or not available');
    }

    // Check stock availability
    if (medicine.stock < quantity) {
      throw new BadRequestException(`Only ${medicine.stock} items available in stock`);
    }

    let cart = await this.cartModel.findOne({ patientId }).exec();
    
    if (!cart) {
      cart = await this.createCart(patientId);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.medicineId.toString() === medicineId
    );

    if (existingItemIndex > -1) {
      // Update existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (medicine.stock < newQuantity) {
        throw new BadRequestException(`Only ${medicine.stock} items available in stock`);
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        medicineId: medicine._id,
        quantity,
        price: medicine.price,
        addedAt: new Date(),
      } as any);
    }

    cart.lastUpdated = new Date();
    await this.recalculateCart(cart);
    
    return cart.save();
  }

  async updateCartItem(patientId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const { medicineId, quantity } = updateCartItemDto;

    const cart = await this.cartModel.findOne({ patientId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      item => item.medicineId.toString() === medicineId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    // Check medicine availability and stock
    const medicine = await this.medicineModel.findById(medicineId).exec();
    if (!medicine || !medicine.isActive) {
      throw new NotFoundException('Medicine not found or not available');
    }

    if (medicine.stock < quantity) {
      throw new BadRequestException(`Only ${medicine.stock} items available in stock`);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = medicine.price; // Update price in case it changed
    cart.lastUpdated = new Date();

    await this.recalculateCart(cart);
    
    return cart.save();
  }

  async removeFromCart(patientId: string, medicineId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ patientId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter(
      item => item.medicineId.toString() !== medicineId
    );
    cart.lastUpdated = new Date();

    await this.recalculateCart(cart);
    
    return cart.save();
  }

  async clearCart(patientId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ patientId }).exec();
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;
    cart.lastUpdated = new Date();

    return cart.save();
  }

  async validateCartForCheckout(patientId: string): Promise<{
    isValid: boolean;
    errors: string[];
    cart: Cart;
  }> {
    const cart = await this.getCart(patientId);
    const errors: string[] = [];

    if (cart.items.length === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors, cart };
    }

    // Check each item
    for (const item of cart.items) {
      const medicine = await this.medicineModel.findById(item.medicineId).exec();
      
      if (!medicine || !medicine.isActive) {
        errors.push(`${(item as any).medicineId?.name || 'Medicine'} is no longer available`);
        continue;
      }

      if (medicine.stock < item.quantity) {
        errors.push(
          `Only ${medicine.stock} units of ${medicine.name} are available (you have ${item.quantity} in cart)`
        );
      }

      // Check if price has changed significantly (more than 10%)
      const priceChange = Math.abs(medicine.price - item.price) / item.price;
      if (priceChange > 0.1) {
        errors.push(`Price of ${medicine.name} has changed from ₹${item.price} to ₹${medicine.price}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      cart,
    };
  }

  private async createCart(patientId: string): Promise<Cart> {
    const newCart = new this.cartModel({
      patientId,
      items: [],
      totalAmount: 0,
      totalItems: 0,
      lastUpdated: new Date(),
    });
    
    return newCart.save();
  }

  private async recalculateCart(cart: Cart): Promise<void> {
    let totalAmount = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      totalAmount += item.price * item.quantity;
      totalItems += item.quantity;
    }

    cart.totalAmount = totalAmount;
    cart.totalItems = totalItems;
  }
}

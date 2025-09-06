import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentService } from './payment.service';
import { Order, OrderSchema } from '../schemas/order.schema';
import { Cart, CartSchema } from '../schemas/cart.schema';
import { Medicine, MedicineSchema } from '../schemas/medicine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Medicine.name, schema: MedicineSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService],
  exports: [OrdersService, PaymentService],
})
export class OrdersModule {}

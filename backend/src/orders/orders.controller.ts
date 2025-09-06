import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PaymentService } from './payment.service';
import { CreateOrderDto, PaymentVerificationDto, UpdateOrderStatusDto, CancelOrderDto } from '../dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.createOrder(req.user.userId, createOrderDto);
    
    // Create Razorpay order if payment method is razorpay
    if (createOrderDto.paymentMethod === 'razorpay') {
      const razorpayOrder = await this.paymentService.createRazorpayOrder(
        order._id.toString(),
        order.totalAmount
      );
      return { order, razorpayOrder };
    }
    
    return { order };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  async findMyOrders(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.ordersService.findOrdersByPatient(
      req.user.userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'pharmacist')
  async findAllOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    return this.ordersService.getAllOrders(
      parseInt(page),
      parseInt(limit),
      status,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    // Patients can only see their own orders
    const patientId = req.user.userType === 'patient' ? req.user.userId : undefined;
    return this.ordersService.findOne(id, patientId);
  }

  @Post('verify-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  async verifyPayment(@Body() paymentDto: PaymentVerificationDto) {
    return this.ordersService.verifyRazorpayPayment(paymentDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'pharmacist')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateDto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  async cancelOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() cancelDto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(id, req.user.userId, cancelDto.reason);
  }
}

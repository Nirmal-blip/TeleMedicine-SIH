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
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
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
        (order as any)._id.toString(),
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

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'text/html')
  async generateInvoice(
    @Request() req,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      // Get the order with patient access check
      const patientId = req.user.userType === 'patient' ? req.user.userId : undefined;
      const order = await this.ordersService.findOne(id, patientId);
      
      if (!order) {
        return res.status(404).send('Order not found');
      }

      // Generate invoice HTML
      const invoiceHTML = this.generateInvoiceHTML(order);
      
      // Set headers for PDF download
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `inline; filename="invoice-${order.orderNumber}.html"`);
      
      return res.send(invoiceHTML);
    } catch (error) {
      console.error('Error generating invoice:', error);
      return res.status(500).send('Error generating invoice');
    }
  }

  private generateInvoiceHTML(order: any): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const getPaymentMethodText = (method: string) => {
      switch (method) {
        case 'razorpay':
          return 'Online Payment';
        case 'cod':
          return 'Cash on Delivery';
        default:
          return method;
      }
    };

    const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.totalPrice || item.price * item.quantity), 0);
    const shipping = subtotal < 500 ? 50 : 0;
    const tax = subtotal * 0.12; // 12% GST
    const total = subtotal + shipping + tax;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.orderNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #059669; 
            padding-bottom: 20px; 
          }
          .header h1 {
            color: #059669;
            margin: 0;
            font-size: 2.5em;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .invoice-details { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px; 
          }
          .invoice-details h3 {
            color: #059669;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 5px;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          .items-table th { 
            background-color: #059669; 
            color: white;
            font-weight: bold; 
          }
          .items-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .totals { 
            float: right; 
            width: 350px; 
            margin-top: 20px;
          }
          .totals table { 
            width: 100%; 
            border-collapse: collapse; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .totals td { 
            padding: 12px; 
            border-bottom: 1px solid #ddd; 
          }
          .totals .total-row { 
            font-weight: bold; 
            font-size: 1.2em; 
            background-color: #059669;
            color: white;
          }
          .footer { 
            margin-top: 80px; 
            text-align: center; 
            color: #666; 
            border-top: 2px solid #e0e0e0;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-paid {
            background-color: #d4edda;
            color: #155724;
          }
          .status-pending {
            background-color: #fff3cd;
            color: #856404;
          }
          @media print {
            body { padding: 0; }
            .footer { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Telemedicine Pharmacy</h1>
          <p>Quality Healthcare at Your Doorstep</p>
          <h2 style="margin: 20px 0; color: #333;">INVOICE</h2>
        </div>

        <div class="invoice-details">
          <div>
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Payment Method:</strong> ${getPaymentMethodText(order.paymentDetails?.method || order.paymentMethod)}</p>
            <p><strong>Payment Status:</strong> 
              <span class="status-badge ${(order.paymentDetails?.status || order.status) === 'completed' ? 'status-paid' : 'status-pending'}">
                ${order.paymentDetails?.status || order.status || 'Processing'}
              </span>
            </p>
            <p><strong>Order Status:</strong> ${order.status || 'Processing'}</p>
          </div>
          <div>
            <h3>Billing Address</h3>
            <p><strong>${order.shippingAddress?.fullName || 'Customer'}</strong></p>
            <p>${order.shippingAddress?.addressLine1 || ''}</p>
            ${order.shippingAddress?.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
            <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress?.phoneNumber || 'N/A'}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Manufacturer</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td>${item.medicineId?.name || item.medicineName || 'Medicine'}</td>
                <td>${item.medicineId?.manufacturer || item.manufacturer || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>₹${(item.price || 0).toFixed(2)}</td>
                <td>₹${(item.totalPrice || item.price * item.quantity || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td><strong>₹${subtotal.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td><strong>Shipping:</strong></td>
              <td><strong>${shipping === 0 ? 'FREE' : '₹' + shipping.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td><strong>Tax (GST 12%):</strong></td>
              <td><strong>₹${tax.toFixed(2)}</strong></td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Amount:</strong></td>
              <td><strong>₹${total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <h3>Thank you for choosing Telemedicine Pharmacy!</h3>
          <p>For any queries, contact us at support@telemedicine.com | Phone: +91-1234567890</p>
          <p><em>This is a computer-generated invoice and does not require a signature.</em></p>
          <p><small>Generated on ${formatDate(new Date().toISOString())}</small></p>
        </div>

        <script>
          // Auto-print functionality
          window.onload = function() {
            if (window.location.search.includes('print=true')) {
              window.print();
            }
          }
        </script>
      </body>
      </html>
    `;
  }
}

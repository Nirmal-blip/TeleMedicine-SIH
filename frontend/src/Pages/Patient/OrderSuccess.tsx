import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faCalendarAlt,
  faTruck,
  faMapMarkerAlt,
  faReceipt,
  faHome,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    medicineId: {
      name: string;
      manufacturer: string;
      images: string[];
    };
    medicineName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentDetails: {
    method: string;
    status: string;
  };
  status: string;
  estimatedDeliveryDate: string;
  createdAt: string;
}

const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_BACKEND_URL}/api/orders/${orderId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        console.error('Failed to fetch order');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      // Open invoice in new window for download/print
      const invoiceUrl = `${(import.meta as any).env.VITE_BACKEND_URL}/api/orders/${orderId}/invoice`;
      window.open(invoiceUrl, '_blank');
    } catch (error) {
      console.error('Error opening invoice:', error);
      alert('Failed to open invoice');
    }
  };

  const generateInvoiceHTML = () => {
    if (!order) return '';
    
    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
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
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #059669; padding-bottom: 20px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details div { flex: 1; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background-color: #f8f9fa; font-weight: bold; }
          .totals { float: right; width: 300px; }
          .totals table { width: 100%; border-collapse: collapse; }
          .totals td { padding: 8px; border-bottom: 1px solid #ddd; }
          .totals .total-row { font-weight: bold; font-size: 1.1em; border-top: 2px solid #059669; }
          .footer { margin-top: 50px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #059669; margin: 0;">Telemedicine Pharmacy</h1>
          <p style="margin: 5px 0;">Quality Healthcare at Your Doorstep</p>
          <h2 style="margin: 20px 0;">INVOICE</h2>
        </div>

        <div class="invoice-details">
          <div>
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Payment Method:</strong> ${getPaymentMethodText(order.paymentDetails.method)}</p>
            <p><strong>Payment Status:</strong> ${order.paymentDetails.status}</p>
          </div>
          <div>
            <h3>Billing Address</h3>
            <p><strong>${order.shippingAddress.fullName}</strong></p>
            <p>${order.shippingAddress.addressLine1}</p>
            ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
            <p>Phone: ${order.shippingAddress.phoneNumber}</p>
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
            ${order.items.map(item => `
              <tr>
                <td>${item.medicineId?.name || item.medicineName}</td>
                <td>${item.medicineId?.manufacturer || ''}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${item.totalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping:</td>
              <td>${shipping === 0 ? 'FREE' : '₹' + shipping.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax (GST 12%):</td>
              <td>₹${tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount:</td>
              <td>₹${total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for choosing Telemedicine Pharmacy!</p>
          <p>For any queries, contact us at support@telemedicine.com</p>
          <p><em>This is a computer-generated invoice.</em></p>
        </div>
      </body>
      </html>
    `;
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateInvoiceHTML());
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <button
            onClick={() => window.location.href = '/patient/dashboard'}
            className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Thank you for your order. We'll send you updates about your delivery.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">
                  ₹{order.totalAmount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {getPaymentMethodText(order.paymentDetails.method)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faTruck} className="text-emerald-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">Delivery Status</h3>
                  <p className="text-gray-600 capitalize">{order.status}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-gray-600">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                  <span>Expected by {formatDate(order.estimatedDeliveryDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img
                    src={item.medicineId?.images?.[0] || '/placeholder-medicine.png'}
                    alt={item.medicineName}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.medicineName}</h4>
                    <p className="text-sm text-gray-600">
                      {item.medicineId?.manufacturer}
                    </p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{item.totalPrice.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">₹{item.price} each</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={downloadInvoice}
            className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faReceipt} className="mr-2" />
            Download Invoice
          </button>
          
          <button
            onClick={printInvoice}
            className="flex items-center justify-center border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FontAwesomeIcon icon={faReceipt} className="mr-2" />
            Print Invoice
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/patient/orders'}
            className="flex items-center justify-center bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FontAwesomeIcon icon={faReceipt} className="mr-2" />
            View All Orders
          </button>
          
          <button
            onClick={() => window.location.href = '/patient/medicine-shop'}
            className="flex items-center justify-center border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
            Continue Shopping
          </button>
          
          <button
            onClick={() => window.location.href = '/patient/dashboard'}
            className="flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            Go to Dashboard
          </button>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
          <div className="text-blue-800 text-sm space-y-2">
            <p>• You will receive SMS and email updates about your order status.</p>
            <p>• For prescription medicines, ensure someone is available to receive the delivery.</p>
            <p>• Contact our support team if you have any questions about your order.</p>
            {order.paymentDetails.method === 'cod' && (
              <p>• Please keep exact change ready for cash on delivery orders.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

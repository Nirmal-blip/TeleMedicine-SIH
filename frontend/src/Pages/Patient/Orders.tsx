import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingBag,
  faCalendarAlt,
  faMapMarkerAlt,
  faEye,
  faDownload,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faFilter,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    medicineId: {
      _id: string;
      name: string;
      images: string[];
    };
    medicineName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: string;
  paymentDetails: {
    method: string;
    status: string;
  };
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  trackingNumber?: string;
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`http://localhost:3000/api/orders?${params}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data: OrdersResponse = await response.json();
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-purple-600 bg-purple-100';
      case 'shipped':
        return 'text-indigo-600 bg-indigo-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return faSpinner;
      case 'confirmed':
        return faCheckCircle;
      case 'processing':
        return faSpinner;
      case 'shipped':
        return faTruck;
      case 'delivered':
        return faCheckCircle;
      case 'cancelled':
        return faTimesCircle;
      default:
        return faSpinner;
    }
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

  const viewOrderDetails = (orderId: string) => {
    window.location.href = `/patient/order/${orderId}`;
  };

  const downloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/invoice`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert('Order cancelled successfully');
        fetchOrders();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              <FontAwesomeIcon icon={faShoppingBag} className="mr-3" />
              My Orders
            </h1>
            <button
              onClick={() => window.location.href = '/patient/medicine-shop'}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Shop More
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search by order number or medicine name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faShoppingBag} className="text-gray-400 text-6xl mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <button
              onClick={() => window.location.href = '/patient/medicine-shop'}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                          Placed on {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getPaymentMethodText(order.paymentDetails.method)}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(order.status)} className="mr-1" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.trackingNumber && (
                          <span className="ml-4 text-sm text-gray-600">
                            Tracking: {order.trackingNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.status === 'delivered' && order.actualDeliveryDate
                          ? `Delivered on ${formatDate(order.actualDeliveryDate)}`
                          : `Expected by ${formatDate(order.estimatedDeliveryDate)}`
                        }
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <img
                            src={item.medicineId?.images?.[0] || '/placeholder-medicine.png'}
                            alt={item.medicineName}
                            className="w-12 h-12 object-cover rounded border"
                          />
                          <div>
                            <p className="font-medium text-sm text-gray-900 line-clamp-1">
                              {item.medicineName}
                            </p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-gray-600">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => viewOrderDetails(order._id)}
                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                        View Details
                      </button>
                      
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => downloadInvoice(order._id)}
                          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faDownload} className="mr-2" />
                          Download Invoice
                        </button>
                      )}
                      
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                          Cancel Order
                        </button>
                      )}
                      
                      {order.status === 'shipped' && order.trackingNumber && (
                        <button
                          onClick={() => window.open(`https://www.example.com/track/${order.trackingNumber}`, '_blank')}
                          className="flex items-center px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTruck} className="mr-2" />
                          Track Package
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;

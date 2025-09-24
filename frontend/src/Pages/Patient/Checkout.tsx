import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faMapMarkerAlt,
  faCreditCard,
  faMoneyBillWave,
  faShieldAlt,
  faTruck,
  faCheckCircle,
  faExclamationTriangle,
  faPrescriptionBottleAlt,
  faUpload,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface CartItem {
  medicineId: {
    _id: string;
    name: string;
    manufacturer: string;
    price: number;
    images: string[];
    prescriptionRequired: boolean;
    packSize: string;
  };
  quantity: number;
  price: number;
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
  namespace ImportMeta {
    interface Env {
      VITE_RAZORPAY_KEY_ID?: string;
    }
  }
}

const Checkout: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [prescriptionFiles, setPrescriptionFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchCart();
    validateCart();
    loadRazorpayScript();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/cart', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        window.location.href = '/patient/cart';
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      window.location.href = '/patient/cart';
    } finally {
      setLoading(false);
    }
  };

  const validateCart = async () => {
    try {
      const response = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/cart/validate', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const validation = await response.json();
        setErrors(validation.errors);
        if (!validation.isValid) {
          alert('There are issues with your cart. Please review and try again.');
          window.location.href = '/patient/cart';
        }
      }
    } catch (error) {
      console.error('Error validating cart:', error);
    }
  };

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep(2);
    }
  };

  const validateAddress = () => {
    const required = ['fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'postalCode'];
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPrescriptionFiles(prev => [...prev, ...files]);
  };

  const removePrescriptionFile = (index: number) => {
    setPrescriptionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPrescriptions = async (): Promise<string[]> => {
    if (prescriptionFiles.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const file of prescriptionFiles) {
      const formData = new FormData();
      formData.append('prescription', file);

      try {
        const response = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/uploads/prescription', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      } catch (error) {
        console.error('Error uploading prescription:', error);
      }
    }

    return uploadedUrls;
  };

  const createOrder = async () => {
    setProcessing(true);
    try {
      // Upload prescriptions if any
      const prescriptionImages = await uploadPrescriptions();

      const orderData = {
        shippingAddress,
        paymentMethod,
        notes,
        prescriptionImages,
      };

      const response = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (paymentMethod === 'razorpay') {
          initiateRazorpayPayment(data.order, data.razorpayOrder);
        } else if (paymentMethod === 'cod') {
          // Clear cart after successful COD order
          localStorage.removeItem('medicineCart');
          
          // Show success message with invoice option for COD
          const result = confirm('Order placed successfully! Your COD order has been confirmed. Would you like to view the invoice now?');
          if (result) {
            // Open invoice in new tab
            try {
              const invoiceUrl = `https://telemedicine-sih-8i5h.onrender.com/api/orders/${data.order._id}/invoice`;
              window.open(invoiceUrl, '_blank');
            } catch (error) {
              console.error('Could not open invoice:', error);
            }
          }
          
          // Redirect to success page for COD
          window.location.href = `/patient/order-success/${data.order._id}`;
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  const initiateRazorpayPayment = (order: any, razorpayOrder: any) => {
    const options = {
      key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Telemedicine Pharmacy',
      description: `Order #${order.orderNumber}`,
      order_id: razorpayOrder.id,
      handler: async (response: any) => {
        try {
          const verifyResponse = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/orders/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            }),
          });

          if (verifyResponse.ok) {
            // Clear cart after successful payment
            localStorage.removeItem('medicineCart');
            
            // Show success message with invoice option
            const result = confirm('Payment successful! Your order has been placed. Would you like to view the invoice now?');
            if (result) {
              // Open invoice in new tab
              try {
                const invoiceUrl = `https://telemedicine-sih-8i5h.onrender.com/api/orders/${order._id}/invoice`;
                window.open(invoiceUrl, '_blank');
              } catch (error) {
                console.error('Could not open invoice:', error);
              }
            }
            
            // Redirect to success page
            window.location.href = `/patient/order-success/${order._id}`;
          } else {
            alert('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          alert('Payment verification failed');
        }
      },
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phoneNumber,
      },
      theme: {
        color: '#059669',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const calculateSubtotal = () => {
    return cart?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal < 500 ? 50 : 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.12; // 12% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const requiresPrescription = () => {
    return cart?.items.some(item => item.medicineId.prescriptionRequired) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => step === 1 ? window.history.back() : setStep(step - 1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            </div>
            <div className="flex items-center space-x-8">
              <div className={`flex items-center ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-300'}`}>
                  {step > 1 ? <FontAwesomeIcon icon={faCheckCircle} /> : '1'}
                </div>
                <span className="ml-2 hidden sm:block">Address</span>
              </div>
              <div className={`flex items-center ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-300'}`}>
                  {step > 2 ? <FontAwesomeIcon icon={faCheckCircle} /> : '2'}
                </div>
                <span className="ml-2 hidden sm:block">Payment</span>
              </div>
              <div className={`flex items-center ${step >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="ml-2 hidden sm:block">Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              /* Step 1: Shipping Address */
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-600 mr-3" />
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={shippingAddress.phoneNumber}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine1: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, addressLine2: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              /* Step 2: Payment Method */
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <FontAwesomeIcon icon={faCreditCard} className="text-emerald-600 mr-3" />
                    <h2 className="text-xl font-semibold">Payment Method</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                         onClick={() => setPaymentMethod('razorpay')}>
                      <input
                        type="radio"
                        id="razorpay"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="razorpay" className="flex-1 cursor-pointer">
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-gray-600">Pay using UPI, Card, Net Banking, or Wallet</div>
                      </label>
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-500" />
                    </div>

                    <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                         onClick={() => setPaymentMethod('cod')}>
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive your order</div>
                      </label>
                      <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Prescription Upload */}
                {requiresPrescription() && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-4">
                      <FontAwesomeIcon icon={faPrescriptionBottleAlt} className="text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold">Upload Prescription</h3>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-blue-600 mt-1 mr-3" />
                        <div>
                          <p className="text-blue-800 font-medium">Prescription Required</p>
                          <p className="text-blue-700 text-sm mt-1">
                            Your order contains prescription medicines. Please upload a valid prescription.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <input
                          type="file"
                          id="prescription"
                          multiple
                          accept="image/*,.pdf"
                          onChange={handlePrescriptionUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="prescription"
                          className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div className="text-center">
                            <FontAwesomeIcon icon={faUpload} className="text-gray-400 text-2xl mb-2" />
                            <p className="text-gray-600">Click to upload prescription</p>
                            <p className="text-xs text-gray-500">JPG, PNG, or PDF (max 5MB each)</p>
                          </div>
                        </label>
                      </div>

                      {prescriptionFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Uploaded Files:</h4>
                          {prescriptionFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{file.name}</span>
                              <button
                                onClick={() => removePrescriptionFile(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Notes (Optional)</h3>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Any special instructions for delivery..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => setStep(3)}
                  disabled={requiresPrescription() && prescriptionFiles.length === 0}
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Review Order
                </button>
              </div>
            )}

            {step === 3 && (
              /* Step 3: Review Order */
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cart?.items.map((item) => (
                    <div key={item.medicineId._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.medicineId.images[0] || '/placeholder-medicine.png'}
                        alt={item.medicineId.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.medicineId.name}</h4>
                        <p className="text-sm text-gray-600">{item.medicineId.manufacturer}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600">
                    <p>{shippingAddress.fullName}</p>
                    <p>{shippingAddress.addressLine1}</p>
                    {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                    <p>{shippingAddress.phoneNumber}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <p className="text-sm text-gray-600">
                    {paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                  </p>
                </div>

                <button
                  onClick={createOrder}
                  disabled={processing}
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                      Processing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping().toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST 12%)</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                Secure and Safe Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faPlus,
  faMinus,
  faTrash,
  faArrowLeft,
  faExclamationTriangle,
  faPrescriptionBottleAlt,
  faShieldAlt,
  faTruck
} from '@fortawesome/free-solid-svg-icons';

interface CartItem {
  medicineId: {
    _id: string;
    name: string;
    genericName: string;
    manufacturer: string;
    price: number;
    mrp: number;
    images: string[];
    stock: number;
    prescriptionRequired: boolean;
    packSize: string;
    isActive: boolean;
  };
  quantity: number;
  price: number;
  addedAt: Date;
}

interface Cart {
  _id: string;
  patientId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  lastUpdated: Date;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cart', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        // Sync with localStorage for offline access
        localStorage.setItem('medicineCart', JSON.stringify(data.items || []));
      } else if (response.status === 401) {
        // User not authenticated, redirect to login
        alert('Please log in to view your cart');
        window.location.href = '/auth/patient-login';
      } else {
        console.error('Failed to fetch cart');
        // Fallback to localStorage cart
        const localCart = localStorage.getItem('medicineCart');
        if (localCart) {
          const items = JSON.parse(localCart);
          setCart({ 
            _id: 'local', 
            patientId: 'local', 
            items: items || [], 
            totalAmount: 0, 
            totalItems: items?.length || 0,
            lastUpdated: new Date()
          } as Cart);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Fallback to localStorage cart
      const localCart = localStorage.getItem('medicineCart');
      if (localCart) {
        const items = JSON.parse(localCart);
        setCart({ 
          _id: 'local', 
          patientId: 'local', 
          items: items || [], 
          totalAmount: 0, 
          totalItems: items?.length || 0,
          lastUpdated: new Date()
        } as Cart);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (medicineId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setUpdating(medicineId);
    try {
      const response = await fetch('http://localhost:3000/api/cart/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          medicineId,
          quantity,
        }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (medicineId: string) => {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          medicineId,
        }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/cart/clear', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  const validateCart = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cart/validate', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const validation = await response.json();
        setErrors(validation.errors);
        return validation.isValid;
      }
    } catch (error) {
      console.error('Error validating cart:', error);
    }
    return false;
  };

  const proceedToCheckout = async () => {
    const isValid = await validateCart();
    if (isValid) {
      window.location.href = '/patient/checkout';
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading cart...</p>
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
                onClick={() => window.history.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                <FontAwesomeIcon icon={faShoppingCart} className="mr-3" />
                Shopping Cart
              </h1>
            </div>
            {cart && cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-1 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Cart Validation Issues</h3>
                <ul className="mt-2 text-red-700 text-sm list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faShoppingCart} className="text-gray-400 text-6xl mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some medicines to get started</p>
            <button
              onClick={() => window.location.href = '/patient/medicine-shop'}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Cart Items ({cart.totalItems})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
                    <div key={item.medicineId._id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.medicineId.images[0] || '/placeholder-medicine.png'}
                            alt={item.medicineId.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.medicineId.name}</h3>
                              <p className="text-sm text-gray-600">{item.medicineId.manufacturer}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.medicineId.packSize}</p>
                              
                              {item.medicineId.prescriptionRequired && (
                                <div className="flex items-center mt-2 text-blue-600">
                                  <FontAwesomeIcon icon={faPrescriptionBottleAlt} className="mr-1 text-xs" />
                                  <span className="text-xs">Prescription Required</span>
                                </div>
                              )}

                              {/* Stock Warning */}
                              {item.medicineId.stock < item.quantity && (
                                <div className="flex items-center mt-2 text-red-600">
                                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1 text-xs" />
                                  <span className="text-xs">Only {item.medicineId.stock} available</span>
                                </div>
                              )}
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.medicineId._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => updateQuantity(item.medicineId._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating === item.medicineId._id}
                                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                              >
                                <FontAwesomeIcon icon={faMinus} className="text-xs" />
                              </button>
                              
                              <span className="font-medium w-8 text-center">
                                {updating === item.medicineId._id ? '...' : item.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateQuantity(item.medicineId._id, item.quantity + 1)}
                                disabled={
                                  item.quantity >= item.medicineId.stock || 
                                  updating === item.medicineId._id
                                }
                                className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                              >
                                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                ₹{item.price} each
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm sticky top-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {calculateShipping() === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${calculateShipping().toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {calculateShipping() > 0 && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <FontAwesomeIcon icon={faTruck} className="mr-1" />
                      Add ₹{(500 - calculateSubtotal()).toFixed(2)} more for free shipping
                    </div>
                  )}

                  {/* Tax */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST 12%)</span>
                    <span className="font-medium">₹{calculateTax().toFixed(2)}</span>
                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center text-xs text-gray-500 mt-4">
                    <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                    Secure Checkout
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={proceedToCheckout}
                    disabled={errors.length > 0}
                    className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                  >
                    Proceed to Checkout
                  </button>

                  {/* Continue Shopping */}
                  <button
                    onClick={() => window.location.href = '/patient/medicine-shop'}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

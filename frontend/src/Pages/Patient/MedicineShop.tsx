import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaShoppingCart, FaHeart, FaStar, FaPlus, FaMinus, FaCheck, FaExclamationTriangle, FaPrescriptionBottleAlt, FaShieldAlt, FaTruck, FaTag, FaLeaf, FaAward, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Medicine {
  _id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  description: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  unit: string;
  packSize: string;
  dosage: string;
  form: string;
  activeIngredients: string[];
  images: string[];
  prescriptionRequired: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
  discount: number;
  isFeatured: boolean;
}

interface CartItem {
  medicineId: string;
  quantity: number;
}

const MedicineShop: React.FC = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [prescriptionFilter, setPrescriptionFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    loadCart();
    loadWishlist();
  }, [currentPage, searchQuery, selectedCategory, sortBy, sortOrder, priceRange, prescriptionFilter]);

  // Also fetch cart from server on component mount
  useEffect(() => {
    fetchCartFromServer();
  }, []);

  const fetchCartFromServer = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cart', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          setCart(data.items);
          localStorage.setItem('medicineCart', JSON.stringify(data.items));
        }
      }
    } catch (error) {
      // Silent fail - use localStorage cart
      console.log('Could not fetch cart from server, using local cart');
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        sortOrder,
      });

      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (priceRange.min > 0) params.append('minPrice', priceRange.min.toString());
      if (priceRange.max < 1000) params.append('maxPrice', priceRange.max.toString());
      if (prescriptionFilter !== 'all') {
        params.append('prescriptionRequired', prescriptionFilter === 'prescription' ? 'true' : 'false');
      }

      const response = await fetch(`http://localhost:3000/api/medicines?${params}`);
      const data = await response.json();
      
      setMedicines(data.medicines);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/medicines/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('medicineCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const loadWishlist = () => {
    const savedWishlist = localStorage.getItem('medicineWishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  };

  const addToCart = async (medicine: Medicine) => {
    try {
      const response = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          medicineId: medicine._id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local cart state
        const existingItem = cart.find(item => item.medicineId === medicine._id);
        let newCart;
        if (existingItem) {
          newCart = cart.map(item =>
            item.medicineId === medicine._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newCart = [...cart, { medicineId: medicine._id, quantity: 1 }];
        }
        setCart(newCart);
        localStorage.setItem('medicineCart', JSON.stringify(newCart));
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span>Added ${medicine.name} to cart!</span>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
        
      } else if (response.status === 401) {
        // Authentication required
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        notification.innerHTML = `
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span>Please log in to add items to cart</span>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => document.body.removeChild(notification), 300);
        }, 4000);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/auth/patient-login');
        }, 2000);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span>Failed to add to cart. Please try again.</span>
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 4000);
    }
  };

  const toggleWishlist = (medicineId: string) => {
    let newWishlist;
    if (wishlist.includes(medicineId)) {
      newWishlist = wishlist.filter(id => id !== medicineId);
    } else {
      newWishlist = [...wishlist, medicineId];
    }
    setWishlist(newWishlist);
    localStorage.setItem('medicineWishlist', JSON.stringify(newWishlist));
  };

  const getCartItemCount = (medicineId: string) => {
    const item = cart.find(item => item.medicineId === medicineId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateDiscount = (mrp: number, price: number) => {
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all duration-200"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Medicine Shop
                </h1>
                <p className="text-sm text-gray-600">Quality medicines at your doorstep</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => navigate('/patient/cart')}
                  className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaShoppingCart />
                  <span className="font-medium">Cart</span>
                  {getTotalCartItems() > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                      {getTotalCartItems()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trusted Healthcare</h2>
              <p className="text-emerald-100 mb-4">Genuine medicines with fast delivery & prescription support</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <FaShieldAlt className="text-emerald-200" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaTruck className="text-emerald-200" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPrescriptionBottleAlt className="text-emerald-200" />
                  <span>Prescription Support</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <FaLeaf className="text-6xl text-emerald-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-emerald-100">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines, brands, or health conditions..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-[180px]"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-[150px]"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Rating (High to Low)</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all duration-200"
            >
              <FaFilter className="text-emerald-600" />
              <span className="text-emerald-600 font-medium">Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ₹{priceRange.min} - ₹{priceRange.max}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Prescription Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription Required
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={prescriptionFilter}
                    onChange={(e) => setPrescriptionFilter(e.target.value)}
                  >
                    <option value="all">All Medicines</option>
                    <option value="prescription">Prescription Required</option>
                    <option value="no-prescription">No Prescription Needed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading medicines...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {medicines.length} of {totalPages * 12} medicines
                {selectedCategory && ` in "${selectedCategory}"`}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Medicine Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {medicines.map((medicine) => (
                <div key={medicine._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  {/* Medicine Image */}
                  <div className="relative">
                    <img
                      src={medicine.images[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop'}
                      alt={medicine.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop';
                      }}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
                      {medicine.isFeatured && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                          <FaAward className="w-3 h-3" />
                          <span>Featured</span>
                        </span>
                      )}
                      {calculateDiscount(medicine.mrp, medicine.price) > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {calculateDiscount(medicine.mrp, medicine.price)}% OFF
                        </span>
                      )}
                      {medicine.prescriptionRequired && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                          <FaPrescriptionBottleAlt className="w-3 h-3" />
                          <span>Rx</span>
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(medicine._id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        wishlist.includes(medicine._id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <FaHeart className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Medicine Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200">
                        {medicine.name}
                      </h3>
                      <p className="text-sm text-gray-600">{medicine.manufacturer}</p>
                      <p className="text-xs text-gray-500 mt-1">{medicine.packSize}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(medicine.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {medicine.rating} ({medicine.reviewCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-emerald-600">₹{medicine.price}</span>
                          {medicine.mrp > medicine.price && (
                            <span className="text-sm text-gray-500 line-through">₹{medicine.mrp}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">per {medicine.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${medicine.stock > 10 ? 'text-green-600' : medicine.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {medicine.stock > 10 ? 'In Stock' : medicine.stock > 0 ? 'Limited Stock' : 'Out of Stock'}
                        </p>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex items-center space-x-2">
                      {getCartItemCount(medicine._id) > 0 ? (
                        <div className="flex items-center space-x-2 bg-emerald-50 rounded-xl p-2 flex-1">
                          <span className="text-sm font-medium text-emerald-600 flex-1 text-center">
                            {getCartItemCount(medicine._id)} in cart
                          </span>
                          <FaCheck className="text-emerald-600 w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(medicine)}
                          disabled={medicine.stock === 0}
                          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                            medicine.stock > 0
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <FaPlus className="w-3 h-3" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}

            {/* Empty State */}
            {medicines.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No medicines found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setPrescriptionFilter('all');
                    setPriceRange({ min: 0, max: 1000 });
                  }}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MedicineShop;
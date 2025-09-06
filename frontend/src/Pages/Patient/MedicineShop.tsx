import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faShoppingCart, 
  faStar, 
  faPlus, 
  faMinus,
  faHeart,
  faTag,
  faPrescriptionBottleAlt
} from '@fortawesome/free-solid-svg-icons';

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
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [prescriptionFilter, setPrescriptionFilter] = useState<string>('all');

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    loadCart();
  }, [searchQuery, selectedCategory, sortBy, sortOrder, currentPage, priceRange, prescriptionFilter]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
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

      const response = await fetch(`/api/medicines?${params}`);
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
      const response = await fetch('/api/medicines/categories');
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

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('medicineCart', JSON.stringify(newCart));
  };

  const addToCart = async (medicine: Medicine) => {
    try {
      const response = await fetch('/api/cart/add', {
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
        const existingItem = cart.find(item => item.medicineId === medicine._id);
        if (existingItem) {
          const updatedCart = cart.map(item =>
            item.medicineId === medicine._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          saveCart(updatedCart);
        } else {
          const updatedCart = [...cart, { medicineId: medicine._id, quantity: 1 }];
          saveCart(updatedCart);
        }
        alert('Added to cart successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const getCartQuantity = (medicineId: string) => {
    const item = cart.find(item => item.medicineId === medicineId);
    return item ? item.quantity : 0;
  };

  const calculateDiscount = (price: number, mrp: number) => {
    return Math.round(((mrp - price) / mrp) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Medicine Shop</h1>
            <button
              onClick={() => window.location.href = '/patient/cart'}
              className="relative bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search medicines by name, generic name, or manufacturer..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              <option value="popularity-desc">Most Popular</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₹)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))}
                    />
                  </div>
                </div>

                {/* Prescription Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prescription Required
                  </label>
                  <select
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    value={prescriptionFilter}
                    onChange={(e) => setPrescriptionFilter(e.target.value)}
                  >
                    <option value="all">All Medicines</option>
                    <option value="prescription">Prescription Required</option>
                    <option value="otc">Over the Counter</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medicine Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-gray-600">Loading medicines...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map((medicine) => (
                <div key={medicine._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={medicine.images[0] || '/placeholder-medicine.png'}
                      alt={medicine.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {medicine.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {medicine.discount}% OFF
                      </div>
                    )}
                    {medicine.prescriptionRequired && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                        <FontAwesomeIcon icon={faPrescriptionBottleAlt} className="text-xs" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{medicine.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{medicine.manufacturer}</p>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{medicine.description}</p>

                    {/* Rating */}
                    {medicine.rating > 0 && (
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FontAwesomeIcon
                              key={i}
                              icon={faStar}
                              className={`w-3 h-3 ${i < medicine.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">({medicine.reviewCount})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-emerald-600">₹{medicine.price}</span>
                        {medicine.mrp > medicine.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">₹{medicine.mrp}</span>
                        )}
                        <p className="text-xs text-gray-500">{medicine.packSize}</p>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-3">
                      {medicine.stock > 0 ? (
                        <span className="text-xs text-green-600">In Stock ({medicine.stock} available)</span>
                      ) : (
                        <span className="text-xs text-red-600">Out of Stock</span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <div className="flex items-center justify-between">
                      {getCartQuantity(medicine._id) > 0 ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {/* Handle decrease quantity */}}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faMinus} className="text-xs" />
                          </button>
                          <span className="font-medium">{getCartQuantity(medicine._id)}</span>
                          <button
                            onClick={() => addToCart(medicine)}
                            className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faPlus} className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(medicine)}
                          disabled={medicine.stock === 0}
                          className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                        >
                          <FontAwesomeIcon icon={faShoppingCart} className="mr-2" />
                          Add to Cart
                        </button>
                      )}
                      <button className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <FontAwesomeIcon icon={faHeart} />
                      </button>
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

export default MedicineShop;

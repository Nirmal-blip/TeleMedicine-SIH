# 🏥 Telemedicine Database Setup Guide

## 📋 Overview

This guide covers the complete database setup for the Telemedicine platform, including the new Medicine Shop e-commerce functionality.

## 🗄️ Database Schema

### Collections Overview

| Collection | Purpose | Documents | Status |
|------------|---------|-----------|---------|
| `patients` | Patient records & authentication | 6+ | ✅ Ready |
| `doctors` | Doctor profiles & availability | 4+ | ✅ Ready |
| `medicines` | Medicine catalog for e-commerce | 5+ | ✅ Ready |
| `appointments` | Doctor-patient appointments | 17+ | ✅ Ready |
| `carts` | Patient shopping carts | Dynamic | ✅ Ready |
| `orders` | Medicine orders & payments | Dynamic | ✅ Ready |
| `prescriptions` | Medical prescriptions | 5+ | ✅ Ready |
| `notifications` | System notifications | Dynamic | ✅ Ready |
| `reviews` | Medicine & doctor reviews | Dynamic | ✅ Ready |
| `chathistories` | AI chatbot conversations | 52+ | ✅ Ready |

## 🔧 Setup Instructions

### 1. MongoDB Connection

The database is hosted on **MongoDB Atlas** with the following configuration:
- **Cluster**: `cluster1.zuncx72.mongodb.net`
- **Database**: `TeleMedicine` (case-sensitive)
- **Connection String**: Provided in environment variables

### 2. Run Database Setup

```bash
# Install MongoDB driver (if not already installed)
npm install mongodb bcrypt

# Run the comprehensive database setup
node final-database-setup.js
```

### 3. Verify Setup

```bash
# Run database verification
node database-verification.js
```

## 💊 Medicine Shop Schema

### Medicine Document Structure

```javascript
{
  name: "Paracetamol 500mg",
  genericName: "Acetaminophen",
  manufacturer: "ABC Pharmaceuticals",
  description: "Pain reliever and fever reducer...",
  category: "Pain Relief",
  price: 25.00,
  mrp: 30.00,
  stock: 100,
  unit: "tablets",
  packSize: "10 tablets",
  dosage: "500mg",
  form: "tablet",
  activeIngredients: ["Acetaminophen 500mg"],
  images: ["/images/medicines/paracetamol.jpg"],
  prescriptionRequired: false,
  tags: ["pain relief", "fever", "headache"],
  rating: 4.5,
  reviewCount: 120,
  discount: 17,
  isFeatured: true,
  isActive: true,
  expiryDate: "2026-12-31",
  batchNumber: "PCT001",
  sideEffects: "Nausea, liver damage in high doses",
  contraindications: "Liver disease, alcohol dependency",
  storageInstructions: "Store in cool, dry place",
  salesCount: 0,
  createdAt: "2025-01-06",
  updatedAt: "2025-01-06"
}
```

### Medicine Categories Available

1. **Pain Relief** - Paracetamol, etc.
2. **Antibiotics** - Amoxicillin, etc.
3. **Allergy & Cold** - Cetirizine, etc.
4. **Diabetes** - Metformin, etc.
5. **Vitamins & Supplements** - Vitamin D3, etc.

### Cart Document Structure

```javascript
{
  patientId: "ObjectId",
  items: [
    {
      medicineId: "ObjectId",
      quantity: 2,
      price: 25.00,
      addedAt: "2025-01-06"
    }
  ],
  totalAmount: 50.00,
  totalItems: 2,
  lastUpdated: "2025-01-06"
}
```

### Order Document Structure

```javascript
{
  patientId: "ObjectId",
  orderNumber: "ORD-20250106-001",
  items: [
    {
      medicineId: "ObjectId",
      medicineName: "Paracetamol 500mg",
      quantity: 2,
      price: 25.00,
      totalPrice: 50.00
    }
  ],
  subtotal: 50.00,
  shippingCharges: 0.00,
  tax: 6.00,
  totalAmount: 56.00,
  paymentMethod: "razorpay",
  paymentStatus: "pending",
  status: "pending",
  shippingAddress: {
    street: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India"
  },
  razorpayOrderId: "order_xyz123",
  estimatedDelivery: "2025-01-08",
  createdAt: "2025-01-06",
  updatedAt: "2025-01-06"
}
```

## 🔑 Test Credentials

### Patient Account
- **Email**: `patient@example.com`
- **Password**: `password123`
- **Name**: John Doe
- **Phone**: +91-9876543210

### Doctor Account
- **Email**: `prithvi@gmail.com`
- **Password**: (existing password)
- **Name**: Dr. Sarah Wilson
- **Specialization**: Cardiology

## 🚀 API Endpoints

### Medicine Shop APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medicines` | Get all medicines with pagination |
| GET | `/api/medicines/categories` | Get all medicine categories |
| GET | `/api/medicines/featured` | Get featured medicines |
| GET | `/api/medicines/search` | Search medicines by name/category |
| GET | `/api/medicines/:id` | Get single medicine details |

### Cart APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get patient's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update` | Update cart item quantity |
| DELETE | `/api/cart/remove/:medicineId` | Remove item from cart |
| DELETE | `/api/cart/clear` | Clear entire cart |
| GET | `/api/cart/validate` | Validate cart for checkout |

### Order APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders` | Get patient's orders |
| GET | `/api/orders/:id` | Get single order details |
| POST | `/api/orders/verify-payment` | Verify Razorpay payment |
| PATCH | `/api/orders/:id/status` | Update order status (admin) |
| POST | `/api/orders/:id/cancel` | Cancel order |

## 🔍 Performance Indexes

The following indexes are automatically created for optimal performance:

### Medicine Collection
- Text index: `name`, `genericName`, `manufacturer`
- Single indexes: `category`, `price`, `isActive`, `prescriptionRequired`

### Patient Collection
- Unique index: `email`
- Single index: `phoneNumber`

### Doctor Collection
- Unique index: `email`
- Compound index: `specialization`, `isVerified`, `isActive`

### Cart Collection
- Unique index: `patientId`

### Order Collection
- Single indexes: `patientId`, `status`, `createdAt`
- Unique index: `orderNumber`

### Appointment Collection
- Compound indexes: `doctor + patient`, `date`, `status`

## 🧪 Testing the Setup

### 1. Start the Backend

```bash
cd backend
npm run start:dev
```

The server should start on `http://localhost:3000`

### 2. Test Medicine APIs

```bash
# Get all medicines
curl http://localhost:3000/api/medicines

# Get categories
curl http://localhost:3000/api/medicines/categories

# Get featured medicines
curl http://localhost:3000/api/medicines/featured
```

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

### 4. Test Medicine Shop Flow

1. **Login** as patient (`patient@example.com` / `password123`)
2. **Navigate** to Medicine Shop from dashboard
3. **Browse** medicines by category
4. **Add** medicines to cart
5. **View** cart and proceed to checkout
6. **Complete** order with test payment

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MongoDB URI in environment variables
   - Check internet connection
   - Ensure database name is exactly "TeleMedicine" (case-sensitive)

2. **No Medicines Showing**
   - Run `node database-schema-checker.js` to seed data
   - Check if medicines collection has documents

3. **Cart Not Working**
   - Ensure patient is logged in
   - Check JWT token in browser storage
   - Verify cart collection exists

4. **Payment Issues**
   - Verify Razorpay credentials in environment
   - Check payment service configuration
   - Test with Razorpay test keys

### Database Reset

If you need to reset the database:

```bash
# Clear and re-setup database
node database-schema-checker.js
```

## 📞 Support

For issues or questions:
1. Check compilation errors with `npm run build`
2. Verify database status with verification script
3. Check API responses with tools like Postman
4. Review console logs for detailed error messages

---

## 🎉 Success Indicators

Your setup is successful when:
- ✅ All compilation errors are resolved
- ✅ Database has 5+ medicine categories
- ✅ Test patient and doctor accounts exist
- ✅ Medicine shop loads with products
- ✅ Cart functionality works
- ✅ Order creation succeeds
- ✅ APIs respond correctly

**The telemedicine platform with medicine shop is now ready for production use!** 🚀

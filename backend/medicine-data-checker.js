const { MongoClient } = require('mongodb');
const axios = require('axios');

const MONGODB_URI = 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const DATABASE_NAME = 'TeleMedicine';
const BACKEND_URL = 'http://localhost:3000';

// Extended medicine data
const extendedMedicineData = [
  {
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    manufacturer: "ABC Pharmaceuticals",
    description: "Pain reliever and fever reducer. Effective for headaches, muscle aches, and minor pain.",
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
    expiryDate: new Date('2026-12-31'),
    batchNumber: 'PCT001',
    sideEffects: 'Nausea, liver damage in high doses',
    contraindications: 'Liver disease, alcohol dependency',
    storageInstructions: 'Store in cool, dry place',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    manufacturer: "XYZ Pharma",
    description: "Antibiotic used to treat bacterial infections including pneumonia, bronchitis, and ear infections.",
    category: "Antibiotics",
    price: 85.00,
    mrp: 100.00,
    stock: 50,
    unit: "capsules",
    packSize: "10 capsules",
    dosage: "250mg",
    form: "capsule",
    activeIngredients: ["Amoxicillin 250mg"],
    images: ["/images/medicines/amoxicillin.jpg"],
    prescriptionRequired: true,
    tags: ["antibiotic", "infection", "bacterial"],
    rating: 4.2,
    reviewCount: 85,
    discount: 15,
    isFeatured: false,
    isActive: true,
    expiryDate: new Date('2026-08-31'),
    batchNumber: 'AMX002',
    sideEffects: 'Diarrhea, nausea, allergic reactions',
    contraindications: 'Penicillin allergy',
    storageInstructions: 'Store below 25°C',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Cetirizine 10mg",
    genericName: "Cetirizine Hydrochloride",
    manufacturer: "HealthCare Ltd",
    description: "Antihistamine used to treat allergy symptoms such as runny nose, sneezing, and itching.",
    category: "Allergy & Cold",
    price: 45.00,
    mrp: 50.00,
    stock: 75,
    unit: "tablets",
    packSize: "10 tablets",
    dosage: "10mg",
    form: "tablet",
    activeIngredients: ["Cetirizine Hydrochloride 10mg"],
    images: ["/images/medicines/cetirizine.jpg"],
    prescriptionRequired: false,
    tags: ["allergy", "antihistamine", "cold"],
    rating: 4.3,
    reviewCount: 95,
    discount: 10,
    isFeatured: true,
    isActive: true,
    expiryDate: new Date('2026-10-31'),
    batchNumber: 'CTZ003',
    sideEffects: 'Drowsiness, dry mouth',
    contraindications: 'Severe kidney disease',
    storageInstructions: 'Store at room temperature',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Metformin 500mg",
    genericName: "Metformin Hydrochloride",
    manufacturer: "Diabetes Care Inc",
    description: "Medication used to treat type 2 diabetes by controlling blood sugar levels.",
    category: "Diabetes",
    price: 120.00,
    mrp: 140.00,
    stock: 60,
    unit: "tablets",
    packSize: "30 tablets",
    dosage: "500mg",
    form: "tablet",
    activeIngredients: ["Metformin Hydrochloride 500mg"],
    images: ["/images/medicines/metformin.jpg"],
    prescriptionRequired: true,
    tags: ["diabetes", "blood sugar", "type 2"],
    rating: 4.4,
    reviewCount: 150,
    discount: 14,
    isFeatured: true,
    isActive: true,
    expiryDate: new Date('2026-06-30'),
    batchNumber: 'MET004',
    sideEffects: 'Nausea, diarrhea, metallic taste',
    contraindications: 'Kidney disease, liver disease',
    storageInstructions: 'Store in cool, dry place',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Vitamin D3 1000 IU",
    genericName: "Cholecalciferol",
    manufacturer: "Wellness Supplements",
    description: "Essential vitamin for bone health, immune function, and calcium absorption.",
    category: "Vitamins & Supplements",
    price: 180.00,
    mrp: 200.00,
    stock: 90,
    unit: "tablets",
    packSize: "30 tablets",
    dosage: "1000 IU",
    form: "tablet",
    activeIngredients: ["Cholecalciferol 1000 IU"],
    images: ["/images/medicines/vitamin-d3.jpg"],
    prescriptionRequired: false,
    tags: ["vitamin", "bone health", "immunity"],
    rating: 4.6,
    reviewCount: 200,
    discount: 10,
    isFeatured: true,
    isActive: true,
    expiryDate: new Date('2027-03-31'),
    batchNumber: 'VTD005',
    sideEffects: 'None at recommended doses',
    contraindications: 'Hypercalcemia, vitamin D toxicity',
    storageInstructions: 'Store in cool, dry place away from light',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Ibuprofen 400mg",
    genericName: "Ibuprofen",
    manufacturer: "PainFree Pharma",
    description: "Non-steroidal anti-inflammatory drug (NSAID) for pain, fever, and inflammation.",
    category: "Pain Relief",
    price: 35.00,
    mrp: 42.00,
    stock: 120,
    unit: "tablets",
    packSize: "10 tablets",
    dosage: "400mg",
    form: "tablet",
    activeIngredients: ["Ibuprofen 400mg"],
    images: ["/images/medicines/ibuprofen.jpg"],
    prescriptionRequired: false,
    tags: ["pain relief", "anti-inflammatory", "fever"],
    rating: 4.3,
    reviewCount: 88,
    discount: 17,
    isFeatured: false,
    isActive: true,
    expiryDate: new Date('2026-09-30'),
    batchNumber: 'IBU006',
    sideEffects: 'Stomach irritation, dizziness',
    contraindications: 'Stomach ulcers, kidney problems',
    storageInstructions: 'Store in cool, dry place',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    manufacturer: "MediCore Labs",
    description: "Macrolide antibiotic used to treat respiratory tract infections, skin infections, and sexually transmitted infections.",
    category: "Antibiotics",
    price: 150.00,
    mrp: 175.00,
    stock: 40,
    unit: "tablets",
    packSize: "3 tablets",
    dosage: "500mg",
    form: "tablet",
    activeIngredients: ["Azithromycin 500mg"],
    images: ["/images/medicines/azithromycin.jpg"],
    prescriptionRequired: true,
    tags: ["antibiotic", "respiratory", "infection"],
    rating: 4.1,
    reviewCount: 65,
    discount: 14,
    isFeatured: false,
    isActive: true,
    expiryDate: new Date('2026-07-31'),
    batchNumber: 'AZI007',
    sideEffects: 'Nausea, stomach pain, diarrhea',
    contraindications: 'Liver disease, heart rhythm disorders',
    storageInstructions: 'Store below 30°C',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Omeprazole 20mg",
    genericName: "Omeprazole",
    manufacturer: "GastroHeal Inc",
    description: "Proton pump inhibitor used to treat acid reflux, heartburn, and stomach ulcers.",
    category: "Gastro Health",
    price: 95.00,
    mrp: 110.00,
    stock: 80,
    unit: "capsules",
    packSize: "14 capsules",
    dosage: "20mg",
    form: "capsule",
    activeIngredients: ["Omeprazole 20mg"],
    images: ["/images/medicines/omeprazole.jpg"],
    prescriptionRequired: false,
    tags: ["acid reflux", "heartburn", "stomach"],
    rating: 4.5,
    reviewCount: 110,
    discount: 14,
    isFeatured: true,
    isActive: true,
    expiryDate: new Date('2026-11-30'),
    batchNumber: 'OME008',
    sideEffects: 'Headache, nausea, stomach pain',
    contraindications: 'Severe liver disease',
    storageInstructions: 'Store in cool, dry place',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Loratadine 10mg",
    genericName: "Loratadine",
    manufacturer: "AllerFree Solutions",
    description: "Long-acting antihistamine for seasonal allergies, hay fever, and hives.",
    category: "Allergy & Cold",
    price: 55.00,
    mrp: 65.00,
    stock: 95,
    unit: "tablets",
    packSize: "10 tablets",
    dosage: "10mg",
    form: "tablet",
    activeIngredients: ["Loratadine 10mg"],
    images: ["/images/medicines/loratadine.jpg"],
    prescriptionRequired: false,
    tags: ["allergy", "hay fever", "antihistamine"],
    rating: 4.4,
    reviewCount: 75,
    discount: 15,
    isFeatured: false,
    isActive: true,
    expiryDate: new Date('2026-12-31'),
    batchNumber: 'LOR009',
    sideEffects: 'Drowsiness, dry mouth, fatigue',
    contraindications: 'Severe kidney or liver disease',
    storageInstructions: 'Store at room temperature',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Calcium + Vitamin D3",
    genericName: "Calcium Carbonate with Cholecalciferol",
    manufacturer: "BoneStrong Nutrients",
    description: "Combination supplement for bone health, calcium deficiency, and vitamin D deficiency.",
    category: "Vitamins & Supplements",
    price: 220.00,
    mrp: 250.00,
    stock: 70,
    unit: "tablets",
    packSize: "30 tablets",
    dosage: "500mg + 250 IU",
    form: "tablet",
    activeIngredients: ["Calcium Carbonate 500mg", "Cholecalciferol 250 IU"],
    images: ["/images/medicines/calcium-d3.jpg"],
    prescriptionRequired: false,
    tags: ["calcium", "vitamin d", "bone health"],
    rating: 4.6,
    reviewCount: 130,
    discount: 12,
    isFeatured: true,
    isActive: true,
    expiryDate: new Date('2027-02-28'),
    batchNumber: 'CAL010',
    sideEffects: 'Constipation, gas, nausea',
    contraindications: 'High calcium levels, kidney stones',
    storageInstructions: 'Store in cool, dry place',
    salesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function checkAndSeedMedicines() {
  console.log('💊 Medicine Data Checker & Seeder');
  console.log('=' .repeat(50));

  let client;
  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');

    const db = client.db(DATABASE_NAME);
    const medicinesCollection = db.collection('medicines');

    // Check current medicine count
    const currentCount = await medicinesCollection.countDocuments();
    console.log(`\n📊 Current medicines in database: ${currentCount}`);

    // Display current medicines
    if (currentCount > 0) {
      console.log('\n📋 Current Medicines:');
      const currentMedicines = await medicinesCollection.find({}).limit(10).toArray();
      currentMedicines.forEach((med, index) => {
        console.log(`  ${index + 1}. ${med.name} - ${med.category} - ₹${med.price} - Stock: ${med.stock}`);
      });
    }

    // Check if we need more medicines
    if (currentCount < 10) {
      console.log(`\n⚠️  Only ${currentCount} medicines found. Adding more sample data...`);
      
      // Clear existing medicines to avoid duplicates
      if (currentCount > 0) {
        await medicinesCollection.deleteMany({});
        console.log('🧹 Cleared existing medicines to avoid duplicates');
      }

      // Add extended medicine data
      const result = await medicinesCollection.insertMany(extendedMedicineData);
      console.log(`✅ Added ${result.insertedCount} medicines to database`);
    } else {
      console.log('✅ Sufficient medicine data already exists');
    }

    // Verify final count
    const finalCount = await medicinesCollection.countDocuments();
    console.log(`\n📊 Final medicine count: ${finalCount}`);

    // Check categories
    const categories = await medicinesCollection.distinct('category');
    console.log(`\n🏷️  Available categories: ${categories.join(', ')}`);

    // Check featured medicines
    const featuredCount = await medicinesCollection.countDocuments({ isFeatured: true });
    console.log(`⭐ Featured medicines: ${featuredCount}`);

    // Check prescription vs OTC
    const prescriptionCount = await medicinesCollection.countDocuments({ prescriptionRequired: true });
    const otcCount = await medicinesCollection.countDocuments({ prescriptionRequired: false });
    console.log(`💊 Prescription medicines: ${prescriptionCount}`);
    console.log(`🛒 Over-the-counter medicines: ${otcCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n📡 Disconnected from MongoDB');
    }
  }

  // Test API endpoints
  console.log('\n🌐 Testing Medicine API Endpoints:');
  console.log('-' .repeat(30));

  const apiTests = [
    { name: 'Get All Medicines', url: `${BACKEND_URL}/api/medicines` },
    { name: 'Get Categories', url: `${BACKEND_URL}/api/medicines/categories` },
    { name: 'Get Featured', url: `${BACKEND_URL}/api/medicines/featured` },
  ];

  for (const test of apiTests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      const response = await axios.get(test.url, { timeout: 3000 });
      
      if (response.status === 200) {
        console.log(`  ✅ Status: ${response.status}`);
        
        if (test.name === 'Get All Medicines' && response.data.medicines) {
          console.log(`  📊 Medicines returned: ${response.data.medicines.length}`);
          console.log(`  📄 Total available: ${response.data.total}`);
        } else if (test.name === 'Get Categories' && Array.isArray(response.data)) {
          console.log(`  🏷️  Categories: ${response.data.join(', ')}`);
        } else if (test.name === 'Get Featured' && Array.isArray(response.data)) {
          console.log(`  ⭐ Featured count: ${response.data.length}`);
        }
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`  🔌 Backend server not running`);
      } else {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Testing Instructions:');
  console.log('1. Start backend: npm run start:dev:nestjs');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Login as patient');
  console.log('4. Visit: http://localhost:5173/patient/medicine-shop');
  console.log('5. You should now see 10 medicines with categories');
}

// Run the checker
if (require.main === module) {
  checkAndSeedMedicines().catch(console.error);
}

module.exports = { checkAndSeedMedicines };

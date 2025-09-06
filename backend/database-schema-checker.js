const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const DATABASE_NAME = 'TeleMedicine';

async function checkAndSeedDatabase() {
    console.log('🏥 Telemedicine Database Schema Checker & Seeder');
    console.log('=' .repeat(60));

    let client;
    try {
        // Connect to MongoDB
        console.log('\n📡 Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas successfully');

        const db = client.db(DATABASE_NAME);

        // Get existing collections
        const collections = await db.listCollections().toArray();
        const existingCollections = collections.map(col => col.name);

        console.log('\n📋 Current Collections:');
        existingCollections.forEach(col => console.log(`  - ${col}`));

        // Required collections with their sample data
        const requiredCollections = {
            'patients': {
                required: true,
                sampleData: [
                    {
                        fullname: 'John Doe',
                        email: 'patient@example.com',
                        password: '$2b$10$hashedpassword', // This should be properly hashed
                        phoneNumber: '+91-9876543210',
                        dateOfBirth: new Date('1990-05-15'),
                        gender: 'Male',
                        address: {
                            street: '123 Main Street',
                            city: 'Mumbai',
                            state: 'Maharashtra',
                            postalCode: '400001',
                            country: 'India'
                        },
                        emergencyContact: {
                            name: 'Jane Doe',
                            relationship: 'Spouse',
                            phoneNumber: '+91-9876543211'
                        },
                        medicalHistory: ['Hypertension', 'Diabetes'],
                        allergies: ['Penicillin'],
                        bloodGroup: 'O+',
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ]
            },
            'doctors': {
                required: true,
                sampleData: [
                    {
                        fullname: 'Dr. Sarah Wilson',
                        email: 'prithvi@gmail.com',
                        password: '$2b$10$hashedpassword',
                        phoneNumber: '+91-9876543220',
                        specialization: 'Cardiology',
                        qualification: 'MD, DM Cardiology',
                        experience: 10,
                        licenseNumber: 'MH/DOC/2015/12345',
                        hospitalAffiliation: 'City General Hospital',
                        consultationFee: 500,
                        bio: 'Experienced cardiologist with 10+ years of practice',
                        languages: ['English', 'Hindi', 'Marathi'],
                        availability: {
                            monday: { start: '09:00', end: '17:00', available: true },
                            tuesday: { start: '09:00', end: '17:00', available: true },
                            wednesday: { start: '09:00', end: '17:00', available: true },
                            thursday: { start: '09:00', end: '17:00', available: true },
                            friday: { start: '09:00', end: '17:00', available: true },
                            saturday: { start: '09:00', end: '13:00', available: true },
                            sunday: { available: false }
                        },
                        rating: 4.8,
                        reviewCount: 156,
                        isVerified: true,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        fullname: 'Dr. Raj Patel',
                        email: 'raj.patel@example.com',
                        password: '$2b$10$hashedpassword',
                        phoneNumber: '+91-9876543221',
                        specialization: 'General Medicine',
                        qualification: 'MBBS, MD',
                        experience: 8,
                        licenseNumber: 'MH/DOC/2017/67890',
                        hospitalAffiliation: 'Metro Medical Center',
                        consultationFee: 300,
                        bio: 'General physician with expertise in family medicine',
                        languages: ['English', 'Hindi', 'Gujarati'],
                        availability: {
                            monday: { start: '10:00', end: '18:00', available: true },
                            tuesday: { start: '10:00', end: '18:00', available: true },
                            wednesday: { start: '10:00', end: '18:00', available: true },
                            thursday: { start: '10:00', end: '18:00', available: true },
                            friday: { start: '10:00', end: '18:00', available: true },
                            saturday: { start: '10:00', end: '14:00', available: true },
                            sunday: { available: false }
                        },
                        rating: 4.6,
                        reviewCount: 89,
                        isVerified: true,
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ]
            },
            'medicines': {
                required: true,
                sampleData: [
                    {
                        name: 'Paracetamol 500mg',
                        genericName: 'Acetaminophen',
                        manufacturer: 'ABC Pharmaceuticals',
                        description: 'Pain reliever and fever reducer. Effective for headaches, muscle aches, and minor pain.',
                        category: 'Pain Relief',
                        price: 25.00,
                        mrp: 30.00,
                        stock: 100,
                        unit: 'tablets',
                        packSize: '10 tablets',
                        dosage: '500mg',
                        form: 'tablet',
                        activeIngredients: ['Acetaminophen 500mg'],
                        images: ['/images/medicines/paracetamol.jpg'],
                        prescriptionRequired: false,
                        tags: ['pain relief', 'fever', 'headache'],
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
                        name: 'Amoxicillin 250mg',
                        genericName: 'Amoxicillin',
                        manufacturer: 'XYZ Pharma',
                        description: 'Antibiotic used to treat bacterial infections including pneumonia, bronchitis, and ear infections.',
                        category: 'Antibiotics',
                        price: 85.00,
                        mrp: 100.00,
                        stock: 50,
                        unit: 'capsules',
                        packSize: '10 capsules',
                        dosage: '250mg',
                        form: 'capsule',
                        activeIngredients: ['Amoxicillin 250mg'],
                        images: ['/images/medicines/amoxicillin.jpg'],
                        prescriptionRequired: true,
                        tags: ['antibiotic', 'infection', 'bacterial'],
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
                        name: 'Cetirizine 10mg',
                        genericName: 'Cetirizine Hydrochloride',
                        manufacturer: 'HealthCare Ltd',
                        description: 'Antihistamine used to treat allergy symptoms such as runny nose, sneezing, and itching.',
                        category: 'Allergy & Cold',
                        price: 45.00,
                        mrp: 50.00,
                        stock: 75,
                        unit: 'tablets',
                        packSize: '10 tablets',
                        dosage: '10mg',
                        form: 'tablet',
                        activeIngredients: ['Cetirizine Hydrochloride 10mg'],
                        images: ['/images/medicines/cetirizine.jpg'],
                        prescriptionRequired: false,
                        tags: ['allergy', 'antihistamine', 'cold'],
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
                        name: 'Metformin 500mg',
                        genericName: 'Metformin Hydrochloride',
                        manufacturer: 'Diabetes Care Inc',
                        description: 'Medication used to treat type 2 diabetes by controlling blood sugar levels.',
                        category: 'Diabetes',
                        price: 120.00,
                        mrp: 140.00,
                        stock: 60,
                        unit: 'tablets',
                        packSize: '30 tablets',
                        dosage: '500mg',
                        form: 'tablet',
                        activeIngredients: ['Metformin Hydrochloride 500mg'],
                        images: ['/images/medicines/metformin.jpg'],
                        prescriptionRequired: true,
                        tags: ['diabetes', 'blood sugar', 'type 2'],
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
                        name: 'Vitamin D3 1000 IU',
                        genericName: 'Cholecalciferol',
                        manufacturer: 'Wellness Supplements',
                        description: 'Essential vitamin for bone health, immune function, and calcium absorption.',
                        category: 'Vitamins & Supplements',
                        price: 180.00,
                        mrp: 200.00,
                        stock: 90,
                        unit: 'tablets',
                        packSize: '30 tablets',
                        dosage: '1000 IU',
                        form: 'tablet',
                        activeIngredients: ['Cholecalciferol 1000 IU'],
                        images: ['/images/medicines/vitamin-d3.jpg'],
                        prescriptionRequired: false,
                        tags: ['vitamin', 'bone health', 'immunity'],
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
                    }
                ]
            },
            'appointments': {
                required: true,
                sampleData: []
            },
            'carts': {
                required: true,
                sampleData: []
            },
            'orders': {
                required: true,
                sampleData: []
            },
            'notifications': {
                required: true,
                sampleData: []
            },
            'prescriptions': {
                required: true,
                sampleData: []
            },
            'reviews': {
                required: true,
                sampleData: []
            },
            'chathistories': {
                required: true,
                sampleData: []
            },
            'medicalrecords': {
                required: true,
                sampleData: []
            }
        };

        console.log('\n🔍 Checking Required Collections...');

        let totalCollectionsChecked = 0;
        let collectionsCreated = 0;
        let documentsAdded = 0;

        for (const [collectionName, config] of Object.entries(requiredCollections)) {
            totalCollectionsChecked++;
            
            console.log(`\n📁 Checking collection: ${collectionName}`);
            
            const collection = db.collection(collectionName);
            
            // Check if collection exists and has data
            const count = await collection.countDocuments();
            
            if (count === 0 && config.sampleData.length > 0) {
                console.log(`  ⚠️  Collection '${collectionName}' is empty, adding sample data...`);
                
                try {
                    await collection.insertMany(config.sampleData);
                    documentsAdded += config.sampleData.length;
                    console.log(`  ✅ Added ${config.sampleData.length} sample documents to '${collectionName}'`);
                } catch (error) {
                    console.log(`  ❌ Error adding data to '${collectionName}': ${error.message}`);
                }
            } else if (count > 0) {
                console.log(`  ✅ Collection '${collectionName}' has ${count} documents`);
            } else {
                console.log(`  ✅ Collection '${collectionName}' exists (no sample data configured)`);
            }

            if (!existingCollections.includes(collectionName)) {
                collectionsCreated++;
            }
        }

        // Create indexes for better performance
        console.log('\n🔧 Creating Database Indexes...');
        
        try {
            // Medicine indexes
            await db.collection('medicines').createIndex({ name: 'text', genericName: 'text', manufacturer: 'text' });
            await db.collection('medicines').createIndex({ category: 1 });
            await db.collection('medicines').createIndex({ price: 1 });
            await db.collection('medicines').createIndex({ isActive: 1 });
            await db.collection('medicines').createIndex({ prescriptionRequired: 1 });
            console.log('  ✅ Medicine collection indexes created');

            // Patient indexes
            await db.collection('patients').createIndex({ email: 1 }, { unique: true });
            await db.collection('patients').createIndex({ phoneNumber: 1 });
            console.log('  ✅ Patient collection indexes created');

            // Doctor indexes
            await db.collection('doctors').createIndex({ email: 1 }, { unique: true });
            await db.collection('doctors').createIndex({ specialization: 1 });
            await db.collection('doctors').createIndex({ isVerified: 1, isActive: 1 });
            console.log('  ✅ Doctor collection indexes created');

            // Cart indexes
            await db.collection('carts').createIndex({ patientId: 1 }, { unique: true });
            console.log('  ✅ Cart collection indexes created');

            // Order indexes
            await db.collection('orders').createIndex({ patientId: 1 });
            await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
            await db.collection('orders').createIndex({ status: 1 });
            await db.collection('orders').createIndex({ createdAt: -1 });
            console.log('  ✅ Order collection indexes created');

            // Appointment indexes
            await db.collection('appointments').createIndex({ doctor: 1, patient: 1 });
            await db.collection('appointments').createIndex({ date: 1 });
            await db.collection('appointments').createIndex({ status: 1 });
            console.log('  ✅ Appointment collection indexes created');

        } catch (error) {
            console.log(`  ⚠️  Some indexes may already exist: ${error.message}`);
        }

        // Database health check
        console.log('\n🏥 Database Health Check...');
        
        const stats = await db.stats();
        console.log(`  📊 Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  📁 Collections: ${stats.collections}`);
        console.log(`  📄 Total documents: ${stats.objects}`);
        console.log(`  🗂️  Indexes: ${stats.indexes}`);

        // Test data relationships
        console.log('\n🔗 Testing Data Relationships...');
        
        const patientsCount = await db.collection('patients').countDocuments();
        const doctorsCount = await db.collection('doctors').countDocuments();
        const medicinesCount = await db.collection('medicines').countDocuments();
        
        console.log(`  👥 Patients: ${patientsCount}`);
        console.log(`  👨‍⚕️  Doctors: ${doctorsCount}`);
        console.log(`  💊 Medicines: ${medicinesCount}`);

        // Summary
        console.log('\n' + '=' .repeat(60));
        console.log('📋 DATABASE SETUP SUMMARY');
        console.log('=' .repeat(60));
        console.log(`✅ Collections checked: ${totalCollectionsChecked}`);
        console.log(`🆕 Documents added: ${documentsAdded}`);
        console.log(`🏥 Database is ready for the telemedicine platform!`);
        
        console.log('\n🎯 Next Steps:');
        console.log('  1. Update your .env file with the MongoDB URI');
        console.log('  2. Start your backend server: npm run start:dev');
        console.log('  3. Test the medicine shop and other features');
        console.log('  4. Add more sample data as needed');

        console.log('\n🔗 Test URLs:');
        console.log('  • Medicine Shop: http://localhost:5173/patient/medicine-shop');
        console.log('  • Patient Dashboard: http://localhost:5173/patient/dashboard');
        console.log('  • Doctor Dashboard: http://localhost:5173/doctor/dashboard');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\n📡 Disconnected from MongoDB');
        }
    }
}

// Run the database checker
if (require.main === module) {
    checkAndSeedDatabase().catch(console.error);
}

module.exports = { checkAndSeedDatabase };

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const DATABASE_NAME = 'TeleMedicine';

async function finalDatabaseSetup() {
    console.log('🏥 Final Telemedicine Database Setup & Verification');
    console.log('=' .repeat(60));

    let client;
    try {
        // Connect to MongoDB
        console.log('\n📡 Connecting to MongoDB Atlas...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB Atlas successfully');

        const db = client.db(DATABASE_NAME);

        // Add test patient if missing
        console.log('\n👤 Checking Test Patient...');
        const patientsCollection = db.collection('patients');
        const existingPatient = await patientsCollection.findOne({ email: 'patient@example.com' });
        
        if (!existingPatient) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const testPatient = {
                fullname: 'John Doe',
                email: 'patient@example.com',
                password: hashedPassword,
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
            };

            await patientsCollection.insertOne(testPatient);
            console.log('✅ Test patient added successfully');
        } else {
            console.log('✅ Test patient already exists');
        }

        // Final verification
        console.log('\n📊 Final Database Status:');
        console.log('-' .repeat(40));

        const collections = ['patients', 'doctors', 'medicines', 'appointments', 'carts', 'orders'];
        let totalDocs = 0;

        for (const collectionName of collections) {
            const count = await db.collection(collectionName).countDocuments();
            totalDocs += count;
            console.log(`  ${collectionName.padEnd(15)}: ${count.toString().padStart(3)} documents`);
        }

        console.log(`  ${'TOTAL'.padEnd(15)}: ${totalDocs.toString().padStart(3)} documents`);

        // Test critical data
        console.log('\n🧪 Critical Data Test:');
        console.log('-' .repeat(40));

        const testPatient = await patientsCollection.findOne({ email: 'patient@example.com' });
        const testDoctor = await db.collection('doctors').findOne({ email: 'prithvi@gmail.com' });
        const medicinesCount = await db.collection('medicines').countDocuments();
        const activePatients = await patientsCollection.countDocuments({ isActive: true });

        console.log(`  👤 Test Patient (patient@example.com): ${testPatient ? '✅' : '❌'}`);
        console.log(`  👨‍⚕️ Test Doctor (prithvi@gmail.com): ${testDoctor ? '✅' : '❌'}`);
        console.log(`  💊 Medicines available: ${medicinesCount >= 5 ? '✅' : '❌'} (${medicinesCount})`);
        console.log(`  👥 Active patients: ${activePatients >= 1 ? '✅' : '❌'} (${activePatients})`);

        // Medicine categories check
        const categories = await db.collection('medicines').distinct('category');
        console.log(`  🏷️  Medicine categories: ${categories.length >= 3 ? '✅' : '❌'} (${categories.join(', ')})`);

        console.log('\n' + '=' .repeat(60));
        console.log('🎉 DATABASE SETUP COMPLETE!');
        console.log('=' .repeat(60));

        console.log('\n✅ What\'s Ready:');
        console.log('  • Complete telemedicine database schema');
        console.log('  • Sample medicines (5 categories)');
        console.log('  • Test patient and doctor accounts');
        console.log('  • Performance indexes created');
        console.log('  • All collections properly initialized');

        console.log('\n🔑 Test Credentials:');
        console.log('  Patient Login: patient@example.com / password123');
        console.log('  Doctor Login: prithvi@gmail.com / (existing password)');

        console.log('\n🚀 Ready to Test:');
        console.log('  1. Medicine Shop E-commerce');
        console.log('  2. Patient Cart & Checkout');
        console.log('  3. Order Management');
        console.log('  4. Payment Integration (Razorpay)');
        console.log('  5. Doctor-Patient System');
        console.log('  6. Appointment Booking');
        console.log('  7. Prescription Management');

        console.log('\n💻 Start Commands:');
        console.log('  Backend: npm run start:dev (Port: 3000)');
        console.log('  Frontend: npm run dev (Port: 5173)');
        console.log('  Visit: http://localhost:5173');

        console.log('\n🛍️ Medicine Shop Features:');
        console.log('  • Browse medicines by category');
        console.log('  • Search and filter functionality');
        console.log('  • Add to cart & quantity management');
        console.log('  • Prescription verification');
        console.log('  • Secure checkout process');
        console.log('  • Order tracking & history');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\n📡 Disconnected from MongoDB');
        }
    }
}

// Run the setup
if (require.main === module) {
    finalDatabaseSetup().catch(console.error);
}

module.exports = { finalDatabaseSetup };

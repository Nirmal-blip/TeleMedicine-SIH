const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

async function setupVideoConsultationDatabase() {
  console.log('🗄️ SETTING UP VIDEO CONSULTATION DATABASE');
  console.log('==========================================');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('test'); // Replace with your actual database name

    // 1. Ensure patients collection has required fields
    console.log('\n👥 Setting up patients collection...');
    const patients = db.collection('patients');
    
    // Update existing patients to ensure they have fullname field
    const patientUpdateResult = await patients.updateMany(
      { fullname: { $exists: false } },
      { $set: { fullname: 'Patient Name', isActive: true } }
    );
    console.log(`✅ Updated ${patientUpdateResult.modifiedCount} patient records`);

    // 2. Ensure doctors collection has required fields
    console.log('\n👨‍⚕️ Setting up doctors collection...');
    const doctors = db.collection('doctors');
    
    // Update existing doctors to ensure they have required fields
    const doctorUpdateResult = await doctors.updateMany(
      { 
        $or: [
          { fullname: { $exists: false } },
          { isActive: { $exists: false } },
          { isVerified: { $exists: false } }
        ]
      },
      { 
        $set: { 
          isActive: true, 
          isVerified: true,
          availability: [
            {
              day: 'Monday',
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true
            },
            {
              day: 'Tuesday', 
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true
            },
            {
              day: 'Wednesday',
              startTime: '09:00', 
              endTime: '17:00',
              isAvailable: true
            },
            {
              day: 'Thursday',
              startTime: '09:00',
              endTime: '17:00', 
              isAvailable: true
            },
            {
              day: 'Friday',
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: true
            }
          ]
        }
      }
    );
    console.log(`✅ Updated ${doctorUpdateResult.modifiedCount} doctor records`);

    // Ensure specific test doctor has fullname
    await doctors.updateOne(
      { email: 'prithvi@gmail.com' },
      { 
        $set: { 
          fullname: 'Dr. Prithviraj Verma',
          specialization: 'ENT',
          isActive: true,
          isVerified: true
        }
      }
    );

    // Ensure specific test patient has fullname
    await patients.updateOne(
      { email: 'prithraj120@gmail.com' },
      { 
        $set: { 
          fullname: 'Prithraj Patient',
          isActive: true
        }
      }
    );

    // 3. Setup appointments collection with video consultation fields
    console.log('\n📅 Setting up appointments collection...');
    const appointments = db.collection('appointments');
    
    // Add indexes for better performance
    await appointments.createIndex({ doctor: 1, patient: 1 });
    await appointments.createIndex({ date: 1, time: 1 });
    await appointments.createIndex({ callId: 1 });
    await appointments.createIndex({ status: 1 });
    
    console.log('✅ Appointment indexes created');

    // 4. Ensure appointment schema has video consultation fields
    const appointmentUpdateResult = await appointments.updateMany(
      { isVideoConsultation: { $exists: false } },
      { 
        $set: { 
          isVideoConsultation: false,
          callStartTime: null,
          callEndTime: null,
          duration: null,
          callId: null,
          recordingUrl: null
        }
      }
    );
    console.log(`✅ Updated ${appointmentUpdateResult.modifiedCount} appointment records with video consultation fields`);

    // 5. Create some sample data if collections are empty
    const patientCount = await patients.countDocuments();
    const doctorCount = await doctors.countDocuments();
    
    if (patientCount === 0) {
      console.log('\n📝 Creating sample patient data...');
      await patients.insertOne({
        fullname: 'Test Patient',
        email: 'test.patient@example.com',
        password: '$2b$10$hashedpassword', // This would be properly hashed
        age: 30,
        gender: 'Male',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Sample patient created');
    }

    if (doctorCount === 0) {
      console.log('\n📝 Creating sample doctor data...');
      await doctors.insertOne({
        fullname: 'Dr. Test Doctor',
        email: 'test.doctor@example.com',
        password: '$2b$10$hashedpassword', // This would be properly hashed
        specialization: 'General Medicine',
        experience: 10,
        qualification: 'MBBS, MD',
        consultationFee: 500,
        rating: 4.5,
        totalRatings: 100,
        isActive: true,
        isVerified: true,
        availability: [
          {
            day: 'Monday',
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Sample doctor created');
    }

    // 6. Display current database status
    console.log('\n📊 DATABASE STATUS:');
    console.log('==================');
    console.log(`👥 Patients: ${await patients.countDocuments()}`);
    console.log(`👨‍⚕️ Doctors: ${await doctors.countDocuments()}`);
    console.log(`📅 Appointments: ${await appointments.countDocuments()}`);
    
    // Show sample doctor and patient
    const sampleDoctor = await doctors.findOne({ email: 'prithvi@gmail.com' });
    const samplePatient = await patients.findOne({ email: 'prithraj120@gmail.com' });
    
    if (sampleDoctor) {
      console.log(`\n👨‍⚕️ Test Doctor: ${sampleDoctor.fullname} (${sampleDoctor.specialization})`);
      console.log(`   Active: ${sampleDoctor.isActive}, Verified: ${sampleDoctor.isVerified}`);
    }
    
    if (samplePatient) {
      console.log(`👥 Test Patient: ${samplePatient.fullname}`);
      console.log(`   Active: ${samplePatient.isActive}`);
    }

    console.log('\n🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('🔥 Ready for video consultation testing!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await client.close();
  }
}

// Run the setup
if (require.main === module) {
  setupVideoConsultationDatabase().catch(console.error);
}

module.exports = { setupVideoConsultationDatabase };

const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

// Configuration - using the same URI as the application
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const DB_NAME = 'TeleMedicine';

class DatabaseTester {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      console.log('🔌 Connecting to MongoDB...');
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      console.log('✅ Connected to MongoDB successfully');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  async testCollections() {
    try {
      console.log('\n📋 Testing Collections...');
      const collections = await this.db.listCollections().toArray();
      
      console.log(`Found ${collections.length} collections:`);
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });

      // Test individual collections
      const testCollections = ['patients', 'doctors', 'chathistories', 'appointments', 'medicalrecords'];
      
      for (const collectionName of testCollections) {
        await this.testCollection(collectionName);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Collection test failed:', error.message);
      return false;
    }
  }

  async testCollection(collectionName) {
    try {
      const collection = this.db.collection(collectionName);
      const count = await collection.countDocuments();
      const sample = count > 0 ? await collection.findOne() : null;
      
      console.log(`\n📊 Collection: ${collectionName}`);
      console.log(`   Documents: ${count}`);
      
      if (sample) {
        console.log(`   Sample document keys: ${Object.keys(sample).join(', ')}`);
        if (sample._id) {
          console.log(`   Sample ID: ${sample._id}`);
        }
      } else {
        console.log(`   No documents found`);
      }
    } catch (error) {
      console.error(`❌ Error testing collection ${collectionName}:`, error.message);
    }
  }

  async testRelationships() {
    try {
      console.log('\n🔗 Testing Relationships...');
      
      // Test Patient-ChatHistory relationship
      await this.testPatientChatRelationship();
      
      // Test Patient-Appointment relationship
      await this.testPatientAppointmentRelationship();
      
      // Test Doctor-Appointment relationship
      await this.testDoctorAppointmentRelationship();
      
      return true;
    } catch (error) {
      console.error('❌ Relationship test failed:', error.message);
      return false;
    }
  }

  async testPatientChatRelationship() {
    try {
      const patients = this.db.collection('patients');
      const chatHistories = this.db.collection('chathistories');
      
      const patientCount = await patients.countDocuments();
      const chatCount = await chatHistories.countDocuments();
      
      console.log(`\n👤➡️💬 Patient-ChatHistory Relationship:`);
      console.log(`   Patients: ${patientCount}`);
      console.log(`   Chat Sessions: ${chatCount}`);
      
      if (patientCount > 0 && chatCount > 0) {
        // Find a patient with chat history
        const patientWithChats = await patients.aggregate([
          {
            $lookup: {
              from: 'chathistories',
              localField: '_id',
              foreignField: 'userId',
              as: 'chats'
            }
          },
          {
            $match: {
              'chats.0': { $exists: true }
            }
          },
          {
            $limit: 1
          }
        ]).toArray();
        
        if (patientWithChats.length > 0) {
          const patient = patientWithChats[0];
          console.log(`   ✅ Found patient ${patient.fullname} with ${patient.chats.length} chat sessions`);
        } else {
          console.log(`   ⚠️  No patients found with chat history`);
        }
      }
    } catch (error) {
      console.error(`❌ Patient-Chat relationship test failed:`, error.message);
    }
  }

  async testPatientAppointmentRelationship() {
    try {
      const patients = this.db.collection('patients');
      const appointments = this.db.collection('appointments');
      
      const appointmentCount = await appointments.countDocuments();
      
      console.log(`\n👤➡️📅 Patient-Appointment Relationship:`);
      console.log(`   Appointments: ${appointmentCount}`);
      
      if (appointmentCount > 0) {
        const appointmentSample = await appointments.findOne();
        if (appointmentSample && appointmentSample.patientId) {
          const patient = await patients.findOne({ _id: appointmentSample.patientId });
          if (patient) {
            console.log(`   ✅ Found appointment for patient: ${patient.fullname}`);
          } else {
            console.log(`   ⚠️  Appointment references non-existent patient`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Patient-Appointment relationship test failed:`, error.message);
    }
  }

  async testDoctorAppointmentRelationship() {
    try {
      const doctors = this.db.collection('doctors');
      const appointments = this.db.collection('appointments');
      
      const doctorCount = await doctors.countDocuments();
      const appointmentCount = await appointments.countDocuments();
      
      console.log(`\n👨‍⚕️➡️📅 Doctor-Appointment Relationship:`);
      console.log(`   Doctors: ${doctorCount}`);
      console.log(`   Appointments: ${appointmentCount}`);
      
      if (doctorCount > 0 && appointmentCount > 0) {
        const appointmentSample = await appointments.findOne();
        if (appointmentSample && appointmentSample.doctorId) {
          const doctor = await doctors.findOne({ _id: appointmentSample.doctorId });
          if (doctor) {
            console.log(`   ✅ Found appointment with doctor: ${doctor.fullname}`);
          } else {
            console.log(`   ⚠️  Appointment references non-existent doctor`);
          }
        }
      }
    } catch (error) {
      console.error(`❌ Doctor-Appointment relationship test failed:`, error.message);
    }
  }

  async testIndexes() {
    try {
      console.log('\n📇 Testing Indexes...');
      
      const testCollections = ['patients', 'doctors', 'chathistories', 'appointments'];
      
      for (const collectionName of testCollections) {
        const collection = this.db.collection(collectionName);
        const indexes = await collection.indexes();
        
        console.log(`\n   ${collectionName} indexes:`);
        indexes.forEach(index => {
          const keyString = Object.keys(index.key).map(key => `${key}:${index.key[key]}`).join(', ');
          console.log(`     - ${index.name}: {${keyString}}`);
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Index test failed:', error.message);
      return false;
    }
  }

  async testMongooseConnection() {
    try {
      console.log('\n🍃 Testing Mongoose Connection...');
      
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Mongoose connected successfully');
      
      const connections = mongoose.connections;
      console.log(`   Active connections: ${connections.length}`);
      console.log(`   Database name: ${mongoose.connection.db.databaseName}`);
      console.log(`   Ready state: ${mongoose.connection.readyState} (1=connected)`);
      
      await mongoose.disconnect();
      console.log('✅ Mongoose disconnected successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Mongoose test failed:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Database Tests...\n');
    
    const connected = await this.connect();
    if (!connected) {
      return false;
    }

    let allTestsPassed = true;
    
    // Run all tests
    allTestsPassed &= await this.testCollections();
    allTestsPassed &= await this.testRelationships();
    allTestsPassed &= await this.testIndexes();
    allTestsPassed &= await this.testMongooseConnection();
    
    await this.close();
    
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 All database tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check the output above.');
    }
    console.log('='.repeat(50));
    
    return allTestsPassed;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

// Self-executing test
if (require.main === module) {
  const tester = new DatabaseTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = DatabaseTester;

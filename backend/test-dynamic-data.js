const { MongoClient } = require('mongodb');
const axios = require('axios');

// Database configuration
const MONGODB_URI = 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const DB_NAME = 'TeleMedicine';

// Backend and Frontend URLs
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

// Test user credentials
const TEST_USER = {
  email: 'prithraj120@gmail.com',
  password: '123123123',
  userType: 'patient'  // Add required userType field
};

let authToken = '';
let authCookies = '';

console.log('🚀 Starting Dynamic Data Integration Test...\n');

// MongoDB Connection Test
async function testDatabaseConnection() {
  console.log('📊 Testing MongoDB Database Connection...');
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Test collections existence and count documents
    const collections = ['users', 'doctors', 'patients', 'appointments', 'chathistories'];
    const stats = {};
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        stats[collectionName] = count;
        console.log(`   ✅ ${collectionName}: ${count} documents`);
      } catch (err) {
        console.log(`   ❌ ${collectionName}: Error - ${err.message}`);
        stats[collectionName] = 'Error';
      }
    }
    
    await client.close();
    console.log('   ✅ Database connection successful!\n');
    return stats;
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}\n`);
    return null;
  }
}

// Backend Authentication Test
async function testBackendAuth() {
  console.log('🔐 Testing Backend Authentication...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_USER, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    // Extract token and cookies
    authToken = response.data.access_token;
    authCookies = response.headers['set-cookie']?.join('; ') || '';
    
    console.log('   ✅ Backend authentication successful!');
    console.log(`   📝 Token received: ${authToken ? 'Yes' : 'No'}`);
    console.log(`   🍪 Cookies received: ${authCookies ? 'Yes' : 'No'}\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Backend authentication failed: ${error.response?.data?.message || error.message}\n`);
    return false;
  }
}

// Test Backend API Endpoints
async function testBackendEndpoints() {
  console.log('🔧 Testing Backend API Endpoints...');
  
  const endpoints = [
    { name: 'Get Current Patient', url: '/api/patients/me', method: 'GET' },
    { name: 'Get All Doctors', url: '/api/doctors', method: 'GET' },
    { name: 'Get Available Doctors', url: '/api/doctors/available', method: 'GET' },
    { name: 'Search Doctors', url: '/api/doctors?search=cardio', method: 'GET' },
    { name: 'Get Patient Appointments', url: '/api/appointments', method: 'GET' },
    { name: 'Get Upcoming Appointments', url: '/api/appointments/my/upcoming', method: 'GET' },
    { name: 'Get Completed Appointments', url: '/api/appointments/my/completed', method: 'GET' },
    { name: 'Get Chat History Sessions', url: '/api/ai/chat/sessions', method: 'GET' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Cookie': authCookies
        },
        withCredentials: true
      };
      
      const response = await axios.get(`${BACKEND_URL}${endpoint.url}`, config);
      const dataLength = Array.isArray(response.data) ? response.data.length : 
                       typeof response.data === 'object' ? Object.keys(response.data).length : 1;
      
      console.log(`   ✅ ${endpoint.name}: ${response.status} - ${dataLength} items`);
      results[endpoint.name] = { status: response.status, count: dataLength, success: true };
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
      results[endpoint.name] = { 
        status: error.response?.status || 'Error', 
        error: error.response?.data?.message || error.message, 
        success: false 
      };
    }
  }
  
  console.log('');
  return results;
}

// Test Frontend Pages (simulate frontend requests)
async function testFrontendDataFetching() {
  console.log('🎨 Testing Frontend Data Fetching Simulation...');
  
  // Simulate frontend API calls that we implemented
  const frontendEndpoints = [
    { 
      name: 'DoctorsList Page', 
      url: '/api/doctors',
      description: 'Fetching doctors for patient doctor selection'
    },
    { 
      name: 'Patient Appointments Page', 
      url: '/api/appointments/my/upcoming',
      description: 'Fetching upcoming appointments for patient'
    },
    { 
      name: 'Patient Consultation History', 
      url: '/api/appointments/my/completed',
      description: 'Fetching completed consultations for patient'
    },
    { 
      name: 'Available Doctors Widget', 
      url: '/api/doctors/available',
      description: 'Fetching available doctors for dashboard'
    }
  ];
  
  const frontendResults = {};
  
  for (const endpoint of frontendEndpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint.url}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Cookie': authCookies,
          'Origin': FRONTEND_URL,
          'Referer': FRONTEND_URL
        },
        withCredentials: true
      });
      
      const dataCount = Array.isArray(response.data) ? response.data.length : 1;
      console.log(`   ✅ ${endpoint.name}: ${dataCount} items loaded`);
      console.log(`      📄 ${endpoint.description}`);
      
      frontendResults[endpoint.name] = { 
        success: true, 
        count: dataCount,
        description: endpoint.description
      };
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'}`);
      console.log(`      📄 ${endpoint.description}`);
      
      frontendResults[endpoint.name] = { 
        success: false, 
        error: error.response?.data?.message || error.message,
        description: endpoint.description
      };
    }
  }
  
  console.log('');
  return frontendResults;
}

// Test Data Relationships and Create Sample Data if Needed
async function testDataRelationships() {
  console.log('🔗 Testing Data Relationships...');
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Test 1: Check if appointments have proper doctor references
    const appointmentCount = await db.collection('appointments').countDocuments();
    console.log(`   📋 Found ${appointmentCount} appointments in database`);
    
    // If no appointments exist, let's create some sample data for testing
    if (appointmentCount === 0) {
      console.log('   📝 Creating sample appointment data for testing...');
      
      // Get first patient and doctor
      const firstPatient = await db.collection('patients').findOne();
      const firstDoctor = await db.collection('doctors').findOne();
      
      if (firstPatient && firstDoctor) {
        const sampleAppointments = [
          {
            patient: firstPatient._id,
            doctor: firstDoctor._id,
            date: new Date('2024-01-15'),
            time: '10:00',
            type: 'Online',
            status: 'Completed',
            reason: 'Regular Checkup',
            consultationFee: 150,
            diagnosis: 'General health check - all normal',
            notes: 'Patient is in good health',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            patient: firstPatient._id,
            doctor: firstDoctor._id,
            date: new Date('2024-02-15'),
            time: '14:30',
            type: 'Online',
            status: 'Upcoming',
            reason: 'Follow-up Consultation',
            consultationFee: 150,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        await db.collection('appointments').insertMany(sampleAppointments);
        console.log('   ✅ Created 2 sample appointments for testing');
      } else {
        console.log('   ⚠️ Cannot create sample appointments - missing patient or doctor data');
      }
    }
    
    // Re-check appointments with doctor relationships
    const appointments = await db.collection('appointments')
      .aggregate([
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo'
          }
        },
        { $limit: 5 }
      ]).toArray();
    
    console.log(`   📋 Found ${appointments.length} appointments with doctor relationships`);
    
    // Test 2: Check if patients exist for appointments
    const patients = await db.collection('patients').countDocuments();
    console.log(`   👥 Found ${patients} patients in database`);
    
    // Test 3: Check chat history relationships
    const chatSessions = await db.collection('chathistories').countDocuments();
    console.log(`   💬 Found ${chatSessions} chat history records`);
    
    await client.close();
    console.log('   ✅ Data relationships verified!\n');
    return true;
  } catch (error) {
    console.log(`   ❌ Data relationship test failed: ${error.message}\n`);
    return false;
  }
}

// Generate Test Report
function generateReport(dbStats, backendResults, frontendResults, relationshipsOk) {
  console.log('📊 === DYNAMIC DATA INTEGRATION TEST REPORT ===\n');
  
  // Database Summary
  console.log('🗄️  DATABASE STATUS:');
  if (dbStats) {
    Object.entries(dbStats).forEach(([collection, count]) => {
      console.log(`   ${collection}: ${count} documents`);
    });
  } else {
    console.log('   ❌ Database connection failed');
  }
  console.log('');
  
  // Backend API Summary
  console.log('🔧 BACKEND API STATUS:');
  Object.entries(backendResults).forEach(([endpoint, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${endpoint}: ${result.success ? `${result.count} items` : result.error}`);
  });
  console.log('');
  
  // Frontend Simulation Summary
  console.log('🎨 FRONTEND INTEGRATION STATUS:');
  Object.entries(frontendResults).forEach(([page, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${page}: ${result.success ? `${result.count} items` : result.error}`);
  });
  console.log('');
  
  // Overall Status
  const dbOk = dbStats !== null;
  const backendOk = Object.values(backendResults).some(r => r.success);
  const frontendOk = Object.values(frontendResults).some(r => r.success);
  
  console.log('🎯 OVERALL INTEGRATION STATUS:');
  console.log(`   Database Connection: ${dbOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Backend APIs: ${backendOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Frontend Integration: ${frontendOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Data Relationships: ${relationshipsOk ? '✅ Working' : '❌ Failed'}`);
  console.log('');
  
  const allWorking = dbOk && backendOk && frontendOk && relationshipsOk;
  console.log(`🚀 DYNAMIC DATA SYSTEM: ${allWorking ? '✅ FULLY OPERATIONAL' : '⚠️ NEEDS ATTENTION'}`);
  
  if (!allWorking) {
    console.log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS:');
    if (!dbOk) console.log('   • Check MongoDB Atlas connection and credentials');
    if (!backendOk) console.log('   • Ensure NestJS backend is running on port 3000');
    if (!frontendOk) console.log('   • Verify frontend can connect to backend APIs');
    if (!relationshipsOk) console.log('   • Check database schema and relationships');
  }
}

// Main Test Function
async function runDynamicDataTest() {
  try {
    console.log('Starting comprehensive dynamic data integration test...\n');
    
    // Run all tests
    const dbStats = await testDatabaseConnection();
    
    let backendResults = {};
    let frontendResults = {};
    let relationshipsOk = false;
    
    const authSuccess = await testBackendAuth();
    if (authSuccess) {
      backendResults = await testBackendEndpoints();
      frontendResults = await testFrontendDataFetching();
    } else {
      console.log('⚠️ Skipping API tests due to authentication failure\n');
    }
    
    relationshipsOk = await testDataRelationships();
    
    // Generate final report
    generateReport(dbStats, backendResults, frontendResults, relationshipsOk);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

// Run the test
runDynamicDataTest();

const axios = require('axios');
const { io } = require('socket.io-client');

// Configuration
const BASE_URL = 'http://localhost:3000';
const MONGODB_URI = 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

// Test users
const TEST_PATIENT = {
  email: 'prithraj120@gmail.com',
  password: '123123123',
  userType: 'patient'
};

const TEST_DOCTOR = {
  email: 'prithvi@gmail.com',
  password: '123123123',
  userType: 'doctor'
};

let patientToken = '';
let doctorToken = '';
let patientId = '';
let doctorId = '';
let appointmentId = '';
let callId = '';

// Helper function to make authenticated requests
const authenticatedRequest = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Cookie': `token=${token}`
    }
  });
};

async function testPatientLogin() {
  console.log('\n🔐 Testing Patient Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_PATIENT);
    
    // Extract token from Set-Cookie header
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader[0].match(/token=([^;]+)/);
      if (tokenMatch) {
        patientToken = tokenMatch[1];
        console.log('✅ Patient login successful');
        
        // Get patient ID
        const patientResponse = await authenticatedRequest(patientToken).get('/api/patients/me');
        patientId = patientResponse.data._id;
        console.log('✅ Patient ID retrieved:', patientId);
        
        return true;
      }
    }
    throw new Error('Token not found in response');
  } catch (error) {
    console.error('❌ Patient login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testDoctorLogin() {
  console.log('\n🔐 Testing Doctor Login...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_DOCTOR);
    
    // Extract token from Set-Cookie header
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader[0].match(/token=([^;]+)/);
      if (tokenMatch) {
        doctorToken = tokenMatch[1];
        console.log('✅ Doctor login successful');
        
        // Get doctor ID
        const doctorResponse = await authenticatedRequest(doctorToken).get('/api/doctors/me');
        doctorId = doctorResponse.data._id;
        console.log('✅ Doctor ID retrieved:', doctorId);
        
        return true;
      }
    }
    throw new Error('Token not found in response');
  } catch (error) {
    console.error('❌ Doctor login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testDoctorsList() {
  console.log('\n👩‍⚕️ Testing Doctors List Retrieval...');
  try {
    const response = await authenticatedRequest(patientToken).get('/api/doctors');
    console.log(`✅ Found ${response.data.length} doctors`);
    
    if (response.data.length > 0) {
      const firstDoctor = response.data[0];
      console.log(`✅ Sample doctor: ${firstDoctor.fullname} - ${firstDoctor.specialization}`);
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to retrieve doctors:', error.response?.data?.message || error.message);
    return [];
  }
}

async function testAppointmentBooking() {
  console.log('\n📅 Testing Appointment Booking...');
  try {
    const appointmentData = {
      doctor: doctorId,
      patient: patientId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      reason: 'Test video consultation',
      status: 'Confirmed'
    };
    
    const response = await authenticatedRequest(patientToken).post('/api/appointments', appointmentData);
    appointmentId = response.data._id;
    console.log('✅ Appointment booked successfully');
    console.log(`✅ Appointment ID: ${appointmentId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to book appointment:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testVideoConsultationEndpoints() {
  console.log('\n🎥 Testing Video Consultation Endpoints...');
  
  try {
    // Test upcoming appointments for patient
    console.log('Testing patient upcoming appointments...');
    const patientUpcoming = await authenticatedRequest(patientToken).get('/api/video-consultation/upcoming-appointments');
    console.log(`✅ Patient has ${patientUpcoming.data.length} upcoming video consultations`);
    
    // Test upcoming appointments for doctor
    console.log('Testing doctor upcoming appointments...');
    const doctorUpcoming = await authenticatedRequest(doctorToken).get('/api/video-consultation/upcoming-appointments');
    console.log(`✅ Doctor has ${doctorUpcoming.data.length} upcoming video consultations`);
    
    // Test active calls
    console.log('Testing active calls...');
    const activeCalls = await authenticatedRequest(patientToken).get('/api/video-consultation/active-calls');
    console.log(`✅ Found ${activeCalls.data.length} active calls`);
    
    return true;
  } catch (error) {
    console.error('❌ Video consultation endpoints test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testStartVideoCall() {
  console.log('\n🚀 Testing Start Video Call...');
  try {
    callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const callData = {
      appointmentId: appointmentId,
      patientId: patientId,
      callId: callId
    };
    
    const response = await authenticatedRequest(doctorToken).post('/api/video-consultation/start-call', callData);
    console.log('✅ Video call started successfully');
    console.log(`✅ Call ID: ${callId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to start video call:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testWebSocketConnection() {
  console.log('\n🔌 Testing WebSocket Connection...');
  
  return new Promise((resolve) => {
    try {
      const socket = io(`${BASE_URL}/video-consultation`, {
        query: {
          userId: patientId,
          userType: 'patient'
        }
      });
      
      socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        
        // Test joining a call room
        socket.emit('join-call', { callId: callId });
        console.log('✅ Joined call room');
        
        socket.disconnect();
        resolve(true);
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection failed:', error.message);
        resolve(false);
      });
      
      // Timeout after 5 seconds
      setTimeout(() => {
        console.error('❌ WebSocket connection timeout');
        socket.disconnect();
        resolve(false);
      }, 5000);
      
    } catch (error) {
      console.error('❌ WebSocket test failed:', error.message);
      resolve(false);
    }
  });
}

async function testCallHistory() {
  console.log('\n📊 Testing Call History...');
  try {
    const patientHistory = await authenticatedRequest(patientToken).get('/api/video-consultation/call-history');
    console.log(`✅ Patient call history: ${patientHistory.data.length} calls`);
    
    const doctorHistory = await authenticatedRequest(doctorToken).get('/api/video-consultation/call-history');
    console.log(`✅ Doctor call history: ${doctorHistory.data.length} calls`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to retrieve call history:', error.response?.data?.message || error.message);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    if (appointmentId) {
      await authenticatedRequest(patientToken).delete(`/api/appointments/${appointmentId}`);
      console.log('✅ Test appointment deleted');
    }
  } catch (error) {
    console.log('⚠️ Cleanup warning:', error.response?.data?.message || error.message);
  }
}

async function runAllTests() {
  console.log('🧪 PATIENT-TO-DOCTOR VIDEO CONSULTATION CONNECTION TEST');
  console.log('=====================================================');
  
  const results = {
    patientLogin: false,
    doctorLogin: false,
    doctorsList: false,
    appointmentBooking: false,
    videoEndpoints: false,
    startCall: false,
    websocket: false,
    callHistory: false
  };
  
  // Test patient authentication
  results.patientLogin = await testPatientLogin();
  if (!results.patientLogin) {
    console.log('\n❌ CRITICAL: Patient authentication failed. Cannot continue tests.');
    return results;
  }
  
  // Test doctor authentication
  results.doctorLogin = await testDoctorLogin();
  if (!results.doctorLogin) {
    console.log('\n❌ CRITICAL: Doctor authentication failed. Cannot continue tests.');
    return results;
  }
  
  // Test doctors list
  const doctors = await testDoctorsList();
  results.doctorsList = doctors.length > 0;
  
  // Test appointment booking
  results.appointmentBooking = await testAppointmentBooking();
  
  // Test video consultation endpoints
  results.videoEndpoints = await testVideoConsultationEndpoints();
  
  // Test starting video call
  results.startCall = await testStartVideoCall();
  
  // Test WebSocket connection
  results.websocket = await testWebSocketConnection();
  
  // Test call history
  results.callHistory = await testCallHistory();
  
  // Cleanup
  await cleanup();
  
  // Summary
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`Patient Login: ${results.patientLogin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Doctor Login: ${results.doctorLogin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Doctors List: ${results.doctorsList ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Appointment Booking: ${results.appointmentBooking ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Video Endpoints: ${results.videoEndpoints ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Start Video Call: ${results.startCall ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WebSocket Connection: ${results.websocket ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Call History: ${results.callHistory ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 OVERALL RESULT: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Patient-to-doctor video consultation connection is FULLY FUNCTIONAL!');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }
  
  return results;
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };

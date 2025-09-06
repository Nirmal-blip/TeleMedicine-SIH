const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';

// Test user
const TEST_PATIENT = {
  email: 'prithraj120@gmail.com',
  password: '123123123',
  userType: 'patient'
};

let patientToken = '';
let patientId = '';
let doctorId = '';

// Helper function to make authenticated requests
const authenticatedRequest = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Cookie': `token=${token}`
    }
  });
};

async function testAppointmentBooking() {
  console.log('🧪 TESTING APPOINTMENT BOOKING FIX');
  console.log('==================================');

  try {
    // Step 1: Login as patient
    console.log('\n🔐 Logging in as patient...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_PATIENT);
    
    // Extract token from Set-Cookie header
    const setCookieHeader = loginResponse.headers['set-cookie'];
    if (setCookieHeader) {
      const tokenMatch = setCookieHeader[0].match(/token=([^;]+)/);
      if (tokenMatch) {
        patientToken = tokenMatch[1];
        console.log('✅ Patient login successful');
      }
    }

    // Step 2: Get patient ID
    const patientResponse = await authenticatedRequest(patientToken).get('/api/patients/me');
    patientId = patientResponse.data._id;
    console.log('✅ Patient ID retrieved:', patientId);

    // Step 3: Get a doctor to book with
    const doctorsResponse = await authenticatedRequest(patientToken).get('/api/doctors');
    if (doctorsResponse.data.length > 0) {
      doctorId = doctorsResponse.data[0]._id;
      console.log('✅ Doctor ID retrieved:', doctorId);
      console.log('✅ Doctor name:', doctorsResponse.data[0].fullname);
    } else {
      throw new Error('No doctors found in the system');
    }

    // Step 4: Test regular appointment booking
    console.log('\n📅 Testing regular appointment booking...');
    const appointmentData = {
      doctor: doctorId,
      patient: patientId,
      date: new Date().toISOString().split('T')[0],
      time: '14:30',
      reason: 'Test consultation booking',
      status: 'Pending'
    };

    const appointmentResponse = await authenticatedRequest(patientToken).post('/api/appointments', appointmentData);
    console.log('✅ Regular appointment booked successfully!');
    console.log('✅ Appointment ID:', appointmentResponse.data._id);

    // Step 5: Test immediate consultation booking
    console.log('\n🚀 Testing immediate consultation booking...');
    const immediateData = {
      doctor: doctorId,
      patient: patientId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      reason: 'Immediate Video Consultation',
      status: 'Confirmed'
    };

    const immediateResponse = await authenticatedRequest(patientToken).post('/api/appointments', immediateData);
    console.log('✅ Immediate consultation booked successfully!');
    console.log('✅ Immediate appointment ID:', immediateResponse.data._id);

    // Step 6: Cleanup (delete test appointments)
    console.log('\n🧹 Cleaning up test appointments...');
    await authenticatedRequest(patientToken).delete(`/api/appointments/${appointmentResponse.data._id}`);
    await authenticatedRequest(patientToken).delete(`/api/appointments/${immediateResponse.data._id}`);
    console.log('✅ Test appointments deleted');

    console.log('\n🎉 ALL TESTS PASSED! Appointment booking is now working correctly!');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

// Run the test
if (require.main === module) {
  testAppointmentBooking().catch(console.error);
}

module.exports = { testAppointmentBooking };

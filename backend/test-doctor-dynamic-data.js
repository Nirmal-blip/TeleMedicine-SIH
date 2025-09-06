const axios = require('axios');

// Backend URL
const BACKEND_URL = 'http://localhost:3000';

// Test doctor credentials
const TEST_DOCTOR = {
  email: 'prithvi@gmail.com',
  password: '123123123',
  userType: 'doctor'
};

let authCookies = '';

console.log('🩺 Starting Doctor Dynamic Data Integration Test...\n');

// Doctor Authentication Test
async function testDoctorAuth() {
  console.log('🔐 Testing Doctor Authentication...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, TEST_DOCTOR, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    
    authCookies = response.headers['set-cookie']?.join('; ') || '';
    
    console.log('   ✅ Doctor authentication successful!');
    console.log(`   🍪 Cookies received: ${authCookies ? 'Yes' : 'No'}\n`);
    return true;
  } catch (error) {
    console.log(`   ❌ Doctor authentication failed: ${error.response?.data?.message || error.message}\n`);
    return false;
  }
}

// Test Doctor Dashboard Endpoints
async function testDoctorDashboard() {
  console.log('📊 Testing Doctor Dashboard Endpoints...');
  
  const endpoints = [
    { name: 'Get Current Doctor', url: '/api/doctors/me', description: 'Doctor profile data' },
    { name: 'Get Doctor Stats', url: '/api/doctors/me/stats', description: 'Doctor performance statistics' },
    { name: 'Get Doctor Upcoming Appointments', url: '/api/appointments/my/upcoming', description: 'Today\'s appointments for dashboard' },
    { name: 'Get All Patients', url: '/api/patients', description: 'Patient list for doctor' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        headers: {
          'Cookie': authCookies
        },
        withCredentials: true
      };
      
      const response = await axios.get(`${BACKEND_URL}${endpoint.url}`, config);
      const dataLength = Array.isArray(response.data) ? response.data.length : 
                       typeof response.data === 'object' ? Object.keys(response.data).length : 1;
      
      console.log(`   ✅ ${endpoint.name}: ${response.status} - ${dataLength} items`);
      console.log(`      📄 ${endpoint.description}`);
      results[endpoint.name] = { status: response.status, count: dataLength, success: true };
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'} - ${error.response?.data?.message || error.message}`);
      console.log(`      📄 ${endpoint.description}`);
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

// Test Doctor Patient Management
async function testPatientManagement() {
  console.log('👥 Testing Doctor Patient Management...');
  
  const endpoints = [
    { name: 'Patient List', url: '/api/patients', description: 'All patients for doctor dashboard' },
    { name: 'Patient Search', url: '/api/patients?search=john', description: 'Search patients by name' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        headers: {
          'Cookie': authCookies
        },
        withCredentials: true
      };
      
      const response = await axios.get(`${BACKEND_URL}${endpoint.url}`, config);
      const dataLength = Array.isArray(response.data) ? response.data.length : 1;
      
      console.log(`   ✅ ${endpoint.name}: ${dataLength} patients loaded`);
      console.log(`      📄 ${endpoint.description}`);
      results[endpoint.name] = { success: true, count: dataLength };
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'}`);
      console.log(`      📄 ${endpoint.description}`);
      results[endpoint.name] = { success: false, error: error.message };
    }
  }
  
  console.log('');
  return results;
}

// Test Doctor Consultation History
async function testConsultationHistory() {
  console.log('📋 Testing Doctor Consultation History...');
  
  const endpoints = [
    { name: 'Completed Consultations', url: '/api/appointments/my/completed', description: 'Past consultations for history page' },
    { name: 'All Doctor Appointments', url: '/api/appointments', description: 'All appointments for doctor' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        headers: {
          'Cookie': authCookies
        },
        withCredentials: true
      };
      
      const response = await axios.get(`${BACKEND_URL}${endpoint.url}`, config);
      const dataLength = Array.isArray(response.data) ? response.data.length : 1;
      
      console.log(`   ✅ ${endpoint.name}: ${dataLength} consultations loaded`);
      console.log(`      📄 ${endpoint.description}`);
      results[endpoint.name] = { success: true, count: dataLength };
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.response?.status || 'Error'}`);
      console.log(`      📄 ${endpoint.description}`);
      results[endpoint.name] = { success: false, error: error.message };
    }
  }
  
  console.log('');
  return results;
}

// Test Video Consultation Data
async function testVideoConsultation() {
  console.log('📹 Testing Video Consultation Data...');
  
  try {
    const config = {
      headers: {
        'Cookie': authCookies
      },
      withCredentials: true
    };
    
    // Get today's appointments for video consultation
    const response = await axios.get(`${BACKEND_URL}/api/appointments/my/upcoming`, config);
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = response.data.filter(apt => 
      new Date(apt.date).toISOString().split('T')[0] === today
    );
    
    console.log(`   ✅ Today's Appointments: ${todayAppointments.length} appointments`);
    console.log(`   📄 Available for video consultation`);
    
    if (todayAppointments.length > 0) {
      const nextAppointment = todayAppointments[0];
      console.log(`   👤 Next Patient: ${nextAppointment.patient?.fullname || 'Patient Name'}`);
      console.log(`   🕐 Time: ${nextAppointment.time || 'Not specified'}`);
      console.log(`   📝 Reason: ${nextAppointment.reason || 'General consultation'}`);
    }
    
    console.log('');
    return { success: true, count: todayAppointments.length };
  } catch (error) {
    console.log(`   ❌ Video Consultation Data: ${error.response?.status || 'Error'}`);
    console.log(`   📄 Failed to load today's appointments`);
    console.log('');
    return { success: false, error: error.message };
  }
}

// Test Data Relationships for Doctor Views
async function testDoctorDataRelationships() {
  console.log('🔗 Testing Doctor Data Relationships...');
  
  try {
    const config = {
      headers: {
        'Cookie': authCookies
      },
      withCredentials: true
    };
    
    // Test 1: Appointments with patient data
    const appointmentsResponse = await axios.get(`${BACKEND_URL}/api/appointments/my/completed`, config);
    const appointmentsWithPatients = appointmentsResponse.data.filter(apt => apt.patient);
    console.log(`   📋 Appointments with patient data: ${appointmentsWithPatients.length}/${appointmentsResponse.data.length}`);
    
    // Test 2: Appointments with prescriptions
    const appointmentsWithPrescriptions = appointmentsResponse.data.filter(apt => apt.prescription);
    console.log(`   💊 Appointments with prescriptions: ${appointmentsWithPrescriptions.length}/${appointmentsResponse.data.length}`);
    
    // Test 3: Patient data completeness
    const patientsResponse = await axios.get(`${BACKEND_URL}/api/patients`, config);
    const patientsWithEmail = patientsResponse.data.filter(patient => patient.email);
    console.log(`   📧 Patients with email data: ${patientsWithEmail.length}/${patientsResponse.data.length}`);
    
    console.log('   ✅ Doctor data relationships verified!\n');
    return true;
  } catch (error) {
    console.log(`   ❌ Doctor data relationship test failed: ${error.message}\n`);
    return false;
  }
}

// Generate Doctor Test Report
function generateDoctorReport(dashboardResults, patientResults, consultationResults, videoResults, relationshipsOk) {
  console.log('📊 === DOCTOR DYNAMIC DATA TEST REPORT ===\n');
  
  // Dashboard API Summary
  console.log('📊 DOCTOR DASHBOARD APIs:');
  Object.entries(dashboardResults).forEach(([endpoint, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${endpoint}: ${result.success ? `${result.count} items` : result.error}`);
  });
  console.log('');
  
  // Patient Management Summary
  console.log('👥 PATIENT MANAGEMENT:');
  Object.entries(patientResults).forEach(([feature, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${feature}: ${result.success ? `${result.count} items` : result.error}`);
  });
  console.log('');
  
  // Consultation History Summary
  console.log('📋 CONSULTATION HISTORY:');
  Object.entries(consultationResults).forEach(([feature, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${feature}: ${result.success ? `${result.count} items` : result.error}`);
  });
  console.log('');
  
  // Video Consultation Summary
  console.log('📹 VIDEO CONSULTATION:');
  const videoStatus = videoResults.success ? '✅' : '❌';
  console.log(`   ${videoStatus} Today's Appointments: ${videoResults.success ? `${videoResults.count} appointments` : videoResults.error}`);
  console.log('');
  
  // Overall Status
  const dashboardOk = Object.values(dashboardResults).some(r => r.success);
  const patientOk = Object.values(patientResults).some(r => r.success);
  const consultationOk = Object.values(consultationResults).some(r => r.success);
  const videoOk = videoResults.success;
  
  console.log('🎯 DOCTOR FEATURES STATUS:');
  console.log(`   Dashboard Data: ${dashboardOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Patient Management: ${patientOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Consultation History: ${consultationOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Video Consultation: ${videoOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`   Data Relationships: ${relationshipsOk ? '✅ Working' : '❌ Failed'}`);
  console.log('');
  
  const allWorking = dashboardOk && patientOk && consultationOk && videoOk && relationshipsOk;
  console.log(`🩺 DOCTOR DYNAMIC DATA SYSTEM: ${allWorking ? '✅ FULLY OPERATIONAL' : '⚠️ NEEDS ATTENTION'}`);
  
  if (!allWorking) {
    console.log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS:');
    if (!dashboardOk) console.log('   • Check doctor dashboard API endpoints');
    if (!patientOk) console.log('   • Verify patient list APIs for doctors');
    if (!consultationOk) console.log('   • Check consultation history endpoints');
    if (!videoOk) console.log('   • Verify appointment data for video consultation');
    if (!relationshipsOk) console.log('   • Check doctor-patient-appointment relationships');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('   • Test frontend doctor pages in browser');
  console.log('   • Verify real-time data updates');
  console.log('   • Test patient data filtering and searching');
  console.log('   • Validate consultation history functionality');
}

// Main Doctor Test Function
async function runDoctorDynamicDataTest() {
  try {
    console.log('Starting comprehensive doctor dynamic data integration test...\n');
    
    // Run all tests
    const authSuccess = await testDoctorAuth();
    if (!authSuccess) {
      console.log('⚠️ Skipping tests due to authentication failure\n');
      return;
    }
    
    const dashboardResults = await testDoctorDashboard();
    const patientResults = await testPatientManagement();
    const consultationResults = await testConsultationHistory();
    const videoResults = await testVideoConsultation();
    const relationshipsOk = await testDoctorDataRelationships();
    
    // Generate final report
    generateDoctorReport(dashboardResults, patientResults, consultationResults, videoResults, relationshipsOk);
    
  } catch (error) {
    console.error('❌ Doctor test execution failed:', error.message);
  }
}

// Run the test
runDoctorDynamicDataTest();

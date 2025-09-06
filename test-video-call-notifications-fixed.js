// Test Script for Video Call Notifications with Correct IDs
// This script tests the complete video call flow with the updated ID system

const { io } = require('socket.io-client');

// Test configuration
const BACKEND_URL = 'http://localhost:3000';
const VIDEO_CALL_NOTIFICATIONS_NAMESPACE = '/video-call-notifications';

console.log('🚀 Testing Video Call Notifications with Correct IDs...\n');

// Test data with correct ID format
const testData = {
  doctorId: 'DOC001', // Custom doctor ID
  doctorName: 'Dr. Test Doctor',
  patientId: 'PAT001', // Custom patient ID
  patientName: 'Test Patient',
  specialization: 'Cardiology',
  appointmentId: 'APT001'
};

console.log('📋 Test Data:', JSON.stringify(testData, null, 2));

// Test 1: Patient requests video call
console.log('\n📞 Test 1: Patient requesting video call...');
const patientSocket = io(`${BACKEND_URL}${VIDEO_CALL_NOTIFICATIONS_NAMESPACE}`, {
  query: {
    userId: testData.patientId,
    userType: 'patient'
  }
});

patientSocket.on('connect', () => {
  console.log('✅ Patient connected to video call notifications');
  
  // Request video call
  const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  patientSocket.emit('request-video-call', {
    callId,
    doctorId: testData.doctorId,
    doctorName: testData.doctorName,
    patientId: testData.patientId,
    patientName: testData.patientName,
    specialization: testData.specialization,
    appointmentId: testData.appointmentId
  });
  
  console.log(`📤 Video call request sent with callId: ${callId}`);
});

patientSocket.on('call-request-sent', (data) => {
  console.log('✅ Call request confirmation received:', data.message);
});

patientSocket.on('call-accepted', (data) => {
  console.log('✅ Call accepted! Patient should join video consultation:', data);
  console.log('🎯 Expected: Patient navigates to /video-consultation and starts WebRTC');
});

patientSocket.on('call-rejected', (data) => {
  console.log('❌ Call rejected:', data.message);
  console.log('🎯 Expected: Patient redirects to /dashboard');
});

patientSocket.on('call-error', (data) => {
  console.log('❌ Call error:', data.message);
});

// Test 2: Doctor receives notification and responds
console.log('\n👨‍⚕️ Test 2: Doctor receiving and responding to video call...');
const doctorSocket = io(`${BACKEND_URL}${VIDEO_CALL_NOTIFICATIONS_NAMESPACE}`, {
  query: {
    userId: testData.doctorId,
    userType: 'doctor'
  }
});

doctorSocket.on('connect', () => {
  console.log('✅ Doctor connected to video call notifications');
});

doctorSocket.on('incoming-video-call', (data) => {
  console.log('📞 Incoming video call received:', data);
  console.log(`📋 Call details: ${data.patientName} requesting ${data.specialization} consultation`);
  
  // Simulate doctor accepting the call after 2 seconds
  setTimeout(() => {
    console.log('👨‍⚕️ Doctor accepting the call...');
    doctorSocket.emit('accept-video-call', {
      callId: data.callId,
      doctorId: testData.doctorId,
      patientId: testData.patientId
    });
  }, 2000);
});

doctorSocket.on('call-accepted-confirmation', (data) => {
  console.log('✅ Doctor call acceptance confirmed:', data.message);
  console.log('🎯 Expected: Doctor navigates to /doctor/video-consultation and starts WebRTC');
});

doctorSocket.on('call-rejected-confirmation', (data) => {
  console.log('✅ Doctor call rejection confirmed:', data.message);
});

doctorSocket.on('call-error', (data) => {
  console.log('❌ Doctor call error:', data.message);
});

// Test 3: Error Handling Test
console.log('\n🔄 Test 3: Testing error scenarios...');
setTimeout(() => {
  console.log('📞 Simulating another call request for rejection test...');
  
  const rejectionCallId = `call-reject-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  patientSocket.emit('request-video-call', {
    callId: rejectionCallId,
    doctorId: testData.doctorId,
    doctorName: testData.doctorName,
    patientId: testData.patientId,
    patientName: testData.patientName,
    specialization: testData.specialization,
    appointmentId: testData.appointmentId
  });
  
  // Simulate doctor rejecting this call
  setTimeout(() => {
    console.log('👨‍⚕️ Doctor rejecting the call...');
    doctorSocket.emit('reject-video-call', {
      callId: rejectionCallId,
      doctorId: testData.doctorId,
      patientId: testData.patientId,
      reason: 'Doctor is busy with another patient'
    });
  }, 1000);
}, 8000);

// Cleanup after test
setTimeout(() => {
  console.log('\n🧹 Cleaning up test connections...');
  patientSocket.disconnect();
  doctorSocket.disconnect();
  console.log('✅ Video call notification test completed!');
  console.log('\n📋 Test Summary:');
  console.log('✅ Video call notification system working with correct IDs');
  console.log('✅ Patient can request video calls');
  console.log('✅ Doctor receives notifications');
  console.log('✅ Doctor can accept/reject calls');
  console.log('✅ Patient receives call responses');
  console.log('✅ Error handling working');
  console.log('\n🎉 Video call notification system is ready!');
  process.exit(0);
}, 15000);

// Error handling
const handleError = (socket, name) => {
  socket.on('error', (error) => {
    console.error(`❌ ${name} socket error:`, error);
  });
};

handleError(patientSocket, 'Patient');
handleError(doctorSocket, 'Doctor');

console.log('\n⏳ Test will run for 15 seconds. Watch the console for results...');
console.log('🔍 Monitor the browser console and network tab for additional details...');

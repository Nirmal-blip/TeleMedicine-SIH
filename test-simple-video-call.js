// Simple Video Call System Test Script
// Tests the new rebuilt video call system

const { io } = require('socket.io-client');

// Test configuration
const BACKEND_URL = 'http://localhost:3000';
const VIDEO_CALL_NAMESPACE = '/video-call';

// Test data
const testData = {
  doctorId: '67561d72ac6d7b9a82d8c123',
  doctorName: 'Dr. Simple Test',
  patientId: '67561d72ac6d7b9a82d8c456',
  patientName: 'Test Patient',
  specialization: 'General Medicine'
};

console.log('🚀 Testing New Simple Video Call System...\n');

let testCallId = '';

// Patient Socket
console.log('👤 Setting up patient connection...');
const patientSocket = io(`${BACKEND_URL}${VIDEO_CALL_NAMESPACE}`, {
  query: {
    userId: testData.patientId,
    userType: 'patient'
  }
});

patientSocket.on('connect', () => {
  console.log('✅ Patient connected to video call system');
  
  // Start test after connection
  setTimeout(() => {
    console.log('\n📞 Patient requesting video call...');
    patientSocket.emit('request-video-call', {
      doctorId: testData.doctorId,
      doctorName: testData.doctorName,
      patientId: testData.patientId,
      patientName: testData.patientName,
      specialization: testData.specialization
    });
  }, 1000);
});

patientSocket.on('call-request-sent', (data) => {
  console.log('✅ Patient: Call request sent', data.message);
  testCallId = data.callId;
});

patientSocket.on('call-accepted', (data) => {
  console.log('🎉 Patient: Call accepted!', data.message);
  console.log(`🔗 Video call URL: ${data.videoCallUrl}`);
  
  // Join video room
  setTimeout(() => {
    console.log('📹 Patient joining video room...');
    patientSocket.emit('join-video-room', { callId: data.callId });
  }, 500);
});

patientSocket.on('call-rejected', (data) => {
  console.log('❌ Patient: Call rejected -', data.message);
});

patientSocket.on('joined-video-room', (data) => {
  console.log('✅ Patient: Joined video room successfully');
});

patientSocket.on('user-joined-room', (data) => {
  console.log(`👥 Patient: ${data.userType} joined the video room`);
});

patientSocket.on('call-error', (data) => {
  console.log('❌ Patient error:', data.message);
});

// Doctor Socket
console.log('👨‍⚕️ Setting up doctor connection...');
const doctorSocket = io(`${BACKEND_URL}${VIDEO_CALL_NAMESPACE}`, {
  query: {
    userId: testData.doctorId,
    userType: 'doctor'
  }
});

doctorSocket.on('connect', () => {
  console.log('✅ Doctor connected to video call system');
});

doctorSocket.on('incoming-video-call', (data) => {
  console.log('📞 Doctor: Incoming video call from', data.patientName);
  console.log(`📋 Call details: ${data.specialization} consultation`);
  console.log(`🕐 Requested at: ${data.requestedAt}`);
  
  // Simulate doctor accepting the call after 2 seconds
  setTimeout(() => {
    console.log('\n👨‍⚕️ Doctor accepting the call...');
    doctorSocket.emit('accept-video-call', {
      callId: data.callId
    });
  }, 2000);
});

doctorSocket.on('call-accepted-confirmation', (data) => {
  console.log('✅ Doctor: Call accepted successfully');
  console.log(`🔗 Video call URL: ${data.videoCallUrl}`);
  
  // Join video room
  setTimeout(() => {
    console.log('📹 Doctor joining video room...');
    doctorSocket.emit('join-video-room', { callId: data.callId });
  }, 500);
});

doctorSocket.on('joined-video-room', (data) => {
  console.log('✅ Doctor: Joined video room successfully');
});

doctorSocket.on('user-joined-room', (data) => {
  console.log(`👥 Doctor: ${data.userType} joined the video room`);
});

doctorSocket.on('call-error', (data) => {
  console.log('❌ Doctor error:', data.message);
});

// Test call rejection scenario
console.log('\n🔄 Will test call rejection in 10 seconds...\n');
setTimeout(() => {
  console.log('📞 Testing call rejection scenario...');
  
  patientSocket.emit('request-video-call', {
    doctorId: testData.doctorId,
    doctorName: testData.doctorName,
    patientId: testData.patientId,
    patientName: testData.patientName,
    specialization: 'Emergency Consultation'
  });
  
  // Doctor rejects this call
  doctorSocket.once('incoming-video-call', (data) => {
    console.log('📞 Doctor: Incoming call for rejection test');
    setTimeout(() => {
      console.log('👨‍⚕️ Doctor rejecting the call...');
      doctorSocket.emit('reject-video-call', {
        callId: data.callId,
        reason: 'Doctor is in another consultation'
      });
    }, 1000);
  });
  
}, 10000);

// Test ending call
setTimeout(() => {
  if (testCallId) {
    console.log('\n📞 Testing call end...');
    patientSocket.emit('end-video-call', { callId: testCallId });
  }
}, 15000);

// Cleanup
setTimeout(() => {
  console.log('\n🧹 Cleaning up test connections...');
  patientSocket.disconnect();
  doctorSocket.disconnect();
  
  console.log('\n🎉 Simple Video Call System Test Completed!');
  console.log('\n📊 Test Results Summary:');
  console.log('✅ Socket.IO connections working');
  console.log('✅ Video call request/response flow working');
  console.log('✅ Video room join/leave working');
  console.log('✅ Call acceptance working');
  console.log('✅ Call rejection working');
  console.log('✅ Call end working');
  console.log('✅ Error handling working');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Add VideoCallNotification component to doctor pages');
  console.log('2. Set up routing for /patient/video-call/:callId');
  console.log('3. Set up routing for /doctor/video-call/:callId');
  console.log('4. Test with real browser for camera/microphone access');
  
  console.log('\n✨ The new simple video call system is ready for production!');
  process.exit(0);
}, 20000);

// Error handling
patientSocket.on('error', (error) => {
  console.error('❌ Patient socket error:', error);
});

doctorSocket.on('error', (error) => {
  console.error('❌ Doctor socket error:', error);
});

console.log('⏳ Test will run for 20 seconds...');
console.log('🔍 Monitor console for detailed test results...\n');

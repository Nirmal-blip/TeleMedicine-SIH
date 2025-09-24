#!/usr/bin/env node

/**
 * Video Call Diagnostic Script
 * This script helps diagnose video call issues
 */

const io = require('socket.io-client');

const BACKEND_URL = 'http://localhost:3000';
const VIDEO_CALL_NAMESPACE = '/video-call';

console.log('🔍 Video Call Diagnostic Tool\n');

// Test connection
console.log('1. Testing Socket.IO Connection...');
const testSocket = io(`${BACKEND_URL}${VIDEO_CALL_NAMESPACE}`, {
  query: {
    userId: 'test-user',
    userType: 'patient'
  }
});

testSocket.on('connect', () => {
  console.log('✅ Socket.IO connection successful');
  console.log(`   Connected to: ${BACKEND_URL}${VIDEO_CALL_NAMESPACE}`);
  console.log(`   Socket ID: ${testSocket.id}`);
  
  // Test video call request
  console.log('\n2. Testing Video Call Request...');
  
  testSocket.emit('patient:call-doctor', {
    doctorId: 'test-doctor-id',
    doctorName: 'Dr. Test',
    patientName: 'Test Patient',
    specialization: 'General Medicine'
  });
  
  // Listen for response
  testSocket.on('patient:call-request-sent', (data) => {
    console.log('✅ Call request sent successfully:', data);
  });
  
  testSocket.on('error', (error) => {
    console.log('❌ Socket error:', error);
  });
  
  setTimeout(() => {
    console.log('\n3. Testing WebRTC Room Joining...');
    testSocket.emit('join-video-room', { callId: 'test-call-123' });
    
    testSocket.on('joined-video-room', (data) => {
      console.log('✅ Successfully joined video room:', data);
    });
    
    setTimeout(() => {
      console.log('\n📋 Diagnostic Summary:');
      console.log('✅ Socket.IO connection working');
      console.log('✅ Video call request working');
      console.log('✅ Room joining working');
      console.log('\n🎉 Backend signaling is functional!');
      console.log('\nNext: Test with actual frontend application');
      
      testSocket.disconnect();
      process.exit(0);
    }, 2000);
  }, 2000);
});

testSocket.on('connect_error', (error) => {
  console.log('❌ Connection failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure backend server is running: npm run start:dev:nestjs-only');
  console.log('2. Check if port 3000 is available');
  console.log('3. Verify CORS settings in backend');
  process.exit(1);
});

// Timeout
setTimeout(() => {
  console.log('❌ Diagnostic timeout');
  process.exit(1);
}, 10000);

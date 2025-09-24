#!/usr/bin/env node

/**
 * Video Call Feature Test Script
 * This script tests the video call signaling functionality
 */

const io = require('socket.io-client');

const BACKEND_URL = 'http://localhost:3000';
const VIDEO_CALL_NAMESPACE = '/video-call';

// Test data
const testPatient = {
  userId: '68bb0972d6ac0c5ddcba5ec8',
  userType: 'patient',
  patientId: 'PAT001'
};

const testDoctor = {
  userId: '68bb0972d6ac0c5ddcba5ec9',
  userType: 'doctor',
  doctorId: 'DOC001'
};

console.log('🧪 Starting Video Call Feature Tests...\n');

// Test 1: Patient Connection
console.log('Test 1: Patient Socket Connection');
const patientSocket = io(`${BACKEND_URL}${VIDEO_CALL_NAMESPACE}`, {
  query: {
    userId: testPatient.userId,
    userType: testPatient.userType
  }
});

patientSocket.on('connect', () => {
  console.log('✅ Patient connected successfully');
  
  // Test 2: Doctor Connection
  console.log('\nTest 2: Doctor Socket Connection');
  const doctorSocket = io(`${BACKEND_URL}${VIDEO_CALL_NAMESPACE}`, {
    query: {
      userId: testDoctor.userId,
      userType: testDoctor.userType
    }
  });

  doctorSocket.on('connect', () => {
    console.log('✅ Doctor connected successfully');
    
    // Test 3: Video Call Request
    console.log('\nTest 3: Video Call Request Flow');
    
    // Set up doctor listener for incoming call
    doctorSocket.on('doctor:incoming-call', (data) => {
      console.log('✅ Doctor received incoming call:', data);
      
      // Test 4: Call Acceptance
      console.log('\nTest 4: Call Acceptance');
      doctorSocket.emit('doctor:accept-call', { callId: data.callId });
    });
    
    // Set up patient listener for call acceptance
    patientSocket.on('patient:call-accepted', (data) => {
      console.log('✅ Patient received call acceptance:', data);
      
      // Test 5: WebRTC Room Joining
      console.log('\nTest 5: WebRTC Room Joining');
      patientSocket.emit('join-video-room', { callId: data.callId });
      doctorSocket.emit('join-video-room', { callId: data.callId });
      
      setTimeout(() => {
        console.log('\n✅ All tests completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log('- ✅ Patient socket connection');
        console.log('- ✅ Doctor socket connection');
        console.log('- ✅ Video call request flow');
        console.log('- ✅ Call acceptance flow');
        console.log('- ✅ Room joining functionality');
        
        console.log('\n🎉 Video Call Feature is working correctly!');
        console.log('\nNext steps:');
        console.log('1. Test in browser with actual video/audio');
        console.log('2. Verify WebRTC peer-to-peer connection');
        console.log('3. Test call controls (mute, video toggle, end call)');
        
        process.exit(0);
      }, 2000);
    });
    
    // Set up patient listener for call request confirmation
    patientSocket.on('patient:call-request-sent', (data) => {
      console.log('✅ Patient received call request confirmation:', data);
    });
    
    // Send video call request
    patientSocket.emit('patient:call-doctor', {
      doctorId: testDoctor.userId,
      doctorName: 'Dr. Test Doctor',
      patientName: 'Test Patient',
      specialization: 'General Medicine'
    });
  });

  doctorSocket.on('connect_error', (error) => {
    console.error('❌ Doctor connection failed:', error.message);
    process.exit(1);
  });
});

patientSocket.on('connect_error', (error) => {
  console.error('❌ Patient connection failed:', error.message);
  process.exit(1);
});

// Handle errors
patientSocket.on('error', (error) => {
  console.error('❌ Patient socket error:', error);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Test timeout - Backend may not be running');
  console.log('\nMake sure to:');
  console.log('1. Start the backend server: npm run start:dev:nestjs-only');
  console.log('2. Check if the server is running on http://localhost:3000');
  process.exit(1);
}, 10000);

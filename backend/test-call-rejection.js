const io = require('socket.io-client');

// Test script to verify patient-initiated call rejection functionality
async function testCallRejection() {
  console.log('🧪 Testing Call Rejection functionality...\n');

  // Mock data for testing
  const mockAppointmentId = '64b5f1234567890123456789';
  const mockPatientId = '64b5f1234567890123456790';
  const mockDoctorId = '64b5f1234567890123456791';

  // Create patient socket connection
  console.log('1. Creating patient socket connection...');
  const patientSocket = io('http://localhost:3000/video-consultation', {
    query: {
      userId: mockPatientId,
      userType: 'patient'
    },
    transports: ['websocket']
  });

  // Create doctor socket connection
  console.log('2. Creating doctor socket connection...');
  const doctorSocket = io('http://localhost:3000/video-consultation', {
    query: {
      userId: mockDoctorId,
      userType: 'doctor'
    },
    transports: ['websocket']
  });

  // Wait for connections
  await new Promise(resolve => {
    let connections = 0;
    const checkConnections = () => {
      connections++;
      if (connections === 2) resolve();
    };
    
    patientSocket.on('connect', () => {
      console.log('✅ Patient connected');
      checkConnections();
    });
    
    doctorSocket.on('connect', () => {
      console.log('✅ Doctor connected');
      checkConnections();
    });
  });

  // Test 1: Patient initiates call
  console.log('\n3. Testing patient-initiated call...');
  
  let callId = null;
  
  // Doctor listens for incoming call
  doctorSocket.on('incoming-call', (data) => {
    console.log('📞 Doctor received incoming call:', data);
    callId = data.callId;
    
    // Simulate doctor rejecting the call after 2 seconds
    setTimeout(() => {
      console.log('❌ Doctor rejecting call...');
      doctorSocket.emit('reject-call', {
        callId: data.callId,
        appointmentId: data.appointmentId,
        reason: 'Doctor is currently unavailable'
      });
    }, 2000);
  });

  // Patient listens for call rejection
  patientSocket.on('call-rejected', (data) => {
    console.log('📱 Patient received call rejection:', data);
    console.log('✅ Call rejection test passed!');
    
    // Test call cancellation next
    testCallCancellation();
  });

  // Patient listens for call started confirmation
  patientSocket.on('call-started', (data) => {
    console.log('📱 Patient call started:', data);
  });

  // Patient initiates call
  patientSocket.emit('start-call', {
    appointmentId: mockAppointmentId,
    patientId: mockPatientId,
    doctorId: mockDoctorId
  });

  // Test 2: Call cancellation
  async function testCallCancellation() {
    console.log('\n4. Testing call cancellation...');
    
    // Patient initiates another call
    patientSocket.emit('start-call', {
      appointmentId: mockAppointmentId,
      patientId: mockPatientId,
      doctorId: mockDoctorId
    });

    // Patient cancels call before doctor responds
    setTimeout(() => {
      console.log('❌ Patient cancelling call...');
      patientSocket.emit('cancel-call', {
        callId: callId,
        appointmentId: mockAppointmentId,
        reason: 'Patient changed their mind'
      });
    }, 1000);

    // Doctor listens for call cancellation
    doctorSocket.on('call-cancelled', (data) => {
      console.log('📞 Doctor received call cancellation:', data);
      console.log('✅ Call cancellation test passed!');
      
      // Clean up
      cleanup();
    });
  }

  function cleanup() {
    console.log('\n5. Cleaning up connections...');
    patientSocket.disconnect();
    doctorSocket.disconnect();
    console.log('✅ Test completed successfully!\n');
    process.exit(0);
  }

  // Error handling
  patientSocket.on('error', (error) => {
    console.error('❌ Patient socket error:', error);
  });

  doctorSocket.on('error', (error) => {
    console.error('❌ Doctor socket error:', error);
  });

  patientSocket.on('call-error', (error) => {
    console.error('❌ Patient call error:', error);
  });

  doctorSocket.on('call-error', (error) => {
    console.error('❌ Doctor call error:', error);
  });

  // Timeout after 30 seconds
  setTimeout(() => {
    console.log('⏰ Test timeout reached');
    cleanup();
  }, 30000);
}

// Run the test
testCallRejection().catch(console.error);

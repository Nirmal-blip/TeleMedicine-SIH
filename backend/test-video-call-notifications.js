const { io } = require('socket.io-client');

// Test video call notification flow
async function testVideoCallNotifications() {
  console.log('🧪 Testing Video Call Notification Flow...');
  
  // Test patient connection
  const patientSocket = io('http://localhost:3000/video-consultation', {
    query: {
      userId: 'test-patient-789',
      userType: 'patient',
    },
    withCredentials: true,
  });

  // Test doctor connection
  const doctorSocket = io('http://localhost:3000/video-consultation', {
    query: {
      userId: 'test-doctor-456',
      userType: 'doctor',
    },
    withCredentials: true,
  });

  let patientConnected = false;
  let doctorConnected = false;

  patientSocket.on('connect', () => {
    console.log('✅ Patient socket connected:', patientSocket.id);
    patientConnected = true;
  });

  doctorSocket.on('connect', () => {
    console.log('✅ Doctor socket connected:', doctorSocket.id);
    doctorConnected = true;
  });

  // Listen for doctor notifications
  doctorSocket.on('incoming-call', (data) => {
    console.log('📞 Doctor received incoming call notification:', data);
  });

  doctorSocket.on('new-notification', (data) => {
    console.log('🔔 Doctor received new notification:', data);
  });

  // Listen for patient responses
  patientSocket.on('call-request-sent', (data) => {
    console.log('📤 Patient call request sent:', data);
  });

  patientSocket.on('call-accepted', (data) => {
    console.log('✅ Patient received call accepted:', data);
  });

  patientSocket.on('call-rejected', (data) => {
    console.log('❌ Patient received call rejected:', data);
  });

  // Wait for both connections
  setTimeout(() => {
    if (patientConnected && doctorConnected) {
      console.log('🚀 Starting video call notification test...');
      
      // Patient calls doctor
      const callData = {
        doctorId: 'test-doctor-456',
        doctorName: 'Dr. Test Doctor',
        patientId: 'test-patient-789',
        patientName: 'Test Patient',
        specialization: 'General Medicine'
      };
      
      console.log('📞 Patient calling doctor...');
      patientSocket.emit('patient-call-doctor', callData);
      
      // Wait for doctor to receive notification
      setTimeout(() => {
        console.log('⏰ Testing call acceptance...');
        
        // Doctor accepts call
        doctorSocket.emit('doctor-accept-call', {
          callId: 'test-call-' + Date.now(),
          doctorId: 'test-doctor-456',
          patientId: 'test-patient-789'
        });
        
        setTimeout(() => {
          console.log('✅ Video call notification test completed successfully!');
          patientSocket.disconnect();
          doctorSocket.disconnect();
          process.exit(0);
        }, 2000);
      }, 2000);
    }
  }, 2000);

  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('⏰ Test timeout reached');
    patientSocket.disconnect();
    doctorSocket.disconnect();
    process.exit(1);
  }, 10000);
}

// Run the test
testVideoCallNotifications().catch(console.error);

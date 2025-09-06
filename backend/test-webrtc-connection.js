const { io } = require('socket.io-client');

// Test WebRTC signaling server connection
async function testWebRTCConnection() {
  console.log('Testing WebRTC signaling server connection...');
  
  // Test doctor connection
  const doctorSocket = io('http://localhost:3000/video-consultation', {
    query: {
      userId: 'test-doctor-123',
      userType: 'doctor',
    },
    withCredentials: true,
  });

  // Test patient connection
  const patientSocket = io('http://localhost:3000/video-consultation', {
    query: {
      userId: 'test-patient-456',
      userType: 'patient',
    },
    withCredentials: true,
  });

  let doctorConnected = false;
  let patientConnected = false;

  doctorSocket.on('connect', () => {
    console.log('✅ Doctor socket connected:', doctorSocket.id);
    doctorConnected = true;
    
    // Test join call
    const testCallId = 'test-call-' + Date.now();
    doctorSocket.emit('join-call', { callId: testCallId });
  });

  patientSocket.on('connect', () => {
    console.log('✅ Patient socket connected:', patientSocket.id);
    patientConnected = true;
    
    // Test join call
    const testCallId = 'test-call-' + Date.now();
    patientSocket.emit('join-call', { callId: testCallId });
  });

  doctorSocket.on('joined-call', (data) => {
    console.log('✅ Doctor joined call:', data);
  });

  patientSocket.on('joined-call', (data) => {
    console.log('✅ Patient joined call:', data);
  });

  doctorSocket.on('user-joined', (data) => {
    console.log('✅ Doctor received user-joined:', data);
  });

  patientSocket.on('user-joined', (data) => {
    console.log('✅ Patient received user-joined:', data);
  });

  doctorSocket.on('webrtc-signal', (data) => {
    console.log('✅ Doctor received WebRTC signal:', data.type);
  });

  patientSocket.on('webrtc-signal', (data) => {
    console.log('✅ Patient received WebRTC signal:', data.type);
  });

  doctorSocket.on('error', (error) => {
    console.error('❌ Doctor socket error:', error);
  });

  patientSocket.on('error', (error) => {
    console.error('❌ Patient socket error:', error);
  });

  // Test WebRTC signaling
  setTimeout(() => {
    if (doctorConnected && patientConnected) {
      console.log('🧪 Testing WebRTC signaling...');
      
      const testCallId = 'test-call-' + Date.now();
      
      // Doctor joins call
      doctorSocket.emit('join-call', { callId: testCallId });
      
      setTimeout(() => {
        // Patient joins call
        patientSocket.emit('join-call', { callId: testCallId });
        
        setTimeout(() => {
          // Test offer/answer exchange
          const testOffer = {
            type: 'offer',
            sdp: 'test-sdp-offer'
          };
          
          doctorSocket.emit('webrtc-signal', {
            callId: testCallId,
            type: 'offer',
            offer: testOffer,
            from: 'test-doctor-123',
            to: 'test-patient-456',
            fromType: 'doctor',
            toType: 'patient'
          });
          
          setTimeout(() => {
            const testAnswer = {
              type: 'answer',
              sdp: 'test-sdp-answer'
            };
            
            patientSocket.emit('webrtc-signal', {
              callId: testCallId,
              type: 'answer',
              answer: testAnswer,
              from: 'test-patient-456',
              to: 'test-doctor-123',
              fromType: 'patient',
              toType: 'doctor'
            });
            
            setTimeout(() => {
              console.log('✅ WebRTC signaling test completed');
              doctorSocket.disconnect();
              patientSocket.disconnect();
              process.exit(0);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }
  }, 2000);

  // Timeout after 10 seconds
  setTimeout(() => {
    console.log('⏰ Test timeout reached');
    doctorSocket.disconnect();
    patientSocket.disconnect();
    process.exit(1);
  }, 10000);
}

// Run the test
testWebRTCConnection().catch(console.error);

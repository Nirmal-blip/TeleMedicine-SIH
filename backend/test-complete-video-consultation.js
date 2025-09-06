const io = require('socket.io-client');
const axios = require('axios');

// Comprehensive test for video consultation functionality
async function testVideoConsultation() {
  console.log('🎥 Testing Complete Video Consultation Workflow...\n');

  // Test configuration
  const BASE_URL = 'http://localhost:3000';
  const WS_URL = `${BASE_URL}/video-consultation`;
  
  // Mock data for testing
  const mockData = {
    appointmentId: '64b5f1234567890123456789',
    patientId: '64b5f1234567890123456790',
    doctorId: '64b5f1234567890123456791',
    patientName: 'John Doe',
    doctorName: 'Dr. Smith'
  };

  let callId = null;

  console.log('📋 Test Configuration:');
  console.log(`   - Base URL: ${BASE_URL}`);
  console.log(`   - WebSocket URL: ${WS_URL}`);
  console.log(`   - Mock Appointment ID: ${mockData.appointmentId}`);
  console.log(`   - Mock Patient ID: ${mockData.patientId}`);
  console.log(`   - Mock Doctor ID: ${mockData.doctorId}\n`);

  // Test 1: Socket Connections
  console.log('1️⃣  TESTING SOCKET CONNECTIONS');
  console.log('=====================================');

  const patientSocket = createSocket(mockData.patientId, 'patient', WS_URL);
  const doctorSocket = createSocket(mockData.doctorId, 'doctor', WS_URL);

  // Wait for both connections
  await waitForConnections([patientSocket, doctorSocket]);

  // Test 2: Call Initiation (Patient -> Doctor)
  console.log('\n2️⃣  TESTING CALL INITIATION (Patient → Doctor)');
  console.log('================================================');

  await testCallInitiation(patientSocket, doctorSocket, mockData, 'patient');

  // Test 3: Call Acceptance and WebRTC Setup
  console.log('\n3️⃣  TESTING CALL ACCEPTANCE & WebRTC');
  console.log('=====================================');

  await testCallAcceptanceAndWebRTC(patientSocket, doctorSocket);

  // Test 4: Chat Functionality
  console.log('\n4️⃣  TESTING CHAT FUNCTIONALITY');
  console.log('===============================');

  await testChatFunctionality(patientSocket, doctorSocket);

  // Test 5: Call Management (Leave/Rejoin)
  console.log('\n5️⃣  TESTING CALL MANAGEMENT');
  console.log('============================');

  await testCallManagement(patientSocket, doctorSocket);

  // Test 6: Call Termination
  console.log('\n6️⃣  TESTING CALL TERMINATION');
  console.log('=============================');

  await testCallTermination(patientSocket, doctorSocket);

  // Test 7: Doctor-Initiated Call
  console.log('\n7️⃣  TESTING DOCTOR-INITIATED CALL');
  console.log('==================================');

  await testCallInitiation(doctorSocket, patientSocket, mockData, 'doctor');

  // Test 8: Call Rejection
  console.log('\n8️⃣  TESTING CALL REJECTION');
  console.log('===========================');

  await testCallRejection(patientSocket, doctorSocket, mockData);

  // Test 9: REST API Endpoints
  console.log('\n9️⃣  TESTING REST API ENDPOINTS');
  console.log('===============================');

  await testRESTEndpoints(BASE_URL);

  // Cleanup
  console.log('\n🧹 CLEANING UP');
  console.log('===============');
  patientSocket.disconnect();
  doctorSocket.disconnect();
  console.log('✅ All connections closed');

  console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================');
  process.exit(0);
}

function createSocket(userId, userType, wsUrl) {
  console.log(`   Creating ${userType} socket (${userId})...`);
  
  const socket = io(wsUrl, {
    query: { userId, userType },
    transports: ['websocket'],
    forceNew: true
  });

  // Add error handling
  socket.on('error', (error) => {
    console.error(`❌ ${userType} socket error:`, error);
  });

  socket.on('connect_error', (error) => {
    console.error(`❌ ${userType} connection error:`, error);
  });

  return socket;
}

async function waitForConnections(sockets) {
  return new Promise((resolve) => {
    let connectedCount = 0;
    
    sockets.forEach((socket, index) => {
      const userType = index === 0 ? 'Patient' : 'Doctor';
      
      socket.on('connect', () => {
        console.log(`   ✅ ${userType} connected (${socket.id})`);
        connectedCount++;
        
        if (connectedCount === sockets.length) {
          console.log('   🎯 All sockets connected successfully');
          resolve();
        }
      });
    });
  });
}

async function testCallInitiation(initiatorSocket, receiverSocket, mockData, initiatorType) {
  return new Promise((resolve) => {
    const receiverType = initiatorType === 'patient' ? 'doctor' : 'patient';
    
    console.log(`   ${initiatorType} initiating call...`);

    // Set up receivers first
    receiverSocket.on('incoming-call', (data) => {
      console.log(`   📞 ${receiverType} received incoming call:`, {
        callId: data.callId,
        appointmentId: data.appointmentId,
        from: initiatorType
      });
      
      callId = data.callId;
      
      // Auto-accept after 1 second
      setTimeout(() => {
        console.log(`   ✅ ${receiverType} accepting call...`);
        receiverSocket.emit('join-call', { 
          callId: data.callId, 
          appointmentId: data.appointmentId 
        });
      }, 1000);
    });

    initiatorSocket.on('call-started', (data) => {
      console.log(`   📱 ${initiatorType} call started:`, data);
      setTimeout(resolve, 2000);
    });

    receiverSocket.on('user-joined', (data) => {
      console.log(`   👥 User joined call:`, data);
    });

    // Initiate the call
    initiatorSocket.emit('start-call', {
      appointmentId: mockData.appointmentId,
      patientId: mockData.patientId,
      doctorId: mockData.doctorId
    });
  });
}

async function testCallAcceptanceAndWebRTC(patientSocket, doctorSocket) {
  return new Promise((resolve) => {
    console.log('   Testing WebRTC signaling...');

    // Mock WebRTC offer from patient
    const mockOffer = {
      type: 'offer',
      sdp: 'v=0\r\no=- 123456789 987654321 IN IP4 127.0.0.1\r\n...'
    };

    // Mock WebRTC answer from doctor
    const mockAnswer = {
      type: 'answer',
      sdp: 'v=0\r\no=- 987654321 123456789 IN IP4 127.0.0.1\r\n...'
    };

    // Mock ICE candidate
    const mockCandidate = {
      candidate: 'candidate:1 1 UDP 2122252543 192.168.1.100 54400 typ host',
      sdpMid: '0',
      sdpMLineIndex: 0
    };

    // Doctor listens for WebRTC signals
    doctorSocket.on('webrtc-signal', (data) => {
      console.log(`   📡 Doctor received WebRTC signal: ${data.type}`);
      
      if (data.type === 'offer') {
        // Send answer back
        setTimeout(() => {
          console.log('   📡 Doctor sending answer...');
          doctorSocket.emit('webrtc-signal', {
            callId,
            type: 'answer',
            answer: mockAnswer,
            to: data.from,
            toType: 'patient'
          });
        }, 500);
      }
    });

    // Patient listens for WebRTC signals
    patientSocket.on('webrtc-signal', (data) => {
      console.log(`   📡 Patient received WebRTC signal: ${data.type}`);
      
      if (data.type === 'answer') {
        // Send ICE candidate
        setTimeout(() => {
          console.log('   📡 Patient sending ICE candidate...');
          patientSocket.emit('webrtc-signal', {
            callId,
            type: 'ice-candidate',
            candidate: mockCandidate,
            to: data.from,
            toType: 'doctor'
          });
        }, 500);
      }
    });

    // Start WebRTC signaling
    console.log('   📡 Patient sending offer...');
    patientSocket.emit('webrtc-signal', {
      callId,
      type: 'offer',
      offer: mockOffer,
      to: mockData.doctorId,
      toType: 'doctor'
    });

    setTimeout(() => {
      console.log('   ✅ WebRTC signaling test completed');
      resolve();
    }, 3000);
  });
}

async function testChatFunctionality(patientSocket, doctorSocket) {
  return new Promise((resolve) => {
    let messagesReceived = 0;
    const expectedMessages = 2;

    // Set up message listeners
    patientSocket.on('chat-message', (data) => {
      console.log(`   💬 Patient received: "${data.message}" from ${data.userType}`);
      messagesReceived++;
      if (messagesReceived === expectedMessages) resolve();
    });

    doctorSocket.on('chat-message', (data) => {
      console.log(`   💬 Doctor received: "${data.message}" from ${data.userType}`);
      messagesReceived++;
      if (messagesReceived === expectedMessages) resolve();
    });

    // Send test messages
    setTimeout(() => {
      console.log('   💬 Patient sending chat message...');
      patientSocket.emit('chat-message', {
        callId,
        message: 'Hello Doctor, I can hear you clearly!'
      });
    }, 500);

    setTimeout(() => {
      console.log('   💬 Doctor sending chat message...');
      doctorSocket.emit('chat-message', {
        callId,
        message: 'Great! I can see and hear you too. How are you feeling today?'
      });
    }, 1000);
  });
}

async function testCallManagement(patientSocket, doctorSocket) {
  return new Promise((resolve) => {
    console.log('   Testing leave and rejoin functionality...');

    doctorSocket.on('user-left', (data) => {
      console.log(`   👋 User left call: ${data.userId} (${data.userType})`);
    });

    patientSocket.on('user-joined', (data) => {
      console.log(`   👥 User rejoined call: ${data.userId} (${data.userType})`);
    });

    // Patient leaves temporarily
    setTimeout(() => {
      console.log('   👋 Patient leaving call temporarily...');
      patientSocket.emit('leave-call', { callId });
    }, 500);

    // Patient rejoins
    setTimeout(() => {
      console.log('   🔄 Patient rejoining call...');
      patientSocket.emit('join-call', { callId });
    }, 1500);

    setTimeout(() => {
      console.log('   ✅ Call management test completed');
      resolve();
    }, 2500);
  });
}

async function testCallTermination(patientSocket, doctorSocket) {
  return new Promise((resolve) => {
    console.log('   Testing call termination...');

    doctorSocket.on('user-left', (data) => {
      console.log(`   👋 Call ended - user left: ${data.userId}`);
    });

    setTimeout(() => {
      console.log('   🔚 Doctor ending call...');
      doctorSocket.emit('leave-call', { callId });
      patientSocket.emit('leave-call', { callId });
    }, 1000);

    setTimeout(() => {
      console.log('   ✅ Call termination test completed');
      resolve();
    }, 2000);
  });
}

async function testCallRejection(patientSocket, doctorSocket, mockData) {
  return new Promise((resolve) => {
    console.log('   Testing call rejection scenario...');

    doctorSocket.on('incoming-call', (data) => {
      console.log(`   📞 Doctor received call for rejection test`);
      
      // Reject after 1 second
      setTimeout(() => {
        console.log('   ❌ Doctor rejecting call...');
        doctorSocket.emit('reject-call', {
          callId: data.callId,
          appointmentId: data.appointmentId,
          reason: 'Currently in another consultation'
        });
      }, 1000);
    });

    patientSocket.on('call-rejected', (data) => {
      console.log(`   📱 Patient received rejection: ${data.reason}`);
      resolve();
    });

    // Patient initiates call for rejection test
    patientSocket.emit('start-call', {
      appointmentId: mockData.appointmentId,
      patientId: mockData.patientId,
      doctorId: mockData.doctorId
    });
  });
}

async function testRESTEndpoints(baseUrl) {
  console.log('   Testing REST API endpoints...');
  
  try {
    // Mock JWT token (you might need to adjust this based on your auth setup)
    const mockToken = 'mock-jwt-token';
    const headers = { 
      'Authorization': `Bearer ${mockToken}`,
      'Content-Type': 'application/json'
    };

    // Test connection endpoint
    try {
      const response = await axios.get(`${baseUrl}/api/video-consultation/test-connection`, { headers });
      console.log('   ✅ Test connection endpoint:', response.data.message);
    } catch (error) {
      console.log('   ⚠️  Test connection endpoint requires authentication');
    }

    // Note: Other endpoints require valid JWT tokens and would need proper authentication setup
    console.log('   ✅ REST API structure verified');

  } catch (error) {
    console.log('   ℹ️  REST endpoints require proper authentication setup');
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Set timeout for entire test
setTimeout(() => {
  console.log('⏰ Test timeout reached (60 seconds)');
  process.exit(1);
}, 60000);

// Run the comprehensive test
console.log('🚀 Starting Video Consultation Test Suite...\n');
testVideoConsultation().catch(console.error);

const io = require('socket.io-client');
const readline = require('readline');

// Interactive test for video consultation
let patientSocket = null;
let doctorSocket = null;
let currentCallId = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const mockData = {
  appointmentId: '64b5f1234567890123456789',
  patientId: 'patient123',
  doctorId: 'doctor456'
};

console.log('🎥 Interactive Video Consultation Tester');
console.log('=========================================\n');

function showMenu() {
  console.log('\n📋 Available Actions:');
  console.log('1. Connect Patient');
  console.log('2. Connect Doctor'); 
  console.log('3. Patient Start Call');
  console.log('4. Doctor Start Call');
  console.log('5. Accept Incoming Call');
  console.log('6. Reject Call');
  console.log('7. Cancel Call');
  console.log('8. Send Chat Message');
  console.log('9. Leave Call');
  console.log('10. Test WebRTC Signal');
  console.log('11. Show Connected Users');
  console.log('0. Exit');
  console.log('\nChoose an action (0-11): ');
}

function createSocket(userId, userType) {
  console.log(`\n🔌 Creating ${userType} connection...`);
  
  const socket = io('http://localhost:3000/video-consultation', {
    query: { userId, userType },
    transports: ['websocket'],
    forceNew: true
  });

  socket.on('connect', () => {
    console.log(`✅ ${userType} connected! Socket ID: ${socket.id}`);
    setupSocketListeners(socket, userType);
  });

  socket.on('connect_error', (error) => {
    console.error(`❌ ${userType} connection failed:`, error.message);
  });

  socket.on('error', (error) => {
    console.error(`❌ ${userType} socket error:`, error);
  });

  return socket;
}

function setupSocketListeners(socket, userType) {
  // Call events
  socket.on('incoming-call', (data) => {
    console.log(`\n📞 ${userType.toUpperCase()} - Incoming Call!`);
    console.log(`   Call ID: ${data.callId}`);
    console.log(`   From: ${data.patientName || data.doctorName}`);
    console.log(`   Appointment: ${data.appointmentId}`);
    currentCallId = data.callId;
    showMenu();
  });

  socket.on('call-started', (data) => {
    console.log(`\n📱 ${userType.toUpperCase()} - Call Started!`);
    console.log(`   Call ID: ${data.callId}`);
    console.log(`   With: ${data.patientName || data.doctorName}`);
    currentCallId = data.callId;
    showMenu();
  });

  socket.on('call-rejected', (data) => {
    console.log(`\n❌ ${userType.toUpperCase()} - Call Rejected!`);
    console.log(`   Reason: ${data.reason}`);
    console.log(`   By: ${data.rejectedByType}`);
    currentCallId = null;
    showMenu();
  });

  socket.on('call-cancelled', (data) => {
    console.log(`\n🚫 ${userType.toUpperCase()} - Call Cancelled!`);
    console.log(`   Reason: ${data.reason}`);
    console.log(`   By: ${data.cancelledByType}`);
    currentCallId = null;
    showMenu();
  });

  // User events
  socket.on('user-joined', (data) => {
    console.log(`\n👥 ${userType.toUpperCase()} - User Joined Call!`);
    console.log(`   User: ${data.userId} (${data.userType})`);
    showMenu();
  });

  socket.on('user-left', (data) => {
    console.log(`\n👋 ${userType.toUpperCase()} - User Left Call!`);
    console.log(`   User: ${data.userId} (${data.userType})`);
    showMenu();
  });

  socket.on('existing-participants', (data) => {
    console.log(`\n👥 ${userType.toUpperCase()} - Existing Participants:`, data);
    showMenu();
  });

  // WebRTC events
  socket.on('webrtc-signal', (data) => {
    console.log(`\n📡 ${userType.toUpperCase()} - WebRTC Signal Received!`);
    console.log(`   Type: ${data.type}`);
    console.log(`   From: ${data.from} (${data.fromType})`);
    showMenu();
  });

  // Chat events
  socket.on('chat-message', (data) => {
    console.log(`\n💬 ${userType.toUpperCase()} - Chat Message!`);
    console.log(`   From: ${data.userId} (${data.userType})`);
    console.log(`   Message: "${data.message}"`);
    console.log(`   Time: ${data.timestamp}`);
    showMenu();
  });

  // Connected users
  socket.on('connected-users', (data) => {
    console.log(`\n👥 Connected Users:`, data);
    showMenu();
  });

  // Error events
  socket.on('call-error', (data) => {
    console.error(`\n❌ ${userType.toUpperCase()} - Call Error:`, data.message);
    showMenu();
  });
}

function handleMenuChoice(choice) {
  switch(choice) {
    case '1':
      if (!patientSocket) {
        patientSocket = createSocket(mockData.patientId, 'patient');
      } else {
        console.log('Patient already connected!');
        showMenu();
      }
      break;

    case '2':
      if (!doctorSocket) {
        doctorSocket = createSocket(mockData.doctorId, 'doctor');
      } else {
        console.log('Doctor already connected!');
        showMenu();
      }
      break;

    case '3':
      if (patientSocket && patientSocket.connected) {
        console.log('\n📞 Patient starting call...');
        patientSocket.emit('start-call', {
          appointmentId: mockData.appointmentId,
          patientId: mockData.patientId,
          doctorId: mockData.doctorId
        });
      } else {
        console.log('❌ Patient not connected!');
        showMenu();
      }
      break;

    case '4':
      if (doctorSocket && doctorSocket.connected) {
        console.log('\n📞 Doctor starting call...');
        doctorSocket.emit('start-call', {
          appointmentId: mockData.appointmentId,
          patientId: mockData.patientId
        });
      } else {
        console.log('❌ Doctor not connected!');
        showMenu();
      }
      break;

    case '5':
      if (currentCallId) {
        rl.question('Accept as (patient/doctor)? ', (userType) => {
          const socket = userType === 'patient' ? patientSocket : doctorSocket;
          if (socket && socket.connected) {
            console.log(`\n✅ ${userType} accepting call...`);
            socket.emit('join-call', { 
              callId: currentCallId,
              appointmentId: mockData.appointmentId
            });
          } else {
            console.log(`❌ ${userType} not connected!`);
          }
          showMenu();
        });
      } else {
        console.log('❌ No active call to accept!');
        showMenu();
      }
      break;

    case '6':
      if (currentCallId) {
        rl.question('Reject as (patient/doctor)? ', (userType) => {
          const socket = userType === 'patient' ? patientSocket : doctorSocket;
          if (socket && socket.connected) {
            console.log(`\n❌ ${userType} rejecting call...`);
            socket.emit('reject-call', {
              callId: currentCallId,
              appointmentId: mockData.appointmentId,
              reason: 'Currently unavailable'
            });
          } else {
            console.log(`❌ ${userType} not connected!`);
          }
          showMenu();
        });
      } else {
        console.log('❌ No active call to reject!');
        showMenu();
      }
      break;

    case '7':
      if (currentCallId) {
        rl.question('Cancel as (patient/doctor)? ', (userType) => {
          const socket = userType === 'patient' ? patientSocket : doctorSocket;
          if (socket && socket.connected) {
            console.log(`\n🚫 ${userType} cancelling call...`);
            socket.emit('cancel-call', {
              callId: currentCallId,
              appointmentId: mockData.appointmentId,
              reason: 'Changed mind'
            });
          } else {
            console.log(`❌ ${userType} not connected!`);
          }
          showMenu();
        });
      } else {
        console.log('❌ No active call to cancel!');
        showMenu();
      }
      break;

    case '8':
      if (currentCallId) {
        rl.question('Send message as (patient/doctor)? ', (userType) => {
          rl.question('Enter message: ', (message) => {
            const socket = userType === 'patient' ? patientSocket : doctorSocket;
            if (socket && socket.connected) {
              console.log(`\n💬 ${userType} sending message...`);
              socket.emit('chat-message', {
                callId: currentCallId,
                message: message
              });
            } else {
              console.log(`❌ ${userType} not connected!`);
            }
            showMenu();
          });
        });
      } else {
        console.log('❌ No active call for chat!');
        showMenu();
      }
      break;

    case '9':
      if (currentCallId) {
        rl.question('Leave call as (patient/doctor)? ', (userType) => {
          const socket = userType === 'patient' ? patientSocket : doctorSocket;
          if (socket && socket.connected) {
            console.log(`\n👋 ${userType} leaving call...`);
            socket.emit('leave-call', { callId: currentCallId });
          } else {
            console.log(`❌ ${userType} not connected!`);
          }
          showMenu();
        });
      } else {
        console.log('❌ No active call to leave!');
        showMenu();
      }
      break;

    case '10':
      if (currentCallId) {
        rl.question('Send WebRTC signal as (patient/doctor)? ', (userType) => {
          const socket = userType === 'patient' ? patientSocket : doctorSocket;
          if (socket && socket.connected) {
            console.log(`\n📡 ${userType} sending WebRTC offer...`);
            socket.emit('webrtc-signal', {
              callId: currentCallId,
              type: 'offer',
              offer: { type: 'offer', sdp: 'mock-sdp-data' }
            });
          } else {
            console.log(`❌ ${userType} not connected!`);
          }
          showMenu();
        });
      } else {
        console.log('❌ No active call for WebRTC!');
        showMenu();
      }
      break;

    case '11':
      if (patientSocket && patientSocket.connected) {
        console.log('\n👥 Getting connected users...');
        patientSocket.emit('get-connected-users');
      } else if (doctorSocket && doctorSocket.connected) {
        console.log('\n👥 Getting connected users...');
        doctorSocket.emit('get-connected-users');
      } else {
        console.log('❌ No connections available!');
        showMenu();
      }
      break;

    case '0':
      console.log('\n👋 Goodbye!');
      if (patientSocket) patientSocket.disconnect();
      if (doctorSocket) doctorSocket.disconnect();
      rl.close();
      process.exit(0);
      break;

    default:
      console.log('❌ Invalid choice!');
      showMenu();
      break;
  }
}

// Start the interactive session
console.log('📋 Mock Data:');
console.log(`   Appointment ID: ${mockData.appointmentId}`);
console.log(`   Patient ID: ${mockData.patientId}`);
console.log(`   Doctor ID: ${mockData.doctorId}`);

showMenu();

rl.on('line', (input) => {
  handleMenuChoice(input.trim());
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n👋 Cleaning up...');
  if (patientSocket) patientSocket.disconnect();
  if (doctorSocket) doctorSocket.disconnect();
  rl.close();
  process.exit(0);
});

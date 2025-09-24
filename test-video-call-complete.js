const axios = require('axios');
const io = require('socket.io-client');

// Configuration
const BASE_URL = 'https://telemedicine-sih-8i5h.onrender.com';
const VIDEO_CALL_NAMESPACE = '/video-call';

// Test credentials (you'll need to replace these with actual test accounts)
const TEST_PATIENT = {
  email: 'patient@test.com',
  password: 'password123',
  userType: 'patient'
};

const TEST_DOCTOR = {
  email: 'doctor@test.com', 
  password: 'password123',
  userType: 'doctor'
};

class VideoCallTester {
  constructor() {
    this.patientSocket = null;
    this.doctorSocket = null;
    this.patientAuth = null;
    this.doctorAuth = null;
    this.callId = null;
    this.testResults = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async runTests() {
    this.log('🚀 Starting Video Call System Tests', 'START');
    
    try {
      await this.setupTestEnvironment();
      await this.testAuthentication();
      await this.testSocketConnections();
      await this.testVideoCallRequest();
      await this.testCallAcceptance();
      await this.testCallRejection();
      await this.cleanup();
      
      this.printTestResults();
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'ERROR');
      await this.cleanup();
    }
  }

  async setupTestEnvironment() {
    this.log('🔧 Setting up test environment...', 'SETUP');
    
    // Create axios instance with cookie support
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      withCredentials: true,
      timeout: 10000
    });
  }

  async testAuthentication() {
    this.log('🔐 Testing authentication...', 'AUTH');
    
    try {
      // Test patient login
      this.log('Testing patient authentication...', 'AUTH');
      const patientResponse = await this.axiosInstance.post('/api/auth/login', TEST_PATIENT);
      this.patientAuth = patientResponse.data;
      this.log(`✅ Patient authenticated: ${this.patientAuth.userType}`, 'AUTH');
      
      // Test doctor login  
      this.log('Testing doctor authentication...', 'AUTH');
      const doctorResponse = await this.axiosInstance.post('/api/auth/login', TEST_DOCTOR);
      this.doctorAuth = doctorResponse.data;
      this.log(`✅ Doctor authenticated: ${this.doctorAuth.userType}`, 'AUTH');
      
      // Get user details
      const patientDetails = await this.axiosInstance.get('/api/auth/me');
      const doctorDetails = await this.axiosInstance.get('/api/auth/me');
      
      this.log(`Patient details: ${JSON.stringify(patientDetails.data.user)}`, 'AUTH');
      this.log(`Doctor details: ${JSON.stringify(doctorDetails.data.user)}`, 'AUTH');
      
      this.testResults.push({
        test: 'Authentication',
        status: 'PASS',
        details: 'Both patient and doctor authenticated successfully'
      });
      
    } catch (error) {
      this.log(`❌ Authentication failed: ${error.response?.data?.message || error.message}`, 'ERROR');
      this.testResults.push({
        test: 'Authentication',
        status: 'FAIL',
        details: error.response?.data?.message || error.message
      });
      throw error;
    }
  }

  async testSocketConnections() {
    this.log('🔌 Testing socket connections...', 'SOCKET');
    
    try {
      // Connect patient socket
      this.patientSocket = io(`${BASE_URL}${VIDEO_CALL_NAMESPACE}`, {
        query: {
          userId: this.patientAuth.userId,
          userType: 'patient'
        },
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      // Connect doctor socket
      this.doctorSocket = io(`${BASE_URL}${VIDEO_CALL_NAMESPACE}`, {
        query: {
          userId: this.doctorAuth.userId,
          userType: 'doctor'
        },
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      // Wait for connections
      await this.waitForSocketConnection(this.patientSocket, 'patient');
      await this.waitForSocketConnection(this.doctorSocket, 'doctor');
      
      this.testResults.push({
        test: 'Socket Connections',
        status: 'PASS',
        details: 'Both patient and doctor sockets connected successfully'
      });
      
    } catch (error) {
      this.log(`❌ Socket connection failed: ${error.message}`, 'ERROR');
      this.testResults.push({
        test: 'Socket Connections',
        status: 'FAIL',
        details: error.message
      });
      throw error;
    }
  }

  async waitForSocketConnection(socket, userType) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`${userType} socket connection timeout`));
      }, 10000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        this.log(`✅ ${userType} socket connected: ${socket.id}`, 'SOCKET');
        resolve();
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`${userType} socket connection error: ${error.message}`));
      });
    });
  }

  async testVideoCallRequest() {
    this.log('📞 Testing video call request...', 'CALL');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Video call request timeout'));
      }, 15000);

      // Set up doctor listener for incoming calls
      this.doctorSocket.on('doctor:incoming-call', (data) => {
        this.log(`🔔 Doctor received incoming call: ${JSON.stringify(data)}`, 'CALL');
        this.callId = data.callId;
        clearTimeout(timeout);
        resolve();
      });

      // Set up patient listener for call request confirmation
      this.patientSocket.on('patient:call-request-sent', (data) => {
        this.log(`✅ Patient call request sent: ${JSON.stringify(data)}`, 'CALL');
      });

      // Send video call request
      const callRequest = {
        doctorId: this.doctorAuth.userId,
        doctorName: 'Test Doctor',
        patientName: 'Test Patient',
        specialization: 'General Medicine'
      };

      this.log(`🚀 Sending video call request: ${JSON.stringify(callRequest)}`, 'CALL');
      this.patientSocket.emit('patient:call-doctor', callRequest);

      // Handle errors
      this.patientSocket.on('call-error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Patient call error: ${error.message}`));
      });

      this.doctorSocket.on('call-error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Doctor call error: ${error.message}`));
      });
    }).then(() => {
      this.testResults.push({
        test: 'Video Call Request',
        status: 'PASS',
        details: 'Video call request sent and received successfully'
      });
    }).catch((error) => {
      this.log(`❌ Video call request failed: ${error.message}`, 'ERROR');
      this.testResults.push({
        test: 'Video Call Request',
        status: 'FAIL',
        details: error.message
      });
      throw error;
    });
  }

  async testCallAcceptance() {
    if (!this.callId) {
      throw new Error('No call ID available for acceptance test');
    }

    this.log('✅ Testing call acceptance...', 'CALL');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Call acceptance timeout'));
      }, 10000);

      // Set up patient listener for call acceptance
      this.patientSocket.on('patient:call-accepted', (data) => {
        this.log(`✅ Patient received call acceptance: ${JSON.stringify(data)}`, 'CALL');
        clearTimeout(timeout);
        resolve();
      });

      // Doctor accepts the call
      this.log(`🔥 Doctor accepting call: ${this.callId}`, 'CALL');
      this.doctorSocket.emit('doctor:accept-call', { callId: this.callId });

      // Handle errors
      this.doctorSocket.on('call-error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Doctor acceptance error: ${error.message}`));
      });

      this.doctorSocket.on('call-accepted-confirmation', (data) => {
        this.log(`✅ Doctor received acceptance confirmation: ${JSON.stringify(data)}`, 'CALL');
      });

    }).then(() => {
      this.testResults.push({
        test: 'Call Acceptance',
        status: 'PASS',
        details: 'Call accepted successfully by doctor and patient notified'
      });
    }).catch((error) => {
      this.log(`❌ Call acceptance failed: ${error.message}`, 'ERROR');
      this.testResults.push({
        test: 'Call Acceptance',
        status: 'FAIL',
        details: error.message
      });
      throw error;
    });
  }

  async testCallRejection() {
    this.log('❌ Testing call rejection...', 'CALL');
    
    // Create a new call for rejection test
    const callRequest = {
      doctorId: this.doctorAuth.userId,
      doctorName: 'Test Doctor',
      patientName: 'Test Patient',
      specialization: 'General Medicine'
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Call rejection timeout'));
      }, 10000);

      // Set up patient listener for call rejection
      this.patientSocket.on('patient:call-rejected', (data) => {
        this.log(`❌ Patient received call rejection: ${JSON.stringify(data)}`, 'CALL');
        clearTimeout(timeout);
        resolve();
      });

      // Set up doctor listener for incoming call
      this.doctorSocket.on('doctor:incoming-call', (data) => {
        this.log(`🔔 Doctor received call for rejection test: ${data.callId}`, 'CALL');
        
        // Reject the call
        setTimeout(() => {
          this.log(`❌ Doctor rejecting call: ${data.callId}`, 'CALL');
          this.doctorSocket.emit('doctor:reject-call', { 
            callId: data.callId, 
            reason: 'Doctor is busy' 
          });
        }, 1000);
      });

      // Send video call request
      this.log(`🚀 Sending video call request for rejection test`, 'CALL');
      this.patientSocket.emit('patient:call-doctor', callRequest);

    }).then(() => {
      this.testResults.push({
        test: 'Call Rejection',
        status: 'PASS',
        details: 'Call rejected successfully by doctor and patient notified'
      });
    }).catch((error) => {
      this.log(`❌ Call rejection failed: ${error.message}`, 'ERROR');
      this.testResults.push({
        test: 'Call Rejection',
        status: 'FAIL',
        details: error.message
      });
      throw error;
    });
  }

  async cleanup() {
    this.log('🧹 Cleaning up test environment...', 'CLEANUP');
    
    if (this.patientSocket) {
      this.patientSocket.disconnect();
    }
    
    if (this.doctorSocket) {
      this.doctorSocket.disconnect();
    }

    // Logout from both accounts
    try {
      await this.axiosInstance.get('/api/auth/logout');
    } catch (error) {
      this.log(`Warning: Logout failed: ${error.message}`, 'WARN');
    }
  }

  printTestResults() {
    this.log('📊 Test Results Summary:', 'RESULTS');
    console.log('=' .repeat(60));
    
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      console.log(`   Details: ${result.details}`);
      console.log('');
    });
    
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const totalTests = this.testResults.length;
    
    console.log('=' .repeat(60));
    console.log(`📈 Summary: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      this.log('🎉 All tests passed! Video call system is working correctly.', 'SUCCESS');
    } else {
      this.log('⚠️  Some tests failed. Please check the issues above.', 'WARNING');
    }
  }
}

// Run the tests
async function main() {
  console.log('🎥 TeleMedicine Video Call System Test Suite');
  console.log('==========================================');
  
  const tester = new VideoCallTester();
  await tester.runTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = VideoCallTester;


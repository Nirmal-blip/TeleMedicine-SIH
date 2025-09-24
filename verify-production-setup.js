const axios = require('axios');

// Configuration
const BASE_URL = 'https://telemedicine-sih-8i5h.onrender.com';

class ProductionVerifier {
  constructor() {
    this.results = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
  }

  async runVerification() {
    this.log('🔍 Verifying Production Server Setup', 'START');
    
    try {
      await this.checkServerHealth();
      await this.checkAuthEndpoint();
      await this.checkVideoCallNamespace();
      await this.checkCORS();
      
      this.printResults();
    } catch (error) {
      this.log(`❌ Verification failed: ${error.message}`, 'ERROR');
    }
  }

  async checkServerHealth() {
    this.log('🏥 Checking server health...', 'HEALTH');
    
    try {
      const response = await axios.get(`${BASE_URL}/`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TeleMedicine-Test-Client'
        }
      });
      
      this.results.push({
        test: 'Server Health',
        status: 'PASS',
        details: `Server responding (Status: ${response.status})`
      });
      
      this.log(`✅ Server is healthy`, 'HEALTH');
    } catch (error) {
      this.results.push({
        test: 'Server Health',
        status: 'FAIL',
        details: `Server not responding: ${error.message}`
      });
      
      this.log(`❌ Server health check failed: ${error.message}`, 'ERROR');
    }
  }

  async checkAuthEndpoint() {
    this.log('🔐 Checking authentication endpoint...', 'AUTH');
    
    try {
      // Test auth endpoint (should return 401 without credentials)
      const response = await axios.get(`${BASE_URL}/api/auth/me`, {
        timeout: 10000,
        validateStatus: (status) => status === 401 // Expect 401 for unauthenticated request
      });
      
      this.results.push({
        test: 'Authentication Endpoint',
        status: 'PASS',
        details: 'Auth endpoint accessible and properly secured'
      });
      
      this.log(`✅ Auth endpoint is accessible`, 'AUTH');
    } catch (error) {
      this.results.push({
        test: 'Authentication Endpoint',
        status: 'FAIL',
        details: `Auth endpoint error: ${error.message}`
      });
      
      this.log(`❌ Auth endpoint check failed: ${error.message}`, 'ERROR');
    }
  }

  async checkVideoCallNamespace() {
    this.log('🎥 Checking video call WebSocket namespace...', 'WEBSOCKET');
    
    try {
      // Try to connect to the video call namespace
      const io = require('socket.io-client');
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        const socket = io(`${BASE_URL}/video-call`, {
          transports: ['websocket', 'polling'],
          timeout: 5000
        });

        socket.on('connect', () => {
          clearTimeout(timeout);
          socket.disconnect();
          
          this.results.push({
            test: 'Video Call WebSocket',
            status: 'PASS',
            details: 'WebSocket namespace accessible'
          });
          
          this.log(`✅ Video call WebSocket namespace is accessible`, 'WEBSOCKET');
          resolve();
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`WebSocket connection error: ${error.message}`));
        });
      });
      
    } catch (error) {
      this.results.push({
        test: 'Video Call WebSocket',
        status: 'FAIL',
        details: `WebSocket error: ${error.message}`
      });
      
      this.log(`❌ Video call WebSocket check failed: ${error.message}`, 'ERROR');
    }
  }

  async checkCORS() {
    this.log('🌐 Checking CORS configuration...', 'CORS');
    
    try {
      // Test CORS with a simple OPTIONS request
      const response = await axios.options(`${BASE_URL}/api/auth/me`, {
        timeout: 5000,
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const corsHeaders = {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials']
      };
      
      this.results.push({
        test: 'CORS Configuration',
        status: 'PASS',
        details: `CORS headers present: ${JSON.stringify(corsHeaders)}`
      });
      
      this.log(`✅ CORS configuration looks good`, 'CORS');
    } catch (error) {
      this.results.push({
        test: 'CORS Configuration',
        status: 'FAIL',
        details: `CORS check failed: ${error.message}`
      });
      
      this.log(`❌ CORS check failed: ${error.message}`, 'ERROR');
    }
  }

  printResults() {
    this.log('📊 Production Server Verification Results:', 'RESULTS');
    console.log('=' .repeat(60));
    
    this.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      console.log(`   Details: ${result.details}`);
      console.log('');
    });
    
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const totalTests = this.results.length;
    
    console.log('=' .repeat(60));
    console.log(`📈 Summary: ${passedTests}/${totalTests} checks passed`);
    
    if (passedTests === totalTests) {
      this.log('🎉 Production server is ready for video call testing!', 'SUCCESS');
    } else {
      this.log('⚠️  Some checks failed. Please resolve issues before testing.', 'WARNING');
    }
  }
}

// Run verification
async function main() {
  console.log('🔍 TeleMedicine Production Server Verification');
  console.log('============================================');
  
  const verifier = new ProductionVerifier();
  await verifier.runVerification();
}

// Run the verification
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionVerifier;


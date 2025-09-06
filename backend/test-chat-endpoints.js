const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'prithraj120@gmail.com',
  password: '123123123'
};

class ChatEndpointTester {
  constructor() {
    this.cookies = '';
    this.sessionId = null;
  }

  async login() {
    try {
      console.log('🔑 Attempting to login...');
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password,
        userType: 'patient'
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        // Extract cookies from response
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          this.cookies = cookies.join('; ');
          console.log('✅ Login successful');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testCreateChatSession() {
    try {
      console.log('\n📝 Testing chat session creation...');
      const response = await axios.post(`${BASE_URL}/api/chat-history/session`, {}, {
        headers: {
          Cookie: this.cookies
        },
        withCredentials: true
      });

      if (response.status === 201) {
        this.sessionId = response.data.sessionId;
        console.log(`✅ Chat session created: ${this.sessionId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to create chat session:', error.response?.data || error.message);
      return false;
    }
  }

  async testAddMessage() {
    if (!this.sessionId) {
      console.error('❌ No session ID available');
      return false;
    }

    try {
      console.log('\n💬 Testing add message...');
      const response = await axios.post(`${BASE_URL}/api/chat-history/session/${this.sessionId}/message`, {
        text: 'Hello, this is a test message from the automated test',
        sender: 'user'
      }, {
        headers: {
          Cookie: this.cookies
        },
        withCredentials: true
      });

      if (response.status === 201) {
        console.log('✅ Message added successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to add message:', error.response?.data || error.message);
      return false;
    }
  }

  async testGetChatSessions() {
    try {
      console.log('\n📋 Testing get chat sessions...');
      const response = await axios.get(`${BASE_URL}/api/chat-history/sessions`, {
        headers: {
          Cookie: this.cookies
        },
        withCredentials: true
      });

      if (response.status === 200) {
        const sessions = response.data;
        console.log(`✅ Retrieved ${sessions.length} chat sessions`);
        if (sessions.length > 0) {
          console.log(`   Latest session: ${sessions[0].sessionId} - "${sessions[0].title}"`);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to get chat sessions:', error.response?.data || error.message);
      return false;
    }
  }

  async testGetSpecificSession() {
    if (!this.sessionId) {
      console.error('❌ No session ID available');
      return false;
    }

    try {
      console.log('\n🔍 Testing get specific session...');
      const response = await axios.get(`${BASE_URL}/api/chat-history/session/${this.sessionId}`, {
        headers: {
          Cookie: this.cookies
        },
        withCredentials: true
      });

      if (response.status === 200) {
        const session = response.data;
        console.log(`✅ Retrieved session with ${session.messages.length} messages`);
        if (session.messages.length > 0) {
          console.log(`   Latest message: "${session.messages[session.messages.length - 1].text}"`);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to get specific session:', error.response?.data || error.message);
      return false;
    }
  }

  async testAIChatEndpoint() {
    if (!this.sessionId) {
      console.error('❌ No session ID available');
      return false;
    }

    try {
      console.log('\n🤖 Testing AI chat endpoint...');
      const response = await axios.post(`${BASE_URL}/api/ai/chat`, {
        input: 'What are the symptoms of fever?',
        sessionId: this.sessionId
      }, {
        headers: {
          Cookie: this.cookies
        },
        withCredentials: true
      });

      if (response.status === 200) {
        console.log('✅ AI chat response received');
        console.log(`   Response preview: "${response.data.response?.substring(0, 100)}..."`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ AI chat failed:', error.response?.data || error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Chat History Endpoint Tests...\n');
    
    let allTestsPassed = true;
    
    // Run all tests sequentially
    allTestsPassed &= await this.login();
    allTestsPassed &= await this.testCreateChatSession();
    allTestsPassed &= await this.testAddMessage();
    allTestsPassed &= await this.testGetChatSessions();
    allTestsPassed &= await this.testGetSpecificSession();
    allTestsPassed &= await this.testAIChatEndpoint();
    
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 All chat history tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check the output above.');
    }
    console.log('='.repeat(50));
    
    return allTestsPassed;
  }
}

// Self-executing test
if (require.main === module) {
  const tester = new ChatEndpointTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = ChatEndpointTester;

// Test script for OTP functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function testOTPFlow() {
    console.log('🧪 Testing OTP Flow...\n');

    try {
        // Test 1: Send OTP for signup
        console.log('1. Testing send OTP for signup...');
        const sendOtpResponse = await axios.post(`${BASE_URL}/send-otp`, {
            email: 'test@example.com',
            purpose: 'signup'
        });
        console.log('✅ Send OTP Response:', sendOtpResponse.data);

        // Test 2: Verify OTP (this will fail with invalid OTP, which is expected)
        console.log('\n2. Testing verify OTP with invalid code...');
        try {
            const verifyOtpResponse = await axios.post(`${BASE_URL}/verify-otp`, {
                email: 'test@example.com',
                otp: '123456',
                purpose: 'signup'
            });
            console.log('❌ Unexpected success:', verifyOtpResponse.data);
        } catch (error) {
            console.log('✅ Expected error for invalid OTP:', error.response?.data?.message || error.message);
        }

        // Test 3: Test registration with OTP (this will fail without valid OTP)
        console.log('\n3. Testing registration with OTP...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/register-with-otp`, {
                fullname: 'Test User',
                email: 'test@example.com',
                phone: '+1234567890',
                password: 'password123',
                dateOfBirth: '1990-01-01',
                gender: 'Male',
                location: 'Test City',
                userType: 'patient',
                otp: '123456'
            });
            console.log('❌ Unexpected success:', registerResponse.data);
        } catch (error) {
            console.log('✅ Expected error for registration with invalid OTP:', error.response?.data?.message || error.message);
        }

        console.log('\n🎉 OTP flow test completed!');
        console.log('\n📝 Note: To test with real OTP, you need to:');
        console.log('1. Set up EMAIL_USER and EMAIL_PASS in .env file');
        console.log('2. Use a real email address');
        console.log('3. Check the email for the actual OTP code');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testOTPFlow();

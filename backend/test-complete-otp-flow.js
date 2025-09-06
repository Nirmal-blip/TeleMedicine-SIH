// Complete OTP Flow Test Script
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function testCompleteOTPFlow() {
    console.log('🧪 Testing Complete OTP Flow...\n');

    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    const testUserType = 'patient';

    try {
        // Step 1: Send OTP for signup
        console.log('1. 📧 Sending OTP for signup...');
        const sendOtpResponse = await axios.post(`${BASE_URL}/send-otp`, {
            email: testEmail,
            purpose: 'signup'
        });
        console.log('✅ Send OTP Response:', sendOtpResponse.data);

        // Step 2: Get the actual OTP from the service (for testing purposes)
        console.log('\n2. 🔍 Getting OTP from service...');
        // Note: In real scenario, user would check their email
        // For testing, we'll use a mock OTP
        const mockOtp = '123456'; // This would be the actual OTP from email

        // Step 3: Verify OTP
        console.log('\n3. ✅ Verifying OTP...');
        const verifyOtpResponse = await axios.post(`${BASE_URL}/verify-otp`, {
            email: testEmail,
            otp: mockOtp,
            purpose: 'signup'
        });
        console.log('✅ Verify OTP Response:', verifyOtpResponse.data);

        // Step 4: Register with OTP (if verification was successful)
        if (verifyOtpResponse.data.success) {
            console.log('\n4. 📝 Registering user with OTP...');
            const registerResponse = await axios.post(`${BASE_URL}/register-with-otp`, {
                fullname: 'Test User',
                email: testEmail,
                phone: '+1234567890',
                password: testPassword,
                dateOfBirth: '1990-01-01',
                gender: 'Male',
                location: 'Test City',
                userType: testUserType,
                otp: mockOtp
            });
            console.log('✅ Registration Response:', registerResponse.data);
        }

        // Step 5: Test login with OTP
        console.log('\n5. 🔐 Testing login with OTP...');
        const sendLoginOtpResponse = await axios.post(`${BASE_URL}/send-otp`, {
            email: testEmail,
            purpose: 'signin'
        });
        console.log('✅ Send Login OTP Response:', sendLoginOtpResponse.data);

        // Step 6: Login with OTP
        console.log('\n6. 🚪 Logging in with OTP...');
        const loginResponse = await axios.post(`${BASE_URL}/login-with-otp`, {
            email: testEmail,
            password: testPassword,
            userType: testUserType,
            otp: mockOtp
        });
        console.log('✅ Login Response:', loginResponse.data);

        console.log('\n🎉 Complete OTP flow test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 400) {
            console.log('\n💡 This is expected for invalid OTP. To test with real OTP:');
            console.log('1. Set up EMAIL_USER and EMAIL_PASS in .env file');
            console.log('2. Use a real email address');
            console.log('3. Check the email for the actual OTP code');
            console.log('4. Replace mockOtp with the real OTP from email');
        }
    }
}

// Run the test
testCompleteOTPFlow();

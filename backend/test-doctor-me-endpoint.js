const axios = require('axios');

async function testDoctorMeEndpoint() {
    console.log('🩺 Testing Doctor /me Endpoint Fix');
    console.log('=' .repeat(50));

    const baseUrl = 'http://localhost:3000';
    
    try {
        // Test data - you may need to update these credentials
        const doctorCredentials = {
            email: 'prithvi@gmail.com', // Update with a valid doctor email
            password: '123123123'
        };

        console.log('🔐 Logging in as doctor...');
        
        // Login as doctor
        const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
            ...doctorCredentials,
            userType: 'doctor'
        }, {
            withCredentials: true
        });

        if (loginResponse.status === 200) {
            console.log('✅ Doctor login successful');
            
            // Test the /me endpoint
            console.log('📋 Testing /api/doctors/me endpoint...');
            
            const meResponse = await axios.get(`${baseUrl}/api/doctors/me`, {
                withCredentials: true
            });

            if (meResponse.status === 200) {
                console.log('✅ /api/doctors/me endpoint working correctly!');
                console.log(`👨‍⚕️ Doctor: ${meResponse.data.fullname || meResponse.data.email}`);
                console.log(`🆔 ID: ${meResponse.data._id}`);
                console.log(`🏥 Specialization: ${meResponse.data.specialization || 'N/A'}`);
                console.log(`✅ Route fix successful - "me" is no longer treated as ObjectId`);
            } else {
                console.log('❌ /api/doctors/me endpoint failed');
            }

        } else {
            console.log('❌ Doctor login failed');
        }

    } catch (error) {
        if (error.response) {
            console.log(`❌ HTTP Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
            
            if (error.response.status === 400 && error.response.data?.message?.includes('Cast to ObjectId')) {
                console.log('🔴 ROUTE ORDER ISSUE STILL EXISTS - "me" is being treated as ObjectId');
                console.log('💡 Make sure /me routes are defined BEFORE /:id routes in DoctorsController');
            }
        } else if (error.request) {
            console.log('❌ Network Error: No response received');
            console.log('💡 Make sure the backend server is running on port 3000');
        } else {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

// Run the test
if (require.main === module) {
    testDoctorMeEndpoint().catch(console.error);
}

module.exports = { testDoctorMeEndpoint };

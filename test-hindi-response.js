const axios = require('axios');

async function testHindiResponse() {
    console.log('🧪 Testing Hindi Response Formatting Fix');
    console.log('=' .repeat(50));

    const testQuestion = 'मुझे बुखार है, क्या करूँ?';
    
    try {
        console.log(`📝 Question: ${testQuestion}`);
        console.log('Sending request to Flask server...');
        
        const response = await axios.post('http://localhost:8000/api/chat', {
            input: testQuestion,
            language: 'hi',
            responseLanguage: 'hi'
        }, {
            timeout: 15000
        });

        if (response.status === 200 && response.data.response) {
            console.log('✅ Response received successfully!');
            console.log('Response length:', response.data.response.length);
            console.log('\n📋 Full Response:');
            console.log(response.data.response);
            
            // Check if the response contains Hindi characters
            const hasHindi = /[\u0900-\u097F]/.test(response.data.response);
            console.log('\n🔍 Analysis:');
            console.log(`- Contains Hindi script: ${hasHindi ? '✅ Yes' : '❌ No'}`);
            console.log(`- Response structure: ${response.data.response.includes('**') ? '✅ Formatted' : '❌ Unformatted'}`);
            console.log(`- Has medical disclaimer: ${response.data.response.includes('चिकित्सा अस्वीकरण') ? '✅ Yes' : '❌ No'}`);
            
        } else {
            console.log('❌ No valid response received');
        }
    } catch (error) {
        if (error.response) {
            console.log(`❌ HTTP Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`);
        } else if (error.request) {
            console.log('❌ Network Error: Flask server may not be running on port 8000');
        } else {
            console.log(`❌ Error: ${error.message}`);
        }
    }
}

// Run the test
testHindiResponse().catch(console.error);

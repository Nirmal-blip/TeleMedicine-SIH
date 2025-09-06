const axios = require('axios');

async function testMultilingualChatbot() {
    console.log('🌐 Testing Multilingual Chatbot Functionality');
    console.log('=' .repeat(60));

    const flaskBaseUrl = 'http://localhost:8000';
    
    // Test cases for different languages
    const testCases = [
        {
            language: 'en',
            input: 'I have a headache and fever. What should I do?',
            description: 'English medical query'
        },
        {
            language: 'hi',
            input: 'मुझे सिरदर्द और बुखार है। मुझे क्या करना चाहिए?',
            description: 'Hindi medical query (Devanagari script)'
        },
        {
            language: 'hi',
            input: 'Mujhe sar dard aur bukhar hai. Main kya karun?',
            description: 'Hindi medical query (Roman script)'
        },
        {
            language: 'es',
            input: 'Tengo dolor de cabeza y fiebre. ¿Qué debo hacer?',
            description: 'Spanish medical query'
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n📝 Testing: ${testCase.description}`);
        console.log(`Input: ${testCase.input}`);
        console.log(`Language: ${testCase.language}`);

        try {
            // Test the streaming endpoint
            const response = await axios.post(`${flaskBaseUrl}/api/chat`, {
                input: testCase.input,
                language: testCase.language,
                responseLanguage: testCase.language
            }, {
                timeout: 15000
            });

            if (response.status === 200 && response.data.response) {
                console.log(`✅ Response received in ${testCase.language}:`);
                console.log(`Response length: ${response.data.response.length} characters`);
                console.log(`Preview: ${response.data.response.substring(0, 150)}...`);
                
                // Check if response is in expected language
                const hasExpectedLanguage = checkLanguageInResponse(response.data.response, testCase.language);
                console.log(`🌐 Language check: ${hasExpectedLanguage ? '✅ Correct' : '❌ Mixed/Incorrect'}`);
            } else {
                console.log('❌ No valid response received');
            }
        } catch (error) {
            if (error.response) {
                console.log(`❌ HTTP Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`);
            } else if (error.request) {
                console.log('❌ Network Error: No response received');
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }

        console.log('-'.repeat(50));
    }

    // Test language detection
    console.log('\n🔍 Testing Language Detection');
    const detectionTests = [
        'I have a fever',
        'मुझे बुखार है', 
        'Mujhe bukhar hai',
        'Tengo fiebre',
        'J\'ai de la fièvre'
    ];

    for (const text of detectionTests) {
        const detectedLang = detectLanguageSimple(text);
        console.log(`"${text}" → Detected: ${detectedLang}`);
    }
}

function checkLanguageInResponse(response, expectedLang) {
    const lowerResponse = response.toLowerCase();
    
    switch (expectedLang) {
        case 'hi':
            // Check for Devanagari script or Hindi-specific terms
            return /[\u0900-\u097F]/.test(response) || 
                   lowerResponse.includes('चिकित्सा') || 
                   lowerResponse.includes('स्वास्थ्य') ||
                   lowerResponse.includes('अस्वीकरण');
        case 'es':
            return lowerResponse.includes('médico') || 
                   lowerResponse.includes('salud') || 
                   lowerResponse.includes('consulte');
        case 'en':
            return lowerResponse.includes('medical') || 
                   lowerResponse.includes('health') || 
                   lowerResponse.includes('consult');
        default:
            return true;
    }
}

function detectLanguageSimple(text) {
    const lowerText = text.toLowerCase();
    
    // Hindi detection (Devanagari script)
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    
    // Hindi detection by common Hindi words
    const hindiWords = ['mujhe', 'hai', 'kya', 'aap', 'bukhar', 'dard'];
    if (hindiWords.some(word => lowerText.includes(word))) return 'hi';
    
    // Spanish detection
    const spanishWords = ['tengo', 'que', 'el', 'la', 'de'];
    if (spanishWords.some(word => lowerText.includes(word))) return 'es';
    
    // French detection
    const frenchWords = ['j\'ai', 'de', 'la', 'le'];
    if (frenchWords.some(word => lowerText.includes(word))) return 'fr';
    
    return 'en'; // Default
}

// Run the test
if (require.main === module) {
    testMultilingualChatbot().catch(console.error);
}

module.exports = { testMultilingualChatbot };

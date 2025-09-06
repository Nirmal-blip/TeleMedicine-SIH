const axios = require('axios');

async function testIndianMultilingualChatbot() {
    console.log('🇮🇳 Testing Indian Multilingual Chatbot Functionality');
    console.log('=' .repeat(70));

    const flaskBaseUrl = 'http://localhost:8000';
    
    // Test cases focused on Indian languages
    const testCases = [
        {
            language: 'hi',
            input: 'मुझे सिरदर्द और बुखार है। क्या करूं?',
            description: 'Hindi (Devanagari script) - Headache & fever'
        },
        {
            language: 'hi', 
            input: 'Mujhe pet mein dard hai aur vomiting ho rahi hai',
            description: 'Hindi (Roman script) - Stomach pain & vomiting'
        },
        {
            language: 'ta',
            input: 'எனக்கு தலைவலி மற்றும் காய்ச்சல் உள்ளது',
            description: 'Tamil (Tamil script) - Headache & fever'
        },
        {
            language: 'te',
            input: 'నాకు తలనొప్పి మరియు జ్వరం ఉంది',
            description: 'Telugu (Telugu script) - Headache & fever'
        },
        {
            language: 'bn',
            input: 'আমার মাথাব্যথা এবং জ্বর হচ্ছে',
            description: 'Bengali (Bengali script) - Headache & fever'
        },
        {
            language: 'en',
            input: 'I have cough and cold symptoms',
            description: 'English - Common cold symptoms'
        }
    ];

    console.log('🔍 Testing Language Detection:');
    for (const testCase of testCases) {
        const detectedLang = detectIndianLanguage(testCase.input);
        const isCorrect = detectedLang === testCase.language;
        console.log(`${isCorrect ? '✅' : '❌'} "${testCase.input.substring(0, 30)}..." → Expected: ${testCase.language}, Detected: ${detectedLang}`);
    }

    console.log('\n💬 Testing Multilingual AI Responses:');
    for (const testCase of testCases) {
        console.log(`\n📝 ${testCase.description}`);
        console.log(`Input: ${testCase.input}`);
        console.log(`Language: ${testCase.language}`);

        try {
            const response = await axios.post(`${flaskBaseUrl}/api/chat`, {
                input: testCase.input,
                language: testCase.language,
                responseLanguage: testCase.language
            }, {
                timeout: 20000
            });

            if (response.status === 200 && response.data.response) {
                console.log(`✅ Response received (${response.data.response.length} chars)`);
                
                // Check if response is in expected language
                const hasExpectedLanguage = checkIndianLanguageInResponse(response.data.response, testCase.language);
                console.log(`🌐 Language check: ${hasExpectedLanguage ? '✅ Correct' : '⚠️ Mixed/Uncertain'}`);
                
                // Show preview
                const preview = response.data.response.substring(0, 100).replace(/\n/g, ' ');
                console.log(`Preview: ${preview}...`);
            } else {
                console.log('❌ No valid response received');
            }
        } catch (error) {
            if (error.response) {
                console.log(`❌ HTTP Error ${error.response.status}: ${error.response.data?.error || 'Unknown error'}`);
            } else if (error.request) {
                console.log('❌ Network Error: No response received - Make sure Flask server is running on port 8000');
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
        console.log('-'.repeat(50));
    }

    // Test automatic language switching
    console.log('\n🔄 Testing Auto Language Switching:');
    const mixedInputs = [
        'Hello, mujhe help chahiye',
        'Hi doctor, मुझे पेट दर्द है',
        'நமస্কার, I need medical advice'
    ];

    for (const input of mixedInputs) {
        const detected = detectIndianLanguage(input);
        console.log(`"${input}" → Auto-detected: ${detected}`);
    }
}

function detectIndianLanguage(text) {
    const lowerText = text.toLowerCase();
    
    // Script-based detection
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
    if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
    
    // Roman script detection
    const hindiWords = ['mujhe', 'hai', 'kya', 'aap', 'karun', 'dard', 'pet', 'sar'];
    if (hindiWords.some(word => lowerText.includes(word))) return 'hi';
    
    // English check
    if (/^[a-zA-Z\s.,!?'"()-]+$/.test(text)) return 'en';
    
    return 'hi'; // Default to Hindi for Indian context
}

function checkIndianLanguageInResponse(response, expectedLang) {
    const lowerResponse = response.toLowerCase();
    
    switch (expectedLang) {
        case 'hi':
            return /[\u0900-\u097F]/.test(response) || 
                   lowerResponse.includes('चिकित्सा') || 
                   lowerResponse.includes('स्वास्थ्य') ||
                   lowerResponse.includes('अस्वीकरण');
        case 'ta':
            return /[\u0B80-\u0BFF]/.test(response) ||
                   lowerResponse.includes('மருத்துவ') ||
                   lowerResponse.includes('சுகாதார');
        case 'te':
            return /[\u0C00-\u0C7F]/.test(response) ||
                   lowerResponse.includes('వైద్య') ||
                   lowerResponse.includes('ఆరోగ్య');
        case 'bn':
            return /[\u0980-\u09FF]/.test(response) ||
                   lowerResponse.includes('চিকিৎসা') ||
                   lowerResponse.includes('স্বাস্থ্য');
        case 'en':
            return lowerResponse.includes('medical') || 
                   lowerResponse.includes('health') || 
                   lowerResponse.includes('consult');
        default:
            return true;
    }
}

// Run the test
if (require.main === module) {
    testIndianMultilingualChatbot().catch(console.error);
}

module.exports = { testIndianMultilingualChatbot };

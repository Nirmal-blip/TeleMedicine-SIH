import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faXmark, faPaperPlane, faMicrophone, faMicrophoneSlash, faVolumeUp, faHistory, faPlus, faTrash, faClock } from '@fortawesome/free-solid-svg-icons';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showWelcome, setShowWelcome] = useState<boolean>(false);
    const [isSignupOpen, setIsSignupOpen] = useState<boolean>(false);
    const [isSigninOpen, setIsSigninOpen] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [speechStatus, setSpeechStatus] = useState<string>('');
    const [speechSupported, setSpeechSupported] = useState<boolean>(false);
    const [currentLanguage, setCurrentLanguage] = useState<string>('hi-IN'); // Default to Hindi for India
    const [detectedLanguage, setDetectedLanguage] = useState<string>('hi'); // Default to Hindi
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [chatSessions, setChatSessions] = useState<any[]>([]);
    const [showChatHistory, setShowChatHistory] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

    // Supported languages focused on Indian languages and auto-detection
    const supportedLanguages = [
        { code: 'hi-IN', name: 'हिंदी (Hindi)', aiCode: 'hi' },
        { code: 'en-IN', name: 'English (India)', aiCode: 'en' },
        { code: 'ta-IN', name: 'தமிழ் (Tamil)', aiCode: 'ta' },
        { code: 'te-IN', name: 'తెలుగు (Telugu)', aiCode: 'te' },
        { code: 'bn-IN', name: 'বাংলা (Bengali)', aiCode: 'bn' },
        { code: 'mr-IN', name: 'मराठी (Marathi)', aiCode: 'mr' },
        { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', aiCode: 'gu' },
        { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', aiCode: 'kn' },
        { code: 'ml-IN', name: 'മലയാളം (Malayalam)', aiCode: 'ml' },
        { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', aiCode: 'pa' },
    ];

    // Enhanced Indian language detection based on scripts and common words
    const detectLanguage = (text: string): string => {
        const lowerText = text.toLowerCase();
        
        // Script-based detection for Indian languages
        // Hindi/Marathi (Devanagari script)
        if (/[\u0900-\u097F]/.test(text)) {
            // Check for specific Marathi words
            if (/मी|तू|तो|ती|हे|काय|कसे/.test(text)) return 'mr';
            return 'hi'; // Default to Hindi for Devanagari
        }
        
        // Tamil script
        if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
        
        // Telugu script  
        if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
        
        // Bengali script
        if (/[\u0980-\u09FF]/.test(text)) return 'bn';
        
        // Gujarati script
        if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
        
        // Kannada script
        if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
        
        // Malayalam script
        if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
        
        // Punjabi script (Gurmukhi)
        if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
        
        // Romanized Indian language detection
        // Hindi words in Roman script
        const hindiWords = ['kya', 'hai', 'mera', 'main', 'aap', 'hum', 'tum', 'ye', 'wo', 'kaise', 'kahan', 'kyun', 'acha', 'bura', 'samay', 'paani', 'khana', 'dard', 'sar', 'pet', 'bukhar', 'dawai', 'mujhe', 'aur', 'karun', 'hoon', 'nahin', 'theek', 'accha'];
        const hindiWordCount = hindiWords.filter(word => lowerText.includes(word)).length;
        if (hindiWordCount >= 1) return 'hi';
        
        // Tamil words in Roman script
        const tamilWords = ['naan', 'neenga', 'enna', 'epdi', 'enga', 'enna', 'vandhuruken', 'sollunga', 'sari'];
        const tamilWordCount = tamilWords.filter(word => lowerText.includes(word)).length;
        if (tamilWordCount >= 1) return 'ta';
        
        // Telugu words in Roman script
        const teluguWords = ['nenu', 'miru', 'ela', 'emi', 'ekkada', 'enduku', 'cheppandi', 'telusu'];
        const teluguWordCount = teluguWords.filter(word => lowerText.includes(word)).length;
        if (teluguWordCount >= 1) return 'te';
        
        // Bengali words in Roman script
        const bengaliWords = ['ami', 'tumi', 'ki', 'kemon', 'kothay', 'keno', 'bolo', 'jani'];
        const bengaliWordCount = bengaliWords.filter(word => lowerText.includes(word)).length;
        if (bengaliWordCount >= 1) return 'bn';
        
        // English detection (basic check) - this should be last
        if (/^[a-zA-Z\s.,!?'"()-]+$/.test(text)) return 'en';
        
        // Default to Hindi for Indian context
        return 'hi';
    };

    const toggleChat = async () => {
        const wasOpen = isOpen;
        setIsOpen((prev) => !prev);
        setShowWelcome(false);
        
        if (!wasOpen) {
            // Opening chat - initialize session if none exists
            if (!currentSessionId) {
                await createNewChatSession();
            }
            await loadChatSessions();
            if (messagesEndRef.current) {
                setTimeout(() => scrollToBottom(), 100);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        let timer: number | undefined;
        if (!isOpen) {
            timer = setTimeout(() => {
                setShowWelcome(true);
            }, 3000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Add keyboard shortcuts for speech recognition
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Press Space to start/stop listening when input is focused and empty
            if (event.code === 'Space' && isOpen && speechSupported && !userInput.trim()) {
                const target = event.target as HTMLElement;
                if (target.tagName === 'INPUT') {
                    event.preventDefault();
                    if (isListening) {
                        stopListening();
                    } else {
                        startListening();
                    }
                }
            }
            
            // Press Escape to stop listening
            if (event.key === 'Escape' && isListening) {
                event.preventDefault();
                stopListening();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isListening, userInput, speechSupported]);

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setSpeechSupported(true);
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            
            // Enhanced configuration for better accuracy
            recognitionRef.current.continuous = true; // Allow continuous listening
            recognitionRef.current.interimResults = true; // Show interim results for better UX
            recognitionRef.current.lang = currentLanguage;
            recognitionRef.current.maxAlternatives = 3; // Get multiple alternatives
            
            // Enhanced result handling
            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                // Process all results
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Handle final transcript
                if (finalTranscript) {
                    setUserInput(prev => {
                        // Remove any interim results and add final transcript
                        const baseText = prev.replace(/\[Listening...\].*/, '').trim();
                        return baseText ? baseText + ' ' + finalTranscript.trim() : finalTranscript.trim();
                    });
                    // Don't stop immediately, let the onend event handle it
                } else if (interimTranscript && isListening) {
                    // Show interim results without overwriting existing text
                    setUserInput(prev => {
                        const baseText = prev.replace(/\[Listening...\].*/, '').trim();
                        return baseText + (baseText ? ' ' : '') + `[🎤 ${interimTranscript}]`;
                    });
                }
            };

            // Enhanced error handling
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                
                // Provide user feedback based on error type
                switch (event.error) {
                    case 'network':
                        setSpeechStatus('🌐 Network error. Check your connection.');
                        setTimeout(() => setSpeechStatus(''), 3000);
                        break;
                    case 'not-allowed':
                        setSpeechStatus('🚫 Microphone access denied');
                        alert('Microphone access denied. Please allow microphone access and try again.');
                        setTimeout(() => setSpeechStatus(''), 5000);
                        break;
                    case 'no-speech':
                        setSpeechStatus('🔇 No speech detected. Try speaking louder.');
                        setTimeout(() => setSpeechStatus(''), 3000);
                        break;
                    case 'audio-capture':
                        setSpeechStatus('🎤 No microphone found');
                        alert('No microphone was found. Please check your microphone setup.');
                        setTimeout(() => setSpeechStatus(''), 5000);
                        break;
                    case 'aborted':
                        setSpeechStatus('⏹️ Speech recognition stopped');
                        setTimeout(() => setSpeechStatus(''), 2000);
                        break;
                    default:
                        setSpeechStatus(`❌ Error: ${event.error}`);
                        setTimeout(() => setSpeechStatus(''), 3000);
                }
            };

            // Enhanced end handling
            recognitionRef.current.onend = () => {
                setIsListening(false);
                setSpeechStatus('');
                // Clean up interim results only (keep final results)
                setUserInput(prev => prev.replace(/\[🎤.*?\]/g, '').trim());
            };

            // Additional event handlers for better UX
            recognitionRef.current.onstart = () => {
                console.log('Speech recognition started');
                setIsListening(true);
                setSpeechStatus('🎤 Listening... Please speak clearly');
            };

            recognitionRef.current.onspeechstart = () => {
                console.log('Speech detected');
                setSpeechStatus('🗣️ Speech detected... Keep talking');
            };

            recognitionRef.current.onspeechend = () => {
                console.log('Speech ended');
                setSpeechStatus('✅ Processing speech...');
            };

            recognitionRef.current.onnomatch = () => {
                console.warn('No speech match found');
                setSpeechStatus('❌ No clear speech detected. Try again.');
                setTimeout(() => setSpeechStatus(''), 3000);
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
        }

        // Initialize speech synthesis
        speechSynthesisRef.current = window.speechSynthesis;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (speechSynthesisRef.current) {
                speechSynthesisRef.current.cancel();
            }
        };
    }, [currentLanguage]); // Reinitialize when language changes

    const handleInputFocus = () => {
        // No need to check token here since HTTP-only cookies are handled automatically
        // Authentication is verified at the API level
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                // Clear any interim results
                setUserInput(prev => prev.replace(/\[Listening...\].*/, ''));
                
                // Request microphone permissions first
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        recognitionRef.current.start();
                        setIsListening(true);
                    })
                    .catch((error) => {
                        console.error('Microphone access denied:', error);
                        alert('Please allow microphone access to use voice input.');
                    });
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                setIsListening(false);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            try {
                recognitionRef.current.stop();
                setIsListening(false);
                // Clean up any interim results
                setUserInput(prev => prev.replace(/\[Listening...\].*/, ''));
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
                setIsListening(false);
            }
        }
    };

    const speakText = (text: string) => {
        if (speechSynthesisRef.current && text) {
            // Cancel any ongoing speech
            speechSynthesisRef.current.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Set language for text-to-speech based on detected language or current language
            const speechLang = detectedLanguage || supportedLanguages.find(l => l.code === currentLanguage)?.aiCode || 'en';
            
            // Map language codes to speech synthesis languages
            const speechLanguageMap: { [key: string]: string } = {
                'hi': 'hi-IN',
                'en': 'en-US',
                'es': 'es-ES',
                'fr': 'fr-FR',
                'de': 'de-DE',
                'ja': 'ja-JP',
                'ko': 'ko-KR'
            };
            
            utterance.lang = speechLanguageMap[speechLang] || 'en-US';
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            speechSynthesisRef.current.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if (speechSynthesisRef.current) {
            speechSynthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    const formatMessageText = (text: string) => {
        // Convert markdown-style formatting to HTML for medical responses
        let formatted = text
            // Headers with emojis (e.g., **📋 Dietary Recommendations:**)
            .replace(/\*\*([📋💪⚠️📅].*?):\*\*/g, '<h4 class="font-bold text-emerald-600 mt-4 mb-2 flex items-center gap-2">$1</h4>')
            // Regular bold headers
            .replace(/\*\*(.*?):\*\*/g, '<h4 class="font-bold text-gray-800 mt-3 mb-2">$1:</h4>')
            // Bold text (without colons)
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
            // Italic text
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            // Convert check marks and X marks to proper symbols
            .replace(/✔/g, '✅')
            .replace(/❌/g, '❌')
            // Convert bullet points to proper list items
            .replace(/^[•✔✅❌]\s*(.+)$/gm, '<li class="ml-4 mb-1 flex items-start gap-2"><span class="mt-1">•</span><span>$1</span></li>')
            // Convert line breaks (preserve double breaks for paragraphs)
            .replace(/\n\n/g, '||DOUBLE_BREAK||')
            .replace(/\n/g, '<br>')
            .replace(/\|\|DOUBLE_BREAK\|\|/g, '</p><p class="mb-3">')
            // Wrap content in paragraphs if not already wrapped
            .replace(/^(?!<[hp])/gm, '<p class="mb-3">')
            .replace(/(?<!>)$/gm, '</p>')
            // Handle lists - wrap consecutive <li> elements in <ul>
            .replace(/(<li.*?<\/li>(?:\s*<br>\s*<li.*?<\/li>)*)/gs, '<ul class="list-none my-2 space-y-1 ml-2">$1</ul>')
            // Clean up any <br> tags inside lists
            .replace(/(<ul[^>]*>.*?)<br>\s*(<li)/gs, '$1$2')
            .replace(/(<\/li>)\s*<br>\s*/gs, '$1')
            // Clean up malformed paragraphs
            .replace(/<p[^>]*>\s*<\/p>/g, '')
            .replace(/<p[^>]*>(\s*<h4)/g, '$1')
            .replace(/(<\/h4>)\s*<\/p>/g, '$1');
        
        return formatted;
    };

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        const newMessage: Message = {
            id: Date.now(),
            text,
            sender,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    };

    const updateMessage = (messageId: number, newText: string) => {
        setMessages(prev => 
            prev.map(msg => 
                msg.id === messageId ? { ...msg, text: newText } : msg
            )
        );
    };

    // Chat History Functions
    const createNewChatSession = async () => {
        try {
            const response = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/chat-history/session', {
                method: 'POST',
                credentials: 'include',
            });
            
            if (response.ok) {
                const session = await response.json();
                setCurrentSessionId(session.sessionId);
                // Multilingual welcome message
                const welcomeMessages: { [key: string]: string } = {
                    'hi': "**नमस्ते! मैं आपका AI चिकित्सा सहायक हूं।**\n\nमैं आपकी सहायता कर सकता हूं:\n• **स्वास्थ्य प्रश्न** और लक्षण विश्लेषण\n• **दवा की सिफारिशें**\n• **सामान्य चिकित्सा मार्गदर्शन**\n\nआज मैं आपकी कैसे सहायता कर सकता हूं?",
                    'en': "**Hello! I'm your AI medical assistant.**\n\nI can help you with:\n• **Health questions** and symptom analysis\n• **Medicine recommendations**\n• **General medical guidance**\n\nHow can I help you today?",
                    'ta': "**வணக்கம்! நான் உங்கள் AI மருத்துவ உதவியாளர்.**\n\nநான் உங்களுக்கு உதவ முடியும்:\n• **உடல்நலக் கேள்விகள்** மற்றும் அறிகுறி பகுப்பாய்வு\n• **மருந்து பரிந்துரைகள்**\n• **பொது மருத்துவ வழிகாட்டுதல்**\n\nஇன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
                    'te': "**నమస్కారం! నేను మీ AI వైద్య సహాయకుడిని.**\n\nనేను మీకు సహాయం చేయగలను:\n• **ఆరోగ్య ప్రశ్నలు** మరియు లక్షణ విశ్లేషణ\n• **ఔషధ సిఫార్సులు**\n• **సాధారణ వైద్య మార్గదర్శకత్వం**\n\nఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
                    'bn': "**নমস্কার! আমি আপনার AI চিকিৎসা সহায়ক।**\n\nআমি আপনাকে সাহায্য করতে পারি:\n• **স্বাস্থ্য প্রশ্ন** এবং লক্ষণ বিশ্লেষণ\n• **ওষুধের সুপারিশ**\n• **সাধারণ চিকিৎসা নির্দেশনা**\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
                    'mr': "**नमस्कार! मी तुमचा AI वैद्यकीय सहाय्यक आहे।**\n\nमी तुम्हाला मदत करू शकतो:\n• **आरोग्य प्रश्न** आणि लक्षण विश्लेषण\n• **औषध शिफारसी**\n• **सामान्य वैद्यकीय मार्गदर्शन**\n\nआज मी तुम्हाला कशी मदत करू शकतो?"
                };
                
                const welcomeText = welcomeMessages[detectedLanguage] || welcomeMessages['hi'];
                
                setMessages([{
                    id: 1,
                    text: welcomeText,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
                return session.sessionId;
            }
        } catch (error) {
            console.error('Failed to create chat session:', error);
        }
        return null;
    };

    const loadChatSessions = async () => {
        try {
            const response = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/chat-history/sessions', {
                credentials: 'include',
            });
            
            if (response.ok) {
                const sessions = await response.json();
                setChatSessions(sessions);
            }
        } catch (error) {
            console.error('Failed to load chat sessions:', error);
        }
    };

    const loadChatSession = async (sessionId: string) => {
        try {
            const response = await fetch(`https://telemedicine-sih-8i5h.onrender.com/api/chat-history/session/${sessionId}`, {
                credentials: 'include',
            });
            
            if (response.ok) {
                const session = await response.json();
                setCurrentSessionId(sessionId);
                setMessages(session.messages.map((msg: any) => ({
                    id: msg.messageId,
                    text: msg.text,
                    sender: msg.sender,
                    timestamp: new Date(msg.timestamp)
                })));
                setShowChatHistory(false);
            }
        } catch (error) {
            console.error('Failed to load chat session:', error);
        }
    };

    const deleteChatSession = async (sessionId: string) => {
        try {
            const response = await fetch(`https://telemedicine-sih-8i5h.onrender.com/api/chat-history/session/${sessionId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            
            if (response.ok) {
                await loadChatSessions();
                if (currentSessionId === sessionId) {
                    await createNewChatSession();
                }
            }
        } catch (error) {
            console.error('Failed to delete chat session:', error);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (userInput.trim() === '' || isLoading) return;

        const currentInput = userInput.trim();
        setUserInput(''); // Clear input immediately
        
        // Detect language of the input
        const inputLanguage = detectLanguage(currentInput);
        setDetectedLanguage(inputLanguage);
        
        // Auto-switch speech recognition language based on detected language
        const newSpeechLang = supportedLanguages.find(l => l.aiCode === inputLanguage)?.code || 'hi-IN';
        if (newSpeechLang !== currentLanguage) {
            setCurrentLanguage(newSpeechLang);
            if (recognitionRef.current) {
                recognitionRef.current.lang = newSpeechLang;
            }
        }
        
        // Add user message
        addMessage(currentInput, 'user');
        setIsLoading(true);

        try {
            // Ensure we have a session
            let sessionId = currentSessionId;
            if (!sessionId) {
                sessionId = await createNewChatSession();
            }

            // Use streaming endpoint
            const response = await fetch('https://telemedicine-sih.onrender.com/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    input: currentInput,
                    sessionId: sessionId,
                    language: inputLanguage,
                    responseLanguage: inputLanguage
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Create empty bot message that we'll update
            const botMessage = addMessage('', 'bot');
            let fullResponse = '';

            // Read the stream
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const jsonStr = line.slice(6); // Remove 'data: ' prefix
                                    const data = JSON.parse(jsonStr);
                                    
                                    if (data.chunk) {
                                        fullResponse += data.chunk;
                                        // Update the bot message with accumulated response
                                        updateMessage(botMessage.id, fullResponse);
                                        // Small delay to make streaming more visible
                                        await new Promise(resolve => setTimeout(resolve, 50));
                                    } else if (data.done) {
                                        // Stream finished
                                        break;
                                    } else if (data.error) {
                                        throw new Error(data.error);
                                    }
                                } catch (parseError) {
                                    // Skip malformed JSON lines
                                }
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
            }

            // Auto-speak the complete response
            if (fullResponse) {
                speakText(fullResponse);
                
                // Save bot response to chat history
                if (sessionId) {
                    try {
                        await fetch('https://telemedicine-sih-8i5h.onrender.com/api/ai/chat/save-response', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                sessionId: sessionId,
                                botResponse: fullResponse
                            }),
                        });
                    } catch (saveError) {
                        console.warn('Failed to save bot response to history:', saveError);
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
            // Fallback to non-streaming endpoint
            try {
                console.log('Falling back to non-streaming endpoint...');
                // Ensure we have a session for fallback
                let fallbackSessionId = currentSessionId;
                if (!fallbackSessionId) {
                    fallbackSessionId = await createNewChatSession();
                }
                
                const fallbackResponse = await fetch('https://telemedicine-sih-8i5h.onrender.com/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        input: currentInput,
                        sessionId: fallbackSessionId,
                        language: inputLanguage,
                        responseLanguage: inputLanguage
                    }),
                });

                const data = await fallbackResponse.json();
                
                if (fallbackResponse.ok) {
                    addMessage(data.response, 'bot');
                    speakText(data.response);
                } else {
                    addMessage(data.message || "Sorry, I'm having trouble responding right now. Please try again.", 'bot');
                }
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
                addMessage("Sorry, I'm having trouble connecting. Please check your internet connection and try again.", 'bot');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 poppins z-50">
                <style>
                    {`
                        @keyframes slideIn {
                            0% {
                                transform: translateX(100%);
                                opacity: 0;
                            }
                            100% {
                                transform: translateX(0);
                                opacity: 1;
                            }
                        }
                        
                        @keyframes pulse {
                            0%, 100% {
                                transform: scale(1);
                            }
                            50% {
                                transform: scale(1.1);
                            }
                        }
                        
                        @keyframes typing {
                            0%, 60%, 100% { transform: translateY(0); }
                            30% { transform: translateY(-10px); }
                        }
                        
                        .welcome-text {
                            animation: slideIn 0.5s ease-out;
                        }
                        
                        .pulse {
                            animation: pulse 2s infinite;
                        }
                        
                        .typing-indicator div {
                            animation: typing 1.4s infinite;
                        }
                        
                        .typing-indicator div:nth-child(2) {
                            animation-delay: 0.2s;
                        }
                        
                        .typing-indicator div:nth-child(3) {
                            animation-delay: 0.4s;
                        }
                        
                        .message-fade-in {
                            animation: fadeInUp 0.3s ease-out;
                        }
                        
                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translateY(10px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        
                        .formatted-message strong {
                            font-weight: 600;
                            color: inherit;
                        }
                        
                        .formatted-message em {
                            font-style: italic;
                            color: inherit;
                        }
                        
                        .formatted-message br + br {
                            line-height: 0.5;
                        }
                    `}
                </style>

                {/* Chat Window */}
                {isOpen && (
                    <div className={`mb-20 ${showChatHistory ? 'w-[700px]' : 'w-96'} h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden transition-all duration-300`}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faRobot} className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">AI Medical Assistant</h3>
                                    <p className="text-xs opacity-90">Online • Ready to help</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {detectedLanguage && (
                                    <div className="text-xs bg-white/20 text-white border border-white/30 rounded px-2 py-1" title="Auto-detected language">
                                        🌐 {supportedLanguages.find(l => l.aiCode === detectedLanguage)?.name?.split('(')[0].trim() || detectedLanguage.toUpperCase()}
                                    </div>
                                )}
                                <button 
                                    onClick={() => createNewChatSession()}
                                    className="text-white hover:text-gray-200 p-2"
                                    title="New chat"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="text-sm" />
                                </button>
                                <button 
                                    onClick={() => setShowChatHistory(!showChatHistory)}
                                    className="text-white hover:text-gray-200 p-2"
                                    title="Chat history"
                                >
                                    <FontAwesomeIcon icon={faHistory} className="text-sm" />
                                </button>
                                {isSpeaking && (
                                    <button 
                                        onClick={stopSpeaking}
                                        className="text-white hover:text-gray-200 p-2"
                                        title="Stop speaking"
                                    >
                                        <FontAwesomeIcon icon={faVolumeUp} className="text-lg animate-pulse" />
                                    </button>
                                )}
                                <button 
                                    onClick={toggleChat} 
                                    className="text-white hover:text-gray-200 p-2"
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Chat History Sidebar */}
                            {showChatHistory && (
                                <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faClock} className="text-emerald-600" />
                                        Chat History
                                    </h4>
                                    <div className="space-y-2">
                                        {chatSessions.map((session) => (
                                            <div 
                                                key={session.sessionId}
                                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                                    session.sessionId === currentSessionId 
                                                        ? 'bg-emerald-100 border border-emerald-300' 
                                                        : 'bg-white hover:bg-gray-100'
                                                }`}
                                                onClick={() => loadChatSession(session.sessionId)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-gray-800 truncate">
                                                            {session.title || 'New Chat'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(session.updatedAt).toLocaleDateString()} • {session.messages?.length || 0} messages
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteChatSession(session.sessionId);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                        title="Delete chat"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {chatSessions.length === 0 && (
                                            <p className="text-gray-500 text-sm text-center py-4">
                                                No chat history yet
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col">
                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} message-fade-in`}
                                    >
                                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                                            message.sender === 'user'
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-br-sm'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                        }`}>
                                            <div 
                                                className="text-sm leading-relaxed formatted-message prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: formatMessageText(message.text)
                                                }}
                                            />
                                            <p className={`text-xs mt-1 ${
                                                message.sender === 'user' ? 'text-emerald-100' : 'text-gray-500'
                                            }`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {message.sender === 'bot' && (
                                                <button
                                                    onClick={() => speakText(message.text)}
                                                    className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                                                    disabled={isSpeaking}
                                                >
                                                    <FontAwesomeIcon icon={faVolumeUp} className="text-xs" />
                                                    Speak
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Typing Indicator */}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                                            <div className="typing-indicator flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={userInput}
                                        onChange={handleInputChange}
                                        onFocus={handleInputFocus}
                                        placeholder="Type your health question..."
                                        disabled={isLoading}
                                        className={`w-full p-3 ${speechSupported ? 'pr-12' : 'pr-4'} border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    />
                                    {speechSupported && (
                                        <button
                                            type="button"
                                            onClick={isListening ? stopListening : startListening}
                                            disabled={isLoading}
                                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isListening 
                                                    ? 'text-red-500 hover:text-red-600 animate-pulse' 
                                                    : 'text-gray-400 hover:text-emerald-500'
                                            }`}
                                            title={isListening ? 'Stop recording (Click or press Escape)' : 'Start voice input (Click to speak)'}
                                        >
                                            <FontAwesomeIcon 
                                                icon={isListening ? faMicrophoneSlash : faMicrophone} 
                                                className="text-lg" 
                                            />
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || userInput.trim() === ''}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                {speechStatus && (
                                    <span className={`font-medium ${
                                        speechStatus.includes('❌') || speechStatus.includes('🚫') || speechStatus.includes('🔇') || speechStatus.includes('🎤') ? 'text-red-500' :
                                        speechStatus.includes('✅') || speechStatus.includes('🗣️') ? 'text-green-500' :
                                        'text-blue-500'
                                    }`}>
                                        {speechStatus}
                                    </span>
                                )}
                                {!speechStatus && !isLoading && (
                                    <span>
                                        {isListening ? 
                                            <span className="text-red-500 font-medium">🎤 Listening in {supportedLanguages.find(l => l.code === currentLanguage)?.name}... (Press Escape to stop)</span> :
                                            speechSupported ? 
                                                <>
                                                    Press the microphone, click in empty input + Space, or type your question
                                                    {detectedLanguage && (
                                                        <span className="block text-emerald-600 text-xs mt-1">
                                                            🌐 Last detected: {supportedLanguages.find(l => l.aiCode === detectedLanguage)?.name || detectedLanguage}
                                                        </span>
                                                    )}
                                                </> :
                                                'Type your health question'
                                        }
                                    </span>
                                )}
                                </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Welcome Bubble */}
                {showWelcome && !isOpen && (
                    <div className="welcome-text mb-20 bg-white p-4 rounded-2xl shadow-lg border border-gray-200 max-w-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faRobot} className="text-white text-sm" />
                            </div>
                            <span className="font-semibold text-gray-800">AI Assistant</span>
                        </div>
                        <p className="text-sm text-gray-600">👋 Hi! I'm here to help with your health questions. Click to start chatting!</p>
                    </div>
                )}

                {/* Floating Button */}
                <button
                    onClick={toggleChat}
                    className={`absolute bottom-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-110 ${showWelcome && !isOpen ? 'pulse' : ''}`}
                >
                    <FontAwesomeIcon icon={faRobot} className="text-xl" />
                </button>
            </div>
        </>
    );
};

export default Chatbot;

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
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [chatSessions, setChatSessions] = useState<any[]>([]);
    const [showChatHistory, setShowChatHistory] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

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

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
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
    }, []);

    const handleInputFocus = () => {
        // No need to check token here since HTTP-only cookies are handled automatically
        // Authentication is verified at the API level
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const startListening = () => {
        if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
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
            const response = await fetch('http://localhost:3000/api/chat-history/session', {
                method: 'POST',
                credentials: 'include',
            });
            
            if (response.ok) {
                const session = await response.json();
                setCurrentSessionId(session.sessionId);
                setMessages([{
                    id: 1,
                    text: "**Hello! I'm your AI medical assistant.**\n\nI can help you with:\n• **Health questions** and symptom analysis\n• **Medicine recommendations**\n• **General medical guidance**\n\nHow can I help you today?",
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
            const response = await fetch('http://localhost:3000/api/chat-history/sessions', {
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
            const response = await fetch(`http://localhost:3000/api/chat-history/session/${sessionId}`, {
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
            const response = await fetch(`http://localhost:3000/api/chat-history/session/${sessionId}`, {
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
            const response = await fetch('http://localhost:5000/api/chat/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    input: currentInput,
                    sessionId: sessionId 
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
                
                const fallbackResponse = await fetch('http://localhost:3000/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ 
                        input: currentInput,
                        sessionId: fallbackSessionId 
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
                    <div className={`mb-4 ${showChatHistory ? 'w-[700px]' : 'w-96'} h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden transition-all duration-300`}>
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
                                                className="text-sm leading-relaxed formatted-message"
                                                dangerouslySetInnerHTML={{ 
                                                    __html: message.text
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                                        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                                                        .replace(/\n\*/g, '<br/>•')
                                                        .replace(/^\*/gm, '•')
                                                        .replace(/\n/g, '<br/>')
                                                        .replace(/• /g, '<span class="inline-block w-2 mr-2">•</span>')
                                                        .replace(/([।!?:])\s*(\n|<br\/>)/g, '$1<br/><br/>')
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
                                        className="w-full p-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-800 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        type="button"
                                        onClick={isListening ? stopListening : startListening}
                                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                                            isListening 
                                                ? 'text-red-500 hover:text-red-600 animate-pulse' 
                                                : 'text-gray-400 hover:text-emerald-500'
                                        }`}
                                        title={isListening ? 'Stop recording' : 'Start voice input'}
                                    >
                                        <FontAwesomeIcon 
                                            icon={isListening ? faMicrophoneSlash : faMicrophone} 
                                            className="text-lg" 
                                        />
                                    </button>
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
                                {isListening && (
                                    <span className="text-red-500 font-medium">🎤 Listening... Speak now</span>
                                )}
                                {!isListening && !isLoading && (
                                    <span>Press the microphone to speak or type your question</span>
                                )}
                                </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Welcome Bubble */}
                {showWelcome && !isOpen && (
                    <div className="welcome-text mb-2 bg-white p-4 rounded-2xl shadow-lg border border-gray-200 max-w-xs">
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
                    className={`bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-110 ${showWelcome && !isOpen ? 'pulse' : ''}`}
                >
                    <FontAwesomeIcon icon={faRobot} className="text-xl" />
                </button>
            </div>
        </>
    );
};

export default Chatbot;

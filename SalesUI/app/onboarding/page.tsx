"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Mic, MicOff, Bot, User, Volume2, VolumeX,
    Play, MessageSquare, Send, Loader2, Sparkles, Activity,
    AlertCircle, WifiOff, Server
} from "lucide-react";
import Link from "next/link";

interface Message {
    id: string;
    sender: "Interface Agent" | "user";
    content: string;
    timestamp: Date;
    audioUrl?: string;
    isPlaying?: boolean;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [isListening, setIsListening] = useState(false);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [textInput, setTextInput] = useState("");
    const [conversationStarted, setConversationStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [businessInfo, setBusinessInfo] = useState({
        business_goal: "",
        product_description: "",
        target_market: "",
        value_proposition: ""
    });
    const [conversationState, setConversationState] = useState({
        askedAboutBusiness: false,
        askedAboutTarget: false,
        askedAboutValue: false,
        readyToComplete: false
    });
    const [backendConnected, setBackendConnected] = useState(true);
    const [elevenLabsActive, setElevenLabsActive] = useState(true);
    const [showDemoMode, setShowDemoMode] = useState(false);

    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const connectionCheckRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Check backend connection on component mount
        checkBackendConnection();
        
        // Initialize speech recognition
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const recognition = new (window as any).webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setCurrentTranscript(transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        // Auto-scroll to bottom of messages
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

        // Set up periodic connection checking
        connectionCheckRef.current = setInterval(checkBackendConnection, 30000);

        return () => {
            if (connectionCheckRef.current) {
                clearInterval(connectionCheckRef.current);
            }
        };
    }, [messages]);

    const checkBackendConnection = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/health", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                setBackendConnected(true);
                setElevenLabsActive(data.elevenlabs_active || false);
            } else {
                setBackendConnected(false);
                setElevenLabsActive(false);
            }
        } catch (error) {
            console.error("Backend connection error:", error);
            setBackendConnected(false);
            setElevenLabsActive(false);
        }
    };

    // Auto-start conversation when component mounts
    useEffect(() => {
        if (!conversationStarted) {
            // Small delay to let the component fully render
            const timer = setTimeout(() => {
                startConversation();
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, []);

    const startConversation = async () => {
        setConversationStarted(true);
        setIsLoading(true);

        // If backend is not connected, use demo mode
        if (!backendConnected) {
            setShowDemoMode(true);
            const demoMessage: Message = {
                id: Date.now().toString(),
                sender: "Interface Agent",
                content: "Hello! I'm your AI sales assistant in demo mode. I'm here to learn about your business so I can help you with personalized sales automation. Let's start with a simple question: What is your business goal and what are you selling?",
                timestamp: new Date(),
            };

            setMessages([demoMessage]);
            await speakMessage(demoMessage.content);
            setIsLoading(false);
            return;
        }

        try {
            // Get initial AI-generated question from Interface Agent
            const response = await fetch("http://localhost:8000/api/onboarding/conversation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "start_conversation",
                    history: []
                }),
            });

            if (!response.ok) {
                throw new Error("Backend not responding");
            }

            const result = await response.json();

            if (result.status === "success") {
                const initialMessage: Message = {
                    id: Date.now().toString(),
                    sender: "Interface Agent",
                    content: result.agent_response || "Hello! I'm your AI sales assistant. I'm here to learn about your business so I can help you with personalized sales automation. Let's start with a simple question: What is your business goal and what are you selling?",
                    timestamp: new Date(),
                    audioUrl: result.audio_url
                };

                setMessages([initialMessage]);

                // Play the audio response
                if (result.audio_url && !isMuted) {
                    await playAudioResponse(result.audio_url, initialMessage.content);
                }
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            setBackendConnected(false);
            setElevenLabsActive(false);
            setShowDemoMode(true);
            
            // Fallback message
            const fallbackMessage: Message = {
                id: Date.now().toString(),
                sender: "Interface Agent",
                content: "Hello! I'm your AI sales assistant in demo mode. What is your business goal and what are you selling?",
                timestamp: new Date()
            };
            setMessages([fallbackMessage]);
            await speakMessage(fallbackMessage.content);
        } finally {
            setIsLoading(false);
        }
    };

    const playAudioResponse = async (audioUrl: string, text: string) => {
        setIsAgentSpeaking(true);

        try {
            // Use ElevenLabs audio if available and active
            if (audioUrl && audioUrl.startsWith('data:audio/') && elevenLabsActive) {
                const audio = new Audio(audioUrl);

                audio.onended = () => {
                    setIsAgentSpeaking(false);
                };

                audio.onerror = () => {
                    console.error("Error playing ElevenLabs audio, falling back to browser TTS");
                    setElevenLabsActive(false);
                    fallbackToSpeechSynthesis(text);
                };

                await audio.play();
                console.log("Playing ElevenLabs TTS audio");
            } else {
                // Fallback to browser speech synthesis
                setElevenLabsActive(false);
                fallbackToSpeechSynthesis(text);
            }
        } catch (error) {
            console.error("Error playing audio:", error);
            setElevenLabsActive(false);
            fallbackToSpeechSynthesis(text);
        }
    };

    const fallbackToSpeechSynthesis = (text: string) => {
        if ('speechSynthesis' in window && !isMuted) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;

            utterance.onend = () => {
                setIsAgentSpeaking(false);
            };

            speechSynthesis.speak(utterance);
            console.log("Using browser TTS fallback");
        } else {
            setTimeout(() => {
                setIsAgentSpeaking(false);
            }, text.length * 50);
        }
    };

    const speakMessage = async (text: string) => {
        if (isMuted) return;
        await playAudioResponse("", text);
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            setCurrentTranscript("");
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);

            if (currentTranscript.trim()) {
                handleUserMessage(currentTranscript.trim());
            }
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            handleUserMessage(textInput.trim());
            setTextInput("");
        }
    };

    const handleUserMessage = async (message: string) => {
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            content: message,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentTranscript("");
        setIsLoading(true);

        // Extract business info and update conversation state
        await processBusinessInfo(message);

        // Update conversation state based on what we've learned
        const lowerMessage = message.toLowerCase();
        const newState = { ...conversationState };

        if (lowerMessage.includes('sell') || lowerMessage.includes('business') || lowerMessage.includes('clothes') || lowerMessage.includes('product')) {
            newState.askedAboutBusiness = true;
        }
        if (lowerMessage.includes('b2b') || lowerMessage.includes('companies') || lowerMessage.includes('target') || lowerMessage.includes('market')) {
            newState.askedAboutTarget = true;
        }
        if (lowerMessage.includes('unique') || lowerMessage.includes('value') || lowerMessage.includes('quality')) {
            newState.askedAboutValue = true;
        }

        setConversationState(newState);

        // If backend is not connected, use demo responses
        if (!backendConnected || showDemoMode) {
            await handleDemoResponse(message, newState);
            setIsLoading(false);
            return;
        }

        try {
            // Get AI response from Interface Agent
            const response = await fetch("http://localhost:8000/api/onboarding/conversation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message,
                    history: messages.map(m => ({ sender: m.sender, content: m.content })),
                    conversation_state: newState
                }),
            });

            if (!response.ok) {
                throw new Error("Backend not responding");
            }

            const result = await response.json();

            if (result.status === "success") {
                const agentMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "Interface Agent",
                    content: result.agent_response,
                    timestamp: new Date(),
                    audioUrl: result.audio_url
                };

                setMessages(prev => [...prev, agentMessage]);

                // Play the ElevenLabs audio response
                if (result.audio_url && !isMuted) {
                    await playAudioResponse(result.audio_url, result.agent_response);
                } else if (!isMuted) {
                    // Fallback if no audio URL
                    await playAudioResponse("", result.agent_response);
                }

                // Check if conversation is complete
                if (result.conversation_complete) {
                    setTimeout(() => {
                        saveBusinessInfo();
                    }, 3000);
                }
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
            setBackendConnected(false);
            setElevenLabsActive(false);
            
            // Fallback to demo mode
            await handleDemoResponse(message, newState);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoResponse = async (message: string, currentState: any) => {
        // Simple demo conversation flow
        let response = "";
        
        if (!currentState.askedAboutBusiness) {
            response = "Thank you for sharing that! Could you tell me more about your target market? Who are your ideal customers?";
            setConversationState(prev => ({ ...prev, askedAboutBusiness: true }));
        } else if (!currentState.askedAboutTarget) {
            response = "Great! Now, what makes your business unique? What's your value proposition or competitive advantage?";
            setConversationState(prev => ({ ...prev, askedAboutTarget: true }));
        } else if (!currentState.askedAboutValue) {
            response = "Perfect! I now have enough information to set up your automated sales system. Would you like me to proceed with creating your AI sales agents?";
            setConversationState(prev => ({ ...prev, askedAboutValue: true, readyToComplete: true }));
        } else if (message.toLowerCase().includes('yes') || message.toLowerCase().includes('proceed') || 
                  message.toLowerCase().includes('sure') || message.toLowerCase().includes('ok')) {
            response = "Excellent! I'm setting up your automated sales system now. Your AI agents will start working immediately. Let's go to your dashboard to monitor the progress!";
            setConversationState(prev => ({ ...prev, readyToComplete: true }));
            
            // Complete the onboarding after a short delay
            setTimeout(() => {
                saveBusinessInfo();
            }, 3000);
        } else {
            response = "Thank you for that information. Is there anything else you'd like to share about your business before we proceed?";
        }

        const agentMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: "Interface Agent",
            content: response,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, agentMessage]);
        await speakMessage(response);
    };

    const processBusinessInfo = async (message: string) => {
        const lowerMessage = message.toLowerCase();

        // Extract business goal and product information
        if (lowerMessage.includes('sell') || lowerMessage.includes('business') || lowerMessage.includes('goal') ||
            lowerMessage.includes('product') || lowerMessage.includes('service') || lowerMessage.includes('clothes') ||
            lowerMessage.includes('software') || lowerMessage.includes('app')) {

            // If this is the first business-related message, set both goal and product
            if (!businessInfo.business_goal && !businessInfo.product_description) {
                setBusinessInfo(prev => ({
                    ...prev,
                    business_goal: `My business goal is to ${message}`,
                    product_description: message
                }));
            } else if (!businessInfo.product_description) {
                setBusinessInfo(prev => ({ ...prev, product_description: message }));
            }
        }

        // Extract target market information
        if (lowerMessage.includes('b2b') || lowerMessage.includes('b2c') || lowerMessage.includes('companies') ||
            lowerMessage.includes('customers') || lowerMessage.includes('market') || lowerMessage.includes('target') ||
            lowerMessage.includes('brand') || lowerMessage.includes('retail') || lowerMessage.includes('enterprise')) {
            setBusinessInfo(prev => ({ ...prev, target_market: message }));
        }

        // Extract value proposition
        if (lowerMessage.includes('unique') || lowerMessage.includes('value') || lowerMessage.includes('benefit') ||
            lowerMessage.includes('advantage') || lowerMessage.includes('different') || lowerMessage.includes('quality') ||
            lowerMessage.includes('price') || lowerMessage.includes('fast') || lowerMessage.includes('premium')) {
            setBusinessInfo(prev => ({ ...prev, value_proposition: message }));
        }
    };

    const saveBusinessInfo = async () => {
        try {
            setIsLoading(true);

            // Add final completion message
            const completionMessage: Message = {
                id: (Date.now() + 2).toString(),
                sender: "Interface Agent",
                content: "Perfect! I'm setting up your automated sales system now. Your AI agents will start working immediately. Let's go to your dashboard to monitor the progress!",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, completionMessage]);

            // Save business info locally first
            localStorage.setItem("businessInfo", JSON.stringify(businessInfo));
            localStorage.setItem("workflowInitiated", "true");
            localStorage.setItem("onboardingCompletedAt", new Date().toISOString());

            // Only try to trigger automated workflow if backend is connected
            if (backendConnected) {
                fetch("http://localhost:8000/api/onboarding/complete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(businessInfo),
                }).then(response => response.json())
                    .then(result => {
                        console.log("Background workflow initiated:", result);
                    })
                    .catch(error => {
                        console.error("Background workflow error:", error);
                    });
            }

            // Immediately redirect to dashboard (don't wait for backend)
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500); // Shorter delay for better UX

        } catch (error) {
            console.error("Error saving business info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            speechSynthesis.cancel();
            setIsAgentSpeaking(false);
        }
    };

    const retryConnection = async () => {
        setIsLoading(true);
        await checkBackendConnection();
        
        if (backendConnected) {
            setShowDemoMode(false);
            // Restart the conversation if we just reconnected
            if (messages.length <= 1) {
                setMessages([]);
                startConversation();
            }
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation */}
            <nav className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Home</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleMute}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                        >
                            {isMuted ? <VolumeX className="h-5 w-5 text-gray-600" /> : <Volume2 className="h-5 w-5 text-gray-600" />}
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">AI Sales Assistant</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Connection Status Banner */}
            {!backendConnected && (
                <div className="bg-yellow-100 border-b border-yellow-300 px-6 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <WifiOff className="h-5 w-5 text-yellow-700" />
                            <span className="text-yellow-800 font-medium">Demo Mode - Elevenlabs not connected</span>
                            <span className="text-yellow-700 text-sm">
                                {elevenLabsActive ? "ElevenLabs is active" : "Using browser text-to-speech"}
                            </span>
                        </div>
                        {/* <button 
                            onClick={retryConnection}
                            disabled={isLoading}
                            className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md text-sm disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
                            <span>Retry Connection</span>
                        </button> */}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Voice Interface Section */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                                Voice Onboarding
                            </h1>
                            <p className="text-lg text-gray-600 mb-4">
                                Have a natural conversation with our AI Interface Agent {backendConnected ? "powered by ElevenLabs voice technology" : "in demo mode"}.
                            </p>
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <div className={`w-3 h-3 rounded-full ${elevenLabsActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                <span className={`text-sm font-medium ${elevenLabsActive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {elevenLabsActive ? "ElevenLabs Voice AI Active" : "Browser TTS Active"}
                                </span>
                            </div>
                            {showDemoMode && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-blue-700 text-sm">Running in demo mode with simulated responses</span>
                                </div>
                            )}
                        </div>

                        {/* Voice Visualization */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                            <div className="relative text-center">
                                {/* Agent Avatar with Advanced Voice Visualization */}
                                <div className={`relative w-40 h-40 mx-auto mb-8 rounded-full flex items-center justify-center transition-all duration-500 ${isAgentSpeaking
                                    ? 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-2xl scale-110'
                                    : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                                    }`}>
                                    <Bot className={`h-20 w-20 text-white transition-all duration-500 ${isAgentSpeaking ? 'scale-110' : 'text-blue-600'
                                        }`} />

                                    {/* Advanced Voice Waves Animation */}
                                    {isAgentSpeaking && (
                                        <>
                                            <div className="absolute inset-0 rounded-full">
                                                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
                                                <div className="absolute inset-3 rounded-full bg-indigo-400 opacity-15 animate-ping" style={{ animationDelay: '0.3s' }}></div>
                                                <div className="absolute inset-6 rounded-full bg-purple-400 opacity-10 animate-ping" style={{ animationDelay: '0.6s' }}></div>
                                            </div>
                                            <div className="absolute -inset-4 rounded-full border-2 border-blue-300 opacity-30 animate-pulse"></div>
                                            <div className="absolute -inset-8 rounded-full border border-indigo-200 opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                        </>
                                    )}

                                    {/* Listening indicator */}
                                    {isListening && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <p className="text-lg font-medium text-gray-700 mb-3">
                                        {isAgentSpeaking ? (
                                            <span className="flex items-center justify-center space-x-2">
                                                <Activity className="h-5 w-5 animate-pulse" />
                                                <span>Interface Agent is speaking...</span>
                                            </span>
                                        ) : isListening ? (
                                            <span className="flex items-center justify-center space-x-2 text-red-600">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span>Listening to your response...</span>
                                            </span>
                                        ) : conversationStarted ? (
                                            "Interface Agent is ready for your response"
                                        ) : (
                                            "Interface Agent is preparing to greet you..."
                                        )}
                                    </p>

                                    {isListening && currentTranscript && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-4 border border-blue-200">
                                            <p className="text-blue-800 text-sm font-medium">
                                                "{currentTranscript}"
                                            </p>
                                        </div>
                                    )}

                                    {isLoading && (
                                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Processing your response...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Control Buttons */}
                                <div className="flex justify-center space-x-4">
                                    {!conversationStarted ? (
                                        <div className="text-center">
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-medium shadow-lg inline-flex items-center space-x-3">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Interface Agent is starting...</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-3">The AI will greet you automatically</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <button
                                                onClick={isListening ? stopListening : startListening}
                                                disabled={isAgentSpeaking || isLoading}
                                                className={`p-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl ${isListening
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white scale-110'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                                            </button>
                                            <p className="text-sm text-gray-500 mt-3">
                                                {isListening ? "Release to send" : "Click to speak"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Text Input Alternative */}
                        {conversationStarted && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <MessageSquare className="h-5 w-5" />
                                    <span>Or type your response</span>
                                </h3>
                                <form onSubmit={handleTextSubmit} className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!textInput.trim() || isLoading}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Chat Display Section */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                                Conversation Flow
                            </h2>
                            <p className="text-gray-600">
                                Real-time display of your conversation with the Interface Agent
                            </p>
                            {showDemoMode && (
                                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 inline-flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <span className="text-amber-700 text-sm">Demo conversation flow</span>
                                </div>
                            )}
                        </div>

                        {/* Chat Messages */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-[500px] flex flex-col">
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 py-12">
                                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <p className="text-lg font-medium">Conversation will appear here...</p>
                                        <p className="text-sm text-gray-400 mt-2">Start the conversation to begin your onboarding</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`flex items-start space-x-3 max-w-md ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.sender === "user"
                                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                                    : "bg-gradient-to-r from-blue-500 to-indigo-600"
                                                    }`}>
                                                    {message.sender === "user" ? (
                                                        <User className="h-5 w-5 text-white" />
                                                    ) : (
                                                        <Bot className="h-5 w-5 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-xs font-semibold text-gray-600">
                                                            {message.sender}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className={`rounded-2xl px-4 py-3 ${message.sender === "user"
                                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                                        : "bg-gray-100 text-gray-900"
                                                        }`}>
                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Business Info Preview */}
                        {(businessInfo.business_goal || businessInfo.product_description) && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                                    <Sparkles className="h-5 w-5" />
                                    <span>Information Collected</span>
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {businessInfo.business_goal && (
                                        <div className="flex items-start space-x-2">
                                            <span className="font-medium text-green-800 min-w-0">Goal:</span>
                                            <span className="text-green-700">{businessInfo.business_goal}</span>
                                        </div>
                                    )}
                                    {businessInfo.product_description && (
                                        <div className="flex items-start space-x-2">
                                            <span className="font-medium text-green-800 min-w-0">Product:</span>
                                            <span className="text-green-700">{businessInfo.product_description}</span>
                                        </div>
                                    )}
                                    {businessInfo.target_market && (
                                        <div className="flex items-start space-x-2">
                                            <span className="font-medium text-green-800 min-w-0">Market:</span>
                                            <span className="text-green-700">{businessInfo.target_market}</span>
                                        </div>
                                    )}
                                    {businessInfo.value_proposition && (
                                        <div className="flex items-start space-x-2">
                                            <span className="font-medium text-green-800 min-w-0">Value:</span>
                                            <span className="text-green-700">{businessInfo.value_proposition}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
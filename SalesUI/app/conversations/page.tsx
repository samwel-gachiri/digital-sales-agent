"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Send, Loader2, Bot, User, CheckCircle, ArrowLeft,
    Volume2, VolumeX, Activity, Sparkles, Zap, TrendingUp, Award,
    Mic, MicOff, Play, Pause
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
    id: string;
    sender: "prospect" | "agent";
    content: string;
    timestamp: string;
    audioUrl?: string;
    isPlaying?: boolean;
}

interface ConversationStatus {
    coral_connected: boolean;
    agent_status: "active" | "connecting" | "disconnected";
    elevenlabs_enabled: boolean;
    deal_potential: "high" | "medium" | "low";
    engagement_score: number;
}

export default function ConversationsPage() {
    const router = useRouter();
    const prospectId = "demo_prospect_123"; // Default value instead of search param

    const [loading, setLoading] = useState(false);
    const [conversationStarted, setConversationStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversationStatus, setConversationStatus] = useState<ConversationStatus>({
        coral_connected: false,
        agent_status: "connecting",
        elevenlabs_enabled: false,
        deal_potential: "medium",
        engagement_score: 0
    });
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    const [dealClosed, setDealClosed] = useState(false);
    const [web3RewardsTriggered, setWeb3RewardsTriggered] = useState(false);
    const [demoMode, setDemoMode] = useState(true); // Always use demo mode

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Auto-scroll to bottom of messages
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!conversationStarted) {
            startDemoConversation();
        }
    }, []);

    useEffect(() => {
        // Clean up demo timeouts on unmount
        return () => {
            if (demoTimeoutRef.current) {
                clearTimeout(demoTimeoutRef.current);
            }
        };
    }, []);

    const startDemoConversation = () => {
        setLoading(true);
        setConversationStatus(prev => ({ ...prev, agent_status: "connecting" }));

        // Simulate connection process with animations
        const connectionSteps = [
            { coral_connected: false, agent_status: "connecting", elevenlabs_enabled: false },
            { coral_connected: true, agent_status: "connecting", elevenlabs_enabled: false },
            { coral_connected: true, agent_status: "active", elevenlabs_enabled: true }
        ];

        // Animate connection process
        connectionSteps.forEach((step, index) => {
            demoTimeoutRef.current = setTimeout(() => {
                // setConversationStatus(prev => ({
                //     ...prev,
                //     ...step,
                //     engagement_score: index * 10
                // }));
                
                if (index === connectionSteps.length - 1) {
                    setConversationStarted(true);
                    setConversationId(`demo_${Date.now()}`);
                    setLoading(false);
                    
                    // Add initial demo messages
                    const initialMessages = [
                        {
                            id: "1",
                            sender: "prospect" as const,
                            content: "Hi, I'm interested in learning more about your services.",
                            timestamp: new Date().toISOString()
                        },
                        {
                            id: "2",
                            sender: "agent" as const,
                            content: "Hello! Thank you for your interest. I'm an AI sales agent powered by advanced voice technology and multi-agent coordination. I'd love to help you understand how our solutions can benefit your business. What specific challenges are you looking to solve?",
                            timestamp: new Date().toISOString()
                        }
                    ];
                    
                    setMessages(initialMessages);
                    setConversationStatus(prev => ({
                        ...prev,
                        engagement_score: 25
                    }));
                }
            }, 1000 * (index + 1));
        });
    };

    const playAudioResponse = async (audioUrl: string, text: string) => {
        if (isMuted) return;

        setIsAgentSpeaking(true);

        try {
            // Use ElevenLabs audio if available
            if (audioUrl && audioUrl.startsWith('data:audio/')) {
                const audio = new Audio(audioUrl);

                audio.onended = () => {
                    setIsAgentSpeaking(false);
                };

                audio.onerror = () => {
                    console.error("Error playing ElevenLabs audio, falling back to browser TTS");
                    fallbackToSpeechSynthesis(text);
                };

                await audio.play();
                console.log("Playing ElevenLabs TTS audio");
            } else {
                // Fallback to browser speech synthesis
                fallbackToSpeechSynthesis(text);
            }
        } catch (error) {
            console.error("Error playing audio:", error);
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

    const startListening = () => {
        // Demo mode voice input simulation
        setIsListening(true);
        setCurrentTranscript("");
        
        // Simulate speech recognition
        const demoPhrases = [
            "I'm looking for a sales automation solution",
            "We need to improve our lead generation",
            "How does your pricing work?",
            "Can you integrate with our CRM?",
            "Tell me about your features"
        ];
        
        let progress = "";
        const randomPhrase = demoPhrases[Math.floor(Math.random() * demoPhrases.length)];
        
        const typeDemoText = () => {
            if (progress.length < randomPhrase.length) {
                progress = randomPhrase.substring(0, progress.length + 1);
                setCurrentTranscript(progress);
                demoTimeoutRef.current = setTimeout(typeDemoText, 100);
            } else {
                demoTimeoutRef.current = setTimeout(() => {
                    setIsListening(false);
                    setCurrentMessage(randomPhrase);
                    handleUserMessage(randomPhrase);
                }, 1000);
            }
        };
        
        typeDemoText();
    };

    const stopListening = () => {
        setIsListening(false);
        if (currentTranscript.trim()) {
            setCurrentMessage(currentTranscript.trim());
            handleUserMessage(currentTranscript.trim());
        }
    };

    const handleUserMessage = async (message: string) => {
        if (!message.trim() || !conversationId) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: "prospect",
            content: message,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage("");
        setCurrentTranscript("");
        setLoading(true);

        // Update engagement score
        setConversationStatus(prev => ({
            ...prev,
            engagement_score: Math.min(prev.engagement_score + 15, 100)
        }));

        // Demo mode response simulation
        demoTimeoutRef.current = setTimeout(() => {
            const demoResponses = [
                "Our sales automation platform uses AI to qualify leads 5x faster than traditional methods. We've helped companies increase conversion rates by up to 40%.",
                "That's a great question! Our pricing is based on the number of agents and features you need. We offer flexible plans starting at $99/month.",
                "Yes, we integrate with all major CRMs including Salesforce, HubSpot, and Zoho. The setup process typically takes less than 30 minutes.",
                "Our platform includes automated prospect research, personalized email campaigns, multi-channel outreach, and real-time analytics dashboard.",
                "Based on your needs, I'd recommend our Professional plan which includes 5 AI agents, CRM integration, and advanced analytics."
            ];
            
            const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
            
            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: "agent",
                content: randomResponse,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, agentMessage]);
            
            // Randomly trigger deal closure in demo mode
            if (Math.random() > 0.7 && !dealClosed) {
                setDealClosed(true);
                setConversationStatus(prev => ({
                    ...prev,
                    deal_potential: "high",
                    engagement_score: 100
                }));

                // Trigger Web3 rewards
                setTimeout(() => {
                    triggerWeb3Rewards();
                }, 2000);
            }
            
            setLoading(false);
        }, 1500);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleUserMessage(currentMessage);
    };

    const triggerWeb3Rewards = async () => {
        setWeb3RewardsTriggered(true);

        // Add system message about Web3 rewards
        const rewardMessage: Message = {
            id: (Date.now() + 2).toString(),
            sender: "agent",
            content: "🎉 Congratulations! This deal closure has triggered our Web3 reward system. Commission tokens and achievement NFTs are being processed on the blockchain. You can view your rewards in the Web3 dashboard.",
            timestamp: new Date().toISOString()
        };

        setTimeout(() => {
            setMessages(prev => [...prev, rewardMessage]);
        }, 1000);
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) {
            speechSynthesis.cancel();
            setIsAgentSpeaking(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "text-green-600 bg-green-100";
            case "connecting": return "text-yellow-600 bg-yellow-100";
            case "disconnected": return "text-red-600 bg-red-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    const getDealPotentialColor = (potential: string) => {
        switch (potential) {
            case "high": return "text-green-600 bg-green-100";
            case "medium": return "text-yellow-600 bg-yellow-100";
            case "low": return "text-red-600 bg-red-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation */}
            <nav className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            Demo Mode
                        </div>
                        <button
                            onClick={toggleMute}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                        >
                            {isMuted ? <VolumeX className="h-5 w-5 text-gray-600" /> : <Volume2 className="h-5 w-5 text-gray-600" />}
                        </button>
                        {web3RewardsTriggered && (
                            <Link
                                href="/web3"
                                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                            >
                                <Award className="h-4 w-4" />
                                <span className="text-sm font-medium">View Rewards</span>
                            </Link>
                        )}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">AI Sales Conversation</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* System Status Panel */}
                    <div className="space-y-6">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <Activity className="h-5 w-5" />
                                <span>System Status</span>
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Coral Protocol</span>
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${conversationStatus.coral_connected ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${conversationStatus.coral_connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                        <span>{conversationStatus.coral_connected ? 'Connected' : 'Disconnected'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Agent Status</span>
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(conversationStatus.agent_status)}`}>
                                        <div className={`w-2 h-2 rounded-full ${conversationStatus.agent_status === 'active' ? 'bg-green-500' : conversationStatus.agent_status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
                                        <span className="capitalize">{conversationStatus.agent_status}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">ElevenLabs Voice</span>
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${conversationStatus.elevenlabs_enabled ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100'}`}>
                                        <div className={`w-2 h-2 rounded-full ${conversationStatus.elevenlabs_enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                        <span>{conversationStatus.elevenlabs_enabled ? 'Enabled' : 'Fallback'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conversation Metrics */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5" />
                                <span>Conversation Metrics</span>
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Engagement Score</span>
                                        <span className="text-sm font-medium text-gray-900">{conversationStatus.engagement_score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${conversationStatus.engagement_score}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Deal Potential</span>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDealPotentialColor(conversationStatus.deal_potential)}`}>
                                        <span className="capitalize">{conversationStatus.deal_potential}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Messages</span>
                                    <span className="text-sm font-medium text-gray-900">{messages.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Web3 Integration Status */}
                        {(dealClosed || web3RewardsTriggered) && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Zap className="h-6 w-6 text-yellow-600" />
                                    <h3 className="text-lg font-semibold text-yellow-800">Web3 Rewards Active</h3>
                                </div>
                                <div className="space-y-2 text-sm text-yellow-700">
                                    {dealClosed && <p>✅ Deal closure detected</p>}
                                    {web3RewardsTriggered && <p>✅ Blockchain rewards processing</p>}
                                    <p>💰 Commission tokens being distributed</p>
                                    <p>🏆 Achievement NFT being minted</p>
                                </div>
                                <Link
                                    href="/web3"
                                    className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                                >
                                    <Award className="h-4 w-4" />
                                    <span>View Web3 Dashboard</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Chat Interface */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                                AI Sales Conversation
                            </h1>
                            <p className="text-lg text-gray-600 mb-4">
                                Multi-agent coordination with voice AI and blockchain rewards
                            </p>
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-yellow-600 font-medium">Demo Mode - Interactive Preview</span>
                            </div>
                        </div>

                        {/* Chat Container */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-[600px] flex flex-col">

                            {/* Welcome Message */}
                            {!conversationStarted && (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        {loading ? (
                                            <>
                                                <div className="relative w-20 h-20 mx-auto mb-6">
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse"></div>
                                                    <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                                    </div>
                                                </div>
                                                <p className="text-lg text-gray-700 mb-2">Initializing AI Sales Agent...</p>
                                                <p className="text-sm text-gray-500">Connecting to Coral Protocol and ElevenLabs</p>
                                                <p className="text-sm text-yellow-600 mt-2">Running in demo mode with simulated responses</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <MessageSquare className="h-10 w-10 text-blue-600" />
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                                    Welcome to AI Sales Chat
                                                </h2>
                                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                                    Our advanced AI sales agent uses multi-agent coordination, voice technology, and blockchain rewards to provide the best sales experience.
                                                </p>
                                                <button
                                                    onClick={startDemoConversation}
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                                >
                                                    Start Sales Conversation
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            {conversationStarted && (
                                <>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender === "prospect" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.sender === "prospect" ? "flex-row-reverse space-x-reverse" : ""}`}>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === "prospect" ? "bg-blue-100" : "bg-gray-100"}`}>
                                                        {message.sender === "prospect" ? (
                                                            <User className="h-4 w-4 text-blue-600" />
                                                        ) : (
                                                            <Bot className="h-4 w-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className={`rounded-lg px-4 py-2 ${message.sender === "prospect" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                                                            <p className="text-sm">{message.content}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatTime(message.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {loading && (
                                            <div className="flex justify-start">
                                                <div className="flex items-start space-x-3">
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <Bot className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                                                        <div className="flex space-x-1">
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Voice Input Indicator */}
                                    {isListening && (
                                        <div className="px-6 py-2 bg-red-50 border-t border-red-200">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm text-red-700 font-medium">Listening...</span>
                                                {currentTranscript && (
                                                    <span className="text-sm text-red-600">"{currentTranscript}"</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Message Input */}
                                    <div className="border-t border-gray-200 p-6">
                                        <form onSubmit={sendMessage} className="flex space-x-4">
                                            <div className="flex-1 flex space-x-3">
                                                <input
                                                    type="text"
                                                    value={currentMessage}
                                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                                    placeholder="Type your message or use voice input..."
                                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                                    disabled={loading || isListening}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={isListening ? stopListening : startListening}
                                                    disabled={isAgentSpeaking || loading}
                                                    className={`p-3 rounded-xl transition-all duration-200 ${isListening
                                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                                </button>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!currentMessage.trim() || loading || isListening}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                            >
                                                <Send className="h-5 w-5" />
                                            </button>
                                        </form>

                                        <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <div className={`w-2 h-2 rounded-full ${conversationStatus.coral_connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span>Coral Protocol</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <div className={`w-2 h-2 rounded-full ${conversationStatus.elevenlabs_enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                                <span>ElevenLabs Voice</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span>Web3 Rewards Ready</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Success Message */}
                        {conversationStarted && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800">
                                            AI Sales Agent Active
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Multi-agent coordination • Voice AI • Blockchain rewards • Deal closing automation
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Demo mode with simulated responses
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
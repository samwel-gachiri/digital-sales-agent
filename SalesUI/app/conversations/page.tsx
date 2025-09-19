"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Send, Loader2, Bot, User, CheckCircle, ArrowLeft,
    Volume2, VolumeX, Activity, Sparkles, Zap, TrendingUp, Award,
    Mic, MicOff, Play, Pause
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const prospectId = searchParams.get("prospect_id");

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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
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
    }, [messages]);

    useEffect(() => {
        if (prospectId && !conversationStarted) {
            checkSystemStatus();
            startConversation();
        }
    }, [prospectId]);

    const checkSystemStatus = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/health");
            const health = await response.json();

            setConversationStatus(prev => ({
                ...prev,
                coral_connected: health.agent_status === "connected",
                agent_status: health.agent_status === "connected" ? "active" : "disconnected",
                elevenlabs_enabled: health.elevenlabs_status === "configured"
            }));
        } catch (error) {
            console.error("Error checking system status:", error);
            setConversationStatus(prev => ({
                ...prev,
                coral_connected: false,
                agent_status: "disconnected",
                elevenlabs_enabled: false
            }));
        }
    };

    const startConversation = async () => {
        setLoading(true);
        setConversationStatus(prev => ({ ...prev, agent_status: "connecting" }));

        try {
            // First validate Coral Protocol connection
            await checkSystemStatus();

            const response = await fetch("http://localhost:8000/api/conversations/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prospect_id: prospectId,
                    user_message: "Hi, I'm interested in learning more about your services."
                }),
            });

            const result = await response.json();

            if (result.status === "conversation_started" || result.status === "success") {
                setConversationStarted(true);
                setConversationId(result.conversation_id || `conv_${Date.now()}`);
                setConversationStatus(prev => ({
                    ...prev,
                    agent_status: "active",
                    coral_connected: true
                }));

                const initialResponse = result.initial_response ||
                    "Hello! Thank you for your interest. I'm an AI sales agent powered by advanced voice technology and multi-agent coordination. I'd love to help you understand how our solutions can benefit your business. What specific challenges are you looking to solve?";

                // Add initial messages
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
                        content: initialResponse,
                        timestamp: new Date().toISOString(),
                        audioUrl: result.audio_url
                    }
                ];

                setMessages(initialMessages);

                // Play ElevenLabs audio if available
                if (result.audio_url && !isMuted) {
                    await playAudioResponse(result.audio_url, initialResponse);
                }

                // Update engagement score
                setConversationStatus(prev => ({
                    ...prev,
                    engagement_score: 25
                }));
            } else {
                throw new Error(result.message || "Failed to start conversation");
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            setConversationStatus(prev => ({
                ...prev,
                agent_status: "disconnected",
                coral_connected: false
            }));

            // Show fallback conversation
            const fallbackMessages = [
                {
                    id: "1",
                    sender: "prospect" as const,
                    content: "Hi, I'm interested in learning more about your services.",
                    timestamp: new Date().toISOString()
                },
                {
                    id: "2",
                    sender: "agent" as const,
                    content: "Hello! I'm experiencing some connectivity issues with our advanced AI system, but I'm still here to help. Our sales automation platform uses cutting-edge technology including multi-agent coordination and blockchain rewards. What would you like to know about our services?",
                    timestamp: new Date().toISOString()
                }
            ];

            setMessages(fallbackMessages);
            setConversationStarted(true);
            setConversationId(`fallback_${Date.now()}`);
        } finally {
            setLoading(false);
        }
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
                setCurrentMessage(currentTranscript.trim());
                handleUserMessage(currentTranscript.trim());
            }
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

        try {
            // Call backend for AI response with ElevenLabs TTS
            const response = await fetch(`http://localhost:8000/api/conversations/${conversationId}/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message
                }),
            });

            const result = await response.json();

            if (result.status === "success") {
                const agentMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "agent",
                    content: result.agent_response,
                    timestamp: new Date().toISOString(),
                    audioUrl: result.audio_url
                };

                setMessages(prev => [...prev, agentMessage]);

                // Play ElevenLabs audio response
                if (result.audio_url && !isMuted) {
                    await playAudioResponse(result.audio_url, result.agent_response);
                }

                // Check for deal closure indicators
                const lowerResponse = result.agent_response.toLowerCase();
                if (lowerResponse.includes('deal') && (lowerResponse.includes('closed') || lowerResponse.includes('agreement') || lowerResponse.includes('contract'))) {
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

                // Update deal potential based on conversation
                if (lowerResponse.includes('interested') || lowerResponse.includes('perfect') || lowerResponse.includes('exactly')) {
                    setConversationStatus(prev => ({
                        ...prev,
                        deal_potential: "high"
                    }));
                } else if (lowerResponse.includes('maybe') || lowerResponse.includes('consider')) {
                    setConversationStatus(prev => ({
                        ...prev,
                        deal_potential: "medium"
                    }));
                }
            } else {
                // Fallback response with system status awareness
                const fallbackContent = conversationStatus.coral_connected
                    ? "I appreciate your interest. Let me connect you with our team to discuss how we can help your business grow with our AI-powered sales automation platform."
                    : "I'm experiencing some connectivity issues with our advanced multi-agent system, but I can still help you. Our platform offers automated prospect research, personalized email campaigns, and blockchain-based rewards. What specific challenges can we help you solve?";

                const fallbackMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "agent",
                    content: fallbackContent,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, fallbackMessage]);

                if (!isMuted) {
                    await playAudioResponse("", fallbackContent);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Fallback response
            const fallbackMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: "agent",
                content: "I'm having trouble processing your message right now. Our system uses advanced Coral Protocol coordination between multiple AI agents. Could you please try again?",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, fallbackMessage]);

            if (!isMuted) {
                await playAudioResponse("", fallbackMessage.content);
            }
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleUserMessage(currentMessage);
    };

    const triggerWeb3Rewards = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/crossmint/process-rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deal_id: conversationId,
                    deal_value: 5000,
                    sales_agent_id: 'sales_agent_001',
                    achievement_type: 'deal_closer',
                    performance_data: {
                        deals_closed: 1,
                        revenue: 5000,
                        conversion_rate: 100
                    }
                }),
            });

            const result = await response.json();

            if (result.status === 'success' || result.status === 'disabled') {
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
            }
        } catch (error) {
            console.error('Error triggering Web3 rewards:', error);
        }
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
                            {prospectId && (
                                <div className="flex items-center justify-center space-x-2 mb-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-blue-600 font-medium">Prospect ID: {prospectId}</span>
                                </div>
                            )}
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
                                                    onClick={startConversation}
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
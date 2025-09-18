"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, Bot, User, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Message {
    id: string;
    sender: "prospect" | "agent";
    content: string;
    timestamp: string;
}

export default function ConversationsPage() {
    const searchParams = useSearchParams();
    const prospectId = searchParams.get("prospect_id");

    const [loading, setLoading] = useState(false);
    const [conversationStarted, setConversationStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);

    useEffect(() => {
        if (prospectId && !conversationStarted) {
            startConversation();
        }
    }, [prospectId]);

    const startConversation = async () => {
        setLoading(true);

        try {
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

            if (result.status === "conversation_started") {
                setConversationStarted(true);
                setConversationId(result.conversation_id);

                const initialResponse = result.initial_response || "Hello! Thank you for your interest. I'm an AI sales agent powered by ElevenLabs voice technology. I'd love to help you understand how our solutions can benefit your business. What specific challenges are you looking to solve?";

                // Add initial messages
                setMessages([
                    {
                        id: "1",
                        sender: "prospect",
                        content: "Hi, I'm interested in learning more about your services.",
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: "2",
                        sender: "agent",
                        content: initialResponse,
                        timestamp: new Date().toISOString()
                    }
                ]);

                // Play ElevenLabs audio if available
                if (result.audio_url) {
                    playElevenLabsAudio(result.audio_url, initialResponse);
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMessage.trim() || !conversationId) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            sender: "prospect",
            content: currentMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const messageToSend = currentMessage;
        setCurrentMessage("");
        setLoading(true);

        try {
            // Call backend for AI response with ElevenLabs TTS
            const response = await fetch(`http://localhost:8000/api/conversations/${conversationId}/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: messageToSend
                }),
            });

            const result = await response.json();

            if (result.status === "success") {
                const agentMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "agent",
                    content: result.agent_response,
                    timestamp: new Date().toISOString()
                };

                setMessages(prev => [...prev, agentMessage]);

                // Play ElevenLabs audio response
                if (result.audio_url) {
                    playElevenLabsAudio(result.audio_url, result.agent_response);
                }
            } else {
                // Fallback response
                const fallbackMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: "agent",
                    content: "I appreciate your interest. Let me connect you with our team to discuss how we can help your business grow.",
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, fallbackMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Fallback response
            const fallbackMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: "agent",
                content: "I'm having trouble processing your message right now. Could you please try again?",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, fallbackMessage]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const playElevenLabsAudio = async (audioUrl: string, text: string) => {
        try {
            if (audioUrl && audioUrl.startsWith('data:audio/')) {
                const audio = new Audio(audioUrl);

                audio.onended = () => {
                    console.log("ElevenLabs audio playback completed");
                };

                audio.onerror = () => {
                    console.error("Error playing ElevenLabs audio");
                };

                await audio.play();
                console.log("Playing ElevenLabs TTS audio for sales conversation");
            }
        } catch (error) {
            console.error("Error playing ElevenLabs audio:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Bot className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">AI Sales Agent</h1>
                            <p className="text-sm text-gray-500">
                                {conversationStarted ? "Online • Ready to help" : "Connecting..."}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600">ElevenLabs Voice AI</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <div className="max-w-4xl mx-auto px-6 py-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">

                    {/* Welcome Message */}
                    {!conversationStarted && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                                        <p className="text-gray-600">Starting your sales conversation...</p>
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                            Welcome to Sales Chat
                                        </h2>
                                        <p className="text-gray-600 mb-6">
                                            Our AI sales agent is ready to discuss how we can help your business.
                                        </p>
                                        <button
                                            onClick={startConversation}
                                            className="btn-primary"
                                        >
                                            Start Conversation
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

                            {/* Message Input */}
                            <div className="border-t border-gray-200 p-4">
                                <form onSubmit={sendMessage} className="flex space-x-4">
                                    <input
                                        type="text"
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 input"
                                        disabled={loading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!currentMessage.trim() || loading}
                                        className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>

                {/* Success Message */}
                {conversationStarted && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-sm text-green-800">
                                <span className="font-medium">Conversation Active:</span> Our AI sales agent is ready to help close deals and answer questions.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
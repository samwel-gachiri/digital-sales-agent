"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Bot, Mail, MessageSquare, BarChart3, Sparkles, Zap, TrendingUp, Users, Shield, Globe, Award, ChevronRight, CheckCircle, Play, Phone, MessageCircle, CreditCard, Database, Search, Send } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const [isHovered, setIsHovered] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const processRef = useRef(null);
    const [animatedSteps, setAnimatedSteps] = useState([false, false, false, false, false, false]);

    const features = [
        "Automated Prospect Research",
        "Personalized Email Campaigns",
        "Voice-Powered Conversations",
        "Blockchain Reward System"
    ];

    const processSteps = [
        { icon: <Users className="h-6 w-6" />, title: "Onboarding", desc: "Quick setup and integration" },
        { icon: <Search className="h-6 w-6" />, title: "Prospect Discovery", desc: "AI finds ideal customers" },
        { icon: <Send className="h-6 w-6" />, title: "Cold Outreach", desc: "Personalized automated emails" },
        { icon: <MessageCircle className="h-6 w-6" />, title: "Client Conversation", desc: "AI-powered interactions via Coral Protocol" },
        { icon: <TrendingUp className="h-6 w-6" />, title: "Closing Deals", desc: "Seamless negotiation process" },
        { icon: <CreditCard className="h-6 w-6" />, title: "Blockchain Payments", desc: "Secure transactions via Crossmint" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Animate steps one by one
                        processSteps.forEach((_, i) => {
                            setTimeout(() => {
                                setAnimatedSteps(prev => {
                                    const newArr = [...prev];
                                    newArr[i] = true;
                                    return newArr;
                                });
                            }, i * 300);
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );

        if (processRef.current) {
            observer.observe(processRef.current);
        }

        return () => {
            if (processRef.current) {
                observer.unobserve(processRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse-medium"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse-slow"></div>
                
                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `float ${15 + Math.random() * 10}s infinite ease-in-out`,
                            animationDelay: `${Math.random() * 5}s`,
                            transform: `scale(${0.5 + Math.random() * 1.5})`
                        }}
                    />
                ))}
            </div>

            {/* Navigation */}
            <nav className="relative z-10 px-6 py-6 bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Digital Sales Agent
                            </span>
                            <div className="text-xs text-gray-500 font-medium">AI-Powered Sales Automation</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard"
                            className="text-gray-600 hover:text-gray-900 transition-colors font-medium hover:scale-105 transform transition-transform"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/onboarding"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-float">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Powered by Coral Protocol</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                Sales Automation
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Reimagined
                            </span>
                        </h1>

                        {/* <div className="h-12 mb-8 flex items-center justify-center">
                            <p className="text-xl text-gray-600 transition-all duration-500 transform">
                                {features.map((feature, i) => (
                                    <span 
                                        key={i} 
                                        className={`absolute transition-opacity duration-500 ${i === currentFeature ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        {feature} • Built for Modern Sales Teams
                                    </span>
                                ))}
                            </p>
                        </div> */}

                        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Transform your sales process with AI agents that research prospects, craft personalized outreach,
                            conduct voice conversations, and reward performance through blockchain technology.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <Link
                                href="/onboarding"
                                className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center space-x-2"
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <span>Start Onboarding</span>
                                <ArrowRight className={`h-5 w-5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                            </Link>

                            <Link
                                href="/dashboard"
                                className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 inline-flex items-center justify-center space-x-2 hover:-translate-y-1 transform transition-all"
                            >
                                <BarChart3 className="h-5 w-5" />
                                <span>View Dashboard</span>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
                            <div className="text-center transform hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">300%</div>
                                <div className="text-sm text-gray-600">Sales Efficiency Increase</div>
                            </div>
                            <div className="text-center transform hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">24/7</div>
                                <div className="text-sm text-gray-600">Automated Operations</div>
                            </div>
                            <div className="text-center transform hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">85%</div>
                                <div className="text-sm text-gray-600">Response Rate</div>
                            </div>
                            <div className="text-center transform hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">50+</div>
                                <div className="text-sm text-gray-600">Integrations</div>
                            </div>
                        </div>
                    </div>

                    {/* Process Flow Section */}
                    <div ref={processRef} className="max-w-6xl mx-auto mb-32">
                        <h2 className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">The Complete Sales Journey</h2>
                        
                        <div className="relative">
                            {/* Connecting line */}
                            <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-600 transform translate-x-4 z-0 hidden md:block"></div>
                            
                            <div className="grid gap-8 relative z-10">
                                {processSteps.map((step, index) => (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col md:flex-row items-center transition-all duration-700 ${animatedSteps[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                    >
                                        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg mb-4 md:mb-0 flex-shrink-0">
                                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <div className="md:ml-8 text-center md:text-left">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                                            <p className="text-gray-600">{step.desc}</p>
                                        </div>
                                        {index < processSteps.length - 1 && (
                                            <ChevronRight className="hidden md:block mx-4 text-gray-400 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
                        <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Bot className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Intelligent Research</h3>
                            <p className="text-gray-600 leading-relaxed">
                                AI agents automatically discover and research prospects, extracting contact information and company insights from across the web.
                            </p>
                        </div>

                        <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Mail className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Outreach</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Generate hyper-personalized email campaigns that convert prospects into conversations with intelligent follow-up sequences.
                            </p>
                        </div>

                        <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <MessageSquare className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Voice AI Conversations</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Natural voice interactions powered by ElevenLabs that can qualify leads, answer questions, and close deals autonomously.
                            </p>
                        </div>

                        <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Analytics</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Real-time insights into your sales pipeline with AI-powered recommendations for optimization and growth.
                            </p>
                        </div>

                        <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Award className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Blockchain Rewards</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Gamify your sales process with NFT achievements and cryptocurrency rewards for hitting targets and closing deals.
                            </p>
                        </div>

                        <div className="group bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Globe className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Global Integration</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Connect with your existing CRM, email platforms, and business tools for seamless workflow automation.
                            </p>
                        </div>
                    </div>

                    {/* Coral Protocol Highlight */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-10 mb-20 border border-indigo-100">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-10">
                                <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 mb-6">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">Powered by Coral Protocol</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Intelligent Agent Communication</h2>
                                <p className="text-gray-600 mb-6">
                                    Our AI agents use Coral Protocol for secure, decentralized communication that ensures privacy and reliability throughout your sales process.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="text-gray-700">End-to-end encrypted messaging</span>
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="text-gray-700">Decentralized communication network</span>
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="text-gray-700">Cross-platform compatibility</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="md:w-1/3 relative">
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex space-x-2 mb-4">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                        <div className="text-sm text-gray-700">Prospect: "Tell me more about your product"</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-sm text-blue-700">Agent: "Our platform integrates with your CRM and automates..."</div>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500 text-center">Coral Protocol • Secure Connection</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full"></div>
                        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white/10 rounded-full"></div>
                        
                        <h2 className="text-4xl font-bold mb-6 relative z-10">Ready to Transform Your Sales?</h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto relative z-10">
                            Join thousands of sales teams already using AI automation to 3x their results.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Link
                                href="/onboarding"
                                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2 hover:-translate-y-1 transform"
                            >
                                <Zap className="h-5 w-5" />
                                <span>Start Your Free Trial</span>
                            </Link>
                            <Link
                                href="/web3"
                                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 border border-white/20 inline-flex items-center justify-center space-x-2 hover:-translate-y-1 transform"
                            >
                                <Award className="h-5 w-5" />
                                <span>Explore Rewards</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-12 bg-white/60 backdrop-blur-sm border-t border-white/20 mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-3 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-semibold text-gray-900">Digital Sales Agent</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span>Built with Coral Protocol</span>
                            <span>•</span>
                            <span>Powered by ElevenLabs</span>
                            <span>•</span>
                            <span>Secured by Crossmint</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.2; }
                    50% { opacity: 0.4; }
                }
                @keyframes pulse-medium {
                    0%, 100% { opacity: 0.15; }
                    50% { opacity: 0.3; }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
                .animate-pulse-medium {
                    animation: pulse-medium 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
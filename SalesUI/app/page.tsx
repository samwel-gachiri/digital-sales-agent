"use client";

import { useState } from "react";
import { ArrowRight, Bot, Mail, MessageSquare, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Navigation */}
            <nav className="px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Bot className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-semibold text-gray-900">Digital Sales Agent</span>
                    </div>
                    <Link
                        href="/dashboard"
                        className="btn-primary"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        AI-Powered Sales
                        <br />
                        <span className="text-blue-600">Automation Platform</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Automate your entire sales process from prospect research to deal closure
                        using intelligent agents that work 24/7.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            href="/onboarding"
                            className="btn-primary inline-flex items-center justify-center space-x-2 text-lg px-8 py-4"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <span>Start Your Sales Journey</span>
                            <ArrowRight className={`h-5 w-5 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
                        </Link>

                        <Link
                            href="/dashboard"
                            className="btn-secondary inline-flex items-center justify-center space-x-2 text-lg px-8 py-4"
                        >
                            <BarChart3 className="h-5 w-5" />
                            <span>View Dashboard</span>
                        </Link>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="card text-center group hover:shadow-md transition-shadow duration-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                                <Bot className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Research</h3>
                            <p className="text-gray-600">
                                AI agents automatically research prospects and extract contact information from company websites.
                            </p>
                        </div>

                        <div className="card text-center group hover:shadow-md transition-shadow duration-200">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-200">
                                <Mail className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Emails</h3>
                            <p className="text-gray-600">
                                Generate and send personalized cold emails with "Talk to Sales" links for immediate engagement.
                            </p>
                        </div>

                        <div className="card text-center group hover:shadow-md transition-shadow duration-200">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-200">
                                <MessageSquare className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Conversations</h3>
                            <p className="text-gray-600">
                                AI-powered voice conversations that can listen, respond, and close deals automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto text-center text-gray-500">
                    <p>Built with Coral Protocol • Multi-Agent Sales Automation</p>
                </div>
            </footer>
        </div>
    );
}
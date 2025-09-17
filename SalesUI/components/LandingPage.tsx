import Navbar from "./Navbar"
import Footer from "./Footer"
import Link from "next/link"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Navbar />

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-20">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Hero Content */}
                    <div className="mb-12">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                            AI-Powered
                            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Sales Automation
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Discover prospects, qualify leads, and close deals with intelligent agents powered by Coral Protocol
                        </p>
                    </div>

                    {/* Animation/Visual */}
                    <div className="mb-12">
                        <div className="relative w-80 h-80 mx-auto">
                            {/* Simple animated illustration */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                            <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30 animate-ping"></div>
                            <div className="absolute inset-8 bg-white rounded-full shadow-2xl flex items-center justify-center">
                                <div className="text-6xl">🎯</div>
                            </div>

                            {/* Floating elements */}
                            <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
                                <div className="text-2xl">📊</div>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg animate-bounce delay-300">
                                <div className="text-2xl">🤖</div>
                            </div>
                            <div className="absolute top-1/2 -left-8 bg-white rounded-full p-3 shadow-lg animate-bounce delay-500">
                                <div className="text-2xl">🎤</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Link href="/dashboard">
                        <button className="px-8 py-4 bg-black text-white text-lg font-semibold rounded-2xl hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg cursor-pointer">
                            Start Selling
                        </button>
                    </Link>

                    {/* Features */}
                    <div className="grid md:grid-cols-4 gap-8 mt-20">
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold mb-2">Prospect Discovery</h3>
                            <p className="text-gray-600">AI-powered web scraping and company research</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold mb-2">Lead Qualification</h3>
                            <p className="text-gray-600">BANT scoring with voice interactions</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">📞</div>
                            <h3 className="text-xl font-semibold mb-2">Smart Outreach</h3>
                            <p className="text-gray-600">Voice and email automation with ElevenLabs</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">📈</div>
                            <h3 className="text-xl font-semibold mb-2">Sales Analytics</h3>
                            <p className="text-gray-600">Real-time pipeline insights and reporting</p>
                        </div>
                    </div>

                    {/* Agent Showcase */}
                    <div className="mt-20 p-8 bg-white rounded-2xl shadow-lg">
                        <h2 className="text-3xl font-bold mb-8">Powered by Coral Protocol Agents</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 border rounded-lg">
                                <div className="text-2xl mb-2">🔥</div>
                                <h4 className="font-semibold">Firecrawl Agent</h4>
                                <p className="text-sm text-gray-600">Web scraping & data extraction</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="text-2xl mb-2">🔬</div>
                                <h4 className="font-semibold">Research Agent</h4>
                                <p className="text-sm text-gray-600">Deep company intelligence</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="text-2xl mb-2">🎙️</div>
                                <h4 className="font-semibold">Voice Agent</h4>
                                <p className="text-sm text-gray-600">Real-time conversations</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="text-2xl mb-2">📊</div>
                                <h4 className="font-semibold">Analytics Agent</h4>
                                <p className="text-sm text-gray-600">Data analysis & insights</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
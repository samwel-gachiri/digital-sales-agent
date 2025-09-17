export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="text-2xl">🎯</div>
                            <span className="text-xl font-bold">Digital Sales Agent</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            AI-powered sales automation using Coral Protocol.
                            Discover prospects, qualify leads, and close deals with intelligent agents.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                GitHub
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Discord
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                Documentation
                            </a>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Features</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Prospect Discovery</li>
                            <li>Lead Qualification</li>
                            <li>Voice Outreach</li>
                            <li>Email Automation</li>
                            <li>Sales Analytics</li>
                        </ul>
                    </div>

                    {/* Agents */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Coral Agents</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Firecrawl Agent</li>
                            <li>Research Agent</li>
                            <li>Voice Interface</li>
                            <li>Pandas Analytics</li>
                            <li>Sales Coordinator</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 Digital Sales Agent. Powered by Coral Protocol.</p>
                </div>
            </div>
        </footer>
    )
}
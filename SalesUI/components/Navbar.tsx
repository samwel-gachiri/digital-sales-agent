import Link from "next/link"

export default function Navbar() {
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="text-2xl">🎯</div>
                        <span className="text-xl font-bold text-gray-900">Digital Sales Agent</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/discover" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Discover
                        </Link>
                        <Link href="/leads" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Leads
                        </Link>
                        <Link href="/analytics" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Analytics
                        </Link>
                    </div>

                    {/* CTA Button */}
                    <Link href="/dashboard">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Get Started
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
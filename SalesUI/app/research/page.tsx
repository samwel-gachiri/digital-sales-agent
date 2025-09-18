"use client";

import { useState } from "react";
import { ArrowLeft, Search, Loader2, Building, Mail, User } from "lucide-react";
import Link from "next/link";

interface Prospect {
    id: string;
    company_name: string;
    domain: string;
    industry: string;
    contacts?: Array<{
        name: string;
        email: string;
        title: string;
    }>;
    fallback?: boolean;
}

export default function ResearchPage() {
    const [loading, setLoading] = useState(false);
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [formData, setFormData] = useState({
        target_domain: "",
        industry: "",
        company_size: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setProspects([]);

        try {
            const response = await fetch("http://localhost:8000/api/prospects/research", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.status === "success" && result.prospects) {
                setProspects(result.prospects);
            } else {
                alert("Failed to research prospects. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const isFormValid = formData.target_domain.trim() || formData.industry.trim();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">Prospect Research</h1>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Find Your Next Customers
                    </h2>
                    <p className="text-gray-600">
                        Our AI agents will research companies and extract contact information automatically.
                    </p>
                </div>

                {/* Research Form */}
                <form onSubmit={handleSubmit} className="card mb-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="target_domain" className="block text-sm font-medium text-gray-700 mb-2">
                                Target Company Domain
                            </label>
                            <input
                                type="text"
                                id="target_domain"
                                name="target_domain"
                                value={formData.target_domain}
                                onChange={handleChange}
                                placeholder="e.g., acme.com"
                                className="input"
                            />
                        </div>

                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                                Industry
                            </label>
                            <select
                                id="industry"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="">Select an industry</option>
                                <option value="Technology">Technology</option>
                                <option value="FinTech">FinTech</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="E-commerce">E-commerce</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Consulting">Consulting</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Education">Education</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-2">
                                Company Size
                            </label>
                            <select
                                id="company_size"
                                name="company_size"
                                value={formData.company_size}
                                onChange={handleChange}
                                className="input"
                            >
                                <option value="">Any size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="501-1000">501-1000 employees</option>
                                <option value="1000+">1000+ employees</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={!isFormValid || loading}
                                className="btn-primary w-full inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Researching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-5 w-5" />
                                        <span>Research Prospects</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Results */}
                {prospects.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Found {prospects.length} prospect{prospects.length !== 1 ? 's' : ''}
                            </h3>
                            {prospects[0]?.fallback && (
                                <span className="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                    Fallback Mode
                                </span>
                            )}
                        </div>

                        <div className="space-y-4">
                            {prospects.map((prospect) => (
                                <div key={prospect.id} className="card">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <Building className="h-5 w-5 text-gray-400" />
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    {prospect.company_name}
                                                </h4>
                                                <span className="text-sm text-gray-500">
                                                    {prospect.domain}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 mb-4">
                                                Industry: <span className="font-medium">{prospect.industry}</span>
                                            </p>

                                            {prospect.contacts && prospect.contacts.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Contacts:</h5>
                                                    <div className="space-y-2">
                                                        {prospect.contacts.map((contact, index) => (
                                                            <div key={index} className="flex items-center space-x-3 text-sm">
                                                                <User className="h-4 w-4 text-gray-400" />
                                                                <span className="font-medium">{contact.name}</span>
                                                                <span className="text-gray-500">{contact.title}</span>
                                                                <Mail className="h-4 w-4 text-gray-400" />
                                                                <span className="text-gray-600">{contact.email}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            href={`/emails?prospect_id=${prospect.id}`}
                                            className="btn-primary ml-4"
                                        >
                                            Generate Email
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                        <p className="text-gray-600">AI agents are researching prospects...</p>
                    </div>
                )}
            </main>
        </div>
    );
}
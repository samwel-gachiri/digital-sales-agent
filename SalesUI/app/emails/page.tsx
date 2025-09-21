"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Send, Loader2, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface EmailData {
    id: string;
    subject: string;
    preview?: string;
    content?: string;
    talk_to_sales_link: string;
    sent_to: string;
    fallback?: boolean;
}

export default function EmailsPage() {
    const searchParams = useSearchParams();
    const prospectId = searchParams.get("prospect_id");

    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [emailData, setEmailData] = useState<EmailData | null>(null);
    const [formData, setFormData] = useState({
        prospect_id: prospectId || "",
        contact_name: "",
        contact_email: ""
    });

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setEmailData(null);

        try {
            const response = await fetch("http://localhost:8000/api/emails/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.status === "success" && result.email_data) {
                setEmailData({
                    id: result.email_id,
                    ...result.email_data,
                    fallback: result.fallback
                });
            } else {
                alert("Failed to generate email. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!emailData) return;

        setSending(true);

        try {
            const response = await fetch("http://localhost:8000/api/emails/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email_id: emailData.id }),
            });

            const result = await response.json();

            if (result.status === "success") {
                alert(`Email sent successfully to ${result.email_data?.sent_to || emailData.sent_to}!`);
            } else {
                alert("Failed to send email. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to connect to the server. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const isFormValid = formData.prospect_id.trim() && formData.contact_name.trim();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-900">Email Campaigns</h1>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Generate Personalized Cold Emails
                    </h2>
                    <p className="text-gray-600">
                        AI will create personalized emails with "Talk to Sales" links for immediate engagement.
                    </p>
                </div>

                {/* Email Generation Form */}
                <form onSubmit={handleGenerate} className="card mb-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="prospect_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Prospect ID *
                            </label>
                            <input
                                type="text"
                                id="prospect_id"
                                name="prospect_id"
                                value={formData.prospect_id}
                                onChange={handleChange}
                                placeholder="e.g., prospect_123"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Name *
                            </label>
                            <input
                                type="text"
                                id="contact_name"
                                name="contact_name"
                                value={formData.contact_name}
                                onChange={handleChange}
                                placeholder="e.g., John Smith"
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                id="contact_email"
                                name="contact_email"
                                value={formData.contact_email}
                                onChange={handleChange}
                                placeholder="e.g., john@company.com"
                                className="input"
                            />
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
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="h-5 w-5" />
                                        <span>Generate Email</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Generated Email Preview */}
                {emailData && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                                {emailData.fallback && (
                                    <span className="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                        Fallback Mode
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        <span>Send Email</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                                <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                                    {emailData.sent_to}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                                <p className="text-gray-900 font-medium">
                                    {emailData.subject}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content Preview:</label>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {emailData.preview || emailData.content || "Email content will be generated..."}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Talk to Sales Link:</label>
                                <div className="flex items-center space-x-2">
                                    <p className="text-blue-600 font-mono text-sm bg-blue-50 p-2 rounded flex-1">
                                        {emailData.talk_to_sales_link}
                                    </p>
                                    <Link
                                        href={emailData.talk_to_sales_link}
                                        target="_blank"
                                        className="btn-secondary inline-flex items-center space-x-1 px-3 py-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        <span>Test</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                        <p className="text-gray-600">AI is generating your personalized email...</p>
                    </div>
                )}
            </main>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Send, Loader2, Eye, ExternalLink, Sparkles, Bot, User } from "lucide-react";
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
    const [backendAvailable, setBackendAvailable] = useState(true);
    const [checkingBackend, setCheckingBackend] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [emailData, setEmailData] = useState<EmailData | null>(null);
    const [formData, setFormData] = useState({
        prospect_id: "",
        contact_name: "",
        contact_email: ""
    });
    const [demoStep, setDemoStep] = useState(0);
    const [demoProgress, setDemoProgress] = useState(0);

    // Check if backend is available on component mount
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/health", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // Add timeout to avoid long waits
                    signal: AbortSignal.timeout(3000)
                });
                
                if (response.ok) {
                    setBackendAvailable(true);
                } else {
                    setBackendAvailable(false);
                }
            } catch (error) {
                console.error("Backend not available, using demo mode:", error);
                setBackendAvailable(false);
            } finally {
                setCheckingBackend(false);
            }
        };

        checkBackend();
    }, []);

    // Initialize form with default values if backend is not available
    useEffect(() => {
        if (!backendAvailable && !checkingBackend) {
            const prospectId = searchParams.get("prospect_id");
            setFormData({
                prospect_id: prospectId || "demo_prospect_001",
                contact_name: "John Smith",
                contact_email: "john@example.com"
            });
        }
    }, [backendAvailable, checkingBackend, searchParams]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setEmailData(null);
        setDemoStep(0);
        setDemoProgress(0);

        if (backendAvailable) {
            // Original backend logic
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
        } else {
            // Demo mode with animation
            const demoSteps = 5;
            const interval = setInterval(() => {
                setDemoStep(prev => {
                    const nextStep = prev + 1;
                    setDemoProgress((nextStep / demoSteps) * 100);
                    
                    if (nextStep >= demoSteps) {
                        clearInterval(interval);
                        
                        // Set demo email data
                        setEmailData({
                            id: "demo_email_001",
                            subject: `Meeting request: ${formData.contact_name} at ${formData.prospect_id}`,
                            preview: `Hi ${formData.contact_name.split(' ')[0]}, I was impressed by your company's work in the industry and would love to discuss how we might collaborate. Our platform helps businesses like yours streamline operations and increase efficiency by up to 40%. Would you be available for a quick 15-minute call next week?`,
                            content: `Hi ${formData.contact_name},\n\nI hope this email finds you well. I was recently reviewing your company's profile and was impressed by the work you're doing in the industry.\n\nI'm reaching out because our platform specializes in helping companies like yours streamline operations and increase efficiency. Many of our clients have seen a 30-40% improvement in workflow efficiency within the first quarter of implementation.\n\nI'd love to schedule a brief 15-minute call next week to explore if there might be a good fit between our solutions and your needs. Would you be available Tuesday or Wednesday afternoon?\n\nBest regards,\n[Your Name]\n[Your Title]`,
                            talk_to_sales_link: "https://calendly.com/yourcompany/demo",
                            sent_to: formData.contact_email || "demo@example.com",
                            fallback: true
                        });
                        
                        setLoading(false);
                        return demoSteps;
                    }
                    return nextStep;
                });
            }, 800);
            
            return () => clearInterval(interval);
        }
    };

    const handleSend = async () => {
        if (!emailData) return;

        setSending(true);

        if (backendAvailable) {
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
        } else {
            // Demo mode for sending
            setTimeout(() => {
                alert(`Demo: Email would be sent to ${emailData.sent_to}`);
                setSending(false);
            }, 1500);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const isFormValid = formData.prospect_id.trim() && formData.contact_name.trim();

    if (checkingBackend) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-gray-600">Checking connection...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span>Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">Email Campaigns</h1>
                        {!backendAvailable && (
                            <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                                Demo Mode
                            </span>
                        )}
                    </div>
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
                    {!backendAvailable && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-blue-700 flex items-center">
                                <Sparkles className="h-4 w-4 mr-2" />
                                <span>Currently in demo mode.</span>
                            </p>
                        </div>
                    )}
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

                {/* Demo Progress Animation */}
                {loading && !backendAvailable && (
                    <div className="card mb-8">
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center">
                                        {demoStep === 0 && <User className="h-10 w-10 text-blue-600" />}
                                        {demoStep === 1 && <Bot className="h-10 w-10 text-blue-600 animate-pulse" />}
                                        {demoStep === 2 && <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />}
                                        {demoStep >= 3 && <Mail className="h-10 w-10 text-blue-600" />}
                                    </div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-28 w-28 border-4 border-blue-100 rounded-full animate-ping" style={{ animationDuration: '1.5s' }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 mx-auto max-w-md">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${demoProgress}%` }}
                                ></div>
                            </div>
                            
                            <p className="text-gray-600">
                                {demoStep === 0 && "Analyzing prospect data..."}
                                {demoStep === 1 && "Generating personalized content..."}
                                {demoStep === 2 && "Crafting subject line..."}
                                {demoStep === 3 && "Adding call-to-action..."}
                                {demoStep >= 4 && "Finalizing email..."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Generated Email Preview */}
                {emailData && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <Eye className="h-5 w-5 text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
                                {emailData.fallback && (
                                    <span className="text-sm text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                        Demo Mode
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

                {loading && backendAvailable && (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
                        <p className="text-gray-600">AI is generating your personalized email...</p>
                    </div>
                )}
            </main>
        </div>
    );
}
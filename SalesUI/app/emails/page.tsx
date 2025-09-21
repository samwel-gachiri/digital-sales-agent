"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Send, Loader2, Eye, ExternalLink, Sparkles, Bot, User } from "lucide-react";

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
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [formData, setFormData] = useState({
    prospect_id: "demo_prospect_001",
    contact_name: "John Smith",
    contact_email: "john@example.com"
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
          <a href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </a>
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
                <span>Currently in demo mode. Backend connection is unavailable.</span>
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
                  <a
                    href={emailData.talk_to_sales_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex items-center space-x-1 px-3 py-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Test</span>
                  </a>
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

      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        .bg-white {
          background-color: #fff;
        }
        .border-gray-200 {
          border-color: #e5e7eb;
        }
        .px-6 {
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .py-4 {
          padding-top: 1rem;
          padding-bottom: 1rem;
        }
        .max-w-7xl {
          max-width: 80rem;
        }
        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }
        .flex {
          display: flex;
        }
        .items-center {
          align-items: center;
        }
        .justify-between {
          justify-content: space-between;
        }
        .text-gray-600 {
          color: #4b5563;
        }
        .text-gray-900 {
          color: #111827;
        }
        .hover\:text-gray-900:hover {
          color: #111827;
        }
        .transition-colors {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .text-xl {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }
        .font-semibold {
          font-weight: 600;
        }
        .max-w-4xl {
          max-width: 56rem;
        }
        .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        .mb-8 {
          margin-bottom: 2rem;
        }
        .text-2xl {
          font-size: 1.5rem;
          line-height: 2rem;
        }
        .font-bold {
          font-weight: 700;
        }
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        .mt-4 {
          margin-top: 1rem;
        }
        .p-4 {
          padding: 1rem;
        }
        .bg-blue-50 {
          background-color: #eff6ff;
        }
        .border {
          border-width: 1px;
        }
        .border-blue-200 {
          border-color: #bfdbfe;
        }
        .rounded-lg {
          border-radius: 0.5rem;
        }
        .text-blue-700 {
          color: #1d4ed8;
        }
        .card {
          background-color: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          padding: 1.5rem;
        }
        .grid {
          display: grid;
        }
        .md\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .gap-6 {
          gap: 1.5rem;
        }
        .block {
          display: block;
        }
        .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .font-medium {
          font-weight: 500;
        }
        .text-gray-700 {
          color: #374151;
        }
        .input {
          display: block;
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          color: #111827;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .input:focus {
          outline: none;
          ring: 2px;
          ring-color: #3b82f6;
          border-color: #3b82f6;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          background-color: #3b82f6;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          font-weight: 500;
          color: white;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .btn-primary:hover {
          background-color: #2563eb;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .space-x-2 > * + * {
          margin-left: 0.5rem;
        }
        .inline-flex {
          display: inline-flex;
        }
        .w-full {
          width: 100%;
        }
        .text-center {
          text-align: center;
        }
        .py-12 {
          padding-top: 3rem;
          padding-bottom: 3rem;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .h-8 {
          height: 2rem;
        }
        .w-8 {
          width: 2rem;
        }
        .mb-4 {
          margin-bottom: 1rem;
        }
        .justify-center {
          justify-content: center;
        }
        .relative {
          position: relative;
        }
        .h-24 {
          height: 6rem;
        }
        .w-24 {
          width: 6rem;
        }
        .rounded-full {
          border-radius: 9999px;
        }
        .bg-blue-50 {
          background-color: #eff6ff;
        }
        .absolute {
          position: absolute;
        }
        .inset-0 {
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .h-28 {
          height: 7rem;
        }
        .w-28 {
          width: 7rem;
        }
        .border-4 {
          border-width: 4px;
        }
        .border-blue-100 {
          border-color: #dbeafe;
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .bg-gray-200 {
          background-color: #e5e7eb;
        }
        .h-2\.5 {
          height: 0.625rem;
        }
        .rounded-full {
          border-radius: 9999px;
        }
        .max-w-md {
          max-width: 28rem;
        }
        .bg-blue-600 {
          background-color: #2563eb;
        }
        .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        .duration-500 {
          transition-duration: 500ms;
        }
        .space-y-4 > * + * {
          margin-top: 1rem;
        }
        .font-mono {
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        }
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        .p-2 {
          padding: 0.5rem;
        }
        .whitespace-pre-line {
          white-space: pre-line;
        }
        .text-blue-600 {
          color: #2563eb;
        }
        .bg-blue-50 {
          background-color: #eff6ff;
        }
        .flex-1 {
          flex: 1 1 0%;
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
          font-weight: 500;
          color: #374151;
          background-color: #fff;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .btn-secondary:hover {
          background-color: #f9fafb;
        }
        .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        .space-x-1 > * + * {
          margin-left: 0.25rem;
        }
        .ml-4 {
          margin-left: 1rem;
        }
        .bg-yellow-100 {
          background-color: #fef3c7;
        }
        .text-yellow-800 {
          color: #92400e;
        }
        .rounded-full {
          border-radius: 9999px;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
}
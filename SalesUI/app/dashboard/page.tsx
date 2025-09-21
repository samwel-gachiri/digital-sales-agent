"use client";

import { useState, useEffect } from "react";
import { Bot, Search, Mail, MessageSquare, BarChart3, Users, TrendingUp, Clock, Play, CheckCircle, Loader2, Zap, Target, Send, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface WorkflowStatus {
    current_stage: string;
    next_action: string;
    total_prospects: number;
    auto_generated_prospects: number;
    emails_generated: number;
    emails_sent: number;
    active_conversations: number;
    conversion_rate: string;
    last_activity: string;
    workflow_active: boolean;
    system_status: string;
}

interface BusinessInfo {
    business_goal: string;
    product_description: string;
    target_market: string;
    value_proposition: string;
}

// Demo data for when backend is not available
const demoWorkflowStatus: WorkflowStatus = {
    current_stage: "active_conversations",
    next_action: "Following up with qualified leads",
    total_prospects: 42,
    auto_generated_prospects: 35,
    emails_generated: 28,
    emails_sent: 25,
    active_conversations: 8,
    conversion_rate: "32%",
    last_activity: new Date().toISOString(),
    workflow_active: true,
    system_status: "active"
};

export default function DashboardPage() {
    const router = useRouter();
    const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [workflowInitiated, setWorkflowInitiated] = useState(false);
    const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);
    const [usingDemoData, setUsingDemoData] = useState(false);
    const [animationValues, setAnimationValues] = useState({
        prospects: 0,
        emails: 0,
        conversations: 0
    });

    useEffect(() => {
        // Check if user has completed onboarding
        const stored = localStorage.getItem("businessInfo");
        const initiated = localStorage.getItem("workflowInitiated");

        if (!stored) {
            // Redirect to onboarding if no business info
            router.push("/onboarding");
            return;
        }

        setBusinessInfo(JSON.parse(stored));
        setWorkflowInitiated(initiated === "true");

        // Start real-time updates
        fetchWorkflowStatus();
        const interval = setInterval(fetchWorkflowStatus, 30000);

        // Start demo animations if using demo data
        if (usingDemoData) {
            startDemoAnimations();
        }

        // Stop interval when page becomes hidden
        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(interval);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [router, usingDemoData]);

    const fetchWorkflowStatus = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/workflow/status", {
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            
            if (!response.ok) throw new Error("Server error");
            
            const result = await response.json();

            if (result.status === "success") {
                const newStatus = result.workflow;

                // Check for status changes to add real-time updates
                if (workflowStatus && newStatus) {
                    if (newStatus.emails_sent > workflowStatus.emails_sent) {
                        addRealTimeUpdate(`📧 New email sent! Total: ${newStatus.emails_sent}`);
                    }
                    if (newStatus.active_conversations > workflowStatus.active_conversations) {
                        addRealTimeUpdate(`💬 New conversation started! Active: ${newStatus.active_conversations}`);
                    }
                    if (newStatus.total_prospects > workflowStatus.total_prospects) {
                        addRealTimeUpdate(`🎯 New prospects found! Total: ${newStatus.total_prospects}`);
                    }
                }

                setWorkflowStatus(newStatus);
                setUsingDemoData(false);
            }
        } catch (error) {
            console.error("Error fetching workflow status:", error);
            setWorkflowStatus(demoWorkflowStatus);
            setUsingDemoData(true);
            
            // Add demo real-time updates
            if (realTimeUpdates.length === 0) {
                const demoUpdates = [
                    "🤖 AI agent started prospect research",
                    "🎯 Found 5 new potential clients",
                    "📧 Generated personalized email for TechCorp Inc",
                    "💬 Received response from John@StartupXYZ.com",
                    "🚀 Scheduled follow-up meeting with Acme Co"
                ];
                setRealTimeUpdates(demoUpdates);
            }
        } finally {
            setLoading(false);
        }
    };

    const startDemoAnimations = () => {
        // Animate the counter values for demo effect
        let prospects = 0;
        let emails = 0;
        let conversations = 0;
        
        const prospectsTarget = demoWorkflowStatus.total_prospects;
        const emailsTarget = demoWorkflowStatus.emails_sent;
        const conversationsTarget = demoWorkflowStatus.active_conversations;
        
        const interval = setInterval(() => {
            if (prospects < prospectsTarget) prospects += Math.ceil(prospectsTarget / 20);
            if (emails < emailsTarget) emails += Math.ceil(emailsTarget / 20);
            if (conversations < conversationsTarget) conversations += Math.ceil(conversationsTarget / 20);
            
            setAnimationValues({
                prospects: Math.min(prospects, prospectsTarget),
                emails: Math.min(emails, emailsTarget),
                conversations: Math.min(conversations, conversationsTarget)
            });
            
            if (prospects >= prospectsTarget && 
                emails >= emailsTarget && 
                conversations >= conversationsTarget) {
                clearInterval(interval);
            }
        }, 100);
    };

    const addRealTimeUpdate = (message: string) => {
        setRealTimeUpdates(prev => {
            const newUpdates = [message, ...prev].slice(0, 5); // Keep only last 5 updates
            return newUpdates;
        });
    };

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case "onboarding": return <Play className="h-5 w-5" />;
            case "email_generation": return <Mail className="h-5 w-5" />;
            case "waiting_for_responses": return <Clock className="h-5 w-5" />;
            case "active_conversations": return <MessageSquare className="h-5 w-5" />;
            default: return <Activity className="h-5 w-5" />;
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case "onboarding": return "text-blue-600 bg-blue-100";
            case "email_generation": return "text-orange-600 bg-orange-100";
            case "waiting_for_responses": return "text-yellow-600 bg-yellow-100";
            case "active_conversations": return "text-green-600 bg-green-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-lg text-gray-600">Loading your sales dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900">Digital Sales Agent</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${workflowStatus?.system_status === "active"
                            ? "text-green-700 bg-green-100"
                            : "text-yellow-700 bg-yellow-100"
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${workflowStatus?.system_status === "active" ? "bg-green-500" : "bg-yellow-500"
                                } animate-pulse`}></div>
                            <span>{workflowStatus?.system_status === "active" ? "Active" : "Standby"}</span>
                        </div>
                        {usingDemoData && (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-blue-700 bg-blue-100">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span>Demo Mode</span>
                            </div>
                        )}
                        <Link href="/web3" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Web3
                        </Link>
                        <Link href="/onboarding" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Settings
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Demo Mode Banner */}
            {usingDemoData && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4 text-blue-600" />
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Demo Mode:</span> Showing sample data with animations
                            </p>
                        </div>
                        <button 
                            onClick={fetchWorkflowStatus}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Retry Connection
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                        Sales Automation Dashboard
                    </h1>
                    {businessInfo ? (
                        <p className="text-lg text-gray-600">
                            AI agents working on: <span className="font-medium text-gray-900">{businessInfo.product_description}</span>
                            {usingDemoData && " (Demo Data)"}
                        </p>
                    ) : (
                        <p className="text-gray-600">
                            <Link href="/onboarding" className="text-blue-600 hover:text-blue-700 underline">
                                Complete your business setup
                            </Link> to activate your AI sales agents
                        </p>
                    )}
                </div>

                {/* Current Workflow Stage */}
                {workflowStatus && (
                    <div className="mb-8">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Current Workflow Stage</h2>
                                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${getStageColor(workflowStatus.current_stage)}`}>
                                    {getStageIcon(workflowStatus.current_stage)}
                                    <span className="font-medium capitalize">{workflowStatus.current_stage ? workflowStatus.current_stage.replace('_', ' ') : 'Loading'}</span>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">{workflowStatus.next_action}</p>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: workflowStatus.current_stage === "onboarding" ? "25%" :
                                            workflowStatus.current_stage === "email_generation" ? "50%" :
                                                workflowStatus.current_stage === "waiting_for_responses" ? "75%" :
                                                    workflowStatus.current_stage === "active_conversations" ? "100%" : "0%"
                                    }}
                                ></div>
                            </div>

                            <div className="text-sm text-gray-500">
                                Last activity: {new Date(workflowStatus.last_activity).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Prospects</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {usingDemoData ? animationValues.prospects : workflowStatus?.total_prospects || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {usingDemoData ? animationValues.emails : workflowStatus?.emails_sent || 0}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {workflowStatus?.emails_generated || 0} generated
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Send className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Conversations</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {usingDemoData ? animationValues.conversations : workflowStatus?.active_conversations || 0}
                                </p>
                                <p className="text-xs text-gray-500">AI-powered</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {workflowStatus?.conversion_rate || "0%"}
                                </p>
                                <p className="text-xs text-gray-500">Email to conversation</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Updates & Action Cards */}
                <div className="grid lg:grid-cols-2 gap-8">

                    {/* Real-time Activity Feed */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
                            {usingDemoData && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    Simulated
                                </span>
                            )}
                        </div>

                        {realTimeUpdates.length > 0 ? (
                            <div className="space-y-3">
                                {realTimeUpdates.map((update, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg transition-all duration-300 hover:bg-blue-100"
                                    >
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-700">{update}</span>
                                        <span className="text-xs text-gray-500 ml-auto">Just now</span>
                                    </div>
                                ))}
                                {usingDemoData && (
                                    <div className="text-center pt-4">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                            Simulating live updates...
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Waiting for agent activity...</p>
                                <p className="text-sm">Updates will appear here in real-time</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <Link href="/research" className="block bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-200 group">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                                    <Search className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Manual Research</h3>
                                    <p className="text-gray-600">Add specific prospects to the pipeline</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/emails" className="block bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-200 group">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                                    <Mail className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Email Campaigns</h3>
                                    <p className="text-gray-600">View and manage email campaigns</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/conversations" className="block bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-200 group">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                                    <MessageSquare className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Sales Conversations</h3>
                                    <p className="text-gray-600">Monitor AI-powered sales conversations</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/web3" className="block bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-200 group">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:from-yellow-500 group-hover:to-orange-600 transition-all duration-200">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Web3 Integration</h3>
                                    <p className="text-gray-600">Blockchain payments & NFT rewards</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* System Status */}
                {workflowStatus?.system_status !== "active" && (
                    <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 p-6">
                        <div className="flex items-center space-x-3">
                            <Clock className="h-6 w-6 text-yellow-600" />
                            <div>
                                <p className="font-medium text-yellow-800">
                                    System Status: {workflowStatus?.system_status || "Standby"}
                                </p>
                                <p className="text-sm text-yellow-700">
                                    Your AI agents are ready to work. Complete onboarding to activate automated workflows.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
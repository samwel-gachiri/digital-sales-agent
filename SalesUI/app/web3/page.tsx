'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CreditCard,
    Trophy,
    Coins,
    Wallet,
    Star,
    TrendingUp,
    Gift,
    Zap,
    Shield,
    Globe
} from 'lucide-react';

interface WalletStatus {
    wallet_address: string;
    nft_count: number;
    commission_tokens: number;
    achievements: Array<{
        type: string;
        earned_at: string;
    }>;
    total_earnings: number;
}

interface PaymentResult {
    status: string;
    payment_id?: string;
    payment_url?: string;
    amount?: number;
    plan?: string;
    message?: string;
}

interface AchievementResult {
    status: string;
    nft_id?: string;
    transaction_hash?: string;
    achievement_type?: string;
    message?: string;
}

export default function Web3Dashboard() {
    const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [achievementLoading, setAchievementLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState({
        backend_connected: false,
        crossmint_configured: false,
        sales_agent_active: false
    });
    const [workflowData, setWorkflowData] = useState({
        total_prospects: 0,
        emails_sent: 0,
        active_conversations: 0,
        deals_closed: 0
    });

    // Form states
    const [customerEmail, setCustomerEmail] = useState('samgachiri2002@gmail.com');
    const [customerName, setCustomerName] = useState('Demo Customer');
    const [planType, setPlanType] = useState('pro');
    const [amount, setAmount] = useState(99.00);

    const [achievementEmail, setAchievementEmail] = useState('samgachiri2002@gmail.com');
    const [achievementType, setAchievementType] = useState('top_performer');
    const [performanceData, setPerformanceData] = useState({
        performance_percentage: 150,
        deals_closed: 5,
        revenue: 25000,
        conversion_rate: 85
    });

    useEffect(() => {
        loadSystemStatus();
        loadWalletStatus();
        loadWorkflowData();

        // Refresh data every 30 seconds
        const interval = setInterval(() => {
            loadSystemStatus();
            loadWorkflowData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadSystemStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/health');
            const health = await response.json();

            setSystemStatus({
                backend_connected: health.status === 'healthy',
                crossmint_configured: health.crossmint_status === 'configured',
                sales_agent_active: health.agent_status === 'connected'
            });
        } catch (error) {
            console.error('Error loading system status:', error);
            setSystemStatus({
                backend_connected: false,
                crossmint_configured: false,
                sales_agent_active: false
            });
        }
    };

    const loadWorkflowData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/workflow/status');
            const workflow = await response.json();

            if (workflow.status === 'success') {
                setWorkflowData({
                    total_prospects: workflow.workflow?.total_prospects || 0,
                    emails_sent: workflow.workflow?.emails_sent || 0,
                    active_conversations: workflow.workflow?.active_conversations || 0,
                    deals_closed: workflow.workflow?.deals_closed || 0
                });

                // Update performance data based on real workflow data
                setPerformanceData(prev => ({
                    ...prev,
                    deals_closed: workflow.workflow?.deals_closed || prev.deals_closed,
                    revenue: (workflow.workflow?.deals_closed || 0) * 5000, // Assume $5k per deal
                    conversion_rate: workflow.workflow?.emails_sent > 0
                        ? Math.round((workflow.workflow?.active_conversations / workflow.workflow?.emails_sent) * 100)
                        : prev.conversion_rate
                }));
            }
        } catch (error) {
            console.error('Error loading workflow data:', error);
        }
    };

    const loadWalletStatus = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/crossmint/wallet/${encodeURIComponent('samgachiri2002@gmail.com')}`);
            const data = await response.json();

            if (data.status === 'success') {
                setWalletStatus(data);
            }
        } catch (error) {
            console.error('Error loading wallet status:', error);
        } finally {
            setLoading(false);
        }
    };

    const createSubscription = async () => {
        setPaymentLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/crossmint/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_email: customerEmail,
                    customer_name: customerName,
                    plan_type: planType,
                    amount: amount
                }),
            });

            const result: PaymentResult = await response.json();

            if (result.status === 'success') {
                alert(`Payment created successfully! Payment ID: ${result.payment_id}`);
                loadWalletStatus(); // Refresh wallet status
            } else if (result.status === 'disabled') {
                alert('Crossmint is not configured. This is a demo of the Web3 integration capabilities.');
            } else {
                alert(`Payment failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            alert('Error creating subscription');
        } finally {
            setPaymentLoading(false);
        }
    };

    const mintAchievement = async () => {
        setAchievementLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/crossmint/achievement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient_email: achievementEmail,
                    achievement_type: achievementType,
                    performance_data: performanceData
                }),
            });

            const result: AchievementResult = await response.json();

            if (result.status === 'success') {
                alert(`Achievement NFT minted successfully! NFT ID: ${result.nft_id}`);
                loadWalletStatus(); // Refresh wallet status
            } else if (result.status === 'disabled') {
                alert('Crossmint is not configured. This is a demo of the NFT achievement system.');
            } else {
                alert(`NFT minting failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error minting achievement:', error);
            alert('Error minting achievement NFT');
        } finally {
            setAchievementLoading(false);
        }
    };

    const processDealPayment = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/crossmint/deal-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deal_id: `deal_${Date.now()}`,
                    amount: 5000,
                    customer_email: 'customer@example.com',
                    sales_agent_id: 'sales_agent_001'
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert(`Deal processed successfully! Commission: $${result.commission_amount}`);
                loadWalletStatus();
            } else if (result.status === 'disabled') {
                alert('Crossmint is not configured. This demonstrates automated deal processing with commission distribution.');
            } else {
                alert(`Deal processing failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Error processing deal:', error);
            alert('Error processing deal payment');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Web3 Integration Dashboard</h1>
                    <p className="text-muted-foreground">
                        Blockchain payments, NFT rewards, and smart contract automation powered by Crossmint
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${systemStatus.backend_connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                            <span className="text-sm text-gray-600">Backend</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${systemStatus.crossmint_configured ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                            <span className="text-sm text-gray-600">Crossmint</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${systemStatus.sales_agent_active ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                            <span className="text-sm text-gray-600">Sales Agent</span>
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="text-xs text-gray-500">
                            {systemStatus.crossmint_configured
                                ? "Live blockchain transactions enabled"
                                : "Demo mode • Configure Crossmint API keys for live transactions"}
                        </span>
                    </div>
                </div>
                <Button onClick={loadWalletStatus} disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh Wallet'}
                </Button>
            </div>

            {/* Wallet Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wallet Address</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {walletStatus ? `${walletStatus.wallet_address.slice(0, 6)}...${walletStatus.wallet_address.slice(-4)}` : 'Loading...'}
                        </div>
                        <p className="text-xs text-muted-foreground">Polygon Network</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Achievement NFTs</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{walletStatus?.nft_count || 0}</div>
                        <p className="text-xs text-muted-foreground">Earned achievements</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commission Tokens</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{walletStatus?.commission_tokens || 0} SCT</div>
                        <p className="text-xs text-muted-foreground">Sales Commission Tokens</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${walletStatus?.total_earnings || 0}</div>
                        <p className="text-xs text-muted-foreground">Lifetime earnings</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="payments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="payments">Subscription Payments</TabsTrigger>
                    <TabsTrigger value="achievements">NFT Achievements</TabsTrigger>
                    <TabsTrigger value="deals">Deal Processing</TabsTrigger>
                    <TabsTrigger value="features">Web3 Features</TabsTrigger>
                </TabsList>

                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Create Subscription Payment
                            </CardTitle>
                            <CardDescription>
                                Process subscription payments with automatic crypto conversion via Crossmint
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Customer Email</Label>
                                    <Input
                                        id="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="customer@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Customer Name</Label>
                                    <Input
                                        id="name"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="plan">Plan Type</Label>
                                    <select
                                        id="plan"
                                        value={planType}
                                        onChange={(e) => setPlanType(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="basic">Basic - $49/month</option>
                                        <option value="pro">Pro - $99/month</option>
                                        <option value="enterprise">Enterprise - $199/month</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount ($)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                                        placeholder="99.00"
                                    />
                                </div>
                            </div>
                            <Button onClick={createSubscription} disabled={paymentLoading} className="w-full">
                                {paymentLoading ? 'Processing...' : 'Create Payment'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Mint Achievement NFT
                            </CardTitle>
                            <CardDescription>
                                Reward sales performance with blockchain-verified achievement NFTs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="achievement-email">Recipient Email</Label>
                                    <Input
                                        id="achievement-email"
                                        value={achievementEmail}
                                        onChange={(e) => setAchievementEmail(e.target.value)}
                                        placeholder="agent@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="achievement-type">Achievement Type</Label>
                                    <select
                                        id="achievement-type"
                                        value={achievementType}
                                        onChange={(e) => setAchievementType(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="top_performer">Top Performer</option>
                                        <option value="deal_closer">Deal Closer</option>
                                        <option value="email_master">Email Master</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Performance %</Label>
                                    <Input
                                        type="number"
                                        value={performanceData.performance_percentage}
                                        onChange={(e) => setPerformanceData({
                                            ...performanceData,
                                            performance_percentage: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Deals Closed</Label>
                                    <Input
                                        type="number"
                                        value={performanceData.deals_closed}
                                        onChange={(e) => setPerformanceData({
                                            ...performanceData,
                                            deals_closed: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Revenue ($)</Label>
                                    <Input
                                        type="number"
                                        value={performanceData.revenue}
                                        onChange={(e) => setPerformanceData({
                                            ...performanceData,
                                            revenue: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Conversion Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={performanceData.conversion_rate}
                                        onChange={(e) => setPerformanceData({
                                            ...performanceData,
                                            conversion_rate: parseInt(e.target.value)
                                        })}
                                    />
                                </div>
                            </div>

                            <Button onClick={mintAchievement} disabled={achievementLoading} className="w-full">
                                {achievementLoading ? 'Minting...' : 'Mint Achievement NFT'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Achievement Gallery */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Achievement Gallery</CardTitle>
                            <CardDescription>Your earned achievement NFTs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {walletStatus?.achievements.map((achievement, index) => (
                                    <div key={index} className="border rounded-lg p-4 text-center">
                                        <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                            <Trophy className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="font-semibold capitalize">{achievement.type.replace('_', ' ')}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Earned: {new Date(achievement.earned_at).toLocaleDateString()}
                                        </p>
                                        <Badge variant="secondary" className="mt-2">NFT</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="deals" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Automated Deal Processing
                            </CardTitle>
                            <CardDescription>
                                Smart contract automation for deal closure and commission distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Demo Deal Scenario</h3>
                                <ul className="text-sm space-y-1">
                                    <li>• Deal Value: $5,000</li>
                                    <li>• Commission Rate: 15%</li>
                                    <li>• Commission Amount: $750</li>
                                    <li>• Achievement NFT: Deal Closer</li>
                                </ul>
                            </div>

                            <Button onClick={processDealPayment} className="w-full">
                                Process Demo Deal
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Global Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        Accept payments from anywhere
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        Automatic fiat-to-crypto conversion
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        Lower transaction fees
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-500" />
                                        Instant settlement
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift className="h-5 w-5" />
                                    NFT Rewards System
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        Performance-based achievements
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        Blockchain-verified credentials
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        Collectible and tradeable
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        Gamified sales experience
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5" />
                                    Commission Tokens
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                        Transparent commission tracking
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                        Automated distribution
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                        Programmable payouts
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-500" />
                                        Cross-border compatibility
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Smart Contracts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-500" />
                                        Automated deal processing
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-500" />
                                        Escrow and dispute resolution
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-500" />
                                        Trustless transactions
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-500" />
                                        Audit trail on blockchain
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
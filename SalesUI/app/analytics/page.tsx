"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Target, DollarSign, Calendar, Download } from 'lucide-react'

const pipelineData = [
    { stage: 'Discovered', count: 45, value: 450000 },
    { stage: 'Researched', count: 32, value: 320000 },
    { stage: 'Contacted', count: 18, value: 180000 },
    { stage: 'Qualified', count: 12, value: 120000 },
    { stage: 'Proposal', count: 8, value: 80000 },
    { stage: 'Negotiation', count: 5, value: 50000 },
    { stage: 'Closed Won', count: 3, value: 30000 },
]

const performanceData = [
    { month: 'Jan', prospects: 25, qualified: 8, closed: 2 },
    { month: 'Feb', prospects: 32, qualified: 12, closed: 3 },
    { month: 'Mar', prospects: 28, qualified: 10, closed: 4 },
    { month: 'Apr', prospects: 35, qualified: 15, closed: 5 },
    { month: 'May', prospects: 42, qualified: 18, closed: 6 },
    { month: 'Jun', prospects: 38, qualified: 16, closed: 7 },
]

const agentPerformanceData = [
    { name: 'Firecrawl Agent', tasks: 156, success: 94, rate: 60.3 },
    { name: 'Research Agent', tasks: 142, success: 89, rate: 62.7 },
    { name: 'Voice Agent', tasks: 98, success: 76, rate: 77.6 },
    { name: 'Pandas Agent', tasks: 203, success: 198, rate: 97.5 },
]

const leadSourceData = [
    { name: 'Web Scraping', value: 45, color: '#3b82f6' },
    { name: 'Research', value: 30, color: '#10b981' },
    { name: 'Referrals', value: 15, color: '#f59e0b' },
    { name: 'Direct', value: 10, color: '#ef4444' },
]

export default function AnalyticsPage() {
    const [timeframe, setTimeframe] = useState('last_30_days')
    const [isLoading, setIsLoading] = useState(false)

    const handleGenerateReport = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:8000/sales/analytics?timeframe=${timeframe}&metrics=conversion_rate,pipeline_velocity,agent_performance`, {
                method: 'GET',
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Analytics generated:', result)
            }
        } catch (error) {
            console.error('Analytics error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
                        <p className="text-gray-600 mt-2">Track performance and optimize your sales process</p>
                    </div>
                    <div className="flex space-x-4">
                        <select
                            className="input-field"
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                        >
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                            <option value="last_90_days">Last 90 Days</option>
                            <option value="this_year">This Year</option>
                        </select>
                        <button
                            onClick={handleGenerateReport}
                            disabled={isLoading}
                            className="btn-primary flex items-center space-x-2"
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>{isLoading ? 'Generating...' : 'Generate Report'}</span>
                        </button>
                        <button className="btn-secondary flex items-center space-x-2">
                            <Download className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">$1.2M</p>
                                <p className="text-sm text-green-600">+12.5% from last month</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">26.7%</p>
                                <p className="text-sm text-green-600">+3.2% from last month</p>
                            </div>
                            <Target className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pipeline Velocity</p>
                                <p className="text-2xl font-bold text-gray-900">18 days</p>
                                <p className="text-sm text-red-600">+2 days from last month</p>
                            </div>
                            <Calendar className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Prospects</p>
                                <p className="text-2xl font-bold text-gray-900">156</p>
                                <p className="text-sm text-green-600">+23 from last month</p>
                            </div>
                            <Users className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Pipeline Analysis */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Sales Pipeline Analysis</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={pipelineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="stage" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Performance Trends */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="prospects" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="qualified" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="closed" stroke="#f59e0b" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Lead Sources */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={leadSourceData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {leadSourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Agent Performance */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Agent Performance</h3>
                        <div className="space-y-4">
                            {agentPerformanceData.map((agent, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{agent.name}</p>
                                        <p className="text-sm text-gray-600">{agent.tasks} tasks completed</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{agent.rate}%</p>
                                        <p className="text-sm text-gray-600">Success Rate</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performing Industries */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Top Performing Industries</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 font-medium text-gray-600">Industry</th>
                                        <th className="text-left py-2 font-medium text-gray-600">Prospects</th>
                                        <th className="text-left py-2 font-medium text-gray-600">Conversion</th>
                                        <th className="text-left py-2 font-medium text-gray-600">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Technology</td>
                                        <td className="py-2">45</td>
                                        <td className="py-2">32%</td>
                                        <td className="py-2">$450K</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Finance</td>
                                        <td className="py-2">32</td>
                                        <td className="py-2">28%</td>
                                        <td className="py-2">$320K</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-2">Healthcare</td>
                                        <td className="py-2">28</td>
                                        <td className="py-2">25%</td>
                                        <td className="py-2">$280K</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Recent Agent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Firecrawl Agent discovered 5 new prospects</p>
                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Research Agent completed company analysis</p>
                                    <p className="text-xs text-gray-500">5 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Voice Agent completed qualification call</p>
                                    <p className="text-xs text-gray-500">12 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 border rounded-lg">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Pandas Agent generated lead scores</p>
                                    <p className="text-xs text-gray-500">18 minutes ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
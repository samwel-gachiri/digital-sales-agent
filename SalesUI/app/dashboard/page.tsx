"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Target, Phone, TrendingUp, Plus, Search } from 'lucide-react'

interface Prospect {
  id: string
  companyName: string
  industry: string
  leadScore: number
  category: 'hot' | 'warm' | 'cold'
  dealStage: string
  lastContact: string
}

const mockProspects: Prospect[] = [
  { id: '1', companyName: 'TechStart Inc', industry: 'Technology', leadScore: 8.5, category: 'hot', dealStage: 'qualified', lastContact: '2 hours ago' },
  { id: '2', companyName: 'FinanceFlow Ltd', industry: 'Finance', leadScore: 7.2, category: 'warm', dealStage: 'contacted', lastContact: '1 day ago' },
  { id: '3', companyName: 'HealthCare Plus', industry: 'Healthcare', leadScore: 6.1, category: 'warm', dealStage: 'researched', lastContact: '3 days ago' },
  { id: '4', companyName: 'RetailMax Corp', industry: 'Retail', leadScore: 4.8, category: 'cold', dealStage: 'discovered', lastContact: '1 week ago' },
]

const pipelineData = [
  { stage: 'Discovered', count: 45 },
  { stage: 'Researched', count: 32 },
  { stage: 'Contacted', count: 18 },
  { stage: 'Qualified', count: 12 },
  { stage: 'Proposal', count: 8 },
  { stage: 'Closed Won', count: 5 },
]

const leadCategoryData = [
  { name: 'Hot', value: 15, color: '#ef4444' },
  { name: 'Warm', value: 35, color: '#f59e0b' },
  { name: 'Cold', value: 50, color: '#3b82f6' },
]

export default function Dashboard() {
  const [prospects, setProspects] = useState<Prospect[]>(mockProspects)
  const [isLoading, setIsLoading] = useState(false)

  const handleDiscoverProspects = async () => {
    setIsLoading(true)
    try {
      // This would call the Sales Interface Agent API
      const response = await fetch('/api/sales/discover-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: 'technology',
          company_size: '50-200',
          keywords: ['SaaS', 'startup']
        })
      })

      if (response.ok) {
        // Refresh prospects list
        console.log('Prospect discovery initiated')
      }
    } catch (error) {
      console.error('Error discovering prospects:', error)
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
            <h1 className="text-3xl font-bold text-gray-900">Sales Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor your sales pipeline and agent performance</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleDiscoverProspects}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Discovering...' : 'Discover Prospects'}</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Prospect</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Prospects</p>
                <p className="text-2xl font-bold text-gray-900">120</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                <p className="text-2xl font-bold text-gray-900">32</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contacts</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
              <Phone className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">26.7%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pipeline Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Sales Pipeline</h3>
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

          {/* Lead Categories */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Lead Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {leadCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Prospects */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Prospects</h3>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Industry</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Lead Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Stage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Last Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{prospect.companyName}</td>
                    <td className="py-3 px-4 text-gray-600">{prospect.industry}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{prospect.leadScore}/10</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`status-badge status-${prospect.category}`}>
                        {prospect.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{prospect.dealStage}</td>
                    <td className="py-3 px-4 text-gray-600">{prospect.lastContact}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          Contact
                        </button>
                        <button className="text-green-600 hover:text-green-700 text-sm">
                          Qualify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
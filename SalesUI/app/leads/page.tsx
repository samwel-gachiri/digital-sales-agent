"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import { Phone, Mail, MessageCircle, Star, Filter, Search, ChevronDown } from 'lucide-react'

interface Lead {
    id: string
    companyName: string
    industry: string
    leadScore: number
    category: 'hot' | 'warm' | 'cold'
    dealStage: string
    lastContact: string
    contacts: Array<{
        name: string
        title: string
        email: string
        decision_maker: boolean
    }>
}

const mockLeads: Lead[] = [
    {
        id: '1',
        companyName: 'TechStart Inc',
        industry: 'Technology',
        leadScore: 8.5,
        category: 'hot',
        dealStage: 'qualified',
        lastContact: '2 hours ago',
        contacts: [
            { name: 'John Smith', title: 'CEO', email: 'john@techstart.com', decision_maker: true },
            { name: 'Alice Johnson', title: 'CTO', email: 'alice@techstart.com', decision_maker: true }
        ]
    },
    {
        id: '2',
        companyName: 'FinanceFlow Ltd',
        industry: 'Finance',
        leadScore: 7.2,
        category: 'warm',
        dealStage: 'contacted',
        lastContact: '1 day ago',
        contacts: [
            { name: 'Sarah Wilson', title: 'VP Finance', email: 'sarah@financeflow.com', decision_maker: true }
        ]
    },
    {
        id: '3',
        companyName: 'HealthCare Plus',
        industry: 'Healthcare',
        leadScore: 6.1,
        category: 'warm',
        dealStage: 'researched',
        lastContact: '3 days ago',
        contacts: [
            { name: 'Dr. Michael Brown', title: 'Chief Medical Officer', email: 'michael@healthcare.com', decision_maker: true }
        ]
    }
]

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>(mockLeads)
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [isQualifying, setIsQualifying] = useState(false)

    const filteredLeads = leads.filter(lead => {
        const matchesCategory = filterCategory === 'all' || lead.category === filterCategory
        const matchesSearch = lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleQualifyLead = async (leadId: string, contactId: string) => {
        setIsQualifying(true)
        try {
            const response = await fetch('http://localhost:8000/sales/qualify-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prospect_id: leadId,
                    contact_id: contactId
                })
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Qualification initiated:', result)
                // Update lead status
                setLeads(prev => prev.map(lead =>
                    lead.id === leadId
                        ? { ...lead, dealStage: 'qualifying', lastContact: 'Just now' }
                        : lead
                ))
            }
        } catch (error) {
            console.error('Qualification error:', error)
        } finally {
            setIsQualifying(false)
        }
    }

    const handleInitiateContact = async (leadId: string, contactId: string, method: 'voice' | 'email') => {
        try {
            const response = await fetch('http://localhost:8000/sales/initiate-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prospect_id: leadId,
                    contact_id: contactId,
                    method: method,
                    message: method === 'voice'
                        ? "Hi, I'd like to discuss how we can help your business grow with our AI solutions"
                        : "I came across your company and was impressed by your recent growth. I'd love to discuss how we can help you scale even further."
                })
            })

            if (response.ok) {
                const result = await response.json()
                console.log('Contact initiated:', result)
                // Update lead status
                setLeads(prev => prev.map(lead =>
                    lead.id === leadId
                        ? { ...lead, dealStage: 'contacted', lastContact: 'Just now' }
                        : lead
                ))
            }
        } catch (error) {
            console.error('Contact error:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
                        <p className="text-gray-600 mt-2">Qualify and manage your sales prospects</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Leads List */}
                    <div className="lg:col-span-2">
                        <div className="card">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search leads..."
                                            className="input-field pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <select
                                        className="input-field pr-10 appearance-none"
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="hot">Hot Leads</option>
                                        <option value="warm">Warm Leads</option>
                                        <option value="cold">Cold Leads</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Leads List */}
                            <div className="space-y-4">
                                {filteredLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedLead?.id === lead.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-semibold">{lead.companyName}</h3>
                                                <p className="text-gray-600">{lead.industry}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`status-badge status-${lead.category}`}>
                                                    {lead.category.toUpperCase()}
                                                </span>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm font-medium">{lead.leadScore}/10</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Deal Stage</p>
                                                <p className="text-sm text-gray-600 capitalize">{lead.dealStage}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Last Contact</p>
                                                <p className="text-sm text-gray-600">{lead.lastContact}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    {lead.contacts.length} contact{lead.contacts.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleInitiateContact(lead.id, lead.contacts[0]?.name || 'contact_1', 'voice')
                                                    }}
                                                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    <span>Call</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleInitiateContact(lead.id, lead.contacts[0]?.name || 'contact_1', 'email')
                                                    }}
                                                    className="text-green-600 hover:text-green-700 text-sm flex items-center space-x-1"
                                                >
                                                    <Mail className="w-3 h-3" />
                                                    <span>Email</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleQualifyLead(lead.id, lead.contacts[0]?.name || 'contact_1')
                                                    }}
                                                    disabled={isQualifying}
                                                    className="text-purple-600 hover:text-purple-700 text-sm flex items-center space-x-1"
                                                >
                                                    <MessageCircle className="w-3 h-3" />
                                                    <span>{isQualifying ? 'Qualifying...' : 'Qualify'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lead Details */}
                    <div className="lg:col-span-1">
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4">Lead Details</h3>

                            {selectedLead ? (
                                <div className="space-y-6">
                                    {/* Company Info */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">{selectedLead.companyName}</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Industry:</span>
                                                <span>{selectedLead.industry}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Lead Score:</span>
                                                <span className="font-medium">{selectedLead.leadScore}/10</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Category:</span>
                                                <span className={`status-badge status-${selectedLead.category}`}>
                                                    {selectedLead.category.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Stage:</span>
                                                <span className="capitalize">{selectedLead.dealStage}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contacts */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Key Contacts</h4>
                                        <div className="space-y-3">
                                            {selectedLead.contacts.map((contact, idx) => (
                                                <div key={idx} className="border rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium">{contact.name}</p>
                                                            <p className="text-sm text-gray-600">{contact.title}</p>
                                                        </div>
                                                        {contact.decision_maker && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                Decision Maker
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{contact.email}</p>

                                                    <div className="flex space-x-2 mt-3">
                                                        <button
                                                            onClick={() => handleInitiateContact(selectedLead.id, contact.name, 'voice')}
                                                            className="btn-primary text-xs flex items-center space-x-1"
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                            <span>Call</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleInitiateContact(selectedLead.id, contact.name, 'email')}
                                                            className="btn-secondary text-xs flex items-center space-x-1"
                                                        >
                                                            <Mail className="w-3 h-3" />
                                                            <span>Email</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* BANT Qualification */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">BANT Qualification</h4>
                                        <button
                                            onClick={() => handleQualifyLead(selectedLead.id, selectedLead.contacts[0]?.name || 'contact_1')}
                                            disabled={isQualifying}
                                            className="w-full btn-primary flex items-center justify-center space-x-2"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{isQualifying ? 'Starting Qualification...' : 'Start BANT Qualification'}</span>
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Uses VoiceInterface agent to conduct qualification call with BANT criteria
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Select a lead to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
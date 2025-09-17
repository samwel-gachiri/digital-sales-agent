"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import { Search, Globe, Building, MapPin, Tag, Loader2 } from 'lucide-react'

interface DiscoveryForm {
  targetDomain: string
  industry: string
  companySize: string
  location: string
  keywords: string[]
}

export default function DiscoverPage() {
  const [form, setForm] = useState<DiscoveryForm>({
    targetDomain: '',
    industry: '',
    companySize: '',
    location: '',
    keywords: []
  })
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [keywordInput, setKeywordInput] = useState('')

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !form.keywords.includes(keywordInput.trim())) {
      setForm(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }))
      setKeywordInput('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setForm(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const handleDiscover = async () => {
    setIsDiscovering(true)
    try {
      const response = await fetch('http://localhost:8000/sales/discover-prospects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_domain: form.targetDomain || undefined,
          industry: form.industry || undefined,
          company_size: form.companySize || undefined,
          location: form.location || undefined,
          keywords: form.keywords
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Discovery initiated:', data)
        // In a real app, you'd poll for results or use WebSockets
        setResults([
          {
            id: '1',
            companyName: 'Example Tech Corp',
            domain: 'exampletech.com',
            industry: form.industry || 'Technology',
            contacts: [
              { name: 'John Doe', title: 'CEO', email: 'john@exampletech.com' }
            ]
          }
        ])
      }
    } catch (error) {
      console.error('Discovery error:', error)
    } finally {
      setIsDiscovering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prospect Discovery</h1>
          <p className="text-gray-600 mt-2">
            Use AI agents to discover and research potential customers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Discovery Form */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Search Criteria</h2>
              
              <div className="space-y-6">
                {/* Target Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Target Domain (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="example.com"
                    className="input-field"
                    value={form.targetDomain}
                    onChange={(e) => setForm(prev => ({ ...prev, targetDomain: e.target.value }))}
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Industry
                  </label>
                  <select
                    className="input-field"
                    value={form.industry}
                    onChange={(e) => setForm(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    className="input-field"
                    value={form.companySize}
                    onChange={(e) => setForm(prev => ({ ...prev, companySize: e.target.value }))}
                  >
                    <option value="">Any Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    className="input-field"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Keywords
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add keyword"
                      className="input-field flex-1"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="btn-secondary"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Discover Button */}
                <button
                  onClick={handleDiscover}
                  disabled={isDiscovering || (!form.industry && !form.targetDomain)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {isDiscovering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Discovering...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Discover Prospects</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Agent Status */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">Agent Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Firecrawl Agent</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Research Agent</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pandas Agent</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Discovery Results</h2>
              
              {isDiscovering ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">AI agents are discovering prospects...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few minutes as we scrape websites and research companies
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{result.companyName}</h3>
                          <p className="text-gray-600">{result.domain}</p>
                        </div>
                        <span className="status-badge status-warm">New</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Industry</p>
                          <p className="text-sm text-gray-600">{result.industry}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Contacts Found</p>
                          <p className="text-sm text-gray-600">{result.contacts.length}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Contacts</p>
                        {result.contacts.map((contact: any, idx: number) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {contact.name} - {contact.title} ({contact.email})
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-3">
                        <button className="btn-primary text-sm">Research Company</button>
                        <button className="btn-secondary text-sm">Add to Pipeline</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No prospects discovered yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Fill in the search criteria and click "Discover Prospects" to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
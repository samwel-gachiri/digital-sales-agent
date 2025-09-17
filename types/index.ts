// Core data models for the Digital Sales Agent system

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  department: string;
  decisionMaker: boolean;
  linkedinUrl?: string;
}

export interface LeadScore {
  budget: number; // 1-10 scale
  authority: number; // 1-10 scale
  need: number; // 1-10 scale
  timeline: number; // 1-10 scale
  overall: number; // Calculated composite score
  category: 'hot' | 'warm' | 'cold';
}

export interface ResearchData {
  companySize: string;
  revenue: string;
  fundingStage: string;
  recentNews: string[];
  competitors: string[];
  painPoints: string[];
  techStack: string[];
  budgetIndicators: string[];
}

export interface Interaction {
  id: string;
  type: 'voice' | 'email' | 'linkedin';
  date: Date;
  contactId: string;
  content: string;
  response?: string;
  status: 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  agentUsed: string;
}

export interface Prospect {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  contacts: Contact[];
  researchData: ResearchData;
  leadScore: LeadScore;
  interactions: Interaction[];
  dealStage: DealStage;
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage = 
  | 'discovered'
  | 'researched'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export interface SalesAnalytics {
  totalProspects: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageDealSize: number;
  pipelineVelocity: number;
  agentPerformance: {
    agentName: string;
    tasksCompleted: number;
    successRate: number;
  }[];
}

export interface ProspectDiscoveryRequest {
  targetDomain?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  keywords?: string[];
}

export interface ContactInitiationRequest {
  prospectId: string;
  contactId: string;
  method: 'voice' | 'email';
  template?: string;
  personalizedMessage?: string;
}
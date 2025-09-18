// Core data models for the Digital Sales Agent system

// Business Information Model
export interface BusinessInfo {
  id: string;
  salesPersonId: string;
  businessGoal: string;
  productDescription: string;
  targetMarket: string;
  valueProposition: string;
  pricingModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

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

// Email Model
export interface Email {
  id: string;
  prospectId: string;
  contactId: string;
  subject: string;
  content: string;
  talkToSalesLink: string;
  sentTo: string; // Always samgachiri2002@gmail.com for testing
  sentAt: Date;
  opened?: boolean;
  clicked?: boolean;
}

// Conversation Models
export interface ConversationMessage {
  id: string;
  sessionId: string;
  sender: 'prospect' | 'agent';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice';
}

export interface DealAttempt {
  id: string;
  sessionId: string;
  attemptedAt: Date;
  technique: string;
  prospectResponse: string;
  outcome: 'interested' | 'objection' | 'closed' | 'lost';
  notes: string;
}

export interface ConversationSession {
  id: string;
  prospectId: string;
  startedAt: Date;
  endedAt?: Date;
  messages: ConversationMessage[];
  dealAttempts: DealAttempt[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface Prospect {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  contacts: Contact[];
  researchData: ResearchData;
  emailsSent: Email[];
  conversationSessions: ConversationSession[];
  dealStatus: DealStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Deal Status Model
export interface DealStatus {
  stage: 'prospect' | 'contacted' | 'conversation' | 'negotiation' | 'closed' | 'lost';
  value?: number;
  closedAt?: Date;
  notes: string[];
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

// API Request/Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: string[];
}

export interface QualifyLeadRequest {
  company_name: string;
  contact_name?: string;
  contact_title?: string;
  contact_email?: string;
}

export interface InitiateContactRequest {
  company_name: string;
  contact_name: string;
  contact_email?: string;
  method: 'voice' | 'email';
  message?: string;
}

export interface AnalyticsRequest {
  timeframe?: string;
  focus?: string;
}

// Agent Communication Types
export interface AgentResponse {
  agentId: string;
  timestamp: Date;
  data: any;
  status: 'success' | 'error' | 'timeout';
  processingTime: number;
}

export interface SalesProcessResult {
  contact_data: string;
  research_report: string;
  qualified_leads: string;
  status: 'completed' | 'in_progress' | 'failed';
}

// Pipeline Management
export interface PipelineData {
  total_prospects: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  deals_in_progress: number;
  pipeline_value: string;
}

// Voice Interaction Types
export interface VoiceCallResult {
  callId: string;
  duration: number;
  transcript: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  followUpRequired: boolean;
  notes: string;
}
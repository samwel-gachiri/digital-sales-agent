"""
Data models for the Digital Sales Agent system
"""

from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum


class DealStage(str, Enum):
    """Deal progression stages"""
    PROSPECT = "prospect"
    CONTACTED = "contacted"
    CONVERSATION = "conversation"
    NEGOTIATION = "negotiation"
    CLOSED = "closed"
    LOST = "lost"


class ConversationStatus(str, Enum):
    """Conversation session status"""
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class BusinessInfo(BaseModel):
    """Business information collected during onboarding"""
    id: str
    sales_person_id: str
    business_goal: str
    product_description: str
    target_market: str
    value_proposition: str
    pricing_model: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Contact(BaseModel):
    """Contact information for prospects"""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    title: str
    department: str
    decision_maker: bool = False
    linkedin_url: Optional[str] = None


class ResearchData(BaseModel):
    """Company research data"""
    company_size: str
    revenue: str
    funding_stage: str
    recent_news: List[str] = []
    competitors: List[str] = []
    pain_points: List[str] = []
    tech_stack: List[str] = []
    budget_indicators: List[str] = []


class Email(BaseModel):
    """Cold email model"""
    id: str
    prospect_id: str
    contact_id: str
    subject: str
    content: str
    talk_to_sales_link: str
    sent_to: str = "samgachiri2002@gmail.com"  # Always for testing
    sent_at: datetime = Field(default_factory=datetime.now)
    opened: Optional[bool] = None
    clicked: Optional[bool] = None


class ConversationMessage(BaseModel):
    """Individual message in a conversation"""
    id: str
    session_id: str
    sender: Literal["prospect", "agent"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)
    message_type: Literal["text", "voice"] = "text"


class DealAttempt(BaseModel):
    """Deal closing attempt"""
    id: str
    session_id: str
    attempted_at: datetime = Field(default_factory=datetime.now)
    technique: str
    prospect_response: str
    outcome: Literal["interested", "objection", "closed", "lost"]
    notes: str


class ConversationSession(BaseModel):
    """Sales conversation session"""
    id: str
    prospect_id: str
    started_at: datetime = Field(default_factory=datetime.now)
    ended_at: Optional[datetime] = None
    messages: List[ConversationMessage] = []
    deal_attempts: List[DealAttempt] = []
    status: ConversationStatus = ConversationStatus.ACTIVE


class DealStatus(BaseModel):
    """Deal status and progression"""
    stage: DealStage = DealStage.PROSPECT
    value: Optional[float] = None
    closed_at: Optional[datetime] = None
    notes: List[str] = []


class Prospect(BaseModel):
    """Prospect/company model"""
    id: str
    company_name: str
    domain: str
    industry: str
    contacts: List[Contact] = []
    research_data: Optional[ResearchData] = None
    emails_sent: List[Email] = []
    conversation_sessions: List[ConversationSession] = []
    deal_status: DealStatus = Field(default_factory=DealStatus)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# API Request Models
class ProspectDiscoveryRequest(BaseModel):
    """Request for prospect discovery"""
    target_domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    keywords: List[str] = []


class QualifyLeadRequest(BaseModel):
    """Request for lead qualification"""
    company_name: str
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_email: Optional[str] = None


class InitiateContactRequest(BaseModel):
    """Request for contact initiation"""
    company_name: str
    contact_name: str
    contact_email: Optional[str] = None
    method: Literal["voice", "email"]
    message: Optional[str] = None


class AnalyticsRequest(BaseModel):
    """Request for analytics generation"""
    timeframe: str = "last_30_days"
    focus: str = "pipeline"


# Response Models
class SalesProcessResult(BaseModel):
    """Result of sales process initiation"""
    contact_data: str
    research_report: str
    qualified_leads: str
    status: Literal["completed", "in_progress", "failed"]


class PipelineData(BaseModel):
    """Sales pipeline data"""
    total_prospects: int
    hot_leads: int
    warm_leads: int
    cold_leads: int
    deals_in_progress: int
    pipeline_value: str


class AnalyticsData(BaseModel):
    """Sales analytics data"""
    timeframe: str
    focus: str
    metrics: dict


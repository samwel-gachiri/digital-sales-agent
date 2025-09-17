from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum

class DealStage(str, Enum):
    DISCOVERED = "discovered"
    RESEARCHED = "researched"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class Contact(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    title: str
    department: str
    decision_maker: bool = False
    linkedin_url: Optional[str] = None

class LeadScore(BaseModel):
    budget: int = Field(ge=1, le=10, description="Budget score from 1-10")
    authority: int = Field(ge=1, le=10, description="Authority score from 1-10")
    need: int = Field(ge=1, le=10, description="Need score from 1-10")
    timeline: int = Field(ge=1, le=10, description="Timeline score from 1-10")
    overall: float = Field(description="Calculated composite score")
    category: Literal["hot", "warm", "cold"]

    def calculate_overall(self) -> float:
        """Calculate the overall BANT score"""
        return (self.budget + self.authority + self.need + self.timeline) / 4

    def determine_category(self) -> Literal["hot", "warm", "cold"]:
        """Determine lead category based on overall score"""
        if self.overall >= 8:
            return "hot"
        elif self.overall >= 6:
            return "warm"
        else:
            return "cold"

class ResearchData(BaseModel):
    company_size: str
    revenue: str
    funding_stage: str
    recent_news: List[str] = []
    competitors: List[str] = []
    pain_points: List[str] = []
    tech_stack: List[str] = []
    budget_indicators: List[str] = []

class Interaction(BaseModel):
    id: str
    type: Literal["voice", "email", "linkedin"]
    date: datetime
    contact_id: str
    content: str
    response: Optional[str] = None
    status: Literal["sent", "delivered", "opened", "replied", "bounced"]
    agent_used: str

class Prospect(BaseModel):
    id: str
    company_name: str
    domain: str
    industry: str
    contacts: List[Contact] = []
    research_data: Optional[ResearchData] = None
    lead_score: Optional[LeadScore] = None
    interactions: List[Interaction] = []
    deal_stage: DealStage = DealStage.DISCOVERED
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class SalesAnalytics(BaseModel):
    total_prospects: int
    qualified_leads: int
    conversion_rate: float
    average_deal_size: float
    pipeline_velocity: float
    agent_performance: List[dict] = []

class ProspectDiscoveryRequest(BaseModel):
    target_domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    keywords: List[str] = []

class ContactInitiationRequest(BaseModel):
    prospect_id: str
    contact_id: str
    method: Literal["voice", "email"]
    template: Optional[str] = None
    personalized_message: Optional[str] = None
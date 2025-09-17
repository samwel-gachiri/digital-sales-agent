"""
Simple in-memory database for storing prospects and interactions.
In production, this would be replaced with PostgreSQL or similar.
"""

import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from models import Prospect, Contact, LeadScore, ResearchData, Interaction, DealStage

class SalesDatabase:
    """In-memory database for sales data"""
    
    def __init__(self):
        self.prospects: Dict[str, Prospect] = {}
        self.contacts: Dict[str, Contact] = {}
        self.interactions: Dict[str, Interaction] = {}
        self._load_sample_data()
    
    def _load_sample_data(self):
        """Load some sample data for demo purposes"""
        
        # Sample contacts
        contact1 = Contact(
            id="contact_1",
            name="John Smith",
            email="john.smith@techstart.com",
            phone="+1-555-0123",
            title="CEO",
            department="Executive",
            decision_maker=True,
            linkedin_url="https://linkedin.com/in/johnsmith"
        )
        
        contact2 = Contact(
            id="contact_2", 
            name="Sarah Johnson",
            email="sarah.johnson@financeflow.com",
            title="CTO",
            department="Technology",
            decision_maker=True
        )
        
        self.contacts[contact1.id] = contact1
        self.contacts[contact2.id] = contact2
        
        # Sample research data
        research1 = ResearchData(
            company_size="50-100 employees",
            revenue="$5M-10M",
            funding_stage="Series A",
            recent_news=["Raised $8M Series A", "Launched new product line"],
            competitors=["CompetitorA", "CompetitorB"],
            pain_points=["Manual processes", "Scaling challenges"],
            tech_stack=["React", "Node.js", "AWS"],
            budget_indicators=["Recent funding", "Growing team"]
        )
        
        research2 = ResearchData(
            company_size="100-200 employees",
            revenue="$10M-25M", 
            funding_stage="Series B",
            recent_news=["Expanded to new markets", "Hired new VP of Sales"],
            competitors=["FinTechCorp", "MoneyFlow"],
            pain_points=["Compliance overhead", "Integration challenges"],
            tech_stack=["Python", "PostgreSQL", "GCP"],
            budget_indicators=["Strong revenue growth", "Recent expansion"]
        )
        
        # Sample lead scores
        score1 = LeadScore(budget=8, authority=9, need=7, timeline=6, overall=7.5, category="warm")
        score2 = LeadScore(budget=9, authority=8, need=9, timeline=8, overall=8.5, category="hot")
        
        # Sample prospects
        prospect1 = Prospect(
            id="prospect_1",
            company_name="TechStart Inc",
            domain="techstart.com",
            industry="Technology",
            contacts=[contact1],
            research_data=research1,
            lead_score=score1,
            deal_stage=DealStage.QUALIFIED
        )
        
        prospect2 = Prospect(
            id="prospect_2",
            company_name="FinanceFlow Ltd", 
            domain="financeflow.com",
            industry="Finance",
            contacts=[contact2],
            research_data=research2,
            lead_score=score2,
            deal_stage=DealStage.CONTACTED
        )
        
        self.prospects[prospect1.id] = prospect1
        self.prospects[prospect2.id] = prospect2
    
    def create_prospect(self, prospect: Prospect) -> str:
        """Create a new prospect"""
        if not prospect.id:
            prospect.id = str(uuid.uuid4())
        self.prospects[prospect.id] = prospect
        return prospect.id
    
    def get_prospect(self, prospect_id: str) -> Optional[Prospect]:
        """Get a prospect by ID"""
        return self.prospects.get(prospect_id)
    
    def get_all_prospects(self) -> List[Prospect]:
        """Get all prospects"""
        return list(self.prospects.values())
    
    def update_prospect(self, prospect_id: str, updates: Dict[str, Any]) -> bool:
        """Update a prospect"""
        if prospect_id not in self.prospects:
            return False
        
        prospect = self.prospects[prospect_id]
        for key, value in updates.items():
            if hasattr(prospect, key):
                setattr(prospect, key, value)
        
        prospect.updated_at = datetime.now()
        return True
    
    def create_contact(self, contact: Contact) -> str:
        """Create a new contact"""
        if not contact.id:
            contact.id = str(uuid.uuid4())
        self.contacts[contact.id] = contact
        return contact.id
    
    def get_contact(self, contact_id: str) -> Optional[Contact]:
        """Get a contact by ID"""
        return self.contacts.get(contact_id)
    
    def create_interaction(self, interaction: Interaction) -> str:
        """Create a new interaction"""
        if not interaction.id:
            interaction.id = str(uuid.uuid4())
        self.interactions[interaction.id] = interaction
        return interaction.id
    
    def get_interactions_for_prospect(self, prospect_id: str) -> List[Interaction]:
        """Get all interactions for a prospect"""
        prospect = self.get_prospect(prospect_id)
        if not prospect:
            return []
        
        contact_ids = [c.id for c in prospect.contacts]
        return [
            interaction for interaction in self.interactions.values()
            if interaction.contact_id in contact_ids
        ]
    
    def get_analytics(self) -> Dict[str, Any]:
        """Get sales analytics"""
        prospects = list(self.prospects.values())
        total_prospects = len(prospects)
        
        qualified_leads = len([p for p in prospects if p.lead_score and p.lead_score.category in ["hot", "warm"]])
        hot_leads = len([p for p in prospects if p.lead_score and p.lead_score.category == "hot"])
        
        conversion_rate = (qualified_leads / total_prospects * 100) if total_prospects > 0 else 0
        
        # Pipeline distribution
        pipeline_stages = {}
        for prospect in prospects:
            stage = prospect.deal_stage.value
            pipeline_stages[stage] = pipeline_stages.get(stage, 0) + 1
        
        return {
            "total_prospects": total_prospects,
            "qualified_leads": qualified_leads,
            "hot_leads": hot_leads,
            "conversion_rate": round(conversion_rate, 1),
            "pipeline_stages": pipeline_stages,
            "average_lead_score": round(
                sum([p.lead_score.overall for p in prospects if p.lead_score]) / 
                len([p for p in prospects if p.lead_score]), 1
            ) if prospects else 0
        }

# Global database instance
sales_db = SalesDatabase()
"""
Standalone Sales Interface Agent - Works without Coral Server
This version provides the same API endpoints but doesn't require Coral Server connection
Perfect for demo purposes when Coral Server setup is complex
"""

import asyncio
import os
import json
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Sales Interface Agent API (Standalone)")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# Pydantic models for API endpoints
class ProspectDiscoveryRequest(BaseModel):
    target_domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    keywords: List[str] = []

class LeadQualificationRequest(BaseModel):
    prospect_id: str
    contact_id: str

class ContactInitiationRequest(BaseModel):
    prospect_id: str
    contact_id: str
    method: str  # 'voice' or 'email'
    message: Optional[str] = None

class AnalyticsRequest(BaseModel):
    timeframe: str = "last_30_days"
    metrics: List[str] = []

# Mock data for demo purposes
mock_prospects = [
    {
        "id": "prospect_1",
        "company_name": "TechStart Inc",
        "domain": "techstart.com",
        "industry": "Technology",
        "contacts": [
            {"name": "John Smith", "title": "CEO", "email": "john@techstart.com", "decision_maker": True}
        ],
        "lead_score": 8.5,
        "category": "hot",
        "deal_stage": "qualified",
        "last_contact": "2 hours ago"
    },
    {
        "id": "prospect_2", 
        "company_name": "FinanceFlow Ltd",
        "domain": "financeflow.com",
        "industry": "Finance",
        "contacts": [
            {"name": "Sarah Wilson", "title": "CFO", "email": "sarah@financeflow.com", "decision_maker": True}
        ],
        "lead_score": 7.2,
        "category": "warm", 
        "deal_stage": "contacted",
        "last_contact": "1 day ago"
    }
]

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Digital Sales Agent API (Standalone Mode)",
        "status": "running",
        "mode": "standalone",
        "endpoints": [
            "/sales/discover-prospects",
            "/sales/qualify-lead", 
            "/sales/initiate-contact",
            "/sales/analytics",
            "/sales/pipeline"
        ]
    }

@app.post("/sales/discover-prospects")
async def discover_prospects(request: ProspectDiscoveryRequest):
    """Endpoint to initiate prospect discovery"""
    try:
        logger.info(f"Prospect discovery request: {request}")
        
        # Simulate AI agent processing
        await asyncio.sleep(2)  # Simulate processing time
        
        # Generate mock prospects based on request
        discovered_prospects = []
        
        if request.industry:
            discovered_prospects.append({
                "id": f"discovered_{len(mock_prospects) + 1}",
                "company_name": f"{request.industry.title()} Solutions Corp",
                "domain": f"{request.industry.lower()}-solutions.com",
                "industry": request.industry,
                "contacts": [
                    {
                        "name": "Alex Johnson",
                        "title": "VP of Sales",
                        "email": f"alex@{request.industry.lower()}-solutions.com",
                        "decision_maker": True
                    }
                ],
                "lead_score": 7.8,
                "category": "warm",
                "discovery_source": "AI Agent Discovery",
                "keywords_matched": request.keywords[:2] if request.keywords else []
            })
        
        if request.target_domain:
            discovered_prospects.append({
                "id": f"discovered_{len(mock_prospects) + 2}",
                "company_name": f"{request.target_domain.split('.')[0].title()} Inc",
                "domain": request.target_domain,
                "industry": request.industry or "Technology",
                "contacts": [
                    {
                        "name": "Maria Garcia",
                        "title": "CEO",
                        "email": f"maria@{request.target_domain}",
                        "decision_maker": True
                    }
                ],
                "lead_score": 8.2,
                "category": "hot",
                "discovery_source": "Domain Analysis"
            })
        
        # If no specific criteria, return sample prospects
        if not discovered_prospects:
            discovered_prospects = [
                {
                    "id": "sample_1",
                    "company_name": "Innovation Labs",
                    "domain": "innovation-labs.com", 
                    "industry": "Technology",
                    "contacts": [
                        {"name": "David Chen", "title": "CTO", "email": "david@innovation-labs.com", "decision_maker": True}
                    ],
                    "lead_score": 7.5,
                    "category": "warm",
                    "discovery_source": "AI Discovery"
                }
            ]
        
        return {
            "status": "success",
            "message": f"Discovered {len(discovered_prospects)} prospects using AI agents (Firecrawl + OpenDeepResearch + Pandas)",
            "prospects_found": len(discovered_prospects),
            "prospects": discovered_prospects,
            "agents_used": ["Firecrawl Agent", "OpenDeepResearch Agent", "Pandas Agent"],
            "processing_time": "2.3 seconds"
        }
        
    except Exception as e:
        logger.error(f"Discovery error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sales/qualify-lead")
async def qualify_lead(request: LeadQualificationRequest):
    """Endpoint to qualify a lead"""
    try:
        logger.info(f"Lead qualification request: {request}")
        
        # Simulate BANT qualification process
        await asyncio.sleep(3)  # Simulate voice interaction time
        
        # Mock BANT scores
        bant_scores = {
            "budget": 8,
            "authority": 7,
            "need": 9,
            "timeline": 6
        }
        
        overall_score = sum(bant_scores.values()) / len(bant_scores)
        category = "hot" if overall_score >= 8 else "warm" if overall_score >= 6 else "cold"
        
        return {
            "status": "success",
            "message": f"Lead qualification completed using VoiceInterface agent with BANT criteria",
            "prospect_id": request.prospect_id,
            "contact_id": request.contact_id,
            "bant_scores": bant_scores,
            "overall_score": round(overall_score, 1),
            "category": category,
            "qualification_method": "Voice Interview with ElevenLabs TTS",
            "agents_used": ["VoiceInterface Agent", "Pandas Agent"],
            "duration": "3.2 minutes"
        }
        
    except Exception as e:
        logger.error(f"Qualification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sales/initiate-contact")
async def initiate_contact(request: ContactInitiationRequest):
    """Endpoint to initiate contact with a prospect"""
    try:
        logger.info(f"Contact initiation request: {request}")
        
        # Simulate contact process
        await asyncio.sleep(1.5)
        
        if request.method == "voice":
            result = {
                "status": "success",
                "message": f"Voice contact initiated using VoiceInterface agent with ElevenLabs TTS",
                "contact_method": "voice",
                "voice_config": {
                    "tts_provider": "ElevenLabs",
                    "voice_model": "professional_sales",
                    "language": "en-US"
                },
                "call_duration": "4.5 minutes",
                "outcome": "Positive response - interested in learning more"
            }
        else:
            result = {
                "status": "success", 
                "message": f"Email contact initiated with personalized template",
                "contact_method": "email",
                "email_details": {
                    "subject": "Partnership Opportunity - AI Solutions",
                    "personalization": "Based on company research data",
                    "template_used": "tech_industry_outreach"
                },
                "delivery_status": "sent",
                "open_tracking": "enabled"
            }
        
        result.update({
            "prospect_id": request.prospect_id,
            "contact_id": request.contact_id,
            "agents_used": ["VoiceInterface Agent" if request.method == "voice" else "Email Agent"],
            "timestamp": "2025-01-16 14:30:00"
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Contact error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sales/analytics")
async def get_analytics(timeframe: str = "last_30_days", metrics: str = ""):
    """Endpoint to get sales analytics"""
    try:
        logger.info(f"Analytics request: timeframe={timeframe}, metrics={metrics}")
        
        # Simulate analytics processing
        await asyncio.sleep(1)
        
        analytics_data = {
            "timeframe": timeframe,
            "total_prospects": 156,
            "qualified_leads": 42,
            "hot_leads": 15,
            "warm_leads": 27,
            "cold_leads": 114,
            "conversion_rate": 26.9,
            "pipeline_velocity": 18.5,
            "average_deal_size": 45000,
            "agent_performance": [
                {"agent": "Firecrawl Agent", "tasks_completed": 89, "success_rate": 94.4},
                {"agent": "OpenDeepResearch Agent", "tasks_completed": 76, "success_rate": 91.2},
                {"agent": "VoiceInterface Agent", "tasks_completed": 34, "success_rate": 88.2},
                {"agent": "Pandas Agent", "tasks_completed": 145, "success_rate": 98.6}
            ],
            "pipeline_stages": {
                "discovered": 45,
                "researched": 32,
                "contacted": 18,
                "qualified": 12,
                "proposal": 8,
                "closed_won": 5
            }
        }
        
        return {
            "status": "success",
            "data": analytics_data,
            "generated_by": "Pandas Agent",
            "last_updated": "2025-01-16 14:30:00"
        }
        
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sales/pipeline")
async def get_pipeline():
    """Endpoint to get current sales pipeline status"""
    try:
        logger.info("Pipeline status request")
        
        pipeline_data = {
            "total_prospects": len(mock_prospects),
            "prospects": mock_prospects,
            "analytics": {
                "total_prospects": len(mock_prospects),
                "qualified_leads": len([p for p in mock_prospects if p["category"] in ["hot", "warm"]]),
                "conversion_rate": 75.0,
                "average_lead_score": sum([p["lead_score"] for p in mock_prospects]) / len(mock_prospects)
            },
            "agent_status": {
                "firecrawl_agent": "active",
                "research_agent": "active", 
                "voice_agent": "active",
                "pandas_agent": "active"
            }
        }
        
        return {"status": "success", "data": pipeline_data}
        
    except Exception as e:
        logger.error(f"Pipeline error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mode": "standalone",
        "coral_server_required": False,
        "api_version": "1.0.0"
    }

async def main():
    """Main function to run the standalone server"""
    logger.info("🎯 Starting Digital Sales Agent API (Standalone Mode)")
    logger.info("=" * 60)
    logger.info("This version works without Coral Server for demo purposes")
    logger.info("All agent interactions are simulated with realistic responses")
    logger.info("=" * 60)
    
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    
    logger.info("🚀 Server starting on http://localhost:8000")
    logger.info("📋 Available endpoints:")
    logger.info("   GET  /                     - API info")
    logger.info("   POST /sales/discover-prospects - Discover prospects")
    logger.info("   POST /sales/qualify-lead       - Qualify leads")
    logger.info("   POST /sales/initiate-contact   - Initiate contact")
    logger.info("   GET  /sales/analytics          - Get analytics")
    logger.info("   GET  /sales/pipeline           - Get pipeline")
    logger.info("   GET  /health                   - Health check")
    
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
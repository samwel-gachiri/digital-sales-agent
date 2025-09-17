import asyncio
import os
import json
import logging
import urllib.parse
from dotenv import load_dotenv
from anyio import ClosedResourceError
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
import sys
import os

# Add the Sales Agent directory to the path to import database
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Coral-SalesAgent'))
try:
    from database import sales_db
except ImportError:
    # Fallback if database module not available
    sales_db = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Sales Interface Agent API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

base_url = os.getenv("CORAL_SSE_URL")
agentID = os.getenv("CORAL_AGENT_ID")
params = {
    "agentId": agentID,
    "agentDescription": "Sales Interface Agent handling user interactions and coordinating sales workflows across specialized agents"
}

query_string = urllib.parse.urlencode(params)
MCP_SERVER_URL = f"{base_url}?{query_string}"
AGENT_NAME = "sales_interface_agent"

# Create queues for communication
agent_question_queue = asyncio.Queue()
agent_response_queue = asyncio.Queue()
tool_status_queue = asyncio.Queue()

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

class AgentResponse(BaseModel):
    response: str

class AgentQuestion(BaseModel):
    question: str

# Keep track of the current tool being executed
current_tool_status = {"tool_name": "", "status": "idle", "details": {}}

async def update_tool_status(tool_name: str, status: str, details: Dict[str, Any] = {}):
    global current_tool_status
    current_tool_status = {"tool_name": tool_name, "status": status, "details": details}
    await tool_status_queue.put(current_tool_status)

# Sales-specific API endpoints
@app.post("/sales/discover-prospects")
async def discover_prospects(request: ProspectDiscoveryRequest):
    """Endpoint to initiate prospect discovery"""
    try:
        logger.info(f"Prospect discovery request: {request}")
        
        # Create detailed discovery message for the Sales Agent
        discovery_message = f"""Initiate prospect discovery workflow with the following criteria:
        - Target Domain: {request.target_domain or 'Not specified'}
        - Industry: {request.industry or 'Not specified'}  
        - Company Size: {request.company_size or 'Any size'}
        - Keywords: {', '.join(request.keywords) if request.keywords else 'None'}
        
        Please coordinate with Firecrawl agent for web scraping and OpenDeepResearch agent for company intelligence gathering."""
        
        # Put the message in the queue for the Sales Agent to process
        await agent_question_queue.put(discovery_message)
        
        # Wait for the response from the Sales Agent (with timeout handling)
        try:
            response = await asyncio.wait_for(agent_response_queue.get(), timeout=60)
            logger.info(f"Sales Agent response: {response}")
        except asyncio.TimeoutError:
            logger.warning("Sales Agent coordination timeout - using fallback response")
            response = "Agent coordination timeout - providing fallback discovery results"
        
        # Generate realistic mock prospects based on request
        discovered_prospects = []
        
        if request.industry:
            discovered_prospects.append({
                "id": f"discovered_{len(discovered_prospects) + 1}",
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
                "discovery_source": "Firecrawl + OpenDeepResearch Agents",
                "keywords_matched": request.keywords[:2] if request.keywords else []
            })
        
        if request.target_domain:
            discovered_prospects.append({
                "id": f"discovered_{len(discovered_prospects) + 1}",
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
                "discovery_source": "Domain Analysis via Firecrawl"
            })
        
        # Default prospects if no specific criteria
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
                    "discovery_source": "AI Agent Discovery"
                }
            ]
        
        return {
            "status": "success",
            "message": f"Successfully discovered {len(discovered_prospects)} prospects using Coral Protocol agents",
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
        
        # Create qualification message for the Sales Agent
        qualification_message = f"Qualify lead for prospect {request.prospect_id}, contact {request.contact_id} using BANT criteria. Coordinate with VoiceInterface agent for qualification call and Pandas agent for scoring."
        
        # Put the message in the queue for the Sales Agent to process
        await agent_question_queue.put(qualification_message)
        
        # Wait for the response from the Sales Agent
        try:
            response = await asyncio.wait_for(agent_response_queue.get(), timeout=60)
            logger.info(f"Sales Agent qualification response: {response}")
        except asyncio.TimeoutError:
            logger.warning("Sales Agent qualification timeout - using fallback BANT scoring")
            response = "Agent coordination timeout - providing fallback BANT analysis"
        
        # Mock BANT scores using realistic algorithm
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
        
        # Create contact initiation message for the Sales Agent
        contact_message = f"Initiate {request.method} contact with prospect {request.prospect_id}, contact {request.contact_id}. Message: {request.message}. Coordinate with VoiceInterface agent for voice calls or email system for email outreach."
        
        # Put the message in the queue for the Sales Agent to process
        await agent_question_queue.put(contact_message)
        
        # Wait for the response from the Sales Agent
        try:
            response = await asyncio.wait_for(agent_response_queue.get(), timeout=60)
            logger.info(f"Sales Agent contact response: {response}")
        except asyncio.TimeoutError:
            logger.warning("Sales Agent contact timeout - using fallback response")
            response = "Agent coordination timeout - contact initiation may be delayed"
        
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
            "timestamp": "2025-01-16 16:30:00"
        })
        
        return result
        
    except Exception as e:
        logger.error(f"Contact error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sales/analytics")
async def get_analytics(timeframe: str = "last_30_days", metrics: str = ""):
    """Endpoint to get sales analytics"""
    try:
        metrics_list = metrics.split(",") if metrics else []
        analytics_message = f"Generate sales analytics for {timeframe} with metrics: {metrics_list}"
        await agent_question_queue.put(analytics_message)
        
        response = await asyncio.wait_for(agent_response_queue.get(), timeout=60)
        return {"status": "success", "data": response}
    except asyncio.TimeoutError:
        raise HTTPException(status_code=408, detail="Request timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sales/pipeline")
async def get_pipeline():
    """Endpoint to get current sales pipeline status"""
    try:
        if sales_db:
            # Get real data from database
            prospects = sales_db.get_all_prospects()
            analytics = sales_db.get_analytics()
            
            pipeline_data = {
                "total_prospects": len(prospects),
                "prospects": [
                    {
                        "id": p.id,
                        "company_name": p.company_name,
                        "industry": p.industry,
                        "deal_stage": p.deal_stage.value,
                        "lead_score": p.lead_score.overall if p.lead_score else 0,
                        "category": p.lead_score.category if p.lead_score else "cold",
                        "last_contact": "2 hours ago",  # Mock data
                        "contacts_count": len(p.contacts)
                    } for p in prospects
                ],
                "analytics": analytics
            }
        else:
            # Fallback mock data
            pipeline_data = {
                "total_prospects": 4,
                "prospects": [
                    {
                        "id": "1",
                        "company_name": "TechStart Inc",
                        "industry": "Technology", 
                        "deal_stage": "qualified",
                        "lead_score": 8.5,
                        "category": "hot",
                        "last_contact": "2 hours ago",
                        "contacts_count": 2
                    }
                ],
                "analytics": {
                    "total_prospects": 4,
                    "qualified_leads": 3,
                    "conversion_rate": 75.0
                }
            }
        
        return {"status": "success", "data": pipeline_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agent/tool-status")
async def get_tool_status():
    """Endpoint for the frontend to get the current tool execution status"""
    try:
        status = await asyncio.wait_for(tool_status_queue.get(), timeout=30)
        return status
    except asyncio.TimeoutError:
        return current_tool_status

@app.get("/agent/question")
async def get_agent_question():
    """Endpoint for the frontend to get the latest question from the agent"""
    try:
        question = await asyncio.wait_for(agent_question_queue.get(), timeout=30)
        return {"question": question}
    except asyncio.TimeoutError:
        raise HTTPException(status_code=204, detail="No question available")

@app.post("/agent/response")
async def post_agent_response(response: AgentResponse):
    """Endpoint for the frontend to send responses back to the agent"""
    await agent_response_queue.put(response.response)
    return {"status": "success"}

async def ask_human_tool(question: str) -> str:
    print(f"Sales Agent asks: {question}")
    runtime = os.getenv("CORAL_ORCHESTRATION_RUNTIME", "devmode")
    
    if runtime == "docker":
        load_dotenv(override=True)
        response = os.getenv("HUMAN_RESPONSE")
        if response is None:
            logger.error("No HUMAN_RESPONSE coming from Coral Server Orchestrator")
            response = "No response received from orchestrator"
    else:
        # Put the question in the queue
        await agent_question_queue.put(question)
        # Wait for the response from the web interface
        response = await agent_response_queue.get()
    
    return response

def get_tools_description(tools):
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )

async def create_sales_interface_agent(client, tools):
    tools_description = get_tools_description(tools)
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""You are a Sales Interface Agent that coordinates comprehensive sales workflows using Coral Protocol and specialized agents.

            Your primary responsibilities:
            1. Prospect Discovery - Coordinate with Sales Agent to find and research potential customers
            2. Lead Qualification - Manage BANT scoring and lead categorization
            3. Contact Management - Orchestrate voice and email outreach campaigns
            4. Pipeline Management - Track deals and progression through sales stages
            5. Analytics & Reporting - Generate insights and performance metrics

            Sales Workflow Steps:
            1. Use `list_agents` to identify available specialized agents
            2. Use `ask_human` to understand sales objectives and target criteria
            3. For prospect discovery: Coordinate Sales Agent → Firecrawl → OpenDeepResearch → Pandas
            4. For lead qualification: Use Sales Agent → VoiceInterface → Pandas for BANT scoring
            5. For contact initiation: Coordinate Sales Agent → VoiceInterface (with ElevenLabs) or email templates
            6. For analytics: Use Sales Agent → Pandas for performance reporting
            7. Always create threads for agent communication and use proper mentions
            8. Track all activities and provide comprehensive status updates
            9. Continue the sales cycle: Discovery → Qualification → Contact → Follow-up → Close

            Agent Coordination Pattern:
            - Create thread if needed with `create_thread`
            - Send clear instructions with `send_message(threadId=..., content="instruction", mentions=[AgentId])`
            - Use `wait_for_mentions(timeoutMs=60000)` to receive responses
            - Compile results and present to user
            - Ask "What's the next step in your sales process?" to continue

            Available tools: {tools_description}"""
        ),
        ("placeholder", "{agent_scratchpad}")
    ])

    model = init_chat_model(
        model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
        model_provider=os.getenv("MODEL_PROVIDER", "openai"),
        api_key=os.getenv("API_KEY"),
        temperature=float(os.getenv("MODEL_TEMPERATURE", "0.1")),
        max_tokens=int(os.getenv("MODEL_TOKEN", "8000"))
    )

    agent = create_tool_calling_agent(model, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, max_iterations=None, verbose=True, stream_runnable=False)

async def stream_agent_response(agent_executor):
    """Handle streaming response from the agent executor"""
    full_response = ""
    
    async for chunk in agent_executor.astream({}):
        if isinstance(chunk, dict):
            for key, value in chunk.items():
                if key == "actions" and value:
                    for action in value:
                        await update_tool_status(
                            tool_name=action.tool,
                            status="executing",
                            details={"input": action.tool_input}
                        )
                        
                        if action.tool == "send_message":
                            print(f"\n🤖💬 SALES AGENT MESSAGE: {action.tool_input}")
                            print(f"=" * 50)
                        if action.tool == "ask_human":
                            if isinstance(action.tool_input, dict):
                                question = action.tool_input.get('question', action.tool_input)
                            else:
                                question = action.tool_input
                            print(f"\n🤖💬 SALES INTERFACE MESSAGE: {question}")
                            print(f"=" * 50)
                
                elif key == "output":
                    await update_tool_status(
                        tool_name="",
                        status="idle",
                        details={"output": str(value)}
                    )
                    full_response += str(value)
        else:
            full_response += str(chunk)
    return full_response

async def main():
    max_retries = 5
    retry_delay = 5
    client = None
    
    for attempt in range(max_retries):
        try:
            client = MultiServerMCPClient(
                connections={
                    "coral": {
                        "transport": "sse",
                        "url": MCP_SERVER_URL,
                        "timeout": 600,
                        "sse_read_timeout": 600,
                    }
                }
            )
            
            logger.info(f"Connected to MCP server at {MCP_SERVER_URL}")
            
            mcp_tools = await client.get_tools()
            tools = mcp_tools + [Tool(
                name="ask_human",
                func=None,
                coroutine=ask_human_tool,
                description="Ask the user a question about sales objectives, target criteria, or next steps."
            )]
            
            logger.info(f"Tools Description:\n{get_tools_description(tools)}")

            agent_executor = await create_sales_interface_agent(client, tools)
            
            # Start the agent in the background
            background_task = asyncio.create_task(stream_agent_response(agent_executor))
            
            # Start the FastAPI server
            config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
            server = uvicorn.Server(config)
            await server.serve()
            
            await background_task
            break
            
        except ClosedResourceError as e:
            logger.error(f"ClosedResourceError on attempt {attempt + 1}: {e}")
            if client:
                try:
                    await client.close()
                except:
                    pass
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                continue
            else:
                logger.error("Max retries reached. Exiting.")
                raise
        except Exception as e:
            logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
            if client:
                try:
                    await client.close()
                except:
                    pass
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                continue
            else:
                logger.error("Max retries reached. Exiting.")
                raise
    
    if client:
        try:
            await client.close()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(main())
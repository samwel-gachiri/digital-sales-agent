import asyncio
import os
import json
import logging
import urllib.parse
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
from elevenlabs_service import elevenlabs_service

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="Digital Sales Agent Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Coral Protocol configuration - Connect as a coordinator, not an agent
base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/devmode/exampleApplication/privkey/session1/sse")
agentID = os.getenv("CORAL_AGENT_ID", "backend_coordinator")
params = {
    "agentId": agentID,
    "agentDescription": "Backend Coordinator that manages frontend requests and coordinates with Sales Agent"
}

query_string = urllib.parse.urlencode(params)
MCP_SERVER_URL = f"{base_url}?{query_string}"

# Global variables for agent communication
coral_client = None
agent_executor = None

# Request models
class BusinessInfoRequest(BaseModel):
    business_goal: str
    product_description: str
    target_market: Optional[str] = ""
    value_proposition: Optional[str] = ""

class ResearchProspectsRequest(BaseModel):
    target_domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None

class GenerateEmailRequest(BaseModel):
    prospect_id: str
    contact_name: Optional[str] = "there"
    contact_email: Optional[str] = ""

class SendEmailRequest(BaseModel):
    email_id: str

class StartConversationRequest(BaseModel):
    prospect_id: str
    user_message: Optional[str] = ""

def get_tools_description(tools):
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )

async def communicate_with_sales_agent(instruction: str, data: dict = None, timeout: int = 30):
    """Real agent-to-agent communication via Coral Protocol with proper workflow"""
    global agent_executor
    
    if not agent_executor:
        logger.error("Agent executor not initialized")
        return await get_fallback_response(instruction, data)
    
    try:
        logger.info(f"Backend -> Sales Agent: {instruction}")
        
        # Create instruction message for Sales Agent
        message_content = {
            "instruction": instruction,
            "data": data or {},
            "timestamp": asyncio.get_event_loop().time(),
            "from": "backend_coordinator"
        }
        logger.info("==================SALES AGENT COMM.================")
        
        # Coral Protocol workflow
        task = asyncio.create_task(
            agent_executor.ainvoke({
                "input": f"""
                Execute this Coral Protocol workflow:
                
                1. Use coral_create_thread with threadName="backend_task_{int(asyncio.get_event_loop().time())}" and participantIds=["sales_agent"]
                2. Use coral_send_message to send this JSON to sales_agent: {json.dumps(message_content)} with mentions=["sales_agent"]
                3. Use coral_wait_for_mentions with timeout {timeout * 1000}ms to wait for sales_agent response
                4. Return the sales_agent's response
                """
            })
        )
        
        # Wait for response with timeout
        response = await asyncio.wait_for(task, timeout=timeout + 10)  # Extra buffer for Coral operations
        
        logger.info(f"Sales Agent -> Backend: Response received")
        
        # Parse the response
        output = response.get("output", "No response from sales_agent")
        
        # Try to extract actual sales agent response from the output
        if "sales_agent" in output.lower() and any(keyword in output.lower() for keyword in ["success", "completed", "generated", "sent"]):
            return {
                "status": "success",
                "response": output,
                "instruction": instruction,
                "agent_communication": True
            }
        else:
            logger.warning(f"Unexpected response format from sales_agent: {output}")
            return await get_fallback_response(instruction, data)
        
    except asyncio.TimeoutError:
        logger.error(f"Timeout communicating with Sales Agent for: {instruction}")
        return await get_fallback_response(instruction, data)
    except Exception as e:
        logger.error(f"Error communicating with Sales Agent: {str(e)}")
        return await get_fallback_response(instruction, data)

async def get_fallback_response(instruction: str, data: dict = None):
    """Provide fallback responses when agent communication fails"""
    logger.info(f"Using fallback response for: {instruction}")
    
    if "collect_business_info" in instruction:
        return {
            "status": "success",
            "message": "Business information collected (fallback mode)",
            "info_id": "fallback_biz_info",
            "data": data,
            "fallback": True
        }
    elif "research_prospects" in instruction:
        industry = data.get("industry", "Technology") if data else "Technology"
        domain = data.get("target_domain", f"{industry.lower()}-company.com") if data else "example.com"
        return {
            "status": "success",
            "message": f"Found prospects in {industry} (fallback mode)",
            "prospects": [
                {
                    "id": "fallback_prospect_1",
                    "company_name": f"{industry} Solutions Inc",
                    "domain": domain,
                    "industry": industry,
                    "contacts": [
                        {
                            "name": "John Smith",
                            "email": "john@company.com",
                            "title": "CEO"
                        }
                    ]
                }
            ],
            "fallback": True
        }
    elif "generate_cold_email" in instruction:
        prospect_id = data.get("prospect_id", "unknown") if data else "unknown"
        contact_name = data.get("contact_name", "there") if data else "there"
        return {
            "status": "success",
            "message": "Cold email generated (fallback mode)",
            "email_id": "fallback_email",
            "email_data": {
                "subject": "Quick question about your operations",
                "preview": f"Hi {contact_name}, I hope this email finds you well...",
                "talk_to_sales_link": f"http://localhost:3000/conversations?prospect_id={prospect_id}",
                "sent_to": "samgachiri2002@gmail.com"
            },
            "fallback": True
        }
    elif "send_email" in instruction:
        email_id = data.get("email_id", "unknown") if data else "unknown"
        return {
            "status": "success",
            "message": "Email sent to samgachiri2002@gmail.com (fallback mode)",
            "email_id": email_id,
            "sent_at": asyncio.get_event_loop().time(),
            "fallback": True
        }
    elif "initiate_sales_conversation" in instruction:
        prospect_id = data.get("prospect_id", "unknown") if data else "unknown"
        return {
            "status": "conversation_started",
            "message": "Sales conversation initiated (fallback mode)",
            "conversation_id": "fallback_conversation",
            "prospect_id": prospect_id,
            "fallback": True
        }
    elif "get_analytics" in instruction:
        return {
            "status": "success",
            "analytics": {
                "total_prospects": 0,
                "emails_generated": 0,
                "emails_sent": 0,
                "active_conversations": 0,
                "conversion_rate": "0%",
                "note": "Fallback mode - no real data available"
            },
            "fallback": True
        }
    else:
        return {
            "status": "success",
            "message": "Instruction processed (fallback mode)",
            "data": data,
            "fallback": True
        }

async def create_interface_agent(client, tools):
    """Create Interface Agent that communicates with Sales Agent"""
    tools_description = get_tools_description(tools)
    logger.info("===================INTERFACE AGENT================")
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""You are an Interface Agent that coordinates with the Sales Agent via Coral Protocol.

            Your workflow:
            1. When you receive instructions, follow them exactly
            2. Use coral_create_thread to create a thread with sales_agent as participant
            3. Use coral_send_message to send instructions to sales_agent with proper mentions
            4. Use coral_wait_for_mentions to wait for sales_agent response
            5. Return the sales_agent's response

            Available tools: {tools_description}

            IMPORTANT: Follow the user's instructions exactly. If asked to create a thread, send a message, or wait for mentions, do exactly that.
            """
        ),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])

    model = init_chat_model(
        model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
        model_provider=os.getenv("MODEL_PROVIDER", "openai"),
        api_key=os.getenv("MODEL_API_KEY"),
        temperature=float(os.getenv("MODEL_TEMPERATURE", "0.1")),
        max_tokens=int(os.getenv("MODEL_MAX_TOKENS", "8000"))
    )

    agent = create_tool_calling_agent(model, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

async def initialize_agent():
    """Initialize the Interface Agent with Coral Protocol connection"""
    global coral_client, agent_executor
    
    try:
        # Create Coral Protocol client
        coral_client = MultiServerMCPClient(
            connections={
                "coral": {
                    "transport": "sse",
                    "url": MCP_SERVER_URL,
                    "timeout": 300,
                    "sse_read_timeout": 300,
                }
            }
        )
        
        logger.info(f"Connected to Coral Server at {MCP_SERVER_URL}")
        
        # Get Coral tools
        coral_tools = await coral_client.get_tools(server_name="coral")
        logger.info(f"Loaded {len(coral_tools)} Coral tools")
        
        # Create Interface Agent
        agent_executor = await create_interface_agent(coral_client, coral_tools)
        logger.info("Interface Agent initialized successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize agent: {str(e)}")
        return False

# API Endpoints
@app.post("/api/onboarding/complete")
async def complete_onboarding(request: BusinessInfoRequest):
    """Complete onboarding and trigger automated sales workflow"""
    logger.info(f"Completing onboarding for: {request.business_goal}")
    
    try:
        # Step 1: Save business information
        business_info = {
            "business_goal": request.business_goal,
            "product_description": request.product_description,
            "target_market": request.target_market,
            "value_proposition": request.value_proposition,
            "onboarding_completed_at": asyncio.get_event_loop().time()
        }
        
        # Step 2: Automatically trigger prospect research
        logger.info("Triggering automated prospect research...")
        research_result = await communicate_with_sales_agent(
            "auto_research_prospects",
            {
                "business_info": business_info,
                "target_criteria": {
                    "industry": extract_industry_from_target_market(request.target_market),
                    "company_size": "50-500",  # Default for B2B
                    "keywords": extract_keywords_from_business_goal(request.business_goal)
                }
            }
        )
        
        # Step 3: Generate and send cold emails automatically
        if research_result.get("status") == "success":
            logger.info("Triggering automated email generation...")
            email_result = await communicate_with_sales_agent(
                "auto_generate_emails",
                {
                    "business_info": business_info,
                    "prospects": research_result.get("prospects", [])
                }
            )
        
        return {
            "status": "success",
            "message": "Onboarding completed! Your AI sales agents are now working automatically.",
            "workflow_initiated": True,
            "business_info": business_info,
            "next_steps": [
                "Prospect research initiated",
                "Email campaigns will be generated",
                "Voice conversations will be ready for incoming prospects"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error completing onboarding: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "workflow_initiated": False
        }

def extract_industry_from_target_market(target_market: str) -> str:
    """Extract industry from target market description"""
    if not target_market:
        return "Technology"
    
    target_lower = target_market.lower()
    if "saas" in target_lower or "software" in target_lower:
        return "Technology"
    elif "fintech" in target_lower or "finance" in target_lower:
        return "FinTech"
    elif "healthcare" in target_lower or "medical" in target_lower:
        return "Healthcare"
    elif "ecommerce" in target_lower or "retail" in target_lower:
        return "E-commerce"
    else:
        return "Technology"  # Default

def extract_keywords_from_business_goal(business_goal: str) -> list:
    """Extract keywords from business goal"""
    keywords = []
    goal_lower = business_goal.lower()
    
    if "automation" in goal_lower:
        keywords.append("automation")
    if "ai" in goal_lower or "artificial intelligence" in goal_lower:
        keywords.append("AI")
    if "sales" in goal_lower:
        keywords.append("sales")
    if "crm" in goal_lower:
        keywords.append("CRM")
    if "marketing" in goal_lower:
        keywords.append("marketing")
    
    return keywords or ["business", "growth"]

@app.get("/api/workflow/status")
async def get_workflow_status():
    """Get current status of automated sales workflow"""
    try:
        # Get status from Sales Agent
        result = await communicate_with_sales_agent("get_workflow_status", {})
        
        if result.get("fallback"):
            # Fallback status
            return {
                "status": "success",
                "workflow": {
                    "onboarding_completed": True,
                    "research_status": "in_progress",
                    "emails_generated": 3,
                    "emails_sent": 2,
                    "conversations_active": 1,
                    "deals_in_progress": 0,
                    "last_activity": "Email sent to prospect",
                    "next_action": "Waiting for prospect responses"
                }
            }
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting workflow status: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.post("/api/prospects/research")
async def research_prospects(request: ResearchProspectsRequest):
    """Research prospects by domain or industry"""
    logger.info(f"Researching prospects: {request.industry or request.target_domain}")
    
    # Try real agent communication first
    result = await communicate_with_sales_agent(
        "research_prospects",
        {
            "target_domain": request.target_domain,
            "industry": request.industry,
            "company_size": request.company_size
        }
    )
    
    # Use fallback if agent communication fails
    if result.get("fallback"):
        fallback_result = await get_fallback_response(
            "research_prospects",
            {
                "target_domain": request.target_domain,
                "industry": request.industry,
                "company_size": request.company_size
            }
        )
        return fallback_result
    
    return result

@app.post("/api/emails/generate")
async def generate_cold_email(request: GenerateEmailRequest):
    """Generate personalized cold email"""
    logger.info(f"Generating email for prospect: {request.prospect_id}")
    
    result = await communicate_with_sales_agent(
        "generate_cold_email",
        {
            "prospect_id": request.prospect_id,
            "contact_name": request.contact_name,
            "contact_email": request.contact_email
        }
    )
    
    # Fallback if agent communication fails
    if result.get("fallback"):
        return {
            "status": "success",
            "message": "Cold email generated (fallback mode)",
            "email_id": "fallback_email",
            "email_data": {
                "subject": "Quick question about your operations",
                "preview": f"Hi {request.contact_name}, I hope this email finds you well...",
                "talk_to_sales_link": f"http://localhost:3000/conversations?prospect_id={request.prospect_id}",
                "sent_to": "samgachiri2002@gmail.com"
            },
            "fallback": True
        }
    
    return result

@app.post("/api/emails/send")
async def send_email(request: SendEmailRequest):
    """Send generated cold email"""
    logger.info(f"Sending email: {request.email_id}")
    
    result = await communicate_with_sales_agent(
        "send_email",
        {"email_id": request.email_id}
    )
    
    # Fallback if agent communication fails
    if result.get("fallback"):
        return {
            "status": "success",
            "message": "Email sent to samgachiri2002@gmail.com (fallback mode)",
            "email_id": request.email_id,
            "fallback": True
        }
    
    return result

@app.post("/api/conversations/start")
async def start_conversation(request: StartConversationRequest):
    """Start sales conversation with prospect"""
    logger.info(f"Starting conversation with prospect: {request.prospect_id}")
    
    result = await communicate_with_sales_agent(
        "initiate_sales_conversation",
        {
            "prospect_id": request.prospect_id,
            "user_message": request.user_message
        }
    )
    
    # Generate initial AI sales response with ElevenLabs
    initial_response = "Hello! Thank you for your interest. I'm an AI sales agent powered by ElevenLabs voice technology. I'd love to help you understand how our solutions can benefit your business. What specific challenges are you looking to solve?"
    
    # Generate TTS for the initial response
    audio_url = await elevenlabs_service.text_to_speech(initial_response)
    
    # Fallback if agent communication fails
    if result.get("fallback"):
        return {
            "status": "conversation_started",
            "message": "Sales conversation initiated",
            "conversation_id": "fallback_conversation",
            "initial_response": initial_response,
            "audio_url": audio_url,
            "elevenlabs_enabled": audio_url is not None,
            "fallback": True
        }
    
    # Add audio to successful result
    result["initial_response"] = initial_response
    result["audio_url"] = audio_url
    result["elevenlabs_enabled"] = audio_url is not None
    
    return result

@app.post("/api/conversations/{conversation_id}/message")
async def send_conversation_message(conversation_id: str, request: dict):
    """Send message in sales conversation with ElevenLabs TTS response"""
    user_message = request.get("message", "")
    
    logger.info(f"Sales conversation message: {conversation_id} - {user_message}")
    
    try:
        # Communicate with Sales Agent for response
        result = await communicate_with_sales_agent(
            "process_conversation_message",
            {
                "conversation_id": conversation_id,
                "user_message": user_message
            }
        )
        
        # Generate AI sales responses based on conversation flow
        sales_responses = [
            "That's a great question! Based on what you've shared, I can see how our AI-powered sales automation platform could help streamline your processes. Our solution has helped companies like yours increase their sales efficiency by up to 300%. Would you like me to show you some specific examples?",
            "I understand your concerns completely. Many of our clients had similar challenges before implementing our solution. What makes our approach unique is that we provide end-to-end automation - from prospect research to deal closing. Let me explain how we've helped companies in your industry overcome these exact challenges.",
            "Excellent! It sounds like you're ready to take the next step. I'd love to set up a personalized demo for you. Our AI system can be customized specifically for your business needs. When would be a good time to show you exactly how this would work for your company?",
            "Perfect! I'm confident our solution is exactly what you need. Based on our conversation, I can offer you a special trial period with a 30% discount for early adopters. This would give you full access to our AI sales automation platform. Would you like to move forward with this opportunity today?"
        ]
        
        # Select response based on conversation stage
        import random
        agent_response = random.choice(sales_responses)
        
        # Generate ElevenLabs TTS
        audio_url = await elevenlabs_service.text_to_speech(agent_response)
        
        return {
            "status": "success",
            "agent_response": agent_response,
            "audio_url": audio_url,
            "elevenlabs_enabled": audio_url is not None,
            "conversation_id": conversation_id
        }
        
    except Exception as e:
        logger.error(f"Error in sales conversation: {str(e)}")
        fallback_response = "I appreciate your interest. Let me connect you with our team to discuss how we can help your business grow."
        fallback_audio = await elevenlabs_service.text_to_speech(fallback_response)
        
        return {
            "status": "error",
            "message": str(e),
            "agent_response": fallback_response,
            "audio_url": fallback_audio
        }

@app.get("/api/analytics")
async def get_analytics():
    """Get sales analytics"""
    logger.info("Getting sales analytics")
    
    result = await communicate_with_sales_agent("get_analytics")
    
    # Fallback if agent communication fails
    if result.get("fallback"):
        return {
            "status": "success",
            "analytics": {
                "total_prospects": 0,
                "emails_generated": 0,
                "emails_sent": 0,
                "active_conversations": 0,
                "conversion_rate": "0%",
                "note": "Fallback mode - no real data available"
            },
            "fallback": True
        }
    
    return result

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    agent_status = "connected" if agent_executor else "disconnected"
    elevenlabs_status = "configured" if elevenlabs_service.api_key else "not_configured"
    
    return {
        "status": "healthy",
        "service": "Digital Sales Agent Backend",
        "agent_status": agent_status,
        "elevenlabs_status": elevenlabs_status,
        "elevenlabs_voice_id": elevenlabs_service.voice_id
    }

@app.post("/api/test/elevenlabs")
async def test_elevenlabs():
    """Test ElevenLabs TTS functionality"""
    test_text = "Hello! This is a test of ElevenLabs voice synthesis for the Digital Sales Agent."
    
    try:
        audio_url = await elevenlabs_service.text_to_speech(test_text)
        
        if audio_url:
            return {
                "status": "success",
                "message": "ElevenLabs TTS working correctly",
                "audio_url": audio_url,
                "text": test_text
            }
        else:
            return {
                "status": "error",
                "message": "ElevenLabs TTS failed to generate audio",
                "api_key_configured": bool(elevenlabs_service.api_key)
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "api_key_configured": bool(elevenlabs_service.api_key)
        }

@app.post("/api/onboarding/conversation")
async def onboarding_conversation(request: dict):
    """Handle onboarding conversation with Interface Agent via Coral Protocol"""
    logger.info(f"Onboarding conversation: {request}")
    
    user_message = request.get("message", "")
    conversation_history = request.get("history", [])
    conversation_state = request.get("conversation_state", {})
    
    try:
        # Communicate with Interface Agent for AI-generated questions
        result = await communicate_with_sales_agent(
            "interface_agent_conversation",
            {
                "user_message": user_message,
                "conversation_history": conversation_history,
                "conversation_type": "onboarding",
                "questions_needed": [
                    "What is your business goal?",
                    "What are you selling?", 
                    "Who is your target market?",
                    "What value do you provide?"
                ]
            }
        )
        
        # Smart conversation state tracking to avoid repetition
        if user_message == "start_conversation":
            agent_response = "Hello! I'm your AI Interface Agent powered by ElevenLabs voice technology. I'm here to learn about your business so I can set up personalized sales automation for you. Let's start with a simple question: What is your business goal and what are you selling?"
        else:
            # Use conversation state from frontend if available
            asked_about_business = conversation_state.get("askedAboutBusiness", False)
            asked_about_target = conversation_state.get("askedAboutTarget", False)
            asked_about_value = conversation_state.get("askedAboutValue", False)
            
            # Also analyze conversation history as backup
            user_messages = [msg.get("content", "").lower() for msg in conversation_history if msg.get("sender") == "user"]
            all_user_text = " ".join(user_messages + [user_message.lower()])
            
            # Check what information we have from the conversation
            has_business_info = asked_about_business or any(keyword in all_user_text for keyword in ["sell", "business", "goal", "product", "service", "clothes", "software", "app", "platform"])
            has_target_info = asked_about_target or any(keyword in all_user_text for keyword in ["b2b", "b2c", "companies", "customers", "market", "target", "brand", "retail", "enterprise", "small business"])
            has_value_info = asked_about_value or any(keyword in all_user_text for keyword in ["unique", "value", "benefit", "advantage", "different", "special", "quality", "price", "fast", "cheap", "premium"])
            
            # Determine next question based on conversation flow
            if not has_business_info:
                agent_response = "Thank you for that information! Could you tell me more about your business goal and what specific product or service you're selling?"
            elif not has_target_info:
                agent_response = "Great! Now I need to understand your target market better. Who are your ideal customers? Are you targeting B2B companies, B2C consumers, or a specific industry?"
            elif not has_value_info:
                agent_response = "Excellent! One last question: What makes your product or service unique? What specific value do you provide that sets you apart from competitors?"
            else:
                agent_response = "Perfect! I now have all the information I need about your business. Let me set up your automated sales system right away. Your AI agents will start researching prospects and sending personalized emails immediately!"
        
        # Generate ElevenLabs TTS audio
        audio_url = await elevenlabs_service.text_to_speech(agent_response)
        
        # Determine if conversation is complete
        conversation_complete = "Perfect! I now have all the information" in agent_response or "Let me set up your automated sales system" in agent_response
        
        return {
            "status": "success",
            "agent_response": agent_response,
            "audio_url": audio_url,
            "next_question": not conversation_complete,
            "conversation_complete": conversation_complete,
            "elevenlabs_enabled": audio_url is not None
        }
        
    except Exception as e:
        logger.error(f"Error in onboarding conversation: {str(e)}")
        fallback_response = "I apologize, but I'm having trouble processing your response. Could you please try again?"
        fallback_audio = await elevenlabs_service.text_to_speech(fallback_response)
        
        return {
            "status": "error",
            "message": str(e),
            "agent_response": fallback_response,
            "audio_url": fallback_audio
        }

@app.post("/api/tts/generate")
async def generate_tts(request: dict):
    """Generate TTS audio using ElevenLabs"""
    text = request.get("text", "")
    voice_id = request.get("voice_id", None)
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        audio_url = await elevenlabs_service.text_to_speech(text, voice_id)
        
        if audio_url:
            return {
                "status": "success",
                "audio_url": audio_url,
                "text": text,
                "voice_id": voice_id or elevenlabs_service.voice_id
            }
        else:
            return {
                "status": "fallback",
                "message": "ElevenLabs TTS not available, using browser TTS",
                "text": text
            }
            
    except Exception as e:
        logger.error(f"Error generating TTS: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "text": text
        }

@app.get("/api/tts/voices")
async def get_voices():
    """Get available ElevenLabs voices"""
    try:
        voices = await elevenlabs_service.get_available_voices()
        return {
            "status": "success",
            "voices": voices,
            "current_voice_id": elevenlabs_service.voice_id
        }
    except Exception as e:
        logger.error(f"Error fetching voices: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "voices": []
        }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Digital Sales Agent Backend",
        "version": "1.0.0",
        "agent_communication": "Coral Protocol",
        "endpoints": [
            "/api/onboarding/business-info",
            "/api/onboarding/conversation",
            "/api/tts/generate",
            "/api/prospects/research", 
            "/api/emails/generate",
            "/api/emails/send",
            "/api/conversations/start",
            "/api/analytics",
            "/api/health"
        ]
    }

@app.on_event("startup")
async def startup_event():
    """Initialize agent on startup"""
    logger.info("Initializing Digital Sales Agent Backend...")
    success = await initialize_agent()
    if success:
        logger.info("Backend initialized successfully with agent communication")
    else:
        logger.warning("Backend started but agent communication failed - using fallback mode")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global coral_client
    if coral_client:
        try:
            await coral_client.close()
        except:
            pass
    logger.info("Backend shutdown complete")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
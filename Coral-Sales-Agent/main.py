import urllib.parse
from dotenv import load_dotenv
import os, json, asyncio, traceback
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool, StructuredTool
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import uuid

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Simple in-memory storage for demo
business_info = {}
prospects = {}
emails_sent = []
conversations = {}

async def collect_business_info(business_goal: str, product_description: str, target_market: str = "", value_proposition: str = ""):
    """Store business information from onboarding"""
    logger.info(f"Sales Agent: Collecting business info - {business_goal}")
    
    info_id = str(uuid.uuid4())
    business_info[info_id] = {
        "id": info_id,
        "business_goal": business_goal,
        "product_description": product_description,
        "target_market": target_market,
        "value_proposition": value_proposition,
        "created_at": datetime.now().isoformat()
    }
    
    return {
        "status": "success",
        "message": f"Business information collected: {business_goal}",
        "info_id": info_id
    }

async def research_prospects(target_domain: str = None, industry: str = None, company_size: str = None):
    """Research prospects - coordinates with Firecrawl agent via Coral Protocol"""
    logger.info(f"Sales Agent: Researching prospects for {target_domain or industry}")
    
    prospect_id = str(uuid.uuid4())
    
    # Create initial prospect entry
    prospects[prospect_id] = {
        "id": prospect_id,
        "company_name": target_domain or f"{industry} Company",
        "domain": target_domain or f"example-{industry.lower()}.com",
        "industry": industry or "Technology",
        "contacts": [],
        "research_data": {},
        "created_at": datetime.now().isoformat(),
        "research_status": "coordinating_with_firecrawl"
    }
    
    # Return instruction for the agent to coordinate with Firecrawl
    return {
        "status": "success",
        "message": f"Prospect research initiated for {target_domain or industry}",
        "prospect_id": prospect_id,
        "target_domain": target_domain,
        "industry": industry,
        "next_steps": [
            "Use list_agents to find firecrawl_agent",
            "Use create_thread with firecrawl_agent as participant", 
            f"Use send_message to request web scraping for {target_domain or industry}",
            "Use wait_for_mentions to receive Firecrawl response",
            "Use process_firecrawl_response to update prospect data"
        ],
        "firecrawl_request": {
            "action": "scrape_company_info",
            "target": target_domain or f"{industry} companies",
            "extract": ["contact_information", "company_details", "decision_makers"],
            "prospect_id": prospect_id
        }
    }

async def process_firecrawl_response(prospect_id: str, firecrawl_data: dict):
    """Process response from Firecrawl agent and update prospect data"""
    logger.info(f"Sales Agent: Processing Firecrawl response for prospect {prospect_id}")
    
    if prospect_id not in prospects:
        return {"status": "error", "message": "Prospect not found"}
    
    prospect = prospects[prospect_id]
    
    # Extract useful information from Firecrawl response
    # Firecrawl typically returns markdown content and metadata
    scraped_content = firecrawl_data.get("content", "")
    metadata = firecrawl_data.get("metadata", {})
    
    # Update prospect with research data
    prospect["research_data"] = {
        "scraped_content": scraped_content,
        "title": metadata.get("title", ""),
        "description": metadata.get("description", ""),
        "keywords": metadata.get("keywords", []),
        "last_updated": datetime.now().isoformat()
    }
    
    # Try to extract contact information from scraped content
    # Simple extraction - in production, this would be more sophisticated
    contacts = []
    if "contact" in scraped_content.lower() or "email" in scraped_content.lower():
        # Extract potential contact info (simplified)
        contacts.append({
            "id": str(uuid.uuid4()),
            "name": "Contact Person",
            "email": "contact@company.com",
            "title": "Decision Maker",
            "department": "Business",
            "decision_maker": True
        })
    
    prospect["contacts"] = contacts
    prospect["research_status"] = "completed"
    
    return {
        "status": "success",
        "message": f"Research completed for {prospect['company_name']}",
        "prospect_id": prospect_id,
        "contacts_found": len(contacts),
        "research_data": prospect["research_data"]
    }

async def generate_cold_email(prospect_id: str, contact_name: str = "there", contact_email: str = ""):
    """Generate personalized cold email"""
    logger.info(f"Sales Agent: Generating cold email for prospect {prospect_id}")
    
    if prospect_id not in prospects:
        return {"status": "error", "message": "Prospect not found"}
    
    prospect = prospects[prospect_id]
    
    # Get business info for personalization
    biz_info = list(business_info.values())[0] if business_info else {}
    
    # Use research data for better personalization
    research_data = prospect.get("research_data", {})
    company_description = research_data.get("description", f"work in the {prospect['industry']} space")
    
    # Generate personalized email
    subject = f"Quick question about {prospect['company_name']}'s {prospect['industry']} operations"
    
    localhost_link = f"http://localhost:3000/conversations?prospect_id={prospect_id}"
    
    email_content = f"""Hi {contact_name},

I hope this email finds you well. I noticed {prospect['company_name']} is {company_description}.

{biz_info.get('business_goal', 'We help companies optimize their operations')} through {biz_info.get('product_description', 'our innovative solutions')}.

I'd love to have a quick conversation about how we might be able to help {prospect['company_name']} {biz_info.get('value_proposition', 'achieve better results')}.

Would you be interested in a brief chat? You can talk to me directly here:
{localhost_link}

Best regards,
Sales Agent

P.S. The conversation link above will connect you directly with our AI sales agent for an immediate discussion.
"""
    
    email_id = str(uuid.uuid4())
    email_data = {
        "id": email_id,
        "prospect_id": prospect_id,
        "contact_name": contact_name,
        "contact_email": contact_email,
        "subject": subject,
        "content": email_content,
        "talk_to_sales_link": localhost_link,
        "sent_to": "samgachiri2002@gmail.com",  # Always for testing
        "sent_at": datetime.now().isoformat(),
        "status": "generated"
    }
    
    emails_sent.append(email_data)
    
    return {
        "status": "success",
        "message": "Cold email generated",
        "email_id": email_id,
        "email_data": email_data
    }

async def send_email(email_id: str):
    """Send the generated email to samgachiri2002@gmail.com"""
    logger.info(f"Sales Agent: Sending email {email_id}")
    
    email_data = next((e for e in emails_sent if e["id"] == email_id), None)
    if not email_data:
        return {"status": "error", "message": "Email not found"}
    
    try:
        # Email configuration
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        test_email = os.getenv("TEST_EMAIL", "samgachiri2002@gmail.com")
        
        if not smtp_username or not smtp_password:
            logger.warning("SMTP credentials not configured")
            email_data["status"] = "ready_to_send"
            return {
                "status": "success",
                "message": f"Email ready to send to {test_email} (configure SMTP to actually send)",
                "email_preview": {
                    "to": test_email,
                    "subject": email_data["subject"],
                    "content_preview": email_data["content"][:200] + "...",
                    "talk_to_sales_link": email_data["talk_to_sales_link"]
                },
                "smtp_configured": False
            }
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = test_email
        msg['Subject'] = email_data["subject"]
        
        # Add HTML version for better formatting
        html_content = email_data["content"].replace('\n', '<br>')
        msg.attach(MIMEText(email_data["content"], 'plain'))
        msg.attach(MIMEText(f"<html><body>{html_content}</body></html>", 'html'))
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_username, test_email, text)
        server.quit()
        
        email_data["status"] = "sent"
        email_data["actual_sent_at"] = datetime.now().isoformat()
        email_data["sent_to"] = test_email
        
        logger.info(f"Email sent successfully to {test_email}")
        
        return {
            "status": "success",
            "message": f"Cold email sent to {test_email}",
            "email_data": {
                "email_id": email_id,
                "sent_to": test_email,
                "subject": email_data["subject"],
                "sent_at": email_data["actual_sent_at"],
                "talk_to_sales_link": email_data["talk_to_sales_link"]
            },
            "smtp_configured": True
        }
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        email_data["status"] = "failed"
        email_data["error"] = str(e)
        
        return {
            "status": "error",
            "message": f"Failed to send email: {str(e)}",
            "email_data": email_data,
            "fallback": "Email generation successful but sending failed"
        }

async def initiate_sales_conversation(prospect_id: str, user_message: str = ""):
    """Initiate sales conversation - coordinates with Interface Agent"""
    logger.info(f"Sales Agent: Initiating sales conversation for prospect {prospect_id}")
    
    if prospect_id not in prospects:
        return {"status": "error", "message": "Prospect not found"}
    
    prospect = prospects[prospect_id]
    conversation_id = str(uuid.uuid4())
    
    # Get business info for conversation context
    biz_info = list(business_info.values())[0] if business_info else {}
    
    # Create conversation context for Interface Agent
    conversation_context = {
        "prospect_company": prospect["company_name"],
        "prospect_industry": prospect["industry"],
        "business_goal": biz_info.get("business_goal", "help companies optimize operations"),
        "product_description": biz_info.get("product_description", "innovative solutions"),
        "value_proposition": biz_info.get("value_proposition", "achieve better results"),
        "research_data": prospect.get("research_data", {}),
        "user_message": user_message
    }
    
    conversation_data = {
        "id": conversation_id,
        "prospect_id": prospect_id,
        "prospect_company": prospect["company_name"],
        "started_at": datetime.now().isoformat(),
        "messages": [
            {
                "id": str(uuid.uuid4()),
                "sender": "prospect",
                "content": user_message or "Hi, I'm interested in learning more about your services.",
                "timestamp": datetime.now().isoformat(),
                "type": "text"
            }
        ],
        "business_context": biz_info,
        "status": "active",
        "deal_attempts": []
    }
    
    conversations[conversation_id] = conversation_data
    
    return {
        "status": "conversation_started",
        "message": f"Sales conversation initiated with {prospect['company_name']}",
        "conversation_id": conversation_id,
        "conversation_context": conversation_context,
        "interface_agent_instruction": f"Start sales conversation with prospect from {prospect['company_name']}. Use the provided context to deliver personalized sales pitch and attempt to close deals. Be persuasive but professional.",
        "interface_agent_needed": True
    }

async def process_conversation_response(conversation_id: str, agent_response: str, deal_closed: bool = False):
    """Process response from Interface Agent during sales conversation"""
    logger.info(f"Sales Agent: Processing conversation response for {conversation_id}")
    
    if conversation_id not in conversations:
        return {"status": "error", "message": "Conversation not found"}
    
    conversation = conversations[conversation_id]
    
    # Add agent response to conversation
    response_message = {
        "id": str(uuid.uuid4()),
        "sender": "agent",
        "content": agent_response,
        "timestamp": datetime.now().isoformat(),
        "type": "text"
    }
    
    conversation["messages"].append(response_message)
    
    # If deal was closed, update conversation status
    if deal_closed:
        conversation["status"] = "deal_closed"
        conversation["ended_at"] = datetime.now().isoformat()
        
        # Add deal attempt record
        deal_attempt = {
            "id": str(uuid.uuid4()),
            "attempted_at": datetime.now().isoformat(),
            "technique": "voice_conversation",
            "outcome": "closed",
            "notes": "Deal successfully closed through voice conversation"
        }
        
        conversation["deal_attempts"].append(deal_attempt)
        
        # Update prospect deal status
        if conversation["prospect_id"] in prospects:
            prospects[conversation["prospect_id"]]["deal_status"] = {
                "stage": "closed",
                "closed_at": datetime.now().isoformat(),
                "value": None,  # Could be extracted from conversation
                "notes": ["Deal closed through AI sales conversation"]
            }
        
        logger.info(f"Deal closed for conversation {conversation_id}")
    
    return {
        "status": "success",
        "message": "Conversation response processed",
        "conversation_id": conversation_id,
        "deal_closed": deal_closed,
        "conversation_status": conversation["status"]
    }

async def handle_interface_conversation(data: dict):
    """Handle conversation instructions from Interface Agent"""
    logger.info(f"Sales Agent: Handling interface conversation")
    
    user_message = data.get("user_message", "")
    conversation_history = data.get("conversation_history", [])
    conversation_type = data.get("conversation_type", "")
    questions_needed = data.get("questions_needed", [])
    
    if conversation_type == "onboarding":
        # Handle onboarding conversation
        # Extract business information from conversation history
        business_goal = ""
        product_description = ""
        target_market = ""
        value_proposition = ""
        
        # Parse conversation history to extract business info
        for message in conversation_history:
            if message.get("sender") == "user":
                content = message.get("content", "").lower()
                if "selling" in content or "business" in content:
                    if not business_goal:
                        business_goal = f"My business goal is to {user_message}"
                    if not product_description:
                        product_description = user_message
                if "target" in content or "market" in content:
                    target_market = user_message
                if "value" in content or "unique" in content:
                    value_proposition = user_message
        
        # Store business information
        if user_message and any(keyword in user_message.lower() for keyword in ["selling", "business", "goal", "value", "unique"]):
            info_id = str(uuid.uuid4())
            business_info[info_id] = {
                "id": info_id,
                "business_goal": business_goal or user_message,
                "product_description": product_description or user_message,
                "target_market": target_market or user_message,
                "value_proposition": value_proposition or user_message,
                "created_at": datetime.now().isoformat(),
                "onboarding_completed": len(conversation_history) >= 4  # Assuming 4+ messages means complete
            }
            
            logger.info(f"Sales Agent: Stored business info from onboarding: {business_goal}")
        
        return {
            "status": "success",
            "message": "Interface conversation processed for onboarding",
            "conversation_type": conversation_type,
            "business_info_collected": len(business_info) > 0,
            "onboarding_progress": f"{len(conversation_history)}/{len(questions_needed)} questions answered"
        }
    
    else:
        # Handle sales conversation
        return {
            "status": "success", 
            "message": "Interface conversation processed for sales",
            "conversation_type": conversation_type,
            "user_message": user_message
        }

async def auto_research_prospects(business_info: dict, target_criteria: dict):
    """Automatically research prospects based on business info - coordinates with Firecrawl agent"""
    logger.info(f"Sales Agent: Auto-researching prospects for {business_info.get('business_goal', 'business')}")
    
    # Create initial prospect entry
    prospect_id = str(uuid.uuid4())
    industry = target_criteria.get("industry", "Technology")
    
    prospects[prospect_id] = {
        "id": prospect_id,
        "company_name": f"{industry} Company Research",
        "domain": f"example-{industry.lower()}.com",
        "industry": industry,
        "contacts": [],
        "research_data": {},
        "created_at": datetime.now().isoformat(),
        "research_status": "coordinating_with_firecrawl"
    }
    
    # Return instruction to coordinate with Firecrawl agent
    return {
        "status": "success",
        "message": f"Prospect research initiated for {industry}",
        "prospect_id": prospect_id,
        "next_steps": [
            "Use coral_list_agents to find firecrawl_agent",
            "Use coral_create_thread with firecrawl_agent as participant", 
            f"Use coral_send_message to request web scraping for {industry} companies",
            "Use coral_wait_for_mentions to receive Firecrawl response",
            "Use process_firecrawl_response to update prospect data"
        ],
        "firecrawl_coordination_needed": True,
        "firecrawl_request": {
            "action": "scrape_company_info",
            "target": f"{industry} companies",
            "extract": ["contact_information", "company_details", "decision_makers"],
            "prospect_id": prospect_id
        }
    }

async def auto_generate_emails(business_info: dict, prospect_list: list):
    """Automatically generate and send emails for all prospects"""
    logger.info(f"Sales Agent: Auto-generating emails for {len(prospect_list)} prospects")
    
    generated_emails = []
    
    for prospect in prospect_list:
        if not prospect.get("contacts"):
            continue
            
        # Generate email for primary contact
        primary_contact = prospect["contacts"][0]
        
        email_id = str(uuid.uuid4())
        localhost_link = f"http://localhost:3001/conversations?prospect_id={prospect['id']}"
        
        # Personalized email content using business info
        subject = f"Quick question about {prospect['company_name']}'s {prospect['industry']} operations"
        
        email_content = f"""Hi {primary_contact['name']},

I hope this email finds you well. I noticed {prospect['company_name']} is doing interesting work in the {prospect['industry']} space.

{business_info.get('business_goal', 'We help companies optimize their operations')} through {business_info.get('product_description', 'our innovative solutions')}.

Based on your role as {primary_contact['title']}, I believe our solution could help {prospect['company_name']} {business_info.get('value_proposition', 'achieve better results')}.

Would you be interested in a brief conversation? You can talk to our AI sales agent directly here:
{localhost_link}

Best regards,
AI Sales Agent

P.S. Click the link above for an immediate AI-powered sales conversation that can answer your questions and potentially close a deal on the spot.
"""
        
        email_data = {
            "id": email_id,
            "prospect_id": prospect["id"],
            "contact_name": primary_contact["name"],
            "contact_email": primary_contact["email"],
            "subject": subject,
            "content": email_content,
            "talk_to_sales_link": localhost_link,
            "sent_to": "samgachiri2002@gmail.com",  # Always for testing
            "sent_at": datetime.now().isoformat(),
            "status": "auto_generated",
            "auto_generated": True
        }
        
        emails_sent.append(email_data)
        generated_emails.append(email_data)
        
        # Auto-send the email (simulate)
        email_data["status"] = "sent"
        email_data["actual_sent_at"] = datetime.now().isoformat()
        
        logger.info(f"Auto-generated and sent email to {primary_contact['name']} at {prospect['company_name']}")
    
    return {
        "status": "success",
        "message": f"Auto-generated and sent {len(generated_emails)} emails",
        "emails": generated_emails,
        "sent_to_test_email": "samgachiri2002@gmail.com"
    }

async def parse_and_execute_instruction(message_data: str):
    """Parse JSON instruction and execute the corresponding sales tool"""
    logger.info(f"Sales Agent: Parsing instruction: {message_data}")
    
    try:
        import json
        # Extract JSON from message data
        if "{" in message_data and "}" in message_data:
            json_start = message_data.find("{")
            json_end = message_data.rfind("}") + 1
            instruction_json = message_data[json_start:json_end]
        else:
            instruction_json = message_data
            
        instruction_data = json.loads(instruction_json)
        instruction_type = instruction_data.get("instruction")
        data = instruction_data.get("data", {})
        
        logger.info(f"Sales Agent: Executing instruction '{instruction_type}' with data: {data}")
        
        if instruction_type == "research_prospects":
            result = await research_prospects(
                target_domain=data.get("target_domain"),
                industry=data.get("industry"),
                company_size=data.get("company_size")
            )
        elif instruction_type == "generate_cold_email":
            result = await generate_cold_email(
                prospect_id=data.get("prospect_id"),
                contact_name=data.get("contact_name", "there"),
                contact_email=data.get("contact_email", "")
            )
        elif instruction_type == "send_email":
            result = await send_email(email_id=data.get("email_id"))
        elif instruction_type == "get_analytics":
            result = await get_analytics()
        elif instruction_type == "collect_business_info":
            result = await collect_business_info(
                business_goal=data.get("business_goal"),
                product_description=data.get("product_description"),
                target_market=data.get("target_market", ""),
                value_proposition=data.get("value_proposition", "")
            )
        elif instruction_type == "interface_agent_conversation":
            # Handle conversation instructions from Interface Agent
            result = await handle_interface_conversation(data)
        elif instruction_type == "auto_research_prospects":
            # Handle automatic prospect research
            business_info_data = data.get("business_info", {})
            target_criteria = data.get("target_criteria", {})
            result = await auto_research_prospects(business_info_data, target_criteria)
        elif instruction_type == "auto_generate_emails":
            # Handle automatic email generation
            business_info_data = data.get("business_info", {})
            prospects_list = data.get("prospects", [])
            result = await auto_generate_emails(business_info_data, prospects_list)
        elif instruction_type == "get_workflow_status":
            # Handle workflow status requests
            result = await get_workflow_status()
        else:
            result = {
                "status": "error",
                "message": f"Unknown instruction type: {instruction_type}",
                "available_instructions": [
                    "research_prospects", "generate_cold_email", "send_email", "get_analytics", 
                    "collect_business_info", "interface_agent_conversation", "auto_research_prospects", 
                    "auto_generate_emails", "get_workflow_status"
                ]
            }
        
        logger.info(f"Sales Agent: Instruction '{instruction_type}' executed successfully")
        return result
        
    except json.JSONDecodeError:
        logger.error(f"Sales Agent: Failed to parse JSON instruction: {instruction_json}")
        return {
            "status": "error",
            "message": "Invalid JSON format in instruction",
            "received": instruction_json
        }
    except Exception as e:
        logger.error(f"Sales Agent: Error executing instruction: {str(e)}")
        return {
            "status": "error",
            "message": f"Error executing instruction: {str(e)}"
        }

async def acknowledge_message(sender_id: str, message_content: str):
    """Acknowledge receipt of a message"""
    logger.info(f"Sales Agent: Acknowledging message from {sender_id}")
    
    return {
        "status": "message_acknowledged",
        "message": f"Sales Agent received your message: '{message_content[:100]}...'",
        "sender": sender_id,
        "timestamp": datetime.now().isoformat(),
        "agent_id": "sales_agent"
    }

async def get_workflow_status():
    """Get current workflow status"""
    logger.info("Sales Agent: Getting workflow status")
    
    total_prospects = len(prospects)
    total_emails = len(emails_sent)
    sent_emails = len([e for e in emails_sent if e["status"] == "sent"])
    active_conversations = len([c for c in conversations.values() if c["status"] == "active"])
    auto_generated_prospects = len([p for p in prospects.values() if p.get("auto_generated")])
    
    # Determine current workflow stage
    if total_prospects == 0:
        current_stage = "onboarding"
        next_action = "Complete onboarding to start automated workflow"
    elif sent_emails == 0:
        current_stage = "email_generation"
        next_action = "Generating personalized cold emails"
    elif active_conversations == 0:
        current_stage = "waiting_for_responses"
        next_action = "Waiting for prospects to click 'Talk to Sales' links"
    else:
        current_stage = "active_conversations"
        next_action = "AI agents handling sales conversations"
    
    workflow_status = {
        "current_stage": current_stage,
        "next_action": next_action,
        "total_prospects": total_prospects,
        "auto_generated_prospects": auto_generated_prospects,
        "emails_generated": total_emails,
        "emails_sent": sent_emails,
        "active_conversations": active_conversations,
        "conversion_rate": f"{(sent_emails/total_emails*100):.1f}%" if total_emails > 0 else "0%",
        "last_activity": datetime.now().isoformat(),
        "workflow_active": total_prospects > 0
    }
    
    return {
        "status": "success",
        "workflow": workflow_status
    }

async def get_analytics():
    """Get sales analytics"""
    logger.info("Sales Agent: Generating analytics")
    
    # Get workflow status first
    workflow_result = await get_workflow_status()
    workflow_data = workflow_result.get("workflow", {})
    
    analytics = {
        **workflow_data,
        "generated_at": datetime.now().isoformat(),
        "system_status": "active" if workflow_data.get("workflow_active") else "waiting"
    }
    
    return {
        "status": "success",
        "analytics": analytics
    }

def get_tools_description(tools):
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )

async def create_agent(coral_tools, agent_tools):
    coral_tools_description = get_tools_description(coral_tools)
    agent_tools_description = get_tools_description(agent_tools)
    combined_tools = coral_tools + agent_tools
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""You are a Sales Agent that handles sales operations including prospect research, email generation, and sales conversations.

            WORKFLOW:
            1. Use coral_wait_for_mentions to listen for instructions from other agents
            2. Parse received messages for JSON instructions or simple text
            3. Execute appropriate sales tools based on instructions
            4. Use coral_send_message to respond back with EXACT JSON results
            5. Loop back to wait for more instructions
            
            INSTRUCTION PROCESSING:
            - For JSON messages: Use parse_and_execute_instruction tool with the JSON content
            - For simple text: Use acknowledge_message tool with sender ID and message content
            - CRITICAL: Always send the EXACT JSON result from tools via coral_send_message
            - Do NOT interpret, summarize, or modify the JSON responses from tools
            - The content parameter in coral_send_message must be the raw JSON string from the tool
            
            AVAILABLE TOOLS:
            Coral Protocol: {coral_tools_description}
            Sales Tools: {agent_tools_description}
            
            COORDINATION:
            - firecrawl_agent: Web scraping and contact extraction
            - backend_coordinator: Receives instructions and sends results
            - Always include sender in mentions when responding
            - All emails sent to samgachiri2002@gmail.com for testing
            - Include localhost:3000/conversations links in emails
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
        max_tokens=int(os.getenv("MODEL_MAX_TOKENS", "8000")),
        base_url=os.getenv("MODEL_BASE_URL", None)
    )
    
    agent = create_tool_calling_agent(model, combined_tools, prompt)
    return AgentExecutor(agent=agent, tools=combined_tools, verbose=True, handle_parsing_errors=True)

async def main():
    runtime = os.getenv("CORAL_ORCHESTRATION_RUNTIME", None)
    if runtime is None:
        load_dotenv()

    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    agentID = os.getenv("CORAL_AGENT_ID", "sales_agent")

    coral_params = {
        "agentId": agentID,
        "agentDescription": "Sales Agent that handles business info collection, prospect research, cold email generation, and sales conversations"
    }
    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}{'&' if '?' in base_url else '?'}{query_string}"
    
    logger.info(f"Connecting to Coral Server: {CORAL_SERVER_URL}")

    timeout = float(os.getenv("TIMEOUT_MS", "60"))
    client = MultiServerMCPClient(
        connections={
            "coral": {
                "transport": "sse",
                "url": CORAL_SERVER_URL,
                "timeout": timeout,
                "sse_read_timeout": timeout,
            }
        }
    )

    logger.info("Coral Server Connection Established")

    coral_tools = await client.get_tools(server_name="coral")
    logger.info(f"Coral tools count: {len(coral_tools)}")
    
    # Sales Agent tools
    agent_tools = [
        Tool(
            name="collect_business_info",
            func=None,
            coroutine=collect_business_info,
            description="Collect and store business information from onboarding",
            args_schema={
                "properties": {
                    "business_goal": {"type": "string", "description": "What is your business goal?"},
                    "product_description": {"type": "string", "description": "What are you selling?"},
                    "target_market": {"type": "string", "description": "Target market (optional)"},
                    "value_proposition": {"type": "string", "description": "Value proposition (optional)"}
                },
                "required": ["business_goal", "product_description"],
                "type": "object"
            }
        ),
        Tool(
            name="research_prospects",
            func=None,
            coroutine=research_prospects,
            description="Research prospects by domain or industry",
            args_schema={
                "properties": {
                    "target_domain": {"type": "string", "description": "Target company domain"},
                    "industry": {"type": "string", "description": "Target industry"},
                    "company_size": {"type": "string", "description": "Company size range"}
                },
                "type": "object"
            }
        ),
        Tool(
            name="generate_cold_email",
            func=None,
            coroutine=generate_cold_email,
            description="Generate personalized cold email for prospect",
            args_schema={
                "properties": {
                    "prospect_id": {"type": "string", "description": "Prospect ID"},
                    "contact_name": {"type": "string", "description": "Contact name"},
                    "contact_email": {"type": "string", "description": "Contact email"}
                },
                "required": ["prospect_id"],
                "type": "object"
            }
        ),
        Tool(
            name="send_email",
            func=None,
            coroutine=send_email,
            description="Send generated cold email",
            args_schema={
                "properties": {
                    "email_id": {"type": "string", "description": "Email ID to send"}
                },
                "required": ["email_id"],
                "type": "object"
            }
        ),
        Tool(
            name="initiate_sales_conversation",
            func=None,
            coroutine=initiate_sales_conversation,
            description="Initiate sales conversation with prospect",
            args_schema={
                "properties": {
                    "prospect_id": {"type": "string", "description": "Prospect ID"},
                    "user_message": {"type": "string", "description": "Initial user message"}
                },
                "required": ["prospect_id"],
                "type": "object"
            }
        ),
        Tool(
            name="get_analytics",
            func=None,
            coroutine=get_analytics,
            description="Get sales analytics and performance metrics",
            args_schema={
                "properties": {},
                "type": "object"
            }
        ),
        Tool(
            name="process_firecrawl_response",
            func=None,
            coroutine=process_firecrawl_response,
            description="Process response from Firecrawl agent and update prospect data",
            args_schema={
                "properties": {
                    "prospect_id": {"type": "string", "description": "Prospect ID"},
                    "firecrawl_data": {"type": "object", "description": "Data returned from Firecrawl agent"}
                },
                "required": ["prospect_id", "firecrawl_data"],
                "type": "object"
            }
        ),
        Tool(
            name="process_conversation_response",
            func=None,
            coroutine=process_conversation_response,
            description="Process response from Interface Agent during sales conversation",
            args_schema={
                "properties": {
                    "conversation_id": {"type": "string", "description": "Conversation ID"},
                    "agent_response": {"type": "string", "description": "Response from Interface Agent"},
                    "deal_closed": {"type": "boolean", "description": "Whether deal was closed", "default": False}
                },
                "required": ["conversation_id", "agent_response"],
                "type": "object"
            }
        ),
        Tool(
            name="auto_research_prospects",
            func=None,
            coroutine=auto_research_prospects,
            description="Automatically research prospects based on business information",
            args_schema={
                "properties": {
                    "business_info": {"type": "object", "description": "Business information from onboarding"},
                    "target_criteria": {"type": "object", "description": "Target criteria for prospect research"}
                },
                "required": ["business_info", "target_criteria"],
                "type": "object"
            }
        ),
        Tool(
            name="auto_generate_emails",
            func=None,
            coroutine=auto_generate_emails,
            description="Automatically generate and send emails for prospects",
            args_schema={
                    "properties": {
                        "business_info": {"type": "object", "description": "Business information for personalization"},
                        "prospect_list": {
                        "type": "array",
                        "description": "List of prospects to email",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string", "description": "Prospect's full name"},
                                "email": {"type": "string", "description": "Prospect's email address"}
                            },
                            "required": ["email"]
                        }
                    }
                },
                "required": ["business_info", "prospect_list"],
                "type": "object"
            }
        ),
        Tool(
            name="get_workflow_status",
            func=None,
            coroutine=get_workflow_status,
            description="Get current automated workflow status",
            args_schema={
                "properties": {},
                "type": "object"
            }
        ),
        Tool(
            name="handle_interface_conversation",
            func=None,
            coroutine=handle_interface_conversation,
            description="Handle conversation instructions from Interface Agent",
            args_schema={
                "properties": {
                    "data": {"type": "object", "description": "Conversation data from Interface Agent"}
                },
                "required": ["data"],
                "type": "object"
            }
        ),
        StructuredTool.from_function(
            func=acknowledge_message,
            name="acknowledge_message",
            description="Acknowledge receipt of a message from another agent",
            coroutine=acknowledge_message
        ),
        StructuredTool.from_function(
            func=parse_and_execute_instruction,
            name="parse_and_execute_instruction", 
            description="Parse JSON instruction and execute the corresponding sales tool",
            coroutine=parse_and_execute_instruction
        )
    ]

    agent_executor = await create_agent(coral_tools, agent_tools)

    # Main agent loop - wait for mentions and process instructions
    while True:
        try:
            logger.info("Sales Agent: Waiting for mentions...")
            
            # Wait for mentions from other agents with error handling
            try:
                response = await agent_executor.ainvoke({
                    "input": "Use coral_wait_for_mentions with timeoutMs 60000 to wait for instructions from other agents."
                })
            except Exception as tool_error:
                logger.error(f"Sales Agent: Error in coral_wait_for_mentions: {str(tool_error)}")
                # Try with different parameter format
                try:
                    response = await agent_executor.ainvoke({
                        "input": "Call coral_wait_for_mentions tool with timeoutMs parameter set to 60000."
                    })
                except Exception as retry_error:
                    logger.error(f"Sales Agent: Retry failed: {str(retry_error)}")
                    # Wait before retrying
                    await asyncio.sleep(10)
                    continue
            
            # Process any received messages
            if response and "output" in response:
                output = response["output"]
                
                if "timeout" not in output.lower() and "no messages" not in output.lower() and "error" not in output.lower():
                    logger.info("Sales Agent: Processing received message...")
                    
                    # Process the instruction with explicit handling
                    processing_response = await agent_executor.ainvoke({
                        "input": f"""
                        Process the received message and respond with EXACT JSON:
                        
                        MESSAGE DATA: {output}
                        
                        STEPS:
                        1. Extract the message content, sender ID, and thread ID from the data above
                        2. Check if message content contains JSON with "instruction" field:
                           - If YES: Use parse_and_execute_instruction tool with the message data
                           - If NO: Use acknowledge_message tool with sender ID and message content
                        3. Use coral_send_message to send the EXACT JSON result from step 2 with proper threadId and mentions
                        
                        CRITICAL: Send the raw JSON result from the tool, do NOT summarize or interpret it!
                        The content parameter in coral_send_message must be the exact JSON string returned by the tool.
                        """
                    })
                    
                    logger.info("Sales Agent: Message processing completed")
                    
                else:
                    logger.debug(f"Sales Agent: No valid messages - {output}")
            
        except Exception as e:
            logger.error(f"Error in Sales Agent main loop: {str(e)}")
            logger.error(traceback.format_exc())
            await asyncio.sleep(5)  # Wait before retrying

if __name__ == "__main__":
    asyncio.run(main())
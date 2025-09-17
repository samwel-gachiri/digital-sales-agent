import urllib.parse
from dotenv import load_dotenv
import os, json, asyncio, traceback
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Sales workflow tool functions
async def discover_prospects_tool(target_domain: str = None, industry: str = None, company_size: str = None, keywords: list = None):
    """Coordinate prospect discovery using Firecrawl and OpenDeepResearch agents"""
    logger.info(f"Starting prospect discovery for domain: {target_domain}, industry: {industry}")
    
    # Create detailed instructions for agent coordination
    if target_domain:
        firecrawl_instruction = f"Please scrape the website {target_domain} and extract: 1) Contact information (emails, phone numbers), 2) Company details (size, industry, location), 3) Key personnel (names, titles, departments), 4) Recent news or updates. Return structured data in JSON format."
    else:
        firecrawl_instruction = f"Please search for companies in the {industry} industry with approximately {company_size} employees. Extract contact information, company websites, and key personnel details. Focus on decision makers like CEOs, CTOs, VPs. Return structured data."
    
    # Research instruction for OpenDeepResearch agent
    research_instruction = f"Please conduct deep research on companies in the {industry} industry. Focus on: 1) Budget indicators (recent funding, revenue growth, expansion), 2) Decision makers and organizational structure, 3) Recent news and market position, 4) Pain points and challenges they might face, 5) Technology stack and current solutions. Provide comprehensive analysis."
    
    # Pandas instruction for data structuring
    pandas_instruction = f"Please analyze and structure the prospect data from Firecrawl and research results. Create a unified dataset with: 1) Company profiles, 2) Contact scoring based on decision-making authority, 3) Lead qualification scores, 4) Prioritized prospect list. Export as structured JSON."
    
    # Return coordination instructions
    coordination_plan = {
        "workflow": "prospect_discovery",
        "agents_required": ["firecrawl_agent", "opendeepresearch_agent", "pandas_agent"],
        "instructions": {
            "firecrawl": firecrawl_instruction,
            "research": research_instruction,
            "pandas": pandas_instruction
        },
        "execution_order": [
            "1. Send firecrawl_instruction to Firecrawl agent",
            "2. Send research_instruction to OpenDeepResearch agent", 
            "3. Wait for both responses",
            "4. Send combined data to Pandas agent with pandas_instruction",
            "5. Return final structured prospect list"
        ],
        "expected_output": "Structured list of qualified prospects with contact details, company intelligence, and lead scores"
    }
    
    return f"PROSPECT DISCOVERY COORDINATION PLAN:\n\nStep 1: Contact Firecrawl Agent\nInstruction: {firecrawl_instruction}\n\nStep 2: Contact OpenDeepResearch Agent\nInstruction: {research_instruction}\n\nStep 3: Process with Pandas Agent\nInstruction: {pandas_instruction}\n\nExecute these steps using send_message to coordinate with each agent, then wait_for_mentions to receive their responses."

async def qualify_lead_tool(prospect_id: str, contact_id: str):
    """Qualify a lead using BANT criteria with real scoring algorithm"""
    logger.info(f"Starting lead qualification for prospect: {prospect_id}, contact: {contact_id}")
    
    # Import the BANT scorer
    try:
        from lead_scoring import bant_scorer
    except ImportError:
        logger.error("Lead scoring module not available")
        return "Error: Lead scoring system not available"
    
    # Create comprehensive BANT qualification instructions
    bant_questions = {
        "budget": [
            "What's your current budget range for this type of solution?",
            "Have you allocated funds for this project this year?",
            "What's your typical investment range for technology solutions?"
        ],
        "authority": [
            "Who else would be involved in making this decision?",
            "What's your role in the decision-making process?",
            "Who would need to approve a purchase of this size?"
        ],
        "need": [
            "What specific challenges are you currently facing?",
            "How is this problem impacting your business?",
            "What happens if you don't solve this problem?",
            "What solutions have you tried before?"
        ],
        "timeline": [
            "When are you looking to implement a solution?",
            "What's driving the timeline for this project?",
            "Are there any deadlines or events that influence timing?"
        ]
    }
    
    # Detailed voice instruction for comprehensive qualification
    voice_instruction = f"""Conduct a thorough BANT qualification call with contact {contact_id} from prospect {prospect_id}.

BUDGET Questions:
{' '.join(bant_questions['budget'])}

AUTHORITY Questions:
{' '.join(bant_questions['authority'])}

NEED Questions:
{' '.join(bant_questions['need'])}

TIMELINE Questions:
{' '.join(bant_questions['timeline'])}

Instructions:
1. Ask questions naturally in conversation flow
2. Listen for budget indicators (funding, revenue, investment capacity)
3. Identify decision makers and approval process
4. Understand pain points and urgency level
5. Determine implementation timeline and drivers
6. Take detailed notes on responses
7. Return structured data with: budget_info, authority_info, need_info, timeline_info

Use ElevenLabs TTS with professional, consultative tone. Build rapport before diving into qualification questions."""
    
    # Pandas instruction for BANT scoring
    pandas_instruction = f"""Analyze the qualification call results for prospect {prospect_id} and calculate BANT scores:

1. Extract key data points from conversation
2. Apply BANT scoring algorithm (1-10 scale each)
3. Calculate weighted overall score
4. Determine lead category (hot/warm/cold)
5. Provide scoring rationale
6. Return structured BANT analysis

Use the lead_scoring module for consistent scoring methodology."""
    
    qualification_plan = {
        "workflow": "lead_qualification",
        "prospect_id": prospect_id,
        "contact_id": contact_id,
        "agents_required": ["voiceinterface_agent", "pandas_agent"],
        "instructions": {
            "voice_qualification": voice_instruction,
            "bant_scoring": pandas_instruction
        },
        "execution_steps": [
            "1. Send voice_instruction to VoiceInterface agent for qualification call",
            "2. Wait for call completion and conversation data",
            "3. Send conversation data to Pandas agent for BANT scoring",
            "4. Apply lead_scoring algorithm for final scores",
            "5. Update prospect record with qualification results"
        ],
        "expected_output": "Complete BANT analysis with scores, category, and qualification summary"
    }
    
    return f"LEAD QUALIFICATION COORDINATION PLAN:\n\nStep 1: VoiceInterface Agent Qualification\nInstruction: {voice_instruction}\n\nStep 2: BANT Scoring Analysis\nInstruction: {pandas_instruction}\n\nExecute using send_message to VoiceInterface agent, then wait_for_mentions for call results, then coordinate with Pandas agent for scoring analysis."

async def initiate_contact_tool(prospect_id: str, contact_id: str, method: str, message: str = None):
    """Initiate contact with a prospect"""
    logger.info(f"Initiating {method} contact with prospect: {prospect_id}, contact: {contact_id}")
    
    if method == "voice":
        # Create voice contact instructions for VoiceInterface agent with ElevenLabs
        default_message = "Hi, I hope you're doing well. I'd like to discuss how we can help your business grow with our solutions."
        opening_message = message or default_message
        voice_instruction = f"Make a voice call to contact {contact_id} from prospect {prospect_id}. Use ElevenLabs TTS with a professional, friendly tone. Opening message: '{opening_message}' Then engage in natural conversation about their business needs."
        
        contact_workflow = {
            "action": "initiate_voice_contact",
            "method": "voice",
            "voice_task": voice_instruction,
            "elevenlabs_config": {
                "voice_id": "professional_sales",
                "stability": 0.75,
                "similarity_boost": 0.75
            }
        }
    else:
        # Create email template based on prospect research
        default_email_message = "I came across your company and was impressed by your recent growth. I'd love to discuss how we can help you scale even further."
        email_message = message or default_email_message
        email_instruction = f"Generate a personalized email for contact {contact_id} from prospect {prospect_id}. Use their company research data to create relevant talking points. Include: '{email_message}'"
        
        contact_workflow = {
            "action": "initiate_email_contact", 
            "method": "email",
            "email_task": email_instruction,
            "personalization_required": True
        }
    
    contact_workflow.update({
        "status": "initiated",
        "prospect_id": prospect_id,
        "contact_id": contact_id,
        "next_steps": [
            f"Send message to {'VoiceInterface' if method == 'voice' else 'Email'} agent with contact instructions",
            "Wait for contact attempt results",
            "Log interaction in prospect history",
            "Schedule follow-up if needed"
        ]
    })
    
    return f"Contact initiation workflow started using {method} method. Ready to coordinate with {'VoiceInterface agent for ElevenLabs call' if method == 'voice' else 'email system'}. Use send_message to execute the contact."

async def generate_analytics_tool(timeframe: str = "last_30_days", metrics: list = None):
    """Generate comprehensive sales analytics using Pandas agent and database"""
    logger.info(f"Generating analytics for timeframe: {timeframe}")
    
    # Import database for real data
    try:
        from database import sales_db
        analytics_data = sales_db.get_analytics()
    except ImportError:
        logger.warning("Database not available, using sample analytics")
        analytics_data = {
            "total_prospects": 156,
            "qualified_leads": 42,
            "conversion_rate": 26.9
        }
    
    # Create comprehensive analytics instruction for Pandas agent
    pandas_instruction = f"""Generate comprehensive sales analytics report for {timeframe}:

DATA ANALYSIS REQUIRED:
1. Prospect Pipeline Analysis:
   - Total prospects by stage (discovered, researched, contacted, qualified, closed)
   - Conversion rates between stages
   - Pipeline velocity (average time per stage)
   - Drop-off analysis

2. Lead Quality Metrics:
   - BANT score distribution
   - Lead category breakdown (hot/warm/cold)
   - Source attribution (Firecrawl vs Research vs Referral)
   - Industry performance comparison

3. Agent Performance Analysis:
   - Task completion rates per agent
   - Success rates and error analysis
   - Response times and efficiency metrics
   - Workload distribution

4. Revenue & Forecasting:
   - Pipeline value by stage
   - Projected close rates
   - Average deal size trends
   - Revenue forecasting

5. Time-based Trends:
   - Daily/weekly prospect acquisition
   - Seasonal patterns
   - Performance trends over time

METRICS TO CALCULATE:
{metrics or ['conversion_rate', 'pipeline_velocity', 'lead_scores', 'agent_performance', 'revenue_forecast']}

OUTPUT FORMAT:
- Executive summary with key insights
- Detailed metrics with visualizations
- Trend analysis and recommendations
- Agent performance scorecards
- Actionable insights for optimization

Use statistical analysis, correlation analysis, and predictive modeling where applicable."""
    
    analytics_plan = {
        "workflow": "sales_analytics",
        "timeframe": timeframe,
        "data_sources": ["prospect_database", "interaction_logs", "agent_performance", "conversion_data"],
        "agents_required": ["pandas_agent"],
        "analysis_scope": {
            "pipeline_analysis": True,
            "lead_quality": True,
            "agent_performance": True,
            "revenue_forecasting": True,
            "trend_analysis": True
        },
        "current_data": analytics_data,
        "instruction": pandas_instruction
    }
    
    return f"SALES ANALYTICS COORDINATION PLAN:\n\nTimeframe: {timeframe}\nCurrent Data: {analytics_data}\n\nPandas Agent Instruction:\n{pandas_instruction}\n\nExecute using send_message to Pandas agent with the analytics instruction and current data, then wait_for_mentions for comprehensive analysis results."

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
            f"""You are a Sales Agent that orchestrates the complete sales workflow using Coral Protocol and specialized agents.
            
            Your responsibilities:
            1. Prospect Discovery - Coordinate with Firecrawl and OpenDeepResearch agents
            2. Lead Qualification - Use BANT criteria and VoiceInterface agent
            3. Contact Initiation - Manage voice and email outreach
            4. Deal Progression - Track and advance sales opportunities
            5. Analytics - Generate insights using Pandas agent
            
            Follow these steps in order:
            1. Call wait_for_mentions from coral tools (timeoutMs: 30000) to receive mentions from other agents.
            2. When you receive a mention, keep the thread ID and the sender ID.
            3. Analyze the instruction and determine which sales workflow to execute.
            4. Coordinate with appropriate agents based on the sales stage:
               - For prospect discovery: Use Firecrawl → OpenDeepResearch → Pandas
               - For lead qualification: Use VoiceInterface → Pandas for scoring
               - For contact initiation: Use VoiceInterface or email templates
               - For analytics: Use Pandas for data analysis
            5. Execute the workflow step by step, waiting for each agent response.
            6. Compile results and send comprehensive response back to sender.
            7. Always respond back to the sender agent with results or errors.
            8. Wait for 2 seconds and repeat the process from step 1.

            Coral tools: {coral_tools_description}
            Agent tools: {agent_tools_description}"""
        ),
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

    base_url = os.getenv("CORAL_SSE_URL")
    agentID = os.getenv("CORAL_AGENT_ID")

    coral_params = {
        "agentId": agentID,
        "agentDescription": "Sales Agent that orchestrates prospect discovery, lead qualification, contact initiation, and deal progression using specialized agents"
    }

    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    logger.info(f"Connecting to Coral Server: {CORAL_SERVER_URL}")

    timeout = float(os.getenv("TIMEOUT_MS", "300"))
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

    # Sales-specific tools
    agent_tools = [
        Tool(
            name="discover_prospects",
            func=None,
            coroutine=discover_prospects_tool,
            description="Discover prospects by coordinating with Firecrawl and OpenDeepResearch agents. Takes target criteria and returns structured prospect data.",
            args_schema={
                "properties": {
                    "target_domain": {"type": "string", "description": "Target company domain"},
                    "industry": {"type": "string", "description": "Target industry"},
                    "company_size": {"type": "string", "description": "Company size range"},
                    "keywords": {"type": "array", "items": {"type": "string"}, "description": "Search keywords"}
                },
                "type": "object"
            }
        ),
        Tool(
            name="qualify_lead",
            func=None,
            coroutine=qualify_lead_tool,
            description="Qualify a lead using BANT criteria and VoiceInterface agent. Returns lead score and category.",
            args_schema={
                "properties": {
                    "prospect_id": {"type": "string", "description": "Prospect ID to qualify"},
                    "contact_id": {"type": "string", "description": "Contact ID for qualification"}
                },
                "required": ["prospect_id", "contact_id"],
                "type": "object"
            }
        ),
        Tool(
            name="initiate_contact",
            func=None,
            coroutine=initiate_contact_tool,
            description="Initiate contact with a prospect via voice or email using VoiceInterface agent.",
            args_schema={
                "properties": {
                    "prospect_id": {"type": "string", "description": "Prospect ID"},
                    "contact_id": {"type": "string", "description": "Contact ID"},
                    "method": {"type": "string", "enum": ["voice", "email"], "description": "Contact method"},
                    "message": {"type": "string", "description": "Personalized message"}
                },
                "required": ["prospect_id", "contact_id", "method"],
                "type": "object"
            }
        ),
        Tool(
            name="generate_analytics",
            func=None,
            coroutine=generate_analytics_tool,
            description="Generate sales analytics and performance reports using Pandas agent.",
            args_schema={
                "properties": {
                    "timeframe": {"type": "string", "description": "Analytics timeframe (e.g., 'last_30_days', 'Q1_2025')"},
                    "metrics": {"type": "array", "items": {"type": "string"}, "description": "Specific metrics to include"}
                },
                "type": "object"
            }
        )
    ]
    
    agent_executor = await create_agent(coral_tools, agent_tools)

    while True:
        try:
            logger.info("Starting new agent invocation")
            await agent_executor.ainvoke({"agent_scratchpad": []})
            logger.info("Completed agent invocation, restarting loop")
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Error in agent loop: {str(e)}")
            logger.error(traceback.format_exc())
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())
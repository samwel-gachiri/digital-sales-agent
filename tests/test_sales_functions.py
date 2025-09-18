#!/usr/bin/env python3
"""
Test script to verify sales agent functions like research_prospects and send_email
"""
import asyncio
import urllib.parse
from dotenv import load_dotenv
import os
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor
import json

load_dotenv()

async def create_sales_test_agent(coral_tools):
    """Create a test agent that sends sales instructions"""
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are a test agent designed to test Sales Agent functions.

            Your task is to send specific sales instructions to the sales_agent and verify responses.
            
            Available test scenarios:
            1. RESEARCH PROSPECTS - Send prospect research instruction
            2. GENERATE EMAIL - Send email generation instruction
            3. GET ANALYTICS - Send analytics request
            
            Follow these steps:
            1. Use coral_list_agents to see available agents
            2. Find the sales_agent
            3. Use coral_create_thread with sales_agent as participant
            4. Send a JSON instruction using coral_send_message with proper mentions
            5. Use coral_wait_for_mentions to wait for sales_agent response
            6. Report the results
            
            JSON Instruction Format:
            {{
                "instruction": "research_prospects",
                "data": {{
                    "industry": "Technology",
                    "company_size": "50-200"
                }},
                "from": "sales_test_agent"
            }}
            """
        ),
        ("user", "{input}"),
        ("placeholder", "{agent_scratchpad}")
    ])
    
    model = init_chat_model(
        model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
        model_provider=os.getenv("MODEL_PROVIDER", "openai"),
        api_key=os.getenv("MODEL_API_KEY"),
        temperature=0.1,
        max_tokens=4000
    )
    
    agent = create_tool_calling_agent(model, coral_tools, prompt)
    return AgentExecutor(agent=agent, tools=coral_tools, verbose=True)

async def test_research_prospects():
    """Test the research_prospects function"""
    print("=== TESTING RESEARCH PROSPECTS ===")
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "sales_test_agent",
        "agentDescription": "Test agent for sales functions"
    }
    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    
    print(f"Connecting to: {CORAL_SERVER_URL}")
    
    client = MultiServerMCPClient(
        connections={
            "coral": {
                "transport": "sse",
                "url": CORAL_SERVER_URL,
                "timeout": 60,
                "sse_read_timeout": 60,
            }
        }
    )
    
    coral_tools = await client.get_tools(server_name="coral")
    agent_executor = await create_sales_test_agent(coral_tools)
    
    print("Sending research_prospects instruction to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": """
            Test the research_prospects function by:
            1. Finding the sales_agent using coral_list_agents
            2. Creating a thread with sales_agent
            3. Sending this JSON instruction with coral_send_message:
            {{
                "instruction": "research_prospects", 
                "data": {{
                    "industry": "Technology",
                    "company_size": "50-200",
                    "target_domain": "example-tech.com"
                }},
                "from": "sales_test_agent"
            }}
            4. Wait for sales_agent response using coral_wait_for_mentions (timeout: 20000ms)
            5. Report what the sales_agent responded
            """
        })
        
        print(f"🔍 RESEARCH PROSPECTS TEST RESULT:")
        print(f"{response['output']}")
        
        # Check if we got a meaningful response
        output = response['output'].lower()
        if "research" in output and ("success" in output or "initiated" in output or "prospect" in output):
            print("✅ Research prospects function appears to be working!")
        else:
            print("⚠️ Research prospects may not be working properly")
        
    except Exception as e:
        print(f"❌ Research prospects test error: {str(e)}")

async def test_generate_email():
    """Test the generate_email function"""
    print("\n=== TESTING GENERATE EMAIL ===")
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "email_test_agent",
        "agentDescription": "Test agent for email functions"
    }
    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    
    client = MultiServerMCPClient(
        connections={
            "coral": {
                "transport": "sse",
                "url": CORAL_SERVER_URL,
                "timeout": 60,
                "sse_read_timeout": 60,
            }
        }
    )
    
    coral_tools = await client.get_tools(server_name="coral")
    agent_executor = await create_sales_test_agent(coral_tools)
    
    print("Sending generate_cold_email instruction to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": """
            Test the generate_cold_email function by:
            1. Finding the sales_agent using coral_list_agents
            2. Creating a thread with sales_agent
            3. Sending this JSON instruction with coral_send_message:
            {{
                "instruction": "generate_cold_email",
                "data": {{
                    "prospect_id": "test_prospect_123",
                    "contact_name": "John Smith",
                    "contact_email": "john@testcompany.com"
                }},
                "from": "email_test_agent"
            }}
            4. Wait for sales_agent response using coral_wait_for_mentions (timeout: 20000ms)
            5. Report what the sales_agent responded
            """
        })
        
        print(f"📧 GENERATE EMAIL TEST RESULT:")
        print(f"{response['output']}")
        
        # Check if we got a meaningful response
        output = response['output'].lower()
        if "email" in output and ("generated" in output or "success" in output or "created" in output):
            print("✅ Generate email function appears to be working!")
        else:
            print("⚠️ Generate email may not be working properly")
        
    except Exception as e:
        print(f"❌ Generate email test error: {str(e)}")

async def test_get_analytics():
    """Test the get_analytics function"""
    print("\n=== TESTING GET ANALYTICS ===")
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "analytics_test_agent",
        "agentDescription": "Test agent for analytics functions"
    }
    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    
    client = MultiServerMCPClient(
        connections={
            "coral": {
                "transport": "sse",
                "url": CORAL_SERVER_URL,
                "timeout": 60,
                "sse_read_timeout": 60,
            }
        }
    )
    
    coral_tools = await client.get_tools(server_name="coral")
    agent_executor = await create_sales_test_agent(coral_tools)
    
    print("Sending get_analytics instruction to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": """
            Test the get_analytics function by:
            1. Finding the sales_agent using coral_list_agents
            2. Creating a thread with sales_agent
            3. Sending this JSON instruction with coral_send_message:
            {{
                "instruction": "get_analytics",
                "data": {{}},
                "from": "analytics_test_agent"
            }}
            4. Wait for sales_agent response using coral_wait_for_mentions (timeout: 20000ms)
            5. Report what the sales_agent responded
            """
        })
        
        print(f"📊 GET ANALYTICS TEST RESULT:")
        print(f"{response['output']}")
        
        # Check if we got a meaningful response
        output = response['output'].lower()
        if "analytics" in output or "prospects" in output or "emails" in output or "status" in output:
            print("✅ Get analytics function appears to be working!")
        else:
            print("⚠️ Get analytics may not be working properly")
        
    except Exception as e:
        print(f"❌ Get analytics test error: {str(e)}")

async def main():
    """Run all sales function tests"""
    print("TESTING SALES AGENT FUNCTIONS")
    print("=" * 50)
    
    # Check if Coral Server is running
    try:
        import requests
        response = requests.get("http://localhost:5555", timeout=5)
        print(f"✅ Coral Server is running (Status: {response.status_code})")
    except:
        print("❌ Coral Server is not running. Please start it first.")
        return
    
    print("\n🧪 Testing sales agent functions...")
    print("Make sure the Sales Agent is running and waiting for mentions!")
    
    await asyncio.sleep(2)
    
    # Run all tests
    await test_research_prospects()
    await test_generate_email()
    await test_get_analytics()
    
    print(f"\n🏁 SALES FUNCTION TESTS COMPLETED")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())
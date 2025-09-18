#!/usr/bin/env python3
"""
Test to prove Sales Agent is receiving and processing messages
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
import time

load_dotenv()

async def create_proof_test_agent(coral_tools):
    """Create a test agent that sends clear messages to sales_agent"""
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are a PROOF TEST AGENT designed to verify Sales Agent message processing.

            Your mission: Send clear, trackable messages to sales_agent and verify responses.
            
            Steps:
            1. Use coral_list_agents to find sales_agent
            2. Use coral_create_thread with sales_agent as participant
            3. Send a clear test message using coral_send_message with mentions=["sales_agent"]
            4. Use coral_wait_for_mentions to wait for sales_agent response
            5. Report exactly what happened
            
            Send messages like:
            - Simple test: "PROOF TEST: Hello sales_agent, please acknowledge this message"
            - Function test: JSON instruction for specific sales functions
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

async def test_simple_acknowledgment():
    """Test if sales_agent acknowledges simple messages"""
    print("🧪 TEST 1: SIMPLE MESSAGE ACKNOWLEDGMENT")
    print("=" * 50)
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "proof_test_1",
        "agentDescription": "Proof test agent for message acknowledgment"
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
    agent_executor = await create_proof_test_agent(coral_tools)
    
    print("📤 Sending simple acknowledgment test to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": """
            Send a simple test message to sales_agent:
            
            1. Find sales_agent using coral_list_agents
            2. Create thread with sales_agent
            3. Send message: "PROOF TEST 1: Hello sales_agent! This is a simple acknowledgment test. Please respond to prove you received this message."
            4. Wait 25 seconds for response using coral_wait_for_mentions
            5. Report exactly what sales_agent responded
            """
        })
        
        print(f"\n📋 TEST 1 RESULT:")
        print(f"{response['output']}")
        
        # Analyze response
        output = response['output'].lower()
        if "sales_agent" in output and ("responded" in output or "acknowledged" in output or "received" in output):
            print("\n✅ SUCCESS: Sales Agent appears to be responding!")
        elif "timeout" in output or "no response" in output:
            print("\n⚠️ TIMEOUT: Sales Agent did not respond within timeout")
        else:
            print("\n❓ UNCLEAR: Response received but unclear if from sales_agent")
        
    except Exception as e:
        print(f"\n❌ TEST 1 ERROR: {str(e)}")

async def test_research_prospects_instruction():
    """Test if sales_agent processes research_prospects instruction"""
    print("\n🧪 TEST 2: RESEARCH PROSPECTS INSTRUCTION")
    print("=" * 50)
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "proof_test_2",
        "agentDescription": "Proof test agent for research prospects"
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
    agent_executor = await create_proof_test_agent(coral_tools)
    
    print("📤 Sending research_prospects instruction to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": """
            Send a research_prospects instruction to sales_agent:
            
            1. Find sales_agent using coral_list_agents
            2. Create thread with sales_agent
            3. Send this JSON message:
            {
                "instruction": "research_prospects",
                "data": {
                    "industry": "Technology",
                    "company_size": "50-200",
                    "target_domain": "example-tech.com"
                },
                "from": "proof_test_2",
                "test_id": "PROOF_TEST_2"
            }
            4. Wait 25 seconds for response using coral_wait_for_mentions
            5. Report exactly what sales_agent responded
            """
        })
        
        print(f"\n📋 TEST 2 RESULT:")
        print(f"{response['output']}")
        
        # Analyze response
        output = response['output'].lower()
        if "research" in output and ("prospect" in output or "success" in output or "initiated" in output):
            print("\n✅ SUCCESS: Sales Agent processed research_prospects instruction!")
        elif "timeout" in output or "no response" in output:
            print("\n⚠️ TIMEOUT: Sales Agent did not respond within timeout")
        else:
            print("\n❓ UNCLEAR: Response received but unclear if research was processed")
        
    except Exception as e:
        print(f"\n❌ TEST 2 ERROR: {str(e)}")

async def test_get_analytics_instruction():
    """Test if sales_agent processes get_analytics instruction"""
    print("\n🧪 TEST 3: GET ANALYTICS INSTRUCTION")
    print("=" * 50)
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "proof_test_3",
        "agentDescription": "Proof test agent for analytics"
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
    agent_executor = await create_proof_test_agent(coral_tools)
    
    print("📤 Sending get_analytics instruction to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": """
            Send a get_analytics instruction to sales_agent:
            
            1. Find sales_agent using coral_list_agents
            2. Create thread with sales_agent
            3. Send this JSON message:
            {
                "instruction": "get_analytics",
                "data": {},
                "from": "proof_test_3",
                "test_id": "PROOF_TEST_3"
            }
            4. Wait 25 seconds for response using coral_wait_for_mentions
            5. Report exactly what sales_agent responded
            """
        })
        
        print(f"\n📋 TEST 3 RESULT:")
        print(f"{response['output']}")
        
        # Analyze response
        output = response['output'].lower()
        if "analytics" in output or "prospects" in output or "emails" in output or "workflow" in output:
            print("\n✅ SUCCESS: Sales Agent processed get_analytics instruction!")
        elif "timeout" in output or "no response" in output:
            print("\n⚠️ TIMEOUT: Sales Agent did not respond within timeout")
        else:
            print("\n❓ UNCLEAR: Response received but unclear if analytics was processed")
        
    except Exception as e:
        print(f"\n❌ TEST 3 ERROR: {str(e)}")

async def main():
    """Run all proof tests"""
    print("🔍 SALES AGENT MESSAGE PROCESSING PROOF TESTS")
    print("=" * 60)
    
    # Check if Coral Server is running
    try:
        import requests
        response = requests.get("http://localhost:5555", timeout=5)
        print(f"✅ Coral Server is running (Status: {response.status_code})")
    except:
        print("❌ Coral Server is not running. Please start it first.")
        return
    
    print("\n📢 IMPORTANT: Make sure the Sales Agent is running!")
    print("📢 Watch the Sales Agent console for message processing logs!")
    print("\n🚀 Starting proof tests...")
    
    # Run tests with delays
    await test_simple_acknowledgment()
    
    print("\n⏳ Waiting 5 seconds before next test...")
    await asyncio.sleep(5)
    
    await test_research_prospects_instruction()
    
    print("\n⏳ Waiting 5 seconds before next test...")
    await asyncio.sleep(5)
    
    await test_get_analytics_instruction()
    
    print(f"\n🏁 ALL PROOF TESTS COMPLETED")
    print("=" * 60)
    print("📊 Check the results above to see if Sales Agent is processing messages!")

if __name__ == "__main__":
    asyncio.run(main())
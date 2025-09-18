#!/usr/bin/env python3
"""
Simple test to verify wait_for_mentions functionality
"""
import asyncio
import urllib.parse
from dotenv import load_dotenv
import os
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor

load_dotenv()

async def create_simple_test_agent(coral_tools):
    """Create a simple test agent without complex variable escaping"""
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are a test agent designed to test Coral Protocol communication.

            Your task is to:
            1. Use coral_list_agents to see what agents are available
            2. Find the sales_agent in the list
            3. Use coral_create_thread with threadName="test_123" and participantIds=["sales_agent","firecrawlmcp_agent"]
            4. Use coral_send_message to send a test message with mentions=["firecrawlmcp_agent"]
            4. Use coral_send_message to send a test message with mentions=["sales_agent"]
            5. Use coral_wait_for_mentions with timeout 15000ms to wait for response
            6. Report what happened
            
            Always use proper mentions in coral_send_message calls.
            Send a simple test message like: "Hello sales_agent, this is a test message from test_sender"
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

async def test_simple_communication():
    """Simple test to send a message to sales_agent"""
    print("=== SIMPLE COMMUNICATION TEST ===")
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "test_sender",
        "agentDescription": "Simple test agent"
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
    print(f"Available Coral tools: {[tool.name for tool in coral_tools]}")
    
    agent_executor = await create_simple_test_agent(coral_tools)
    
    print("Sending test message to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": "Test communication with sales_agent by following the steps in your instructions."
        })
        
        print(f"Test Result: {response}")
        
    except Exception as e:
        print(f"Test Error: {str(e)}")
        import traceback
        traceback.print_exc()

async def main():
    """Run the simple communication test"""
    print("SIMPLE CORAL PROTOCOL TEST")
    print("=" * 40)
    
    # Check if Coral Server is running
    try:
        import requests
        response = requests.get("http://localhost:5555", timeout=5)
        print(f"✅ Coral Server is running")
    except:
        print("❌ Coral Server is not running. Please start it first.")
        return
    
    print("\n🧪 Testing basic agent communication...")
    print("Make sure the Sales Agent is running and waiting for mentions!")
    
    await asyncio.sleep(2)
    await test_simple_communication()

if __name__ == "__main__":
    asyncio.run(main())
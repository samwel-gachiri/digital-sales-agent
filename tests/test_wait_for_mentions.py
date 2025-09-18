#!/usr/bin/env python3
"""
Test script to verify wait_for_mentions functionality between agents
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

def get_tools_description(tools):
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )

async def create_test_agent(coral_tools, agent_id):
    """Create a simple test agent that can send and receive messages"""
    coral_tools_description = get_tools_description(coral_tools)
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""You are a test agent ({agent_id}) designed to test Coral Protocol communication.

            **YOUR MISSION:**
            Test the wait_for_mentions and send_message functionality.
            
            **WORKFLOW:**
            1. Use `list_agents` to see what agents are available
            2. If you are "test_sender":
               - Find "sales_agent" in the agent list
               - Use `create_thread` with threadName="test_communication" and participantIds=["sales_agent"]
               - Use `send_message` to send a test instruction with mentions=["sales_agent"]
               - Use `wait_for_mentions` to wait for response
            3. If you are "test_receiver":
               - Use `wait_for_mentions` to wait for messages from other agents
               - When you receive a message, respond back using `send_message`
            
            **Available Tools:**
            {coral_tools_description}
            
            **Test Message Format:**
            Send JSON like: {{"instruction": "test_communication", "data": {{"message": "Hello from test agent"}}, "from": "{agent_id}"}}
            
            Always use proper mentions in send_message calls.
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

async def test_sender():
    """Test agent that sends a message to sales_agent"""
    print("=== STARTING TEST SENDER ===")
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "test_sender",
        "agentDescription": "Test agent that sends messages to other agents"
    }
    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    
    print(f"Test Sender connecting to: {CORAL_SERVER_URL}")
    
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
    agent_executor = await create_test_agent(coral_tools, "test_sender")
    
    print("Test Sender: Sending test message to sales_agent...")
    
    try:
        response = await agent_executor.ainvoke({
            "input": """
            Follow these steps to test communication with sales_agent:
            
            1. Use list_agents to see available agents
            2. Look for 'sales_agent' in the list
            3. Use create_thread with threadName="test_communication_123" and participantIds=["sales_agent"]
            4. Use send_message to send this test instruction to sales_agent:
               Content: {"instruction": "test_communication", "data": {"message": "Hello from test_sender", "test": true}, "from": "test_sender"}
               Mentions: ["sales_agent"]
            5. Use wait_for_mentions with timeout 15000ms to wait for sales_agent response
            6. Report the results
            """
        })
        
        print(f"Test Sender Result: {response}")
        
    except Exception as e:
        print(f"Test Sender Error: {str(e)}")
    
    # Note: MultiServerMCPClient doesn't have close() method
    print("Test Sender: Completed")

async def main():
    """Run the communication test"""
    print("TESTING CORAL PROTOCOL WAIT_FOR_MENTIONS")
    print("=" * 50)
    
    # Check if Coral Server is running
    try:
        import requests
        response = requests.get("http://localhost:5555", timeout=5)
        print(f"✅ Coral Server is running (Status: {response.status_code})")
    except:
        print("❌ Coral Server is not running. Please start it first.")
        return
    
    print("\n🧪 Starting communication test...")
    print("This will test if agents can communicate via wait_for_mentions")
    print("Make sure the Sales Agent is running!")
    
    await asyncio.sleep(2)
    await test_sender()

if __name__ == "__main__":
    asyncio.run(main())
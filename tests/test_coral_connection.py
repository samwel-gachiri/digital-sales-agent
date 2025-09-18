#!/usr/bin/env python3
"""
Simple test to verify Coral Server connection and tool availability
"""
import asyncio
import urllib.parse
from dotenv import load_dotenv
import os
from langchain_mcp_adapters.client import MultiServerMCPClient

load_dotenv()

async def test_coral_connection():
    """Test basic connection to Coral Server"""
    print("=== TESTING CORAL SERVER CONNECTION ===")
    
    base_url = os.getenv("CORAL_SSE_URL", "http://localhost:5555/sse/v1/devmode/exampleApplication/privkey/session1/sse")
    
    coral_params = {
        "agentId": "connection_test",
        "agentDescription": "Test connection to Coral Server"
    }
    query_string = urllib.parse.urlencode(coral_params)
    CORAL_SERVER_URL = f"{base_url}?{query_string}"
    
    print(f"Connecting to: {CORAL_SERVER_URL}")
    
    try:
        client = MultiServerMCPClient(
            connections={
                "coral": {
                    "transport": "sse",
                    "url": CORAL_SERVER_URL,
                    "timeout": 30,
                    "sse_read_timeout": 30,
                }
            }
        )
        
        print("✅ Client created successfully")
        
        # Get available tools
        coral_tools = await client.get_tools(server_name="coral")
        print(f"✅ Retrieved {len(coral_tools)} Coral tools:")
        
        for tool in coral_tools:
            print(f"   - {tool.name}: {tool.description}")
        
        # Test list_agents tool specifically
        print("\n🔍 Testing list_agents tool...")
        
        # Find list_agents tool
        list_agents_tool = None
        for tool in coral_tools:
            if tool.name == "list_agents":
                list_agents_tool = tool
                break
        
        if list_agents_tool:
            print("✅ Found list_agents tool")
            try:
                # Try to call list_agents
                result = await client.call_tool("coral", "list_agents", {"includeDetails": True})
                print(f"✅ list_agents result: {result}")
            except Exception as e:
                print(f"❌ Error calling list_agents: {str(e)}")
        else:
            print("❌ list_agents tool not found")
        
        print("\n✅ Connection test completed successfully")
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        import traceback
        traceback.print_exc()

async def main():
    print("CORAL SERVER CONNECTION TEST")
    print("=" * 40)
    
    # Check if Coral Server is running
    try:
        import requests
        response = requests.get("http://localhost:5555", timeout=5)
        print(f"✅ Coral Server HTTP check: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Coral Server HTTP check failed: {str(e)}")
        return
    
    await test_coral_connection()

if __name__ == "__main__":
    asyncio.run(main())
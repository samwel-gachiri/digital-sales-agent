#!/usr/bin/env python3
"""
Comprehensive test to verify the full agent workflow:
Backend -> Sales Agent -> Firecrawl Agent -> Sales Agent -> Backend
"""
import asyncio
import requests
import json
import time
from datetime import datetime

def check_services():
    """Check if all required services are running"""
    services = {
        "Coral Server": "http://localhost:5555",
        "Backend": "http://localhost:8000/api/health"
    }
    
    results = {}
    for name, url in services.items():
        try:
            response = requests.get(url, timeout=5)
            results[name] = {"status": "✅ Running", "code": response.status_code}
        except requests.exceptions.ConnectionError:
            results[name] = {"status": "❌ Not Running", "code": None}
        except Exception as e:
            results[name] = {"status": f"❌ Error: {str(e)}", "code": None}
    
    return results

async def test_onboarding_workflow():
    """Test the complete onboarding -> prospect research -> email workflow"""
    print("\n🧪 TESTING COMPLETE AGENT WORKFLOW")
    print("=" * 50)
    
    # Step 1: Complete onboarding (should trigger agent communication)
    print("1️⃣ Testing onboarding completion...")
    
    onboarding_data = {
        "business_goal": "sell AI automation tools to tech companies",
        "product_description": "AI-powered sales automation platform that increases efficiency",
        "target_market": "B2B technology companies and startups",
        "value_proposition": "increase sales efficiency by 300% through AI automation"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/onboarding/complete",
            json=onboarding_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Onboarding completed: {result.get('message', 'Success')}")
            print(f"   📊 Workflow initiated: {result.get('workflow_initiated', False)}")
            
            # Step 2: Wait for agents to process
            print("\n2️⃣ Waiting for agents to process (15 seconds)...")
            for i in range(15):
                print(f"   ⏳ {15-i} seconds remaining...", end='\r')
                time.sleep(1)
            print("\n")
            
            # Step 3: Check workflow status
            print("3️⃣ Checking workflow status...")
            status_response = requests.get("http://localhost:8000/api/workflow/status", timeout=10)
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                print(f"   📈 Workflow Status Response:")
                print(f"   {json.dumps(status_data, indent=4)}")
                
                # Analyze the results
                workflow = status_data.get("workflow", {})
                
                # Check agent communication indicators
                total_prospects = workflow.get("total_prospects", 0)
                emails_generated = workflow.get("emails_generated", 0)
                emails_sent = workflow.get("emails_sent", 0)
                
                print(f"\n📊 AGENT COMMUNICATION ANALYSIS:")
                print(f"   Prospects Created: {total_prospects}")
                print(f"   Emails Generated: {emails_generated}")
                print(f"   Emails Sent: {emails_sent}")
                
                if total_prospects > 0:
                    print("   ✅ Sales Agent is working - prospects created!")
                else:
                    print("   ⚠️  No prospects created - Sales Agent may not be processing")
                
                if emails_generated > 0:
                    print("   ✅ Email generation working!")
                else:
                    print("   ⚠️  No emails generated - Email workflow may have issues")
                
                if emails_sent > 0:
                    print("   ✅ Email sending working!")
                else:
                    print("   ⚠️  No emails sent - SMTP may not be configured")
                
                # Check for fallback mode
                if status_data.get("fallback"):
                    print("   ⚠️  System is running in fallback mode - agents may not be communicating")
                else:
                    print("   ✅ System is running in normal mode")
                    
            else:
                print(f"   ❌ Failed to get workflow status: {status_response.status_code}")
                
        else:
            print(f"   ❌ Onboarding failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Workflow test error: {str(e)}")

async def test_direct_agent_communication():
    """Test direct communication with Sales Agent via backend"""
    print("\n🔗 TESTING DIRECT AGENT COMMUNICATION")
    print("=" * 40)
    
    # Test prospect research endpoint
    print("1️⃣ Testing prospect research...")
    try:
        research_data = {
            "industry": "Technology",
            "company_size": "50-200"
        }
        
        response = requests.post(
            "http://localhost:8000/api/prospects/research",
            json=research_data,
            timeout=20
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Research request successful")
            print(f"   📊 Result: {json.dumps(result, indent=4)}")
            
            if result.get("fallback"):
                print("   ⚠️  Using fallback mode - agent communication failed")
            else:
                print("   ✅ Real agent communication working!")
                
        else:
            print(f"   ❌ Research failed: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Research test error: {str(e)}")

def main():
    print("COMPREHENSIVE AGENT WORKFLOW TEST")
    print("=" * 60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check services
    print("\n🔍 CHECKING SERVICES")
    print("-" * 30)
    service_results = check_services()
    
    all_running = True
    for name, result in service_results.items():
        print(f"{name}: {result['status']}")
        if "❌" in result['status']:
            all_running = False
    
    if not all_running:
        print("\n❌ Some services are not running. Please start all agents using: start_agents.bat")
        return
    
    # Run tests
    asyncio.run(test_onboarding_workflow())
    asyncio.run(test_direct_agent_communication())
    
    print(f"\n🏁 TEST COMPLETED")
    print("=" * 60)
    print("If you see 'fallback mode' warnings, it means agents are not communicating properly.")
    print("Check that all agents are running and connected to Coral Server.")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Test script to verify agent communication through Coral Protocol
"""
import asyncio
import requests
import json
import time
from datetime import datetime

def check_coral_server():
    """Check if Coral Server is running"""
    try:
        response = requests.get("http://localhost:5555", timeout=5)
        return True, f"Coral Server running (Status: {response.status_code})"
    except requests.exceptions.ConnectionError:
        return False, "Coral Server not running"
    except Exception as e:
        return False, f"Coral Server error: {str(e)}"

def check_backend():
    """Check if Backend is running"""
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            return True, f"Backend running - {data}"
        else:
            return False, f"Backend unhealthy (Status: {response.status_code})"
    except requests.exceptions.ConnectionError:
        return False, "Backend not running"
    except Exception as e:
        return False, f"Backend error: {str(e)}"

def test_agent_workflow():
    """Test the complete agent workflow"""
    try:
        print("\n=== TESTING AGENT WORKFLOW ===")
        
        # Test onboarding completion (triggers agent workflow)
        print("1. Testing onboarding completion...")
        onboarding_data = {
            "business_goal": "sell AI automation tools",
            "product_description": "AI-powered sales automation platform",
            "target_market": "B2B technology companies",
            "value_proposition": "increase sales efficiency by 300%"
        }
        
        response = requests.post(
            "http://localhost:8000/api/onboarding/complete",
            json=onboarding_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Onboarding completed: {result.get('message', 'Success')}")
            
            # Wait for agents to process
            print("2. Waiting for agents to process...")
            time.sleep(10)
            
            # Check workflow status
            print("3. Checking workflow status...")
            status_response = requests.get("http://localhost:8000/api/workflow/status", timeout=10)
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                print(f"✅ Workflow status: {json.dumps(status_data, indent=2)}")
                
                # Check if agents communicated
                workflow = status_data.get("workflow", {})
                if workflow.get("total_prospects", 0) > 0:
                    print("✅ Sales Agent created prospects - agent communication working!")
                else:
                    print("⚠️  No prospects created - agents may not be communicating")
                
                if workflow.get("emails_generated", 0) > 0:
                    print("✅ Emails generated - email workflow working!")
                else:
                    print("⚠️  No emails generated - email workflow may have issues")
                    
            else:
                print(f"❌ Failed to get workflow status: {status_response.status_code}")
                
        else:
            print(f"❌ Onboarding failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Workflow test error: {str(e)}")

def main():
    print("AGENT COMMUNICATION TEST")
    print("=" * 50)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Check system components
    checks = [
        ("Coral Server", check_coral_server),
        ("Backend API", check_backend),
    ]

    all_running = True
    for name, check_func in checks:
        success, message = check_func()
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{name}: {status} - {message}")
        if not success:
            all_running = False

    if all_running:
        test_agent_workflow()
    else:
        print("\n❌ Cannot test agent workflow - some components are not running")
        print("Please start all agents using: start_agents.bat")

if __name__ == "__main__":
    main()
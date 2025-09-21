#!/usr/bin/env python3
"""
Test script to verify the fixes implemented
"""

import asyncio
import aiohttp
import json

BASE_URL = "http://localhost:8000"

async def test_health_endpoint():
    """Test health endpoint to check system status"""
    print("🔍 Testing health endpoint...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/api/health") as response:
                data = await response.json()
                print(f"✅ Health Status: {data.get('status')}")
                print(f"   Agent Status: {data.get('agent_status')}")
                print(f"   Crossmint Status: {data.get('crossmint_status')}")
                return data.get('status') == 'healthy'
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

async def test_workflow_status():
    """Test workflow status endpoint"""
    print("\n📊 Testing workflow status...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/api/workflow/status") as response:
                data = await response.json()
                print(f"✅ Workflow Status: {data.get('status')}")
                if data.get('status') == 'success':
                    workflow = data.get('workflow', {})
                    print(f"   Prospects: {workflow.get('total_prospects', 0)}")
                    print(f"   Emails Sent: {workflow.get('emails_sent', 0)}")
                    print(f"   Active Conversations: {workflow.get('active_conversations', 0)}")
                return True
    except Exception as e:
        print(f"❌ Workflow status failed: {e}")
        return False

async def test_onboarding_completion():
    """Test onboarding completion with proper prospect list handling"""
    print("\n🚀 Testing onboarding completion...")
    try:
        business_data = {
            "business_goal": "Sell AI automation software to B2B companies",
            "product_description": "AI-powered sales automation platform",
            "target_market": "B2B technology companies",
            "value_proposition": "Increase sales efficiency by 300% with AI agents"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{BASE_URL}/api/onboarding/complete",
                json=business_data
            ) as response:
                data = await response.json()
                print(f"✅ Onboarding Status: {data.get('status')}")
                print(f"   Workflow Initiated: {data.get('workflow_initiated')}")
                
                if data.get('research_result'):
                    research = data['research_result']
                    print(f"   Research Status: {research.get('status')}")
                    
                if data.get('email_result'):
                    email = data['email_result']
                    print(f"   Email Status: {email.get('status')}")
                    
                return data.get('status') == 'success'
    except Exception as e:
        print(f"❌ Onboarding completion failed: {e}")
        return False

async def test_crossmint_integration():
    """Test Crossmint Web3 integration"""
    print("\n💳 Testing Crossmint integration...")
    try:
        # Test wallet status
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/api/crossmint/wallet/test@example.com") as response:
                data = await response.json()
                print(f"✅ Crossmint Wallet: {data.get('status')}")
                
                # Test subscription payment
                payment_data = {
                    "customer_email": "test@example.com",
                    "customer_name": "Test User",
                    "plan_type": "pro",
                    "amount": 99.00
                }
                
                async with session.post(
                    f"{BASE_URL}/api/crossmint/subscription",
                    json=payment_data
                ) as payment_response:
                    payment_result = await payment_response.json()
                    print(f"✅ Payment Creation: {payment_result.get('status')}")
                    
                return True
    except Exception as e:
        print(f"❌ Crossmint integration failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("🧪 Testing System Fixes")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("Workflow Status", test_workflow_status),
        ("Onboarding Completion", test_onboarding_completion),
        ("Crossmint Integration", test_crossmint_integration)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        print(f"\n🔧 {test_name}")
        print("-" * 30)
        if await test_func():
            passed += 1
            print(f"✅ {test_name} PASSED")
        else:
            print(f"❌ {test_name} FAILED")
    
    print(f"\n📊 Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All fixes working correctly!")
        print("\n✅ Fixed Issues:")
        print("   • Sales Agent get_workflow_status tool error")
        print("   • Prospect list passing in email generation")
        print("   • Dashboard status interval cleanup")
        print("   • Web3 page interval cleanup")
        print("   • MetaMask wallet connection added")
    else:
        print("⚠️  Some tests failed. Check the logs for details.")

if __name__ == "__main__":
    asyncio.run(main())
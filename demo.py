#!/usr/bin/env python3
"""
Digital Sales Agent Demo Script

This script demonstrates the key capabilities of the Digital Sales Agent system
by simulating API calls to the Sales Interface Agent.
"""

import asyncio
import aiohttp
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

async def demo_prospect_discovery():
    """Demo prospect discovery workflow"""
    print("🔍 Starting Prospect Discovery Demo...")
    
    discovery_request = {
        "industry": "technology",
        "company_size": "50-200",
        "keywords": ["SaaS", "AI", "startup"]
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BASE_URL}/sales/discover-prospects",
                json=discovery_request
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Discovery initiated: {result['message']}")
                else:
                    print(f"❌ Discovery failed: {response.status}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
            print("💡 Make sure the Sales Interface Agent is running on port 8000")

async def demo_lead_qualification():
    """Demo lead qualification workflow"""
    print("\n📋 Starting Lead Qualification Demo...")
    
    qualification_request = {
        "prospect_id": "demo_prospect_123",
        "contact_id": "demo_contact_456"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BASE_URL}/sales/qualify-lead",
                json=qualification_request
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Qualification initiated: {result['message']}")
                else:
                    print(f"❌ Qualification failed: {response.status}")
        except Exception as e:
            print(f"❌ Connection error: {e}")

async def demo_contact_initiation():
    """Demo contact initiation workflow"""
    print("\n📞 Starting Contact Initiation Demo...")
    
    contact_request = {
        "prospect_id": "demo_prospect_123",
        "contact_id": "demo_contact_456",
        "method": "voice",
        "message": "Hi, I'd like to discuss how our AI solutions can help your business grow"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                f"{BASE_URL}/sales/initiate-contact",
                json=contact_request
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Contact initiated: {result['message']}")
                else:
                    print(f"❌ Contact initiation failed: {response.status}")
        except Exception as e:
            print(f"❌ Connection error: {e}")

async def demo_analytics():
    """Demo analytics generation"""
    print("\n📊 Starting Analytics Demo...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                f"{BASE_URL}/sales/analytics?timeframe=last_30_days&metrics=conversion_rate,pipeline_velocity"
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Analytics generated: {result['data']}")
                else:
                    print(f"❌ Analytics failed: {response.status}")
        except Exception as e:
            print(f"❌ Connection error: {e}")

async def demo_pipeline_status():
    """Demo pipeline status check"""
    print("\n📈 Checking Pipeline Status...")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/sales/pipeline") as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Pipeline status: {result['data']}")
                else:
                    print(f"❌ Pipeline check failed: {response.status}")
        except Exception as e:
            print(f"❌ Connection error: {e}")

async def main():
    """Run the complete demo"""
    print("🎯 Digital Sales Agent Demo")
    print("=" * 50)
    print(f"Demo started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nThis demo showcases the key capabilities of the Digital Sales Agent:")
    print("1. Prospect Discovery using Firecrawl and OpenDeepResearch agents")
    print("2. Lead Qualification with BANT scoring")
    print("3. Contact Initiation via Voice (ElevenLabs) or Email")
    print("4. Analytics Generation using Pandas agent")
    print("5. Pipeline Status Monitoring")
    print("\n" + "=" * 50)
    
    # Run all demo functions
    await demo_prospect_discovery()
    await asyncio.sleep(1)
    
    await demo_lead_qualification()
    await asyncio.sleep(1)
    
    await demo_contact_initiation()
    await asyncio.sleep(1)
    
    await demo_analytics()
    await asyncio.sleep(1)
    
    await demo_pipeline_status()
    
    print("\n" + "=" * 50)
    print("🎉 Demo completed!")
    print("\nNext steps:")
    print("1. Open http://localhost:3000 to see the frontend")
    print("2. Try the prospect discovery form")
    print("3. Explore the dashboard and analytics")
    print("4. Test voice interactions (requires ElevenLabs setup)")

if __name__ == "__main__":
    asyncio.run(main())
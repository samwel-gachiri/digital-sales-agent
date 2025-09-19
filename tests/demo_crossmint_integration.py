#!/usr/bin/env python3
"""
Crossmint Integration Demo Script
Demonstrates Web3 features in the Digital Sales Agent
"""

import asyncio
import aiohttp
import json
from datetime import datetime

# Backend API base URL
BASE_URL = "http://localhost:8000"

async def demo_subscription_payment():
    """Demo: Create subscription payment"""
    print("\n🔷 Demo: Subscription Payment via Crossmint")
    print("=" * 50)
    
    payment_data = {
        "customer_email": "demo@example.com",
        "customer_name": "Demo Customer",
        "plan_type": "pro",
        "amount": 99.00
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(f"{BASE_URL}/api/crossmint/subscription", json=payment_data) as response:
                result = await response.json()
                
                if result.get("status") == "success":
                    print(f"✅ Payment created successfully!")
                    print(f"   Payment ID: {result.get('payment_id')}")
                    print(f"   Amount: ${result.get('amount')}")
                    print(f"   Plan: {result.get('plan')}")
                elif result.get("status") == "disabled":
                    print("ℹ️  Crossmint not configured - Demo mode")
                    print("   This shows how subscription payments would work")
                else:
                    print(f"❌ Payment failed: {result.get('message')}")
                    
        except Exception as e:
            print(f"❌ Error: {str(e)}")

async def demo_achievement_nft():
    """Demo: Mint achievement NFT"""
    print("\n🏆 Demo: Achievement NFT Minting")
    print("=" * 50)
    
    achievement_data = {
        "recipient_email": "samgachiri2002@gmail.com",
        "achievement_type": "top_performer",
        "performance_data": {
            "performance_percentage": 150,
            "deals_closed": 10,
            "revenue": 50000,
            "conversion_rate": 85
        }
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(f"{BASE_URL}/api/crossmint/achievement", json=achievement_data) as response:
                result = await response.json()
                
                if result.get("status") == "success":
                    print(f"✅ Achievement NFT minted successfully!")
                    print(f"   NFT ID: {result.get('nft_id')}")
                    print(f"   Achievement: {result.get('achievement_type')}")
                    print(f"   Transaction: {result.get('transaction_hash')}")
                elif result.get("status") == "disabled":
                    print("ℹ️  Crossmint not configured - Demo mode")
                    print("   This shows how achievement NFTs would be minted")
                else:
                    print(f"❌ NFT minting failed: {result.get('message')}")
                    
        except Exception as e:
            print(f"❌ Error: {str(e)}")

async def demo_deal_processing():
    """Demo: Automated deal processing with Web3 rewards"""
    print("\n⚡ Demo: Automated Deal Processing")
    print("=" * 50)
    
    deal_data = {
        "deal_id": f"deal_{int(datetime.now().timestamp())}",
        "amount": 5000,
        "customer_email": "customer@example.com",
        "sales_agent_id": "sales_agent_001"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(f"{BASE_URL}/api/crossmint/deal-payment", json=deal_data) as response:
                result = await response.json()
                
                if result.get("status") == "success":
                    print(f"✅ Deal processed successfully!")
                    print(f"   Deal ID: {result.get('deal_id')}")
                    print(f"   Total Amount: ${result.get('total_amount')}")
                    print(f"   Commission: ${result.get('commission_amount')}")
                    print(f"   Payment Status: {result.get('payment', {}).get('status', 'N/A')}")
                    print(f"   Commission Token: {result.get('commission', {}).get('status', 'N/A')}")
                    print(f"   Achievement NFT: {result.get('achievement', {}).get('status', 'N/A')}")
                elif result.get("status") == "disabled":
                    print("ℹ️  Crossmint not configured - Demo mode")
                    print("   This shows automated deal processing with:")
                    print("   • Payment processing")
                    print("   • Commission distribution")
                    print("   • Achievement NFT rewards")
                else:
                    print(f"❌ Deal processing failed: {result.get('message')}")
                    
        except Exception as e:
            print(f"❌ Error: {str(e)}")

async def demo_wallet_status():
    """Demo: Get wallet status"""
    print("\n💼 Demo: Wallet Status")
    print("=" * 50)
    
    email = "samgachiri2002@gmail.com"
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/api/crossmint/wallet/{email}") as response:
                result = await response.json()
                
                if result.get("status") == "success":
                    print(f"✅ Wallet status retrieved!")
                    print(f"   Address: {result.get('wallet_address')}")
                    print(f"   NFT Count: {result.get('nft_count')}")
                    print(f"   Commission Tokens: {result.get('commission_tokens')} SCT")
                    print(f"   Total Earnings: ${result.get('total_earnings')}")
                    print(f"   Achievements: {len(result.get('achievements', []))}")
                elif result.get("status") == "disabled":
                    print("ℹ️  Crossmint not configured - Demo mode")
                    print("   This shows wallet status tracking")
                else:
                    print(f"❌ Wallet status failed: {result.get('message')}")
                    
        except Exception as e:
            print(f"❌ Error: {str(e)}")

async def check_backend_health():
    """Check if backend is running"""
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/api/health") as response:
                result = await response.json()
                
                print(f"🔍 Backend Status: {result.get('status')}")
                print(f"   Agent Status: {result.get('agent_status')}")
                print(f"   ElevenLabs: {result.get('elevenlabs_status')}")
                print(f"   Crossmint: {result.get('crossmint_status')}")
                
                if result.get('crossmint_status') == 'configured':
                    print(f"   Crossmint Environment: {result.get('crossmint_environment')}")
                
                return result.get('status') == 'healthy'
                
        except Exception as e:
            print(f"❌ Backend not accessible: {str(e)}")
            print("   Make sure to start the backend with: cd backend && python main.py")
            return False

async def main():
    """Run the Crossmint integration demo"""
    print("🚀 Digital Sales Agent - Crossmint Web3 Integration Demo")
    print("=" * 60)
    print("This demo showcases blockchain payments, NFT rewards, and smart contract automation")
    print()
    
    # Check backend health
    if not await check_backend_health():
        print("\n❌ Backend is not running. Please start it first:")
        print("   cd backend && python main.py")
        return
    
    print("\n" + "=" * 60)
    
    # Run all demos
    await demo_subscription_payment()
    await demo_achievement_nft()
    await demo_deal_processing()
    await demo_wallet_status()
    
    print("\n" + "=" * 60)
    print("🎉 Demo completed!")
    print()
    print("💡 Key Crossmint Integration Features:")
    print("   • Subscription payments with fiat-to-crypto conversion")
    print("   • Performance-based NFT achievement rewards")
    print("   • Automated commission distribution via tokens")
    print("   • Smart contract deal processing")
    print("   • Transparent blockchain audit trail")
    print()
    print("🌐 Access the Web3 dashboard at: http://localhost:3000/web3")
    print("📚 Configure Crossmint by adding API keys to backend/.env")

if __name__ == "__main__":
    asyncio.run(main())
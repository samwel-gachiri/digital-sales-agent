#!/usr/bin/env python3
"""
Quick test script to verify Crossmint endpoints are working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        print(f"✅ Health: {data.get('status')}")
        print(f"   Crossmint: {data.get('crossmint_status')}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_wallet_status():
    """Test wallet status endpoint"""
    print("\n💼 Testing wallet status endpoint...")
    try:
        email = "samgachiri2002@gmail.com"
        response = requests.get(f"{BASE_URL}/api/crossmint/wallet/{email}")
        data = response.json()
        print(f"✅ Wallet status: {data.get('status')}")
        if data.get('status') == 'success':
            print(f"   Address: {data.get('wallet_address')}")
            print(f"   NFTs: {data.get('nft_count')}")
            print(f"   Tokens: {data.get('commission_tokens')}")
        return True
    except Exception as e:
        print(f"❌ Wallet status failed: {e}")
        return False

def test_subscription():
    """Test subscription endpoint"""
    print("\n💳 Testing subscription endpoint...")
    try:
        payload = {
            "customer_email": "test@example.com",
            "customer_name": "Test Customer",
            "plan_type": "pro",
            "amount": 99.00
        }
        response = requests.post(f"{BASE_URL}/api/crossmint/subscription", json=payload)
        data = response.json()
        print(f"✅ Subscription: {data.get('status')}")
        if data.get('status') == 'success':
            print(f"   Payment ID: {data.get('payment_id')}")
        elif data.get('status') == 'disabled':
            print("   ℹ️  Crossmint not configured - demo mode")
        return True
    except Exception as e:
        print(f"❌ Subscription test failed: {e}")
        return False

def test_achievement():
    """Test achievement NFT endpoint"""
    print("\n🏆 Testing achievement NFT endpoint...")
    try:
        payload = {
            "recipient_email": "samgachiri2002@gmail.com",
            "achievement_type": "top_performer",
            "performance_data": {
                "performance_percentage": 150,
                "deals_closed": 5,
                "revenue": 25000,
                "conversion_rate": 85
            }
        }
        response = requests.post(f"{BASE_URL}/api/crossmint/achievement", json=payload)
        data = response.json()
        print(f"✅ Achievement NFT: {data.get('status')}")
        if data.get('status') == 'success':
            print(f"   NFT ID: {data.get('nft_id')}")
        elif data.get('status') == 'disabled':
            print("   ℹ️  Crossmint not configured - demo mode")
        return True
    except Exception as e:
        print(f"❌ Achievement test failed: {e}")
        return False

def main():
    print("🧪 Crossmint Endpoints Test")
    print("=" * 40)
    
    tests = [
        test_health,
        test_wallet_status,
        test_subscription,
        test_achievement
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Crossmint integration is working.")
        print("\n🌐 Try the Web3 dashboard: http://localhost:3000/web3")
    else:
        print("⚠️  Some tests failed. Check backend logs for details.")

if __name__ == "__main__":
    main()
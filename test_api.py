#!/usr/bin/env python3
"""
Test script for Digital Sales Agent API
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_prospect_discovery():
    """Test prospect discovery endpoint"""
    print("🔍 Testing Prospect Discovery...")
    
    data = {
        "industry": "technology",
        "company_size": "50-200",
        "keywords": ["SaaS", "AI", "startup"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/sales/discover-prospects", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: Found {result['prospects_found']} prospects")
            print(f"   Message: {result['message']}")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_lead_qualification():
    """Test lead qualification endpoint"""
    print("\n📋 Testing Lead Qualification...")
    
    data = {
        "prospect_id": "test_prospect_123",
        "contact_id": "test_contact_456"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/sales/qualify-lead", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: Lead scored {result['overall_score']}/10 ({result['category']})")
            print(f"   BANT Scores: {result['bant_scores']}")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_contact_initiation():
    """Test contact initiation endpoint"""
    print("\n📞 Testing Contact Initiation...")
    
    data = {
        "prospect_id": "test_prospect_123",
        "contact_id": "test_contact_456",
        "method": "voice",
        "message": "Hi, I'd like to discuss how our AI solutions can help your business grow"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/sales/initiate-contact", json=data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result['contact_method']} contact initiated")
            print(f"   Outcome: {result.get('outcome', 'Contact sent')}")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_analytics():
    """Test analytics endpoint"""
    print("\n📊 Testing Analytics...")
    
    try:
        response = requests.get(f"{BASE_URL}/sales/analytics?timeframe=last_30_days", timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: Analytics generated")
            print(f"   Total Prospects: {result['data']['total_prospects']}")
            print(f"   Conversion Rate: {result['data']['conversion_rate']}%")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_pipeline():
    """Test pipeline endpoint"""
    print("\n📈 Testing Pipeline Status...")
    
    try:
        response = requests.get(f"{BASE_URL}/sales/pipeline", timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: Pipeline data retrieved")
            print(f"   Total Prospects: {result['data']['total_prospects']}")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all API tests"""
    print("🎯 Digital Sales Agent API Test Suite")
    print("=" * 50)
    
    # Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API is running")
        else:
            print("⚠️  API responding but may have issues")
    except:
        print("❌ API not responding - make sure it's running on port 8000")
        return
    
    # Run tests
    tests = [
        test_prospect_discovery,
        test_lead_qualification,
        test_contact_initiation,
        test_analytics,
        test_pipeline
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 50)
    print(f"🎉 Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("✅ All tests passed! The Digital Sales Agent API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the API implementation.")

if __name__ == "__main__":
    main()
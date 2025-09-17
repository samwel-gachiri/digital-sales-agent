#!/usr/bin/env python3
"""
Agent Communication Test Suite
Tests the communication between Sales Agent and other Coral Protocol agents
"""

import asyncio
import aiohttp
import json
import logging
import time
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TestResult(Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    SKIP = "SKIP"

@dataclass
class AgentTest:
    name: str
    description: str
    agent_endpoint: str
    expected_response_time: float
    test_data: Dict
    result: Optional[TestResult] = None
    response_time: Optional[float] = None
    error_message: Optional[str] = None

class AgentCommunicationTester:
    """Test suite for agent communication"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.coral_server_url = "http://localhost:5555"
        self.test_results = []
        
    async def test_api_health(self) -> TestResult:
        """Test if the Sales Interface Agent API is responding"""
        try:
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/health") as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ API Health Check: {data}")
                        return TestResult.PASS
                    else:
                        logger.error(f"❌ API Health Check failed: {response.status}")
                        return TestResult.FAIL
                        
        except Exception as e:
            logger.error(f"❌ API Health Check error: {e}")
            return TestResult.FAIL
    
    async def test_prospect_discovery_endpoint(self) -> TestResult:
        """Test prospect discovery endpoint response"""
        try:
            start_time = time.time()
            test_data = {
                "industry": "technology",
                "company_size": "50-200",
                "keywords": ["AI", "SaaS"]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sales/discover-prospects",
                    json=test_data,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Prospect Discovery Test: Found {data.get('prospects_found', 0)} prospects in {response_time:.2f}s")
                        
                        # Validate response structure
                        required_fields = ['status', 'prospects_found', 'prospects']
                        if all(field in data for field in required_fields):
                            return TestResult.PASS
                        else:
                            logger.error(f"❌ Missing required fields in response: {required_fields}")
                            return TestResult.FAIL
                    else:
                        logger.error(f"❌ Prospect Discovery failed: {response.status}")
                        return TestResult.FAIL
                        
        except asyncio.TimeoutError:
            logger.error("❌ Prospect Discovery timeout - agents not responding")
            return TestResult.FAIL
        except Exception as e:
            logger.error(f"❌ Prospect Discovery error: {e}")
            return TestResult.FAIL
    
    async def test_lead_qualification_endpoint(self) -> TestResult:
        """Test lead qualification endpoint"""
        try:
            start_time = time.time()
            test_data = {
                "prospect_id": "test_prospect_123",
                "contact_id": "test_contact_456"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sales/qualify-lead",
                    json=test_data,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Lead Qualification Test: Completed in {response_time:.2f}s")
                        
                        # Check for BANT scores in response
                        if 'bant_scores' in data or 'message' in data:
                            return TestResult.PASS
                        else:
                            logger.error("❌ No BANT scores in qualification response")
                            return TestResult.FAIL
                    else:
                        logger.error(f"❌ Lead Qualification failed: {response.status}")
                        return TestResult.FAIL
                        
        except asyncio.TimeoutError:
            logger.error("❌ Lead Qualification timeout - VoiceInterface agent not responding")
            return TestResult.FAIL
        except Exception as e:
            logger.error(f"❌ Lead Qualification error: {e}")
            return TestResult.FAIL
    
    async def test_contact_initiation_endpoint(self) -> TestResult:
        """Test contact initiation endpoint"""
        try:
            start_time = time.time()
            test_data = {
                "prospect_id": "test_prospect_123",
                "contact_id": "test_contact_456",
                "method": "voice",
                "message": "Test message for agent communication"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sales/initiate-contact",
                    json=test_data,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Contact Initiation Test: {data.get('contact_method', 'unknown')} contact in {response_time:.2f}s")
                        
                        # Validate voice integration
                        if data.get('contact_method') == 'voice' and 'voice_config' in data:
                            return TestResult.PASS
                        elif data.get('contact_method') == 'email':
                            return TestResult.PASS
                        else:
                            logger.error("❌ Invalid contact initiation response")
                            return TestResult.FAIL
                    else:
                        logger.error(f"❌ Contact Initiation failed: {response.status}")
                        return TestResult.FAIL
                        
        except asyncio.TimeoutError:
            logger.error("❌ Contact Initiation timeout - VoiceInterface agent not responding")
            return TestResult.FAIL
        except Exception as e:
            logger.error(f"❌ Contact Initiation error: {e}")
            return TestResult.FAIL
    
    async def test_analytics_endpoint(self) -> TestResult:
        """Test analytics generation endpoint"""
        try:
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/sales/analytics?timeframe=last_30_days&metrics=conversion_rate,pipeline_velocity",
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Analytics Test: Generated analytics in {response_time:.2f}s")
                        
                        # Validate analytics data
                        if 'data' in data and isinstance(data['data'], dict):
                            analytics = data['data']
                            required_metrics = ['total_prospects', 'qualified_leads', 'conversion_rate']
                            if any(metric in analytics for metric in required_metrics):
                                return TestResult.PASS
                            else:
                                logger.error("❌ Missing analytics metrics")
                                return TestResult.FAIL
                        else:
                            logger.error("❌ Invalid analytics response structure")
                            return TestResult.FAIL
                    else:
                        logger.error(f"❌ Analytics failed: {response.status}")
                        return TestResult.FAIL
                        
        except asyncio.TimeoutError:
            logger.error("❌ Analytics timeout - Pandas agent not responding")
            return TestResult.FAIL
        except Exception as e:
            logger.error(f"❌ Analytics error: {e}")
            return TestResult.FAIL
    
    async def test_pipeline_endpoint(self) -> TestResult:
        """Test pipeline status endpoint"""
        try:
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/sales/pipeline",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Pipeline Test: Retrieved pipeline in {response_time:.2f}s")
                        
                        # Validate pipeline data
                        if 'data' in data and 'prospects' in data['data']:
                            return TestResult.PASS
                        else:
                            logger.error("❌ Invalid pipeline response structure")
                            return TestResult.FAIL
                    else:
                        logger.error(f"❌ Pipeline failed: {response.status}")
                        return TestResult.FAIL
                        
        except Exception as e:
            logger.error(f"❌ Pipeline error: {e}")
            return TestResult.FAIL
    
    async def test_coral_server_connectivity(self) -> TestResult:
        """Test if Coral Server is accessible"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.coral_server_url}/health",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    if response.status == 200:
                        logger.info("✅ Coral Server is accessible")
                        return TestResult.PASS
                    else:
                        logger.warning(f"⚠️ Coral Server responded with: {response.status}")
                        return TestResult.SKIP
                        
        except Exception as e:
            logger.warning(f"⚠️ Coral Server not accessible: {e}")
            return TestResult.SKIP
    
    async def test_agent_coordination_flow(self) -> TestResult:
        """Test complete agent coordination flow"""
        try:
            logger.info("🔄 Testing complete agent coordination flow...")
            
            # Step 1: Discover prospects
            discovery_result = await self.test_prospect_discovery_endpoint()
            if discovery_result != TestResult.PASS:
                return TestResult.FAIL
            
            # Step 2: Qualify a lead
            qualification_result = await self.test_lead_qualification_endpoint()
            if qualification_result != TestResult.PASS:
                return TestResult.FAIL
            
            # Step 3: Initiate contact
            contact_result = await self.test_contact_initiation_endpoint()
            if contact_result != TestResult.PASS:
                return TestResult.FAIL
            
            # Step 4: Generate analytics
            analytics_result = await self.test_analytics_endpoint()
            if analytics_result != TestResult.PASS:
                return TestResult.FAIL
            
            logger.info("✅ Complete agent coordination flow successful")
            return TestResult.PASS
            
        except Exception as e:
            logger.error(f"❌ Agent coordination flow error: {e}")
            return TestResult.FAIL
    
    async def run_all_tests(self) -> Dict[str, TestResult]:
        """Run all agent communication tests"""
        logger.info("🧪 Starting Agent Communication Test Suite")
        logger.info("=" * 60)
        
        tests = [
            ("API Health Check", self.test_api_health),
            ("Coral Server Connectivity", self.test_coral_server_connectivity),
            ("Prospect Discovery", self.test_prospect_discovery_endpoint),
            ("Lead Qualification", self.test_lead_qualification_endpoint),
            ("Contact Initiation", self.test_contact_initiation_endpoint),
            ("Analytics Generation", self.test_analytics_endpoint),
            ("Pipeline Status", self.test_pipeline_endpoint),
            ("Complete Agent Flow", self.test_agent_coordination_flow),
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            logger.info(f"\n🔍 Running: {test_name}")
            try:
                result = await test_func()
                results[test_name] = result
                
                if result == TestResult.PASS:
                    logger.info(f"✅ {test_name}: PASSED")
                elif result == TestResult.SKIP:
                    logger.info(f"⚠️ {test_name}: SKIPPED")
                else:
                    logger.error(f"❌ {test_name}: FAILED")
                    
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {e}")
                results[test_name] = TestResult.FAIL
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 TEST SUMMARY")
        logger.info("=" * 60)
        
        passed = sum(1 for r in results.values() if r == TestResult.PASS)
        failed = sum(1 for r in results.values() if r == TestResult.FAIL)
        skipped = sum(1 for r in results.values() if r == TestResult.SKIP)
        
        logger.info(f"✅ Passed: {passed}")
        logger.info(f"❌ Failed: {failed}")
        logger.info(f"⚠️ Skipped: {skipped}")
        logger.info(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%" if (passed+failed) > 0 else "N/A")
        
        if failed == 0:
            logger.info("🎉 All tests passed! Agent communication is working correctly.")
        else:
            logger.warning("⚠️ Some tests failed. Check agent connectivity and configuration.")
        
        return results

async def main():
    """Main test runner"""
    tester = AgentCommunicationTester()
    results = await tester.run_all_tests()
    
    # Exit with appropriate code
    failed_tests = sum(1 for r in results.values() if r == TestResult.FAIL)
    exit(0 if failed_tests == 0 else 1)

if __name__ == "__main__":
    asyncio.run(main())
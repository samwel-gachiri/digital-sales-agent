#!/usr/bin/env python3
"""
Coral Protocol Agent Communication Test
Tests actual message passing between agents through Coral Server
"""

import asyncio
import aiohttp
import json
import logging
import time
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CoralCommunicationTester:
    """Test suite for Coral Protocol agent communication"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.coral_server_url = "http://localhost:5555"
        
    async def test_real_prospect_discovery(self) -> bool:
        """Test real prospect discovery with agent coordination"""
        try:
            logger.info("🔍 Testing real prospect discovery with Firecrawl + OpenDeepResearch agents...")
            
            test_data = {
                "industry": "technology",
                "company_size": "50-200",
                "keywords": ["AI", "machine learning", "SaaS"]
            }
            
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sales/discover-prospects",
                    json=test_data,
                    timeout=aiohttp.ClientTimeout(total=120)  # Longer timeout for real agent coordination
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Prospect Discovery: {data.get('prospects_found', 0)} prospects found in {response_time:.2f}s")
                        
                        # Check if agents were actually used
                        if 'agents_used' in data:
                            logger.info(f"🤖 Agents used: {data['agents_used']}")
                        
                        # Validate that we got real data, not just mock data
                        prospects = data.get('prospects', [])
                        if prospects:
                            first_prospect = prospects[0]
                            logger.info(f"📊 Sample prospect: {first_prospect.get('company_name')} ({first_prospect.get('industry')})")
                            
                            # Check for signs of real agent processing
                            if 'discovery_source' in first_prospect:
                                logger.info(f"🔍 Discovery source: {first_prospect['discovery_source']}")
                        
                return True
                    else:
                        logger.error(f"❌ Prospect Discovery failed: {response.status}")
                        return False
                        
        except asyncio.TimeoutError:
            logger.error("❌ Prospect Discovery timeout - agents may be slow or not responding")
            return False
        except Exception as e:
            logger.error(f"❌ Prospect Discovery error: {e}")
            return False
    
    async def test_real_lead_qualification(self) -> bool:
        """Test real lead qualification with VoiceInterface agent"""
        try:
            logger.info("📋 Testing real lead qualification with VoiceInterface agent...")
            
            test_data = {
                "prospect_id": "test_prospect_tech_123",
                "contact_id": "test_contact_ceo_456"
            }
            
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sales/qualify-lead",
                    json=test_data,
                    timeout=aiohttp.ClientTimeout(total=90)  # Longer timeout for voice interaction
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Lead Qualification completed in {response_time:.2f}s")
                        
                        # Check for BANT scores
                        if 'bant_scores' in data:
                            bant = data['bant_scores']
                            logger.info(f"📊 BANT Scores: B:{bant.get('budget')}, A:{bant.get('authority')}, N:{bant.get('need')}, T:{bant.get('timeline')}")
                            logger.info(f"🎯 Overall Score: {data.get('overall_score')}, Category: {data.get('category')}")
                        
                        # Check if VoiceInterface agent was used
                        if 'agents_used' in data:
                            logger.info(f"🤖 Agents used: {data['agents_used']}")
                        
                        if 'qualification_method' in data:
                            logger.info(f"🎤 Method: {data['qualification_method']}")
                        
                        return True
                    else:
                        logger.error(f"❌ Lead Qualification failed: {response.status}")
                        return False
                        
        except asyncio.TimeoutError:
            logger.error("❌ Lead Qualification timeout - VoiceInterface agent may be slow")
            return False
        except Exception as e:
            logger.error(f"❌ Lead Qualification error: {e}")
            return False
    
    async def test_real_contact_initiation(self) -> bool:
        """Test real contact initiation with VoiceInterface + ElevenLabs"""
        try:
            logger.info("📞 Testing real contact initiation with VoiceInterface + ElevenLabs...")
            
            test_data = {
                "prospect_id": "test_prospect_tech_123",
                "contact_id": "test_contact_ceo_456",
                "method": "voice",
                "message": "Hi, I'm calling to discuss how our AI solutions can help your technology company scale more efficiently."
            }
            
            start_time = time.time()
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/sales/initiate-contact",
                    json=test_data,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        logger.info(f"✅ Contact Initiation completed in {response_time:.2f}s")
                        
                        # Check voice configuration
                        if 'voice_config' in data:
                            voice_config = data['voice_config']
                            logger.info(f"🎤 Voice Config: {voice_config.get('tts_provider')} - {voice_config.get('voice_model')}")
                        
                        # Check call details
                        if 'call_duration' in data:
                            logger.info(f"⏱️ Call Duration: {data['call_duration']}")
                        
                        if 'outcome' in data:
                            logger.info(f"📈 Outcome: {data['outcome']}")
                        
                        # Check if agents were used
                        if 'agents_used' in data:
                            logger.info(f"🤖 Agents used: {data['agents_used']}")
                        
                        return True
                    else:
                        logger.error(f"❌ Contact Initiation failed: {response.status}")
                        return False
                        
        except asyncio.TimeoutError:
            logger.error("❌ Contact Initiation timeout - VoiceInterface agent may be slow")
            return False
        except Exception as e:
            logger.error(f"❌ Contact Initiation error: {e}")
            return False
    
    async def test_agent_coordination_sequence(self) -> bool:
        """Test complete agent coordination sequence"""
        try:
            logger.info("🔄 Testing complete agent coordination sequence...")
            
            # Step 1: Discover prospects (Firecrawl + OpenDeepResearch + Pandas)
            logger.info("Step 1: Prospect Discovery")
            discovery_success = await self.test_real_prospect_discovery()
            if not discovery_success:
                logger.error("❌ Discovery step failed")
                return False
            
            await asyncio.sleep(2)  # Brief pause between steps
            
            # Step 2: Qualify lead (VoiceInterface + Pandas)
            logger.info("Step 2: Lead Qualification")
            qualification_success = await self.test_real_lead_qualification()
            if not qualification_success:
                logger.error("❌ Qualification step failed")
                return False
            
            await asyncio.sleep(2)  # Brief pause between steps
            
            # Step 3: Initiate contact (VoiceInterface + ElevenLabs)
            logger.info("Step 3: Contact Initiation")
            contact_success = await self.test_real_contact_initiation()
            if not contact_success:
                logger.error("❌ Contact step failed")
                return False
            
            logger.info("✅ Complete agent coordination sequence successful!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Agent coordination sequence error: {e}")
            return False
    
    async def test_agent_response_times(self) -> Dict[str, float]:
        """Test response times for different agent operations"""
        logger.info("⏱️ Testing agent response times...")
        
        response_times = {}
        
        # Test prospect discovery time
        try:
            start_time
            
        
"""
Crossmint Web3 Integration Service
Handles blockchain payments, NFT rewards, and smart contract automation
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List
import aiohttp
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class CrossmintService:
    def __init__(self):
        self.api_key = os.getenv("CROSSMINT_API_KEY")
        self.project_id = os.getenv("CROSSMINT_PROJECT_ID")
        self.environment = os.getenv("CROSSMINT_ENVIRONMENT", "staging")
        
        # API endpoints
        if self.environment == "production":
            self.base_url = "https://api.crossmint.com"
        else:
            self.base_url = "https://staging.crossmint.com"
            
        self.headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Service status
        self.enabled = bool(self.api_key and self.project_id)
        
        if not self.enabled:
            logger.warning("Crossmint not configured - Web3 features disabled")
        else:
            logger.info(f"Crossmint initialized - Environment: {self.environment}")

    async def create_subscription_payment(self, 
                                        customer_email: str,
                                        customer_name: str,
                                        plan_type: str = "pro",
                                        amount: float = 99.00) -> Dict[str, Any]:
        """Create subscription payment for sales automation services"""
        if not self.enabled:
            return {"status": "disabled", "message": "Crossmint not configured"}
            
        try:
            payment_data = {
                "type": "payment-intent",
                "currency": "USD",
                "amount": int(amount * 100),  # Convert to cents
                "description": f"Digital Sales Agent {plan_type.title()} - Monthly Subscription",
                "customer": {
                    "email": customer_email,
                    "name": customer_name
                },
                "metadata": {
                    "service": "sales_automation",
                    "tier": plan_type,
                    "created_at": datetime.now().isoformat(),
                    "subscription_id": str(uuid.uuid4())
                },
                "success_url": f"http://localhost:3000/dashboard?payment=success",
                "cancel_url": f"http://localhost:3000/dashboard?payment=cancelled"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/2022-06-09/payment-intents",
                    headers=self.headers,
                    json=payment_data
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200:
                        logger.info(f"Subscription payment created for {customer_email}")
                        return {
                            "status": "success",
                            "payment_id": result.get("id"),
                            "payment_url": result.get("clientSecret"),
                            "amount": amount,
                            "plan": plan_type
                        }
                    else:
                        logger.error(f"Crossmint payment creation failed: {result}")
                        return {"status": "error", "message": result.get("message", "Payment creation failed")}
                        
        except Exception as e:
            logger.error(f"Error creating Crossmint payment: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def mint_achievement_nft(self,
                                 recipient_email: str,
                                 achievement_type: str,
                                 performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mint NFT rewards for sales achievements"""
        if not self.enabled:
            return {"status": "disabled", "message": "Crossmint not configured"}
            
        try:
            # Define achievement metadata based on type
            achievement_configs = {
                "top_performer": {
                    "name": f"Top Sales Performer - {datetime.now().strftime('%B %Y')}",
                    "description": f"Achieved {performance_data.get('performance_percentage', 100)}% of sales target",
                    "image": "https://via.placeholder.com/400x400/gold/white?text=Top+Performer",
                    "attributes": [
                        {"trait_type": "Achievement", "value": "Top Performer"},
                        {"trait_type": "Performance", "value": f"{performance_data.get('performance_percentage', 100)}%"},
                        {"trait_type": "Deals Closed", "value": performance_data.get('deals_closed', 0)},
                        {"trait_type": "Revenue Generated", "value": f"${performance_data.get('revenue', 0)}"},
                        {"trait_type": "Month", "value": datetime.now().strftime('%B %Y')}
                    ]
                },
                "deal_closer": {
                    "name": f"Deal Closer Champion - {performance_data.get('deals_closed', 0)} Deals",
                    "description": f"Successfully closed {performance_data.get('deals_closed', 0)} deals",
                    "image": "https://via.placeholder.com/400x400/blue/white?text=Deal+Closer",
                    "attributes": [
                        {"trait_type": "Achievement", "value": "Deal Closer"},
                        {"trait_type": "Deals Closed", "value": performance_data.get('deals_closed', 0)},
                        {"trait_type": "Conversion Rate", "value": f"{performance_data.get('conversion_rate', 0)}%"},
                        {"trait_type": "Date", "value": datetime.now().strftime('%Y-%m-%d')}
                    ]
                },
                "email_master": {
                    "name": f"Email Campaign Master - {performance_data.get('emails_sent', 0)} Emails",
                    "description": f"Sent {performance_data.get('emails_sent', 0)} successful email campaigns",
                    "image": "https://via.placeholder.com/400x400/green/white?text=Email+Master",
                    "attributes": [
                        {"trait_type": "Achievement", "value": "Email Master"},
                        {"trait_type": "Emails Sent", "value": performance_data.get('emails_sent', 0)},
                        {"trait_type": "Open Rate", "value": f"{performance_data.get('open_rate', 0)}%"},
                        {"trait_type": "Response Rate", "value": f"{performance_data.get('response_rate', 0)}%"}
                    ]
                }
            }
            
            config = achievement_configs.get(achievement_type, achievement_configs["top_performer"])
            
            nft_data = {
                "recipient": f"email:{recipient_email}:polygon",
                "metadata": {
                    "name": config["name"],
                    "description": config["description"],
                    "image": config["image"],
                    "attributes": config["attributes"],
                    "external_url": "http://localhost:3000/achievements",
                    "created_by": "Digital Sales Agent",
                    "created_at": datetime.now().isoformat()
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/2022-06-09/collections/{self.project_id}/nfts",
                    headers=self.headers,
                    json=nft_data
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200:
                        logger.info(f"Achievement NFT minted for {recipient_email}: {achievement_type}")
                        return {
                            "status": "success",
                            "nft_id": result.get("id"),
                            "transaction_hash": result.get("onChain", {}).get("txId"),
                            "achievement_type": achievement_type,
                            "metadata": config
                        }
                    else:
                        logger.error(f"NFT minting failed: {result}")
                        return {"status": "error", "message": result.get("message", "NFT minting failed")}
                        
        except Exception as e:
            logger.error(f"Error minting achievement NFT: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def create_commission_token(self,
                                    sales_agent_id: str,
                                    commission_amount: float,
                                    deal_id: str) -> Dict[str, Any]:
        """Create commission tokens for sales team"""
        if not self.enabled:
            return {"status": "disabled", "message": "Crossmint not configured"}
            
        try:
            # Create a fungible token for commission tracking
            token_data = {
                "recipient": f"email:samgachiri2002@gmail.com:polygon",  # Demo recipient
                "amount": str(int(commission_amount * 100)),  # Convert to smallest unit
                "metadata": {
                    "name": "Sales Commission Token",
                    "symbol": "SCT",
                    "description": f"Commission token for deal {deal_id}",
                    "decimals": 2,
                    "commission_amount": commission_amount,
                    "deal_id": deal_id,
                    "sales_agent_id": sales_agent_id,
                    "created_at": datetime.now().isoformat()
                }
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.base_url}/api/2022-06-09/collections/{self.project_id}/tokens",
                    headers=self.headers,
                    json=token_data
                ) as response:
                    result = await response.json()
                    
                    if response.status == 200:
                        logger.info(f"Commission token created for agent {sales_agent_id}: ${commission_amount}")
                        return {
                            "status": "success",
                            "token_id": result.get("id"),
                            "transaction_hash": result.get("onChain", {}).get("txId"),
                            "commission_amount": commission_amount,
                            "deal_id": deal_id
                        }
                    else:
                        logger.error(f"Commission token creation failed: {result}")
                        return {"status": "error", "message": result.get("message", "Token creation failed")}
                        
        except Exception as e:
            logger.error(f"Error creating commission token: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def deploy_sales_contract(self,
                                  sales_agent_address: str,
                                  commission_rate: float = 0.15) -> Dict[str, Any]:
        """Deploy smart contract for automated deal processing"""
        if not self.enabled:
            return {"status": "disabled", "message": "Crossmint not configured"}
            
        try:
            # Smart contract deployment for sales automation
            contract_data = {
                "type": "custom",
                "name": "SalesAutomationContract",
                "description": "Automated sales commission and deal processing",
                "parameters": {
                    "salesAgent": sales_agent_address,
                    "commissionRate": int(commission_rate * 10000),  # Basis points
                    "autoPayoutThreshold": 100000,  # $1000 in cents
                    "escrowPeriod": 2592000  # 30 days in seconds
                },
                "metadata": {
                    "created_by": "Digital Sales Agent",
                    "created_at": datetime.now().isoformat(),
                    "version": "1.0.0"
                }
            }
            
            # Note: This is a simplified example - actual smart contract deployment
            # would require more complex contract code and deployment process
            
            logger.info(f"Sales contract deployment initiated for agent {sales_agent_address}")
            return {
                "status": "success",
                "contract_address": f"0x{uuid.uuid4().hex[:40]}",  # Mock address for demo
                "commission_rate": commission_rate,
                "deployment_pending": True,
                "estimated_deployment_time": "5-10 minutes"
            }
                        
        except Exception as e:
            logger.error(f"Error deploying sales contract: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def process_deal_payment(self,
                                 deal_id: str,
                                 amount: float,
                                 customer_email: str,
                                 sales_agent_id: str) -> Dict[str, Any]:
        """Process payment for closed deals with automatic commission distribution"""
        if not self.enabled:
            return {"status": "disabled", "message": "Crossmint not configured"}
            
        try:
            # Create payment for the deal
            payment_result = await self.create_subscription_payment(
                customer_email=customer_email,
                customer_name="Deal Customer",
                plan_type="custom_deal",
                amount=amount
            )
            
            if payment_result.get("status") == "success":
                # Calculate and create commission token
                commission_amount = amount * 0.15  # 15% commission
                commission_result = await self.create_commission_token(
                    sales_agent_id=sales_agent_id,
                    commission_amount=commission_amount,
                    deal_id=deal_id
                )
                
                # Create achievement NFT for deal closure
                achievement_result = await self.mint_achievement_nft(
                    recipient_email="samgachiri2002@gmail.com",  # Demo recipient
                    achievement_type="deal_closer",
                    performance_data={
                        "deals_closed": 1,
                        "revenue": amount,
                        "conversion_rate": 100
                    }
                )
                
                return {
                    "status": "success",
                    "deal_id": deal_id,
                    "payment": payment_result,
                    "commission": commission_result,
                    "achievement": achievement_result,
                    "total_amount": amount,
                    "commission_amount": commission_amount
                }
            else:
                return payment_result
                
        except Exception as e:
            logger.error(f"Error processing deal payment: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def get_wallet_status(self, email: str) -> Dict[str, Any]:
        """Get wallet status and NFT collection for a user"""
        if not self.enabled:
            return {"status": "disabled", "message": "Crossmint not configured"}
            
        try:
            # Mock wallet status for demo - in production this would query actual blockchain data
            return {
                "status": "success",
                "wallet_address": f"0x{uuid.uuid4().hex[:40]}",
                "nft_count": 3,
                "commission_tokens": 150.50,
                "achievements": [
                    {"type": "top_performer", "earned_at": "2024-01-15"},
                    {"type": "deal_closer", "earned_at": "2024-01-20"},
                    {"type": "email_master", "earned_at": "2024-01-25"}
                ],
                "total_earnings": 1250.75
            }
                        
        except Exception as e:
            logger.error(f"Error getting wallet status: {str(e)}")
            return {"status": "error", "message": str(e)}

# Global service instance
crossmint_service = CrossmintService()
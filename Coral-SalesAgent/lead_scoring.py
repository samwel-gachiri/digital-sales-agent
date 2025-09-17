"""
Lead Scoring System - BANT Methodology Implementation
Budget, Authority, Need, Timeline scoring for sales prospects
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ScoreCategory(Enum):
    HOT = "hot"
    WARM = "warm" 
    COLD = "cold"

@dataclass
class BANTScores:
    budget: float  # 1-10 scale
    authority: float  # 1-10 scale
    need: float  # 1-10 scale
    timeline: float  # 1-10 scale
    
    @property
    def overall_score(self) -> float:
        """Calculate weighted overall BANT score"""
        # Weighted scoring: Authority and Need are most important
        weights = {
            'budget': 0.25,
            'authority': 0.30,
            'need': 0.30,
            'timeline': 0.15
        }
        
        return (
            self.budget * weights['budget'] +
            self.authority * weights['authority'] +
            self.need * weights['need'] +
            self.timeline * weights['timeline']
        )
    
    @property
    def category(self) -> ScoreCategory:
        """Determine lead category based on overall score"""
        score = self.overall_score
        if score >= 8.0:
            return ScoreCategory.HOT
        elif score >= 6.0:
            return ScoreCategory.WARM
        else:
            return ScoreCategory.COLD

class BANTScorer:
    """BANT scoring engine for lead qualification"""
    
    def __init__(self):
        self.budget_indicators = {
            'high': ['funded', 'series a', 'series b', 'ipo', 'profitable', 'revenue growth'],
            'medium': ['seed funding', 'angel investment', 'break even', 'stable revenue'],
            'low': ['startup', 'bootstrap', 'pre-revenue', 'cost cutting']
        }
        
        self.authority_indicators = {
            'high': ['ceo', 'cto', 'cfo', 'founder', 'president', 'vp', 'director'],
            'medium': ['manager', 'lead', 'senior', 'principal'],
            'low': ['analyst', 'coordinator', 'associate', 'junior']
        }
        
        self.need_indicators = {
            'high': ['urgent', 'critical', 'immediate', 'pain point', 'problem', 'challenge'],
            'medium': ['improvement', 'optimization', 'upgrade', 'enhancement'],
            'low': ['nice to have', 'future', 'considering', 'exploring']
        }
        
        self.timeline_indicators = {
            'high': ['asap', 'immediate', 'this quarter', 'urgent', 'now'],
            'medium': ['next quarter', '3-6 months', 'this year'],
            'low': ['next year', 'future', 'someday', 'eventually']
        }
    
    def score_budget(self, company_data: Dict) -> float:
        """Score budget capability (1-10 scale)"""
        try:
            # Extract budget indicators from company data
            text_data = ' '.join([
                company_data.get('funding_stage', ''),
                company_data.get('revenue', ''),
                ' '.join(company_data.get('budget_indicators', [])),
                ' '.join(company_data.get('recent_news', []))
            ]).lower()
            
            # Score based on indicators
            high_count = sum(1 for indicator in self.budget_indicators['high'] if indicator in text_data)
            medium_count = sum(1 for indicator in self.budget_indicators['medium'] if indicator in text_data)
            low_count = sum(1 for indicator in self.budget_indicators['low'] if indicator in text_data)
            
            # Calculate score
            if high_count >= 2:
                return min(10.0, 8.0 + high_count * 0.5)
            elif high_count >= 1 or medium_count >= 2:
                return min(8.0, 6.0 + high_count * 1.0 + medium_count * 0.5)
            elif medium_count >= 1:
                return min(6.0, 4.0 + medium_count * 1.0)
            elif low_count >= 1:
                return max(1.0, 3.0 - low_count * 0.5)
            else:
                return 5.0  # Default neutral score
                
        except Exception as e:
            logger.error(f"Budget scoring error: {e}")
            return 5.0
    
    def score_authority(self, contact_data: Dict) -> float:
        """Score decision-making authority (1-10 scale)"""
        try:
            title = contact_data.get('title', '').lower()
            department = contact_data.get('department', '').lower()
            is_decision_maker = contact_data.get('decision_maker', False)
            
            # Base score from title
            score = 5.0
            
            for indicator in self.authority_indicators['high']:
                if indicator in title:
                    score = max(score, 9.0)
                    break
            
            for indicator in self.authority_indicators['medium']:
                if indicator in title:
                    score = max(score, 6.5)
                    break
            
            for indicator in self.authority_indicators['low']:
                if indicator in title:
                    score = min(score, 4.0)
            
            # Boost for decision maker flag
            if is_decision_maker:
                score = min(10.0, score + 1.5)
            
            # Department influence
            if any(dept in department for dept in ['executive', 'c-suite', 'leadership']):
                score = min(10.0, score + 1.0)
            
            return max(1.0, min(10.0, score))
            
        except Exception as e:
            logger.error(f"Authority scoring error: {e}")
            return 5.0
    
    def score_need(self, conversation_data: Dict, company_data: Dict) -> float:
        """Score business need urgency (1-10 scale)"""
        try:
            # Combine conversation and company data
            text_data = ' '.join([
                conversation_data.get('pain_points', ''),
                conversation_data.get('challenges', ''),
                ' '.join(company_data.get('pain_points', [])),
                ' '.join(company_data.get('recent_news', []))
            ]).lower()
            
            # Score based on need indicators
            high_count = sum(1 for indicator in self.need_indicators['high'] if indicator in text_data)
            medium_count = sum(1 for indicator in self.need_indicators['medium'] if indicator in text_data)
            low_count = sum(1 for indicator in self.need_indicators['low'] if indicator in text_data)
            
            # Calculate score
            if high_count >= 2:
                return min(10.0, 8.5 + high_count * 0.3)
            elif high_count >= 1:
                return min(9.0, 7.0 + high_count * 1.0)
            elif medium_count >= 2:
                return min(7.0, 5.5 + medium_count * 0.5)
            elif medium_count >= 1:
                return min(6.0, 4.5 + medium_count * 0.8)
            elif low_count >= 1:
                return max(1.0, 3.0 - low_count * 0.5)
            else:
                return 5.0  # Default neutral score
                
        except Exception as e:
            logger.error(f"Need scoring error: {e}")
            return 5.0
    
    def score_timeline(self, conversation_data: Dict) -> float:
        """Score implementation timeline urgency (1-10 scale)"""
        try:
            timeline_text = ' '.join([
                conversation_data.get('timeline', ''),
                conversation_data.get('urgency', ''),
                conversation_data.get('implementation_date', '')
            ]).lower()
            
            # Score based on timeline indicators
            high_count = sum(1 for indicator in self.timeline_indicators['high'] if indicator in timeline_text)
            medium_count = sum(1 for indicator in self.timeline_indicators['medium'] if indicator in timeline_text)
            low_count = sum(1 for indicator in self.timeline_indicators['low'] if indicator in timeline_text)
            
            # Calculate score
            if high_count >= 1:
                return min(10.0, 8.0 + high_count * 1.0)
            elif medium_count >= 1:
                return min(7.0, 5.0 + medium_count * 1.0)
            elif low_count >= 1:
                return max(1.0, 3.0 - low_count * 0.5)
            else:
                return 5.0  # Default neutral score
                
        except Exception as e:
            logger.error(f"Timeline scoring error: {e}")
            return 5.0
    
    def calculate_bant_score(self, prospect_data: Dict, contact_data: Dict, conversation_data: Dict) -> BANTScores:
        """Calculate complete BANT score for a prospect"""
        try:
            budget_score = self.score_budget(prospect_data.get('company_data', {}))
            authority_score = self.score_authority(contact_data)
            need_score = self.score_need(conversation_data, prospect_data.get('company_data', {}))
            timeline_score = self.score_timeline(conversation_data)
            
            scores = BANTScores(
                budget=round(budget_score, 1),
                authority=round(authority_score, 1),
                need=round(need_score, 1),
                timeline=round(timeline_score, 1)
            )
            
            logger.info(f"BANT Scores calculated: B:{scores.budget}, A:{scores.authority}, N:{scores.need}, T:{scores.timeline}, Overall:{scores.overall_score:.1f}, Category:{scores.category.value}")
            
            return scores
            
        except Exception as e:
            logger.error(f"BANT calculation error: {e}")
            # Return default scores on error
            return BANTScores(budget=5.0, authority=5.0, need=5.0, timeline=5.0)
    
    def batch_score_prospects(self, prospects_data: List[Dict]) -> List[Tuple[str, BANTScores]]:
        """Score multiple prospects in batch"""
        results = []
        
        for prospect in prospects_data:
            try:
                prospect_id = prospect.get('id', 'unknown')
                contact_data = prospect.get('primary_contact', {})
                conversation_data = prospect.get('conversation_data', {})
                
                scores = self.calculate_bant_score(prospect, contact_data, conversation_data)
                results.append((prospect_id, scores))
                
            except Exception as e:
                logger.error(f"Error scoring prospect {prospect.get('id', 'unknown')}: {e}")
                # Add default scores for failed prospects
                results.append((prospect.get('id', 'unknown'), BANTScores(5.0, 5.0, 5.0, 5.0)))
        
        # Sort by overall score (highest first)
        results.sort(key=lambda x: x[1].overall_score, reverse=True)
        
        return results

# Global scorer instance
bant_scorer = BANTScorer()
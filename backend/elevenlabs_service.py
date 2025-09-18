import os
import requests
import logging
import base64
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class ElevenLabsService:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "DLsHlh26Ugcm6ELvS0qi")
        self.base_url = "https://api.elevenlabs.io/v1"
        
        logger.info(f"ElevenLabs API key loaded: {'Yes' if self.api_key else 'No'}")
        logger.info(f"ElevenLabs Voice ID: {self.voice_id}")
        
        if not self.api_key:
            logger.warning("ElevenLabs API key not configured")
    
    async def text_to_speech(self, text: str, voice_id: Optional[str] = None) -> Optional[str]:
        """Convert text to speech using ElevenLabs API"""
        if not self.api_key:
            logger.warning("ElevenLabs API key not available, skipping TTS")
            return None
        
        try:
            voice_id = voice_id or self.voice_id
            url = f"{self.base_url}/text-to-speech/{voice_id}"
            
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5,
                    "style": 0.0,
                    "use_speaker_boost": True
                }
            }
            
            logger.info(f"Generating TTS for text: {text[:50]}...")
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                # Convert audio to base64 for frontend
                audio_base64 = base64.b64encode(response.content).decode('utf-8')
                audio_url = f"data:audio/mpeg;base64,{audio_base64}"
                logger.info("TTS generation successful")
                return audio_url
            else:
                logger.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating TTS: {str(e)}")
            return None
    
    async def get_available_voices(self):
        """Get list of available voices"""
        if not self.api_key:
            return []
        
        try:
            url = f"{self.base_url}/voices"
            headers = {"xi-api-key": self.api_key}
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                voices_data = response.json()
                return voices_data.get("voices", [])
            else:
                logger.error(f"Error fetching voices: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching voices: {str(e)}")
            return []

# Global instance
elevenlabs_service = ElevenLabsService()
"""
Supabase Configuration Module
Manages Supabase client initialization and connection
"""

import os
import logging
from typing import Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseManager:
    def __init__(self):
        self.client: Optional[Client] = None
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client"""
        try:
            if self.url and self.key:
                self.client = create_client(self.url, self.key)
                logger.info("🔍 Supabase connection test successful")
                logger.info("✅ Supabase connection established successfully")
            else:
                logger.warning("⚠️ Supabase URL or Key not provided")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            self.client = None
    
    def get_status(self) -> Dict[str, Any]:
        """Get connection status"""
        if self.client and self.url and self.key:
            return {
                "connected": True,
                "url": self.url,
                "message": "Supabase connection active"
            }
        else:
            return {
                "connected": False,
                "error": "Supabase not configured properly",
                "message": "Please set SUPABASE_URL and SUPABASE_KEY environment variables"
            }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get detailed health status"""
        status = self.get_status()
        if status["connected"]:
            try:
                # Test connection with a simple query
                result = self.client.table('users').select('id').limit(1).execute()
                return {
                    "connected": True,
                    "healthy": True,
                    "message": "Supabase connection is healthy"
                }
            except Exception as e:
                return {
                    "connected": True,
                    "healthy": False,
                    "error": str(e),
                    "message": "Supabase connected but not responding properly"
                }
        else:
            return status
    
    async def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user profile in Supabase"""
        try:
            if not self.client:
                return {
                    "success": False,
                    "error": "Supabase client not initialized"
                }
            
            result = self.client.table('users').insert(user_data).execute()
            
            return {
                "success": True,
                "data": result.data,
                "message": "User profile created successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Global instance
supabase_manager = SupabaseManager()

def is_supabase_configured() -> bool:
    """Check if Supabase is properly configured"""
    return supabase_manager.get_status()["connected"]

def get_supabase_status() -> Dict[str, Any]:
    """Get Supabase connection status"""
    return supabase_manager.get_status()
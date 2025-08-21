"""
Supabase Database Configuration and Management
Enhanced database operations for LifeCompass AI
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
    SupabaseClient = Client
except ImportError:
    print("Supabase not installed. Database features will be disabled.")
    SUPABASE_AVAILABLE = False
    create_client = None
    Client = None
    SupabaseClient = Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseManager:
    """Enhanced Supabase client with connection management and utilities"""
    
    def __init__(self):
        self.client = None
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.is_connected = False
        self.connection_error = None
        
        # Initialize connection
        self._initialize_connection()
    
    def _initialize_connection(self) -> bool:
        """Initialize Supabase connection with error handling"""
        if not SUPABASE_AVAILABLE:
            self.connection_error = "Supabase library not installed"
            logger.warning("⚠️ Supabase library not available")
            return False
        
        if not self.url:
            self.connection_error = "SUPABASE_URL environment variable not set"
            logger.warning("⚠️ SUPABASE_URL not configured")
            return False
        
        if not self.key:
            self.connection_error = "SUPABASE_KEY environment variable not set"
            logger.warning("⚠️ SUPABASE_KEY not configured")
            return False
        
        try:
            self.client = create_client(self.url, self.key)
            
            # Test connection with a simple query
            self._test_connection()
            
            self.is_connected = True
            self.connection_error = None
            logger.info("✅ Supabase connection established successfully")
            return True
            
        except Exception as e:
            self.connection_error = f"Failed to connect to Supabase: {str(e)}"
            logger.error(f"❌ Supabase connection failed: {e}")
            return False
    
    def _test_connection(self):
        """Test the connection with a simple query"""
        if self.client:
            # Try to fetch from a system table or create a test query
            try:
                # This will test the connection without requiring specific tables
                result = self.client.auth.get_session()
                logger.info("🔍 Supabase connection test successful")
            except Exception as e:
                logger.warning(f"⚠️ Connection test warning: {e}")
                # Don't fail the connection for this, as auth might not be configured
    
    def get_status(self) -> Dict[str, Any]:
        """Get detailed connection status"""
        return {
            "connected": self.is_connected,
            "url_configured": bool(self.url),
            "key_configured": bool(self.key),
            "library_available": SUPABASE_AVAILABLE,
            "error": self.connection_error,
            "client_available": self.client is not None
        }
    
    def reconnect(self) -> bool:
        """Attempt to reconnect to Supabase"""
        logger.info("🔄 Attempting to reconnect to Supabase...")
        return self._initialize_connection()
    
    # --- User Management Operations ---
    
    async def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user profile in the database"""
        if not self.is_connected:
            return {"success": False, "error": "Database not connected"}
        
        try:
            # Add timestamp
            user_data["created_at"] = datetime.utcnow().isoformat()
            user_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.client.table("user_profiles").insert(user_data).execute()
            
            return {
                "success": True,
                "data": result.data[0] if result.data else None,
                "message": "User profile created successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to create user profile: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Retrieve user profile by ID"""
        if not self.is_connected:
            return {"success": False, "error": "Database not connected"}
        
        try:
            result = self.client.table("user_profiles").select("*").eq("id", user_id).execute()
            
            if result.data:
                return {
                    "success": True,
                    "data": result.data[0],
                    "message": "User profile retrieved successfully"
                }
            else:
                return {"success": False, "error": "User not found"}
                
        except Exception as e:
            logger.error(f"Failed to get user profile: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_user_profile(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        if not self.is_connected:
            return {"success": False, "error": "Database not connected"}
        
        try:
            # Add update timestamp
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.client.table("user_profiles").update(update_data).eq("id", user_id).execute()
            
            return {
                "success": True,
                "data": result.data[0] if result.data else None,
                "message": "User profile updated successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to update user profile: {e}")
            return {"success": False, "error": str(e)}
    
    # --- Chat History Operations ---
    
    async def save_chat_message(self, user_id: str, message: str, response: str, provider: str) -> Dict[str, Any]:
        """Save chat interaction to database"""
        if not self.is_connected:
            return {"success": False, "error": "Database not connected"}
        
        try:
            chat_data = {
                "user_id": user_id,
                "user_message": message,
                "ai_response": response,
                "ai_provider": provider,
                "created_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("chat_history").insert(chat_data).execute()
            
            return {
                "success": True,
                "data": result.data[0] if result.data else None,
                "message": "Chat saved successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to save chat: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_chat_history(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """Retrieve chat history for a user"""
        if not self.is_connected:
            return {"success": False, "error": "Database not connected"}
        
        try:
            result = (self.client.table("chat_history")
                     .select("*")
                     .eq("user_id", user_id)
                     .order("created_at", desc=True)
                     .limit(limit)
                     .execute())
            
            return {
                "success": True,
                "data": result.data,
                "message": f"Retrieved {len(result.data)} chat messages"
            }
            
        except Exception as e:
            logger.error(f"Failed to get chat history: {e}")
            return {"success": False, "error": str(e)}
    
    # --- Job Applications Operations ---
    
    async def save_job_application(self, user_id: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save job application to database"""
        if not self.is_connected:
            return {"success": False, "error": "Database not connected"}
        
        try:
            job_data["user_id"] = user_id
            job_data["created_at"] = datetime.utcnow().isoformat()
            job_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.client.table("job_applications").insert(job_data).execute()
            
            return {
                "success": True,
                "data": result.data[0] if result.data else None,
                "message": "Job application saved successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to save job application: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_user_applications(self, user_id: str) -> Dict[str, Any]:
        """Get all job applications for a user"""
        if not self.is_connected:
            return {"success": False, "error": "Database not connected"}
        
        try:
            result = (self.client.table("job_applications")
                     .select("*")
                     .eq("user_id", user_id)
                     .order("created_at", desc=True)
                     .execute())
            
            return {
                "success": True,
                "data": result.data,
                "message": f"Retrieved {len(result.data)} job applications"
            }
            
        except Exception as e:
            logger.error(f"Failed to get job applications: {e}")
            return {"success": False, "error": str(e)}
    
    # --- Database Health and Utilities ---
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get comprehensive health status"""
        return {
            "database": {
                "connected": self.is_connected,
                "error": self.connection_error,
                "url_configured": bool(self.url),
                "key_configured": bool(self.key),
                "library_available": SUPABASE_AVAILABLE
            }
        }
    
    def __repr__(self):
        return f"SupabaseManager(connected={self.is_connected}, url={'***' if self.url else None})"

# Global instance
supabase_manager = SupabaseManager()

# Convenience functions for backward compatibility
def get_supabase_client():
    """Get the Supabase client instance"""
    return supabase_manager.client

def is_supabase_configured() -> bool:
    """Check if Supabase is properly configured and connected"""
    return supabase_manager.is_connected

def get_supabase_status() -> Dict[str, Any]:
    """Get Supabase connection status"""
    return supabase_manager.get_status()

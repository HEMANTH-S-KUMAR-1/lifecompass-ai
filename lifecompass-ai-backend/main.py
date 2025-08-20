import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
except ImportError as e:
    print(f"FastAPI dependencies not installed. Run: pip install -r requirements.txt")
    print(f"Missing: {e}")
    exit(1)

try:
    from supabase import create_client, Client
except ImportError:
    print("Supabase not installed. Run: pip install supabase")
    print("Database features will be disabled.")
    create_client = None
    Client = None

try:
    from ai_providers import AIProviderManager
except ImportError as e:
    print(f"AI providers module not found: {e}")
    print("Please ensure ai_providers.py is in the same directory.")
    exit(1)

# --- Environment Configuration ---
# Load API keys from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 

# Check if required environment variables are set
if not SUPABASE_URL:
    print("WARNING: SUPABASE_URL environment variable not set!")
if not SUPABASE_KEY:
    print("WARNING: SUPABASE_KEY environment variable not set!")
# --------------------------------

# --- Initializations ---
# Initialize clients only if credentials are available
supabase = None
if SUPABASE_URL and SUPABASE_KEY and create_client:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
else:
    print("⚠️ Supabase not configured or library not installed")

# Initialize AI Provider Manager
ai_manager = AIProviderManager()
ai_status = ai_manager.get_status()
print(f"✅ AI Provider Manager initialized with {ai_status['total_configured']} provider(s)")

if ai_status['configured_providers']:
    for provider in ai_status['configured_providers']:
        print(f"  ✓ {provider['name']} - {provider['status']}")
    print(f"  🎯 Primary provider: {ai_status['primary_provider']}")
else:
    print("⚠️ No AI providers configured. Please set up at least one AI API key.")

# FastAPI app instance
app = FastAPI(
    title="LifeCompass AI Backend",
    description="Career guidance platform with multi-AI provider support",
    version="2.0.0"
)
# -----------------------

# --- Pydantic Models ---
class ChatMessage(BaseModel):
    message: str
    provider: Optional[str] = None  # Allow users to specify AI provider

class APIConfig(BaseModel):
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None

class ConfigResponse(BaseModel):
    supabase_configured: bool
    ai_providers: dict
    message: str

class AIProvidersResponse(BaseModel):
    available_providers: list
    configured_providers: list
    primary_provider: Optional[str]
    total_configured: int
# -----------------------

# --- CORS Middleware ---
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------

# --- API Endpoints ---
@app.get("/")
def read_root():
    ai_status = ai_manager.get_status()
    return {
        "message": "Welcome to the LifeCompass AI Backend!",
        "status": "running",
        "version": "2.0.0",
        "supabase_configured": supabase is not None,
        "ai_providers": ai_status
    }

@app.get("/api/config", response_model=ConfigResponse)
def get_config():
    """Check which services are configured"""
    ai_status = ai_manager.get_status()
    return ConfigResponse(
        supabase_configured=supabase is not None,
        ai_providers=ai_status,
        message="Configuration status retrieved successfully"
    )

@app.get("/api/ai-providers", response_model=AIProvidersResponse)
def get_ai_providers():
    """Get detailed AI provider information"""
    ai_status = ai_manager.get_status()
    return AIProvidersResponse(**ai_status)

@app.post("/api/signup")
def create_job_seeker():
    if not supabase:
        raise HTTPException(
            status_code=503, 
            detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables."
        )
    
    try:
        test_email = "test.user@example.com"
        test_name = "Test User"
        data, error = supabase.table('job_seekers').insert({"email": test_email, "full_name": test_name}).execute()
        
        response_data = data[1] if data and len(data) > 1 else None
        
        if error:
            error_details = error[1].get('details') if error and len(error) > 1 else "Unknown error"
            return {"status": "error", "message": error_details}
            
        return {"status": "success", "data": response_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/chat")
def chat_with_ai(chat_message: ChatMessage):
    ai_status = ai_manager.get_status()
    
    if ai_status['total_configured'] == 0:
        raise HTTPException(
            status_code=503, 
            detail="No AI providers configured. Please set up at least one AI API key (GOOGLE_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, HUGGINGFACE_API_KEY, or run Ollama locally)."
        )
    
    try:
        # Create career-focused prompt
        prompt = f"""You are 'Career Compass', a helpful AI career advisor for a global talent marketplace called LifeCompass AI. 
        
        A user has asked the following question. Provide a helpful, encouraging, and actionable response focused on career development, job searching, skill building, or professional growth.
        
        User's question: {chat_message.message}
        
        Please provide practical advice that can help them advance their career globally."""
        
        # Generate response using specified or primary provider
        ai_response = ai_manager.generate_response(prompt, chat_message.provider)
        
        if ai_response.success:
            return {
                "reply": ai_response.text,
                "provider": ai_response.provider,
                "success": True
            }
        else:
            # Try fallback to any available provider if specified provider fails
            if chat_message.provider:
                fallback_response = ai_manager.generate_response(prompt)
                if fallback_response.success:
                    return {
                        "reply": f"[Using fallback provider] {fallback_response.text}",
                        "provider": fallback_response.provider,
                        "success": True,
                        "fallback": True
                    }
            
            raise HTTPException(
                status_code=503,
                detail=f"AI service error: {ai_response.error}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
# -----------------------

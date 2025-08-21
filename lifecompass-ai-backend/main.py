import os
from typing import Optional
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file
load_dotenv()

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel, Field
except ImportError as e:
    print(f"FastAPI dependencies not installed. Run: pip install -r requirements.txt")
    print(f"Missing: {e}")
    exit(1)

try:
    from supabase_config import supabase_manager, is_supabase_configured, get_supabase_status
except ImportError:
    print("Supabase configuration module not found. Database features will be disabled.")
    supabase_manager = None
    is_supabase_configured = lambda: False
    get_supabase_status = lambda: {"connected": False, "error": "Supabase module not found"}

try:
    from ai_providers import AIProviderManager
except ImportError as e:
    print(f"AI providers module not found: {e}")
    print("Please ensure ai_providers.py is in the same directory.")
    exit(1)

# Import ATS modules
try:
    from models import Base, User, JobPosting, Application, UserRole, JobStatus, ApplicationStatus
    from job_postings import JobPostingService, validate_job_posting_data, format_job_posting_for_api
    from application_tracking import ApplicationService, format_application_for_api, validate_application_data
    from chat_interface import ChatService, format_message_for_api, validate_message_data
    from user_roles import RoleManager, require_role, require_authentication, set_current_user, get_current_user
except ImportError as e:
    print(f"ATS modules not found: {e}")
    print("Please ensure all ATS modules are in the same directory.")
    exit(1)

# --- Environment Configuration ---
# Load API keys from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
DATABASE_URL = os.getenv("DATABASE_URL", f"postgresql://postgres:{os.getenv('DB_PASSWORD', 'password')}@localhost:5432/ats_db")

# Check if required environment variables are set
if not SUPABASE_URL:
    print("WARNING: SUPABASE_URL environment variable not set!")
if not SUPABASE_KEY:
    print("WARNING: SUPABASE_KEY environment variable not set!")
# --------------------------------

# --- Database Setup ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
except Exception as e:
    print(f"⚠️ Database setup warning: {e}")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ----------------------

# --- Initializations ---
# Initialize Supabase connection using the new manager
if supabase_manager:
    supabase_status = supabase_manager.get_status()
    if supabase_status["connected"]:
        print("✅ Supabase client initialized successfully")
        supabase = supabase_manager.client
    else:
        print(f"❌ Supabase connection failed: {supabase_status.get('error', 'Unknown error')}")
        supabase = None
else:
    print("⚠️ Supabase manager not available")
    supabase = None

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
    description="ATS platform with multi-AI provider support and real-time chat",
    version="3.0.0"
)
# -----------------------

# --- Pydantic Models ---
class ChatMessage(BaseModel):
    message: str
    provider: Optional[str] = None  # Allow users to specify AI provider

class JobPostingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    company_name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10)
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: Optional[str] = None
    is_remote: bool = False
    work_type: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "USD"
    department: Optional[str] = None
    experience_level: Optional[str] = None
    skills_required: Optional[list] = []
    skills_preferred: Optional[list] = []

class ApplicationCreate(BaseModel):
    job_posting_id: str
    cover_letter: Optional[str] = None
    resume_url: str
    resume_filename: str
    answers: Optional[dict] = {}

class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class ChatMessageCreate(BaseModel):
    recipient_id: str
    message: str
    application_id: Optional[str] = None
    message_type: str = "text"
    file_url: Optional[str] = None
    file_name: Optional[str] = None

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
    supabase_configured = is_supabase_configured() if supabase_manager else False
    return {
        "message": "Welcome to the LifeCompass ATS Backend!",
        "status": "running",
        "version": "3.0.0",
        "supabase_configured": supabase_configured,
        "ai_providers": ai_status
    }

@app.get("/api/config", response_model=ConfigResponse)
def get_config():
    """Check which services are configured"""
    ai_status = ai_manager.get_status()
    supabase_configured = is_supabase_configured() if supabase_manager else False
    return ConfigResponse(
        supabase_configured=supabase_configured,
        ai_providers=ai_status,
        message="Configuration status retrieved successfully"
    )

@app.get("/api/ai-providers", response_model=AIProvidersResponse)
def get_ai_providers():
    """Get detailed AI provider information"""
    ai_status = ai_manager.get_status()
    return AIProvidersResponse(**ai_status)

@app.post("/api/signup")
async def create_job_seeker():
    if not supabase_manager or not is_supabase_configured():
        raise HTTPException(
            status_code=503, 
            detail="Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables."
        )
    
    try:
        # Create test user profile
        test_user_data = {
            "email": "test.user@example.com",
            "full_name": "Test User",
            "role": "job_seeker",
            "skills": ["Python", "JavaScript", "React"],
            "experience_level": "intermediate"
        }
        
        result = await supabase_manager.create_user_profile(test_user_data)
        
        if result["success"]:
            return {"status": "success", "data": result["data"], "message": result["message"]}
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/health")
def get_health_status():
    """Get comprehensive health status of all services"""
    ai_status = ai_manager.get_status()
    supabase_status = get_supabase_status() if supabase_manager else {"connected": False, "error": "Supabase manager not available"}
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": {"status": "running", "version": "2.0.0"},
            "database": supabase_status,
            "ai_providers": ai_status
        }
    }

# --- Job Posting Endpoints ---
@app.post("/api/jobs")
def create_job_posting(job_data: JobPostingCreate, db: Session = Depends(get_db)):
    """Create a new job posting (recruiters only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can create job postings")
    
    # Validate job data
    validation_errors = validate_job_posting_data(job_data.dict())
    if validation_errors:
        raise HTTPException(status_code=400, detail=validation_errors)
    
    job_service = JobPostingService(db)
    try:
        job_posting = job_service.create_job_posting(job_data.dict(), current_user.id)
        return format_job_posting_for_api(job_posting)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs")
def get_job_postings(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    location: Optional[str] = None,
    work_type: Optional[str] = None,
    is_remote: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get job postings with filtering"""
    job_service = JobPostingService(db)
    jobs = job_service.get_job_postings(
        skip=skip, limit=limit, search=search, location=location,
        work_type=work_type, is_remote=is_remote
    )
    return [format_job_posting_for_api(job) for job in jobs]

@app.get("/api/jobs/{job_id}")
def get_job_posting(job_id: str, db: Session = Depends(get_db)):
    """Get a specific job posting"""
    job_service = JobPostingService(db)
    job_posting = job_service.get_job_posting(job_id)
    
    if not job_posting:
        raise HTTPException(status_code=404, detail="Job posting not found")
    
    return format_job_posting_for_api(job_posting)

@app.put("/api/jobs/{job_id}")
def update_job_posting(job_id: str, job_data: JobPostingCreate, db: Session = Depends(get_db)):
    """Update a job posting (recruiters only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can update job postings")
    
    job_service = JobPostingService(db)
    job_posting = job_service.update_job_posting(job_id, job_data.dict(), current_user.id)
    
    if not job_posting:
        raise HTTPException(status_code=404, detail="Job posting not found or access denied")
    
    return format_job_posting_for_api(job_posting)

# --- Application Endpoints ---
@app.post("/api/applications")
def submit_application(application_data: ApplicationCreate, db: Session = Depends(get_db)):
    """Submit a job application (job seekers only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != UserRole.JOB_SEEKER:
        raise HTTPException(status_code=403, detail="Only job seekers can submit applications")
    
    # Validate application data
    validation_errors = validate_application_data(application_data.dict())
    if validation_errors:
        raise HTTPException(status_code=400, detail=validation_errors)
    
    application_service = ApplicationService(db)
    try:
        application = application_service.submit_application(
            application_data.job_posting_id,
            current_user.id,
            application_data.dict()
        )
        return format_application_for_api(application)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/applications")
def get_user_applications(db: Session = Depends(get_db)):
    """Get applications for current user"""
    current_user = get_current_user()
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    application_service = ApplicationService(db)
    applications = application_service.get_applications_by_user(current_user.id)
    
    return [format_application_for_api(app) for app in applications]

@app.get("/api/jobs/{job_id}/applications")
def get_job_applications(job_id: str, db: Session = Depends(get_db)):
    """Get applications for a specific job (recruiters only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can view job applications")
    
    application_service = ApplicationService(db)
    try:
        applications = application_service.get_applications_for_job(job_id, current_user.id)
        return [format_application_for_api(app) for app in applications]
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.put("/api/applications/{application_id}/status")
def update_application_status(
    application_id: str, 
    status_update: ApplicationStatusUpdate, 
    db: Session = Depends(get_db)
):
    """Update application status (recruiters only)"""
    current_user = get_current_user()
    if not current_user or current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can update application status")
    
    try:
        status_enum = ApplicationStatus(status_update.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status value")
    
    application_service = ApplicationService(db)
    try:
        application = application_service.update_application_status(
            application_id, status_enum, current_user.id, status_update.notes
        )
        if not application:
            raise HTTPException(status_code=404, detail="Application not found or access denied")
        
        return format_application_for_api(application)
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

# --- Chat Endpoints ---
@app.post("/api/messages")
def send_message(message_data: ChatMessageCreate, db: Session = Depends(get_db)):
    """Send a chat message"""
    current_user = get_current_user()
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate message data
    validation_errors = validate_message_data(message_data.dict())
    if validation_errors:
        raise HTTPException(status_code=400, detail=validation_errors)
    
    chat_service = ChatService(db)
    try:
        message = chat_service.send_message(
            current_user.id,
            message_data.recipient_id,
            message_data.message,
            message_data.application_id,
            message_data.message_type,
            message_data.file_url,
            message_data.file_name
        )
        return format_message_for_api(message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/conversations")
def get_user_conversations(db: Session = Depends(get_db)):
    """Get all conversations for current user"""
    current_user = get_current_user()
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    chat_service = ChatService(db)
    conversations = chat_service.get_user_conversations(current_user.id)
    
    return conversations

@app.get("/api/conversations/{partner_id}")
def get_conversation(partner_id: str, application_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Get conversation with a specific user"""
    current_user = get_current_user()
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    chat_service = ChatService(db)
    messages = chat_service.get_conversation(current_user.id, partner_id, application_id)
    
    return [format_message_for_api(msg) for msg in messages]

@app.put("/api/conversations/{partner_id}/read")
def mark_messages_read(partner_id: str, application_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Mark messages as read"""
    current_user = get_current_user()
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    chat_service = ChatService(db)
    count = chat_service.mark_messages_as_read(current_user.id, partner_id, application_id)
    
    return {"marked_read": count}

@app.get("/api/database/status")
def get_database_status():
    """Get detailed database status"""
    if not supabase_manager:
        return {"connected": False, "error": "Supabase manager not available"}
    
    return supabase_manager.get_health_status()

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

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting LifeCompass AI Backend Server...")
    uvicorn.run(app, host="127.0.0.1", port=8001)

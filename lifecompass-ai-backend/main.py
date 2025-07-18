import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import google.generativeai as genai
from pydantic import BaseModel

# --- Environment Configuration ---
# It's best practice to store these in environment variables!
# Supabase credentials
# This is the correct format for the URL from your Supabase API settings.
SUPABASE_URL="https://bnugfoafscbjyvrtmnis.supabase.co"
SUPABASE_KEY="sb_publishable_hq5OKbRF69FCFVdUGXwg9Q_CpQWDE3M"
# Google Gemini API Key
GOOGLE_API_KEY = "AIzaSyDIlsTgrJj-gU_W8aot2woW68K23VMX0DA" # <-- PASTE YOUR GOOGLE AI API KEY HERE
# --------------------------------

# --- Initializations ---
# Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Google Gemini client
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# FastAPI app instance
app = FastAPI()
# -----------------------

# --- Pydantic Models ---
class ChatMessage(BaseModel):
    message: str
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
    return {"message": "Welcome to the LifeCompass AI Backend!"}

@app.post("/api/signup")
def create_job_seeker():
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
    try:
        prompt = f"You are 'Career Compass', a helpful AI career advisor for a global talent marketplace called LifeCompass AI. A user has asked the following question. Provide a helpful and encouraging response. User's question: {chat_message.message}"
        response = model.generate_content(prompt)
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"Sorry, I encountered an error: {str(e)}"}
# -----------------------

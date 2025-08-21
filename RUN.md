# 🚀 LifeCompass AI - Quick Run Guide

> **Complete commands to run the LifeCompass AI project without testing**

## 📋 Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Git installed
- PowerShell (Windows)

---

## 🏃‍♂️ **OPTION 1: Automated Setup & Run (Recommended)**

### **Single Command Setup**
```powershell
# Clone and run automated setup
git clone https://github.com/yourusername/lifecompass-ai.git
cd lifecompass-ai
.\setup.ps1
```

### **Run Both Servers**
```powershell
# Terminal 1: Backend
& C:/PROJECT/lifecompass-ai/.venv/Scripts/Activate.ps1
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Frontend (open new terminal)
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-frontend
npm run dev
```

---

## 🔧 **OPTION 2: Manual Setup & Run**

### **1. Clone Repository**
```powershell
git clone https://github.com/yourusername/lifecompass-ai.git
cd lifecompass-ai
```

### **2. Backend Setup**
```powershell
# Create virtual environment
cd lifecompass-ai-backend
python -m venv ../.venv

# Activate virtual environment
& ../.venv/Scripts/Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### **3. Frontend Setup**
```powershell
# In new terminal or after backend setup
cd lifecompass-ai-frontend
npm install
```

### **4. Environment Configuration**
```powershell
# Backend environment is already configured with:
# - OpenRouter API Key: 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
# - Supabase Database: Connected and ready
# - AI Provider: OpenRouter (Gemini 1.5 Flash 8B)
```

### **5. Run Backend Server**
```powershell
# Terminal 1: Backend
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-backend
& C:/PROJECT/lifecompass-ai/.venv/Scripts/Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### **6. Run Frontend Server**
```powershell
# Terminal 2: Frontend (open new terminal)
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-frontend
npm run dev
```

---

## 🌐 **Access URLs**

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application interface |
| **Backend API** | http://127.0.0.1:8000 | REST API endpoints |
| **API Docs** | http://127.0.0.1:8000/docs | Interactive API documentation |

---

## 🎯 **Quick Start Commands (Copy & Paste)**

### **For existing setup:**
```powershell
# Terminal 1: Start Backend
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-backend && & C:/PROJECT/lifecompass-ai/.venv/Scripts/Activate.ps1 && uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Start Frontend
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-frontend && npm run dev
```

### **For fresh installation:**
```powershell
# Complete setup and run
git clone https://github.com/yourusername/lifecompass-ai.git && cd lifecompass-ai && .\setup.ps1
```

---

## 🔄 **Development Workflow**

### **Daily Development Start**
```powershell
# 1. Open two terminals

# Terminal 1 - Backend:
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-backend
& C:/PROJECT/lifecompass-ai/.venv/Scripts/Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend:
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-frontend
npm run dev
```

### **Stop Servers**
```powershell
# In each terminal, press: Ctrl + C
```

---

## 🎨 **Project Features Ready to Use**

### **✅ Working Features:**
- **AI Career Chat**: Real-time conversation with Gemini 1.5 Flash 8B
- **Modern UI**: React + Tailwind CSS interface
- **Database**: Supabase PostgreSQL integration
- **API**: FastAPI with comprehensive endpoints
- **Auto-reload**: Both servers support hot reload

### **🎯 Usage:**
1. **Open Frontend**: http://localhost:5173
2. **Click "Start Career Chat"**
3. **Ask career questions**: Get AI-powered guidance
4. **Real-time responses**: Instant AI conversation

---

## 🛠️ **Current Configuration**

### **Backend (FastAPI):**
- **Port**: 8000
- **AI Provider**: OpenRouter (Gemini 1.5 Flash 8B)
- **Database**: Supabase (Connected)
- **Environment**: Development with auto-reload

### **Frontend (React + Vite):**
- **Port**: 5173
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Features**: Chat interface, status indicators

### **Database (Supabase):**
- **Type**: PostgreSQL
- **Status**: Connected and operational
- **Features**: User profiles, conversation history ready

---

## 📱 **System Requirements**

### **Minimum:**
- Python 3.8+
- Node.js 16+
- 4GB RAM
- 1GB free disk space

### **Recommended:**
- Python 3.12+
- Node.js 20+
- 8GB RAM
- 2GB free disk space

---

## 🎉 **Success Indicators**

### **Backend Running Successfully:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
✅ Supabase connection established successfully
✅ AI Provider Manager initialized with 1 provider(s)
  ✓ OpenRouter (google/gemini-flash-1.5-8b) - ready
INFO:     Application startup complete.
```

### **Frontend Running Successfully:**
```
VITE v5.4.19  ready in 192 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🔗 **Important Notes**

1. **API Key**: OpenRouter key is already configured and working
2. **Database**: Supabase connection is pre-configured
3. **CORS**: Backend allows frontend connections
4. **Auto-reload**: Both servers restart automatically on code changes
5. **Chat Interface**: Fully functional AI career advisor

---

## 🚨 **Troubleshooting**

### **"Sorry, I'm having trouble connecting to the AI service" Error:**
```powershell
# This means the backend is not running. Start it with:
cd C:\PROJECT\lifecompass-ai\lifecompass-ai-backend
& C:/PROJECT/lifecompass-ai/.venv/Scripts/Activate.ps1
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### **Backend Won't Start:**
```powershell
# Ensure virtual environment is activated
& C:/PROJECT/lifecompass-ai/.venv/Scripts/Activate.ps1
# Reinstall dependencies
pip install -r requirements.txt
```

### **Frontend Won't Start:**
```powershell
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### **Port Already in Use:**
```powershell
# Kill processes on ports
netstat -ano | findstr :8000
netstat -ano | findstr :5173
# Kill process: taskkill /PID <PID> /F
```

### **Chat API Returns 404 Error:**
```
# Backend logs show: "POST /chat HTTP/1.1" 404 Not Found
# This is normal - the correct endpoint is /api/chat (already fixed in frontend)
# You should see: "POST /api/chat HTTP/1.1" 200 OK
```

---

## 📞 **Support**

- **Frontend Issues**: Check browser console for errors
- **Backend Issues**: Check terminal output for error messages
- **API Issues**: Visit http://127.0.0.1:8000/docs for testing
- **Chat Not Working**: Ensure both servers are running

---

*LifeCompass AI - Your complete AI-powered career guidance platform* 🧭✨

**Ready to launch your career journey!** 🚀

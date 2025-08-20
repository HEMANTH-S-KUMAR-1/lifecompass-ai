# LifeCompass AI - Universal Career Platform

A full-stack web application that provides AI-powered career guidance and job matching for a global talent marketplace. **Now supports multiple AI providers** for maximum flexibility and cost optimization!

## 🌟 Features

### For Job Seekers
- **Career Cockpit**: Personal dashboard for managing job applications
- **Global Job Search**: Search for remote and international opportunities  
- **AI-Powered Learning**: Personalized skill development recommendations
- **Universal Profile**: Create a comprehensive professional profile
- **Multi-AI Career Advisor**: Chat with AI using your preferred provider

### For Recruiters
- **Talent HQ**: Dashboard for managing job postings and candidates
- **Global Talent Search**: Find skilled professionals worldwide
- **Job Posting**: Create and manage job listings

## 🤖 AI Provider Support

Choose from **5 different AI providers** based on your needs and budget:

### **Free Options:**
- **� Google AI (Gemini)** - 15 requests/min free
- **🆓 Hugging Face** - Free tier available
- **🆓 Ollama** - Completely free, runs locally

### **Paid Options:**
- **💳 OpenAI (GPT)** - Industry standard
- **💳 Anthropic (Claude)** - High-quality responses

### **Smart Features:**
- ✅ **Automatic fallback** if primary provider fails
- ✅ **Provider selection** per conversation
- ✅ **Real-time status** showing which providers are active
- ✅ **Cost optimization** - mix free and paid providers

## �🏗️ Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI (Python) with multi-AI provider system
- **Database**: Supabase (PostgreSQL)
- **AI**: Google AI, OpenAI, Anthropic, Hugging Face, or Ollama
- **Deployment**: Ready for cloud deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- **At least ONE AI provider** (see options below)
- Supabase account (optional, for database features)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd lifecompass-ai
```

### 2. Backend Setup

```bash
cd lifecompass-ai-backend

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### 3. Choose Your AI Provider

You only need **ONE** provider to get started:

#### **🆓 Option A: Google AI (Recommended for beginners)**
```bash
# Get free API key from: https://makersuite.google.com/app/apikey
# Add to .env:
GOOGLE_API_KEY=your_google_api_key
```

#### **🆓 Option B: Ollama (Best for privacy)**
```bash
# Download from: https://ollama.ai/
# Install and run: ollama pull llama2
# Add to .env:
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

#### **🆓 Option C: Hugging Face (Free tier)**
```bash
# Get token from: https://huggingface.co/settings/tokens
# Add to .env:
HUGGINGFACE_API_KEY=your_hf_token
```

#### **💳 Option D: OpenAI (Paid)**
```bash
# Get API key from: https://platform.openai.com/api-keys
# Add to .env:
OPENAI_API_KEY=your_openai_key
```

#### **💳 Option E: Anthropic (Paid)**
```bash
# Get API key from: https://console.anthropic.com/
# Add to .env:
ANTHROPIC_API_KEY=your_anthropic_key
```

### 4. Optional: Configure Database
```bash
# Get from: https://supabase.com
# Add to .env:
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 5. Start Backend
```bash
uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`

### 6. Frontend Setup
```bash
cd ../lifecompass-ai-frontend

# Install dependencies  
npm install

# Start development server
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🔧 Configuration Status

The application provides real-time configuration status:

- **🟢 All Systems Ready**: All services configured and working
- **🟡 Partial Configuration**: Some services available, others missing
- **🔴 Connection Failed**: Backend server not running

### Live Status Indicators:
- ✅ **Supabase**: Database operations available
- ✅ **AI Providers**: Shows count and which providers are active
- 🎯 **Primary Provider**: Displays which AI is set as default

## 💰 Cost Optimization Guide

| Provider | Free Tier | Cost | Best Use Case |
|----------|-----------|------|---------------|
| **Google AI** | 15 req/min | Very low | Development & small apps |
| **Hugging Face** | Limited | Free | Experimentation |
| **Ollama** | Unlimited | Free | Privacy-focused & offline |
| **OpenAI** | $5 credit | $0.002/1K tokens | Production apps |
| **Anthropic** | None | $0.003/1K tokens | High-quality responses |

### **Recommended Strategies:**
1. **Development**: Start with Google AI (free)
2. **Privacy**: Use Ollama (local, free)
3. **Production**: Mix Google AI + OpenAI for cost efficiency
4. **Enterprise**: Use Anthropic for quality + OpenAI for volume

## 🛠️ Development

### Adding New AI Providers
The system is designed to easily support new providers:

1. Create new provider class in `ai_providers.py`
2. Implement the `BaseAIProvider` interface
3. Add initialization logic to `AIProviderManager`
4. Update environment variables

### Configuration Management
- All sensitive data uses environment variables
- No hardcoded API keys
- Secure by default
- Easy to configure for different environments

### Error Handling
- Graceful degradation when providers are unavailable
- Automatic fallback between providers
- User-friendly error messages with setup guidance

## 📁 Project Structure

```
lifecompass-ai/
├── lifecompass-ai-backend/
│   ├── main.py              # FastAPI application
│   ├── ai_providers.py      # Multi-AI provider system
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example        # Environment template
│   └── README.md           # Backend documentation
└── lifecompass-ai-frontend/
    ├── src/
    │   ├── App.jsx         # Main React application
    │   ├── main.jsx        # React entry point
    │   └── index.css       # Global styles
    ├── package.json        # Node dependencies
    └── vite.config.js      # Vite configuration
```

## 🚀 Deployment

### Backend (FastAPI)
- Deploy to Heroku, Railway, or any Python hosting
- Set environment variables for your chosen AI providers
- Use production WSGI server (Gunicorn)

### Frontend (React)
- Deploy to Vercel, Netlify, or any static hosting
- Update API URLs for production
- Build with `npm run build`

### Database
- Supabase provides hosted PostgreSQL
- Optional for basic AI chat functionality
- Required for user profiles and job applications

## 🔒 Security Features

- ✅ No hardcoded credentials
- ✅ Environment variable configuration
- ✅ CORS protection
- ✅ Input validation with Pydantic
- ✅ Error handling without data exposure
- ✅ Provider isolation and fallback

## 🎯 Use Cases

### **Startups & Solo Developers**
- Use Google AI or Hugging Face (free)
- Deploy on free tiers (Vercel + Railway)
- Scale up when needed

### **Growing Companies**
- Mix free and paid providers
- Use OpenAI for high-volume features
- Configure multiple providers for reliability

### **Enterprise**
- Deploy Ollama locally for sensitive data
- Use Anthropic for high-quality responses
- Configure full redundancy with multiple providers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test with your preferred AI provider
4. Submit a pull request

## 📞 Support

For setup help:
1. Check the real-time configuration status in the UI
2. Review backend logs for detailed error messages
3. Ensure at least one AI provider is configured in `.env`
4. Verify services are running on correct ports

## 📄 License

This project is open source and available under the MIT License.

---

**Ready to launch careers globally with any AI provider!** 🚀🌍🤖

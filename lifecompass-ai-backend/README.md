# LifeCompass AI Backend - Multi-AI Provider System

A FastAPI-based backend for the LifeCompass AI career platform, featuring **multiple AI provider support** for maximum flexibility and cost optimization.

## 🤖 Supported AI Providers

### **Free Options:**
- **Google AI (Gemini)** - Free tier available
- **Hugging Face Inference API** - Free tier available  
- **Ollama** - Completely free, runs locally

### **Paid Options:**
- **OpenAI (GPT)** - Pay-per-use
- **Anthropic (Claude)** - Pay-per-use

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Supabase account (for database)
- **At least ONE AI provider** (see setup options below)

### Setup Instructions

1. **Clone and navigate to the backend directory**
   ```bash
   cd lifecompass-ai-backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env file with your chosen AI provider credentials
   ```

4. **Choose Your AI Provider(s)**

   You only need to configure **ONE** AI provider to get started, but you can configure multiple for redundancy and cost optimization.

   #### **Option 1: Google AI (Recommended for beginners)**
   - **Free tier**: 15 requests per minute
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create API key
   - Add to `.env`:
     ```env
     GOOGLE_API_KEY=your_api_key_here
     GOOGLE_MODEL=gemini-1.5-flash
     ```

   #### **Option 2: Ollama (Best for privacy)**
   - **Completely free** and runs locally
   - Download from [ollama.ai](https://ollama.ai/)
   - Install and run: `ollama pull llama2`
   - Add to `.env`:
     ```env
     OLLAMA_URL=http://localhost:11434
     OLLAMA_MODEL=llama2
     ```

   #### **Option 3: Hugging Face (Free tier)**
   - Go to [Hugging Face](https://huggingface.co/settings/tokens)
   - Create a free account and generate token
   - Add to `.env`:
     ```env
     HUGGINGFACE_API_KEY=your_token_here
     HUGGINGFACE_MODEL=microsoft/DialoGPT-medium
     ```

   #### **Option 4: OpenAI (Paid)**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add payment method and create API key
   - Add to `.env`:
     ```env
     OPENAI_API_KEY=your_api_key_here
     OPENAI_MODEL=gpt-3.5-turbo
     ```

   #### **Option 5: Anthropic (Paid)**
   - Go to [Anthropic Console](https://console.anthropic.com/)
   - Create account and API key
   - Add to `.env`:
     ```env
     ANTHROPIC_API_KEY=your_api_key_here
     ANTHROPIC_MODEL=claude-3-sonnet-20240229
     ```

5. **Configure Supabase (for database features)**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Go to Settings > API
   - Add to `.env`:
     ```env
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_KEY=your_supabase_anon_key
     ```

6. **Set Primary Provider (optional)**
   ```env
   PRIMARY_AI_PROVIDER=google  # or openai, anthropic, huggingface, ollama
   ```

7. **Run the development server**
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## 📋 API Endpoints

### Health & Configuration
- `GET /` - Health check with all provider status
- `GET /api/config` - Detailed configuration status
- `GET /api/ai-providers` - AI provider information

### Core Features
- `POST /api/signup` - Create job seeker profile
- `POST /api/chat` - AI-powered career chat with provider selection

#### Chat API Example:
```json
{
  "message": "How can I improve my resume?",
  "provider": "google"  // Optional: specify provider
}
```

## 🔧 Multi-Provider Features

### **Automatic Fallback**
If your specified provider fails, the system automatically tries the primary provider.

### **Load Distribution**
Configure multiple providers and specify which one to use per request.

### **Cost Optimization**
- Use free providers (Google AI, Hugging Face, Ollama) for development
- Switch to paid providers (OpenAI, Anthropic) for production quality
- Mix providers based on use case

### **Provider Selection**
```python
# In your requests, optionally specify provider:
{
  "message": "Career advice please",
  "provider": "google"     # Use Google AI
}

{
  "message": "Career advice please",
  "provider": "ollama"     # Use local Ollama
}

{
  "message": "Career advice please"
  # No provider = use primary/auto
}
```

## 🛠️ Configuration Status

The system provides real-time status for all providers:

```bash
✅ AI Provider Manager initialized with 2 provider(s)
  ✓ Google Gemini (gemini-1.5-flash) - ready
  ✓ Ollama (llama2) - ready
  🎯 Primary provider: google
```

## 💰 Cost Comparison

| Provider | Free Tier | Paid Rate | Best For |
|----------|-----------|-----------|----------|
| **Google AI** | 15 req/min | Very cheap | Beginners |
| **Hugging Face** | Limited | Free | Experimentation |
| **Ollama** | Unlimited | Free | Privacy/Offline |
| **OpenAI** | $5 credit | $0.002/1K tokens | Production |
| **Anthropic** | None | $0.003/1K tokens | Quality |

## 🔒 Environment Variables

All configuration is done via environment variables:

```env
# Database (Required)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# AI Providers (Configure at least one)
GOOGLE_API_KEY=your_google_key
OPENAI_API_KEY=your_openai_key  
ANTHROPIC_API_KEY=your_anthropic_key
HUGGINGFACE_API_KEY=your_hf_token
OLLAMA_URL=http://localhost:11434

# Provider Selection
PRIMARY_AI_PROVIDER=google
```

## 🚀 Production Deployment

1. **Choose your providers** based on budget and requirements
2. **Set environment variables** in your hosting platform
3. **Configure fallback providers** for reliability
4. **Monitor usage** and costs

## 🆘 Troubleshooting

### No AI providers configured
- Check your `.env` file
- Ensure at least one API key is set
- For Ollama, make sure it's running locally

### Provider errors
- Check API key validity
- Verify account has credits (for paid providers)
- Check rate limits

### Fallback behavior
- System automatically tries primary provider if specified one fails
- Configure multiple providers for better reliability

## � License

This project is part of the LifeCompass AI platform and supports multiple AI providers for maximum flexibility.

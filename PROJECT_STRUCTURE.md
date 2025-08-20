# Project Structure - LifeCompass AI

```
lifecompass-ai/
├── 📄 README.md                       # Main project documentation
├── 📄 .gitignore                      # Git ignore rules
├── 📄 setup.sh                        # Setup script for Linux/Mac
├── 📄 setup.ps1                       # Setup script for Windows
│
├── 📁 lifecompass-ai-backend/         # FastAPI Backend
│   ├── 📄 main.py                     # Main FastAPI application
│   ├── 📄 ai_providers.py             # Multi-AI provider system
│   ├── 📄 requirements.txt            # Python dependencies
│   ├── 📄 .env.example               # Environment variables template
│   └── 📄 README.md                   # Backend documentation
│
└── 📁 lifecompass-ai-frontend/        # React Frontend
    ├── 📄 package.json                # Node.js dependencies
    ├── 📄 vite.config.js              # Vite configuration
    ├── 📄 tailwind.config.js          # Tailwind CSS config
    ├── 📄 postcss.config.js           # PostCSS configuration
    ├── 📄 eslint.config.js            # ESLint configuration
    ├── 📄 index.html                  # Main HTML template
    ├── 📄 README.md                   # Frontend documentation
    │
    ├── 📁 public/                     # Static assets
    │   └── 📄 vite.svg                # Vite logo
    │
    └── 📁 src/                        # Source code
        ├── 📄 main.jsx                # React entry point
        ├── 📄 App.jsx                 # Main React application
        ├── 📄 App.css                 # Component styles
        ├── 📄 index.css               # Global styles
        │
        └── 📁 assets/                 # Asset files
```

## 📋 Key Files Description

### Backend Files
- **main.py**: FastAPI application with multi-AI provider endpoints
- **ai_providers.py**: Modular AI provider system supporting Google AI, OpenAI, Anthropic, Hugging Face, and Ollama
- **requirements.txt**: Python package dependencies
- **.env.example**: Template for environment variables

### Frontend Files
- **App.jsx**: Main React component with all UI logic
- **main.jsx**: React application entry point
- **package.json**: Node.js dependencies and scripts
- **vite.config.js**: Vite build tool configuration

### Configuration Files
- **.gitignore**: Excludes sensitive files and build artifacts
- **setup.sh / setup.ps1**: Automated setup scripts
- **README.md**: Comprehensive documentation

## 🔧 Dependencies

### Backend Dependencies
```
fastapi==0.104.1               # Web framework
uvicorn==0.24.0                # ASGI server
supabase==2.0.3                # Database client
python-dotenv==1.0.0           # Environment variables
pydantic==2.5.0                # Data validation
requests==2.31.0               # HTTP client
google-generativeai==0.3.2     # Google AI (optional)
```

### Frontend Dependencies
```
react==18.2.0                  # UI framework
react-dom==18.2.0              # React DOM
vite==5.2.0                    # Build tool
tailwindcss==3.4.17            # CSS framework
framer-motion==11.18.2         # Animations
axios==1.10.0                  # HTTP client
lucide-react==0.394.0          # Icons
```

## 🚀 Quick Commands

### Development
```bash
# Backend
cd lifecompass-ai-backend
uvicorn main:app --reload

# Frontend  
cd lifecompass-ai-frontend
npm run dev
```

### Build for Production
```bash
# Frontend build
cd lifecompass-ai-frontend
npm run build
```

### Linting
```bash
# Frontend linting
cd lifecompass-ai-frontend
npm run lint
```

## 🔒 Environment Variables

### Required
- `SUPABASE_URL` - Database connection
- `SUPABASE_KEY` - Database authentication

### AI Providers (Choose at least one)
- `GOOGLE_API_KEY` - Google AI access
- `OPENAI_API_KEY` - OpenAI access  
- `ANTHROPIC_API_KEY` - Anthropic access
- `HUGGINGFACE_API_KEY` - Hugging Face access
- `OLLAMA_URL` - Local Ollama server

### Optional
- `PRIMARY_AI_PROVIDER` - Primary AI provider selection
- `PORT` - Backend server port
- `HOST` - Backend server host

## 📦 Build Artifacts

### Development
- `node_modules/` - Frontend dependencies
- `__pycache__/` - Python cache files
- `.env` - Local environment variables

### Production
- `dist/` - Frontend build output
- `build/` - Alternative build directory

# LifeCompass AI Setup Script for Windows
Write-Host "🚀 Setting up LifeCompass AI..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "lifecompass-ai-backend") -or -not (Test-Path "lifecompass-ai-frontend")) {
    Write-Host "❌ Please run this script from the lifecompass-ai root directory" -ForegroundColor Red
    exit 1
}

# Backend setup
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
Set-Location lifecompass-ai-backend

# Check if Python is installed
try {
    $pythonVersion = python --version 2>$null
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python 3 is required but not installed" -ForegroundColor Red
    Write-Host "Please install Python from https://python.org" -ForegroundColor Yellow
    exit 1
}

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your API keys." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

Set-Location ..

# Frontend setup
Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location lifecompass-ai-frontend

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is required but not installed" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Install Node dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit lifecompass-ai-backend\.env with your API keys" -ForegroundColor White
Write-Host "2. Start the backend: cd lifecompass-ai-backend && uvicorn main:app --reload" -ForegroundColor White
Write-Host "3. Start the frontend: cd lifecompass-ai-frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Get your API keys:" -ForegroundColor Cyan
Write-Host "- Google AI: https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "- OpenAI: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "- Anthropic: https://console.anthropic.com/" -ForegroundColor White
Write-Host "- Hugging Face: https://huggingface.co/settings/tokens" -ForegroundColor White
Write-Host "- Supabase: https://supabase.com" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed instructions, see README.md" -ForegroundColor Cyan

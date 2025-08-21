# LifeCompass AI Setup Script for Windows
param(
    [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "Setting up LifeCompass AI..." -ForegroundColor Green
Write-Host ""

# Function to handle errors gracefully
function Handle-Error {
    param($ErrorMessage)
    Write-Host "ERROR: $ErrorMessage" -ForegroundColor Red
    Write-Host "Setup failed. Please check the error above." -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "lifecompass-ai-backend") -or -not (Test-Path "lifecompass-ai-frontend")) {
    Handle-Error "Please run this script from the lifecompass-ai root directory"
}

# Check if running as administrator (optional but recommended)
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: Running without administrator privileges. Some operations might fail." -ForegroundColor Yellow
    Write-Host "Consider running PowerShell as Administrator if you encounter permission issues." -ForegroundColor Yellow
    Write-Host ""
}

# Backend setup
Write-Host "Setting up backend..." -ForegroundColor Blue

# Check if Python is installed
try {
    $pythonCheck = python --version 2>$null
    if ($LASTEXITCODE -eq 0 -and $pythonCheck) {
        Write-Host "PASS: Python found: $pythonCheck" -ForegroundColor Green
    } else {
        throw "Python not found"
    }
} catch {
    Handle-Error "Python 3.8+ is required but not installed. Please install Python from https://python.org"
}

# Remove existing virtual environment if Force flag is used
if ($Force -and (Test-Path ".venv")) {
    Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force ".venv" -ErrorAction Stop
        Write-Host "PASS: Old virtual environment removed" -ForegroundColor Green
    } catch {
        Handle-Error "Failed to remove existing virtual environment: $($_.Exception.Message)"
    }
}

# Create virtual environment
if (-not (Test-Path ".venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    try {
        python -m venv .venv
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create virtual environment"
        }
        Write-Host "PASS: Virtual environment created" -ForegroundColor Green
    } catch {
        Handle-Error "Failed to create virtual environment: $($_.Exception.Message)"
    }
} else {
    Write-Host "PASS: Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
try {
    # Try different activation methods
    $activationScript = ".\.venv\Scripts\Activate.ps1"
    
    if (Test-Path $activationScript) {
        & $activationScript
        if ($LASTEXITCODE -ne 0) {
            throw "Activation script failed"
        }
    } else {
        throw "Activation script not found"
    }
    
    Write-Host "PASS: Virtual environment activated" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Virtual environment activation failed. Trying alternative method..." -ForegroundColor Yellow
    try {
        # Alternative activation method
        $env:VIRTUAL_ENV = Resolve-Path ".\.venv"
        $env:PATH = "$env:VIRTUAL_ENV\Scripts;$env:PATH"
        Write-Host "PASS: Virtual environment activated (alternative method)" -ForegroundColor Green
    } catch {
        Handle-Error "Failed to activate virtual environment: $($_.Exception.Message). Try running: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
    }
}

# Install Python dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
try {
    Push-Location "lifecompass-ai-backend"
    
    if (-not (Test-Path "requirements.txt")) {
        throw "requirements.txt not found in lifecompass-ai-backend directory"
    }
    
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    
    if ($LASTEXITCODE -ne 0) {
        throw "pip install failed"
    }
    
    Write-Host "PASS: Python dependencies installed successfully" -ForegroundColor Green
} catch {
    Handle-Error "Failed to install Python dependencies: $($_.Exception.Message)"
} finally {
    Pop-Location
}

# Create .env file
$envPath = "lifecompass-ai-backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    try {
        # Check if .env.example exists
        $examplePath = "lifecompass-ai-backend\.env.example"
        if (Test-Path $examplePath) {
            Copy-Item $examplePath $envPath
            Write-Host "PASS: .env file created from .env.example" -ForegroundColor Green
        } else {
            # Create default .env file
            $envContent = @"
# Database Configuration
DATABASE_URL=your_supabase_database_url_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here

# AI API Keys
GOOGLE_API_KEY=your_google_ai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Settings
DEBUG=True
PORT=8000
HOST=0.0.0.0
"@
            $envContent | Out-File -FilePath $envPath -Encoding UTF8
            Write-Host "PASS: Default .env file created" -ForegroundColor Green
        }
    } catch {
        Write-Host "WARNING: Failed to create .env file: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "You will need to create this file manually." -ForegroundColor Yellow
    }
} else {
    Write-Host "PASS: .env file already exists" -ForegroundColor Green
}

# Frontend setup
Write-Host ""
Write-Host "Setting up frontend..." -ForegroundColor Blue

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0 -and $nodeVersion) {
        Write-Host "PASS: Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Handle-Error "Node.js is required but not installed. Please install Node.js from https://nodejs.org"
}

# Install Node.js dependencies
Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
try {
    Push-Location "lifecompass-ai-frontend"
    
    if (-not (Test-Path "package.json")) {
        throw "package.json not found in lifecompass-ai-frontend directory"
    }
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    
    Write-Host "PASS: Node.js dependencies installed successfully" -ForegroundColor Green
} catch {
    Handle-Error "Failed to install Node.js dependencies: $($_.Exception.Message)"
} finally {
    Pop-Location
}

# Success message
Write-Host ""
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit lifecompass-ai-backend\.env with your actual API keys" -ForegroundColor White
Write-Host "2. Start the backend:" -ForegroundColor White
Write-Host "   cd lifecompass-ai-backend" -ForegroundColor Gray
Write-Host "   python -m uvicorn main:app --reload" -ForegroundColor Gray
Write-Host "3. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd lifecompass-ai-frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Get your API keys from:" -ForegroundColor Cyan
Write-Host "- Google AI Studio: https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "- OpenAI: https://platform.openai.com/api-keys" -ForegroundColor White
Write-Host "- Anthropic: https://console.anthropic.com/" -ForegroundColor White
Write-Host "- Hugging Face: https://huggingface.co/settings/tokens" -ForegroundColor White
Write-Host "- Supabase: https://supabase.com/dashboard/projects" -ForegroundColor White
Write-Host ""
Write-Host "For testing without API keys:" -ForegroundColor Cyan
Write-Host "- Add ENABLE_MOCK_AI=true to your .env file" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see README.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "- Run with -Force flag to recreate virtual environment: .\setup.ps1 -Force" -ForegroundColor Gray
Write-Host "- If you get execution policy errors, run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
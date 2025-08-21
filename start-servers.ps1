# LifeCompass AI Server Starter Script for PowerShell
Write-Host "🚀 Starting LifeCompass AI Servers..." -ForegroundColor Green

# Variables
$BackendPath = "lifecompass-ai-backend"
$FrontendPath = "lifecompass-ai-frontend"
$VenvPath = ".venv"

# Check if we're in the right directory
if (-not (Test-Path $BackendPath) -or -not (Test-Path $FrontendPath)) {
    Write-Host "❌ Please run this script from the lifecompass-ai root directory" -ForegroundColor Red
    exit 1
}

# Function to start the backend server
function Start-BackendServer {
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    
    # Check if virtual environment exists
    if (Test-Path $VenvPath) {
        # Activate virtual environment
        & "$VenvPath\Scripts\Activate.ps1"
        
        # Change to backend directory
        Set-Location $BackendPath
        
        # Start the backend server
        Write-Host "✅ Starting FastAPI Server at http://127.0.0.1:8000" -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\$VenvPath\Scripts\Activate.ps1'; Set-Location '$PSScriptRoot\$BackendPath'; uvicorn main:app --reload --host 127.0.0.1 --port 8000"
        
        # Return to root directory
        Set-Location ..
    } else {
        Write-Host "❌ Virtual environment not found. Please run setup.ps1 first." -ForegroundColor Red
        exit 1
    }
}

# Function to start the frontend server
function Start-FrontendServer {
    Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
    
    # Change to frontend directory
    Set-Location $FrontendPath
    
    # Start the frontend server
    Write-Host "✅ Starting Vite Dev Server at http://localhost:5173" -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$PSScriptRoot\$FrontendPath'; npm run dev"
    
    # Return to root directory
    Set-Location ..
}

# Start both servers
Start-BackendServer
Start-FrontendServer

Write-Host ""
Write-Host "🎉 Servers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Access points:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "- Backend API: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "- API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 To stop the servers, close the terminal windows or press Ctrl+C in each window." -ForegroundColor Yellow

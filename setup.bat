@echo off
echo 🚀 Setting up LifeCompass AI...

REM Check if we're in the right directory
if not exist "lifecompass-ai-backend" (
    echo ❌ Please run this script from the lifecompass-ai root directory
    pause
    exit /b 1
)
if not exist "lifecompass-ai-frontend" (
    echo ❌ Please run this script from the lifecompass-ai root directory
    pause
    exit /b 1
)

REM Backend setup
echo 📦 Setting up backend...
cd lifecompass-ai-backend

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed
    pause
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ✅ .env file created. Please edit it with your API keys.
) else (
    echo ✅ .env file already exists
)

cd ..

REM Frontend setup
echo 📦 Setting up frontend...
cd lifecompass-ai-frontend

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed
    pause
    exit /b 1
)

REM Install Node dependencies
echo Installing Node.js dependencies...
npm install

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo 📝 Next steps:
echo 1. Edit lifecompass-ai-backend\.env with your API keys
echo 2. Start the backend: cd lifecompass-ai-backend ^&^& uvicorn main:app --reload
echo 3. Start the frontend: cd lifecompass-ai-frontend ^&^& npm run dev
echo.
echo 🔗 Get your API keys:
echo - Supabase: https://supabase.com
echo - Google AI: https://makersuite.google.com/app/apikey
echo.
echo 📖 For detailed instructions, see README.md
pause

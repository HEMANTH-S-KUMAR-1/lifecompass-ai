@echo off
echo Starting LifeCompass AI...
echo.

REM Start Backend in new window
echo Starting Backend Server...
start "LifeCompass Backend" cmd /k "cd /d C:\PROJECT\Lifecompass-ai\lifecompass-ai-backend && C:\PROJECT\Lifecompass-ai\.venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend in new window  
echo Starting Frontend Server...
start "LifeCompass Frontend" cmd /k "cd /d C:\PROJECT\Lifecompass-ai\lifecompass-ai-frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173 (or next available port)
echo.
echo Press any key to exit...
pause >nul

#!/bin/bash

# LifeCompass AI Setup Script
echo "🚀 Setting up LifeCompass AI..."

# Check if we're in the right directory
if [ ! -d "lifecompass-ai-backend" ] || [ ! -d "lifecompass-ai-frontend" ]; then
    echo "❌ Please run this script from the lifecompass-ai root directory"
    exit 1
fi

# Backend setup
echo "📦 Setting up backend..."
cd lifecompass-ai-backend

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your API keys."
else
    echo "✅ .env file already exists"
fi

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd lifecompass-ai-frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

# Install Node dependencies
echo "Installing Node.js dependencies..."
npm install

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit lifecompass-ai-backend/.env with your API keys"
echo "2. Start the backend: cd lifecompass-ai-backend && uvicorn main:app --reload"
echo "3. Start the frontend: cd lifecompass-ai-frontend && npm run dev"
echo ""
echo "🔗 Get your API keys:"
echo "- Supabase: https://supabase.com"
echo "- Google AI: https://makersuite.google.com/app/apikey"
echo ""
echo "📖 For detailed instructions, see README.md"

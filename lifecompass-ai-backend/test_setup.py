#!/usr/bin/env python3
"""
Test script for LifeCompass AI Backend
Run this to verify your setup is working correctly.
"""

import os
import sys
import requests
import time
from typing import Dict, Any

def test_imports():
    """Test if all required packages can be imported."""
    print("🧪 Testing imports...")
    
    try:
        import fastapi
        print("✅ FastAPI imported successfully")
    except ImportError:
        print("❌ FastAPI not found. Run: pip install fastapi")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn imported successfully")
    except ImportError:
        print("❌ Uvicorn not found. Run: pip install uvicorn")
        return False
    
    try:
        import dotenv
        print("✅ python-dotenv imported successfully")
    except ImportError:
        print("❌ python-dotenv not found. Run: pip install python-dotenv")
        return False
    
    try:
        import requests
        print("✅ Requests imported successfully")
    except ImportError:
        print("❌ Requests not found. Run: pip install requests")
        return False
    
    return True

def test_environment():
    """Test environment configuration."""
    print("\n🔧 Testing environment configuration...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check for .env file
    if os.path.exists('.env'):
        print("✅ .env file found")
    else:
        print("⚠️ .env file not found. Copy from .env.example")
    
    # Check AI provider configuration
    ai_providers = {
        'Google AI': os.getenv('GOOGLE_API_KEY'),
        'OpenAI': os.getenv('OPENAI_API_KEY'),
        'Anthropic': os.getenv('ANTHROPIC_API_KEY'),
        'Hugging Face': os.getenv('HUGGINGFACE_API_KEY'),
    }
    
    configured_providers = []
    for provider, key in ai_providers.items():
        if key:
            configured_providers.append(provider)
            print(f"✅ {provider} configured")
        else:
            print(f"⚠️ {provider} not configured")
    
    if configured_providers:
        print(f"✅ {len(configured_providers)} AI provider(s) configured: {', '.join(configured_providers)}")
    else:
        print("❌ No AI providers configured. At least one is required.")
        return False
    
    # Check Supabase
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    if supabase_url and supabase_key:
        print("✅ Supabase configured")
    else:
        print("⚠️ Supabase not configured (optional for AI features)")
    
    return True

def test_ai_providers():
    """Test AI provider system."""
    print("\n🤖 Testing AI provider system...")
    
    try:
        from ai_providers import AIProviderManager
        
        # Initialize manager
        manager = AIProviderManager()
        status = manager.get_status()
        
        print(f"✅ AI Provider Manager initialized")
        print(f"📊 Total configured providers: {status['total_configured']}")
        
        for provider in status['configured_providers']:
            print(f"  ✓ {provider['name']} - {provider['status']}")
        
        if status['primary_provider']:
            print(f"🎯 Primary provider: {status['primary_provider']}")
        
        # Test a simple generation if providers are available
        if status['total_configured'] > 0:
            test_prompt = "Hello, this is a test message."
            response = manager.generate_response(test_prompt)
            
            if response.success:
                print("✅ AI response generation test passed")
                print(f"   Provider: {response.provider}")
                print(f"   Response length: {len(response.text)} characters")
            else:
                print(f"❌ AI response generation test failed: {response.error}")
                return False
        else:
            print("⚠️ No AI providers available for testing")
        
        return True
        
    except Exception as e:
        print(f"❌ AI provider test failed: {e}")
        return False

def test_server():
    """Test if the server can start and respond."""
    print("\n🌐 Testing server startup...")
    
    try:
        from main import app
        print("✅ Main application imported successfully")
        
        # Try to create the app instance
        if app:
            print("✅ FastAPI app instance created")
        else:
            print("❌ Failed to create FastAPI app instance")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints if server is running."""
    print("\n🔗 Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    try:
        # Test health endpoint
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health endpoint working")
            print(f"   Status: {data.get('status')}")
            print(f"   Version: {data.get('version', 'N/A')}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test config endpoint
        response = requests.get(f"{base_url}/api/config", timeout=5)
        if response.status_code == 200:
            print("✅ Config endpoint working")
        else:
            print(f"⚠️ Config endpoint failed: {response.status_code}")
        
        # Test AI providers endpoint
        response = requests.get(f"{base_url}/api/ai-providers", timeout=5)
        if response.status_code == 200:
            print("✅ AI providers endpoint working")
        else:
            print(f"⚠️ AI providers endpoint failed: {response.status_code}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("⚠️ Server not running. Start with: uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 LifeCompass AI Backend Test Suite")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("Environment Test", test_environment),
        ("AI Providers Test", test_ai_providers),
        ("Server Test", test_server),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Test API endpoints only if server is mentioned to be running
    print("\n" + "=" * 50)
    print("🔗 Optional: API Endpoint Test")
    print("   (Run 'uvicorn main:app --reload' in another terminal first)")
    
    try:
        api_result = test_api_endpoints()
        results.append(("API Endpoints", api_result))
    except Exception as e:
        print(f"⚠️ API test skipped: {e}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    
    passed = 0
    total = len([r for r in results if r[0] != "API Endpoints"])
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} {test_name}")
        if result and test_name != "API Endpoints":
            passed += 1
    
    print(f"\n🎯 Result: {passed}/{total} core tests passed")
    
    if passed == total:
        print("🎉 All core tests passed! Your backend is ready.")
        print("\n🚀 Next steps:")
        print("   1. Start the server: uvicorn main:app --reload")
        print("   2. Test the frontend: cd ../lifecompass-ai-frontend && npm run dev")
        print("   3. Visit: http://localhost:5173")
    else:
        print("❌ Some tests failed. Please check the issues above.")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

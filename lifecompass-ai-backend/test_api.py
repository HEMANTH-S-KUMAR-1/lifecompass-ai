#!/usr/bin/env python3
"""
Simple API test script to test the chat endpoint with 'hi'
"""

import requests
import json
import time

def test_api():
    """Test the API by sending 'hi' to the chat endpoint"""
    base_url = "http://127.0.0.1:8000"
    
    print("🧪 Testing LifeCompass AI API")
    print("=" * 40)
    
    # Test 1: Check if server is running
    try:
        print("1. Testing server health...")
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server is running")
            print(f"   Status: {data.get('status')}")
            print(f"   Version: {data.get('version')}")
            print(f"   AI Providers: {data.get('ai_providers', {}).get('total_configured', 0)}")
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Please start it first:")
        print("   py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test 2: Send 'hi' to chat endpoint
    try:
        print("\n2. Testing chat endpoint with 'hi'...")
        chat_data = {"message": "hi"}
        headers = {"Content-Type": "application/json"}
        
        response = requests.post(f"{base_url}/api/chat", 
                               json=chat_data, 
                               headers=headers, 
                               timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Chat API responded successfully!")
            print(f"   Provider: {data.get('provider', 'unknown')}")
            print(f"   Success: {data.get('success', False)}")
            print(f"   Reply: {data.get('reply', 'No reply')[:200]}...")
            if len(data.get('reply', '')) > 200:
                print("   (Response truncated for display)")
            return True
        else:
            print(f"❌ Chat API failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Raw error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Chat request timed out (30s)")
        return False
    except Exception as e:
        print(f"❌ Chat test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_api()
    if success:
        print("\n🎉 API test completed successfully!")
        print("The API is working and responds to 'hi' messages.")
    else:
        print("\n❌ API test failed.")
        print("Please check the server logs and configuration.")

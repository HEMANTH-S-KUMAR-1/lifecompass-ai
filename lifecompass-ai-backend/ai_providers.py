"""
AI Providers Module
Multi-provider AI integration for chat and content generation
"""

import os
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AIResponse:
    success: bool
    text: Optional[str] = None
    provider: Optional[str] = None
    error: Optional[str] = None

class BaseAIProvider:
    def is_configured(self) -> bool:
        raise NotImplementedError
    
    def generate_text(self, prompt: str) -> str:
        raise NotImplementedError

class MockAIProvider(BaseAIProvider):
    """Mock AI provider for development/testing without API keys"""
    def __init__(self):
        self.enabled = os.getenv("ENABLE_MOCK_AI", "").lower() in ("true", "1", "yes")
    
    def is_configured(self) -> bool:
        return self.enabled
    
    def generate_text(self, prompt: str) -> str:
        """Return a mock response based on the prompt"""
        if not self.enabled:
            raise Exception("Mock AI provider not enabled. Set ENABLE_MOCK_AI=true in .env to use.")
        
        # Simple keywords-based response system for testing
        if "career" in prompt.lower():
            return "I can help with your career questions! For a real project, you would connect to an actual AI provider."
        elif "job" in prompt.lower() or "work" in prompt.lower():
            return "Looking for job advice? In a production environment, this would connect to Google AI, OpenAI, or another provider."
        elif "hello" in prompt.lower() or "hi" in prompt.lower():
            return "Hello! I'm a mock AI provider for testing LifeCompass AI without API keys. Enable a real provider in .env for production use."
        else:
            return f"This is a mock response from the testing provider. In production, LifeCompass would process: '{prompt[:30]}...' using a real AI service."

class AIProviderManager:
    def __init__(self):
        self.providers = {
            "google": GoogleAIProvider(),
            "openai": OpenAIProvider(),
            "anthropic": AnthropicProvider(),
            "huggingface": HuggingFaceProvider(),
            "ollama": OllamaProvider(),
            "mock": MockAIProvider()  # Added mock provider for testing
        }
        # Allow explicit selection of provider from environment
        self.primary_provider = os.getenv("PRIMARY_AI_PROVIDER") or self._determine_primary_provider()
    
    def _determine_primary_provider(self) -> Optional[str]:
        """Determine which provider to use as primary based on available API keys"""
        # Check if mock provider is explicitly enabled
        if "mock" in self.providers and self.providers["mock"].is_configured():
            return "mock"
            
        # Try providers in order of preference
        provider_preference = ["google", "openai", "anthropic", "huggingface", "ollama"]
        for name in provider_preference:
            if name in self.providers and self.providers[name].is_configured():
                return name
        return None
    
    def get_status(self) -> Dict[str, Any]:
        """Get status of all AI providers"""
        configured_providers = []
        available_providers = []
        
        for name, provider in self.providers.items():
            provider_info = {
                "name": name,
                "configured": provider.is_configured(),
                "status": "ready" if provider.is_configured() else "not configured"
            }
            
            available_providers.append(provider_info)
            
            if provider.is_configured():
                configured_providers.append(provider_info)
        
        return {
            "available_providers": available_providers,
            "configured_providers": configured_providers,
            "primary_provider": self.primary_provider,
            "total_configured": len(configured_providers)
        }
    
    def generate_response(self, prompt: str, provider_name: Optional[str] = None) -> AIResponse:
        """Generate AI response using specified provider or primary provider"""
        
        # Use specified provider or fall back to primary
        target_provider = provider_name or self.primary_provider
        
        if not target_provider:
            return AIResponse(
                success=False,
                error="No AI providers are configured. Set up at least one provider in .env or enable the mock provider with ENABLE_MOCK_AI=true"
            )
        
        if target_provider not in self.providers:
            return AIResponse(
                success=False,
                error=f"Provider '{target_provider}' not found"
            )
        
        provider = self.providers[target_provider]
        
        if not provider.is_configured():
            # Try to fall back to any configured provider
            fallback_provider = self._determine_primary_provider()
            if fallback_provider and fallback_provider != target_provider:
                logger.warning(f"Provider '{target_provider}' not configured, falling back to '{fallback_provider}'")
                return self.generate_response(prompt, fallback_provider)
            else:
                return AIResponse(
                    success=False,
                    error=f"Provider '{target_provider}' is not configured and no fallbacks are available"
                )
        
        try:
            response_text = provider.generate_text(prompt)
            return AIResponse(
                success=True,
                text=response_text,
                provider=target_provider
            )
        except Exception as e:
            return AIResponse(
                success=False,
                error=str(e),
                provider=target_provider
            )

class GoogleAIProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.model = os.getenv("GOOGLE_MODEL", "gemini-pro")
        self.client = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model)
            except ImportError:
                logger.error("google-generativeai package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize Google AI: {e}")
    
    def is_configured(self) -> bool:
        return self.api_key is not None
    
    def generate_text(self, prompt: str) -> str:
        if not self.api_key:
            raise Exception("Google AI API key not configured")
        
        try:
            import google.generativeai as genai
            if not self.client:
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model)
                
            response = self.client.generate_content(prompt)
            return response.text
        except ImportError:
            raise Exception("google-generativeai package not installed. Run: pip install google-generativeai")
        except Exception as e:
            raise Exception(f"Google AI error: {str(e)}")

class OpenAIProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                import openai
                self.client = openai.OpenAI(api_key=self.api_key)
            except ImportError:
                logger.error("openai package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI: {e}")
    
    def is_configured(self) -> bool:
        return self.api_key is not None and self.client is not None
    
    def generate_text(self, prompt: str) -> str:
        if not self.client:
            raise Exception("OpenAI client not initialized")
        
        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        
        return response.choices[0].message.content

class AnthropicProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = None
        if self.api_key:
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
            except ImportError:
                logger.error("anthropic package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic: {e}")
    
    def is_configured(self) -> bool:
        return self.api_key is not None and self.client is not None
    
    def generate_text(self, prompt: str) -> str:
        if not self.client:
            raise Exception("Anthropic client not initialized")
        
        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        return response.content[0].text

class HuggingFaceProvider(BaseAIProvider):
    def __init__(self):
        self.api_key = os.getenv("HUGGINGFACE_API_KEY")
        self.client = None
        if self.api_key:
            try:
                from transformers import pipeline
                self.client = pipeline("text-generation", model="gpt2")
            except ImportError:
                logger.error("transformers package not installed")
            except Exception as e:
                logger.error(f"Failed to initialize HuggingFace: {e}")
    
    def is_configured(self) -> bool:
        return self.api_key is not None and self.client is not None
    
    def generate_text(self, prompt: str) -> str:
        if not self.client:
            raise Exception("HuggingFace client not initialized")
        
        response = self.client(prompt, max_length=200, num_return_sequences=1)
        return response[0]['generated_text']

class OllamaProvider(BaseAIProvider):
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "llama2")
    
    def is_configured(self) -> bool:
        # Check if Ollama is running locally
        try:
            import requests
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            return response.status_code == 200
        except:
            return False
    
    def generate_text(self, prompt: str) -> str:
        try:
            import requests
            
            data = {
                "model": self.model,
                "prompt": prompt,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get("response", "No response generated")
            else:
                raise Exception(f"Ollama API error: {response.status_code}")
        
        except Exception as e:
            raise Exception(f"Failed to generate text with Ollama: {e}")
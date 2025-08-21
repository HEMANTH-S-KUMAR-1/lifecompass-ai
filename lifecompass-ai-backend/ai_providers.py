"""
AI Provider System for LifeCompass AI
Supports multiple AI APIs including free and paid options
"""

import os
import json
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import requests
from dataclasses import dataclass

@dataclass
class AIResponse:
    """Standardized AI response format"""
    success: bool
    text: str
    error: Optional[str] = None
    provider: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None

class BaseAIProvider(ABC):
    """Abstract base class for AI providers"""
    
    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.config = kwargs
    
    @abstractmethod
    def generate_response(self, prompt: str, **kwargs) -> AIResponse:
        """Generate AI response from prompt"""
        pass
    
    @abstractmethod
    def is_configured(self) -> bool:
        """Check if provider is properly configured"""
        pass
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return provider name"""
        pass

class GoogleGeminiProvider(BaseAIProvider):
    """Google Gemini AI Provider"""
    
    def __init__(self, api_key: str, model: str = "gemini-1.5-flash", **kwargs):
        super().__init__(api_key, **kwargs)
        self.model = model
        self._client = None
        
        if self.is_configured():
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self._client = genai.GenerativeModel(model)
            except ImportError:
                print(f"Google Generative AI not installed. Install with: pip install google-generativeai")
                self._client = None
            except Exception as e:
                print(f"Error initializing Google Gemini: {e}")
                self._client = None
    
    def generate_response(self, prompt: str, **kwargs) -> AIResponse:
        if not self._client:
            return AIResponse(
                success=False,
                text="",
                error="Google Gemini not properly configured",
                provider=self.provider_name
            )
        
        try:
            response = self._client.generate_content(prompt)
            return AIResponse(
                success=True,
                text=response.text,
                provider=self.provider_name
            )
        except Exception as e:
            return AIResponse(
                success=False,
                text="",
                error=f"Google Gemini error: {str(e)}",
                provider=self.provider_name
            )
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())
    
    @property
    def provider_name(self) -> str:
        return "Google Gemini"

class OpenAIProvider(BaseAIProvider):
    """OpenAI GPT Provider"""
    
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo", **kwargs):
        super().__init__(api_key, **kwargs)
        self.model = model
        self.base_url = kwargs.get('base_url', 'https://api.openai.com/v1')
    
    def generate_response(self, prompt: str, **kwargs) -> AIResponse:
        if not self.is_configured():
            return AIResponse(
                success=False,
                text="",
                error="OpenAI API key not configured",
                provider=self.provider_name
            )
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': self.model,
                'messages': [{'role': 'user', 'content': prompt}],
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7)
            }
            
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return AIResponse(
                    success=True,
                    text=result['choices'][0]['message']['content'],
                    provider=self.provider_name,
                    usage=result.get('usage')
                )
            else:
                return AIResponse(
                    success=False,
                    text="",
                    error=f"OpenAI API error: {response.status_code} - {response.text}",
                    provider=self.provider_name
                )
                
        except Exception as e:
            return AIResponse(
                success=False,
                text="",
                error=f"OpenAI error: {str(e)}",
                provider=self.provider_name
            )
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())
    
    @property
    def provider_name(self) -> str:
        return f"OpenAI ({self.model})"

class AnthropicProvider(BaseAIProvider):
    """Anthropic Claude Provider"""
    
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229", **kwargs):
        super().__init__(api_key, **kwargs)
        self.model = model
        self.base_url = 'https://api.anthropic.com/v1'
    
    def generate_response(self, prompt: str, **kwargs) -> AIResponse:
        if not self.is_configured():
            return AIResponse(
                success=False,
                text="",
                error="Anthropic API key not configured",
                provider=self.provider_name
            )
        
        try:
            headers = {
                'x-api-key': self.api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': self.model,
                'max_tokens': kwargs.get('max_tokens', 1000),
                'messages': [{'role': 'user', 'content': prompt}]
            }
            
            response = requests.post(
                f'{self.base_url}/messages',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return AIResponse(
                    success=True,
                    text=result['content'][0]['text'],
                    provider=self.provider_name,
                    usage=result.get('usage')
                )
            else:
                return AIResponse(
                    success=False,
                    text="",
                    error=f"Anthropic API error: {response.status_code} - {response.text}",
                    provider=self.provider_name
                )
                
        except Exception as e:
            return AIResponse(
                success=False,
                text="",
                error=f"Anthropic error: {str(e)}",
                provider=self.provider_name
            )
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())
    
    @property
    def provider_name(self) -> str:
        return f"Anthropic ({self.model})"

class HuggingFaceProvider(BaseAIProvider):
    """Hugging Face Inference API Provider (Free tier available)"""
    
    def __init__(self, api_key: str, model: str = "microsoft/DialoGPT-medium", **kwargs):
        super().__init__(api_key, **kwargs)
        self.model = model
        self.base_url = f'https://api-inference.huggingface.co/models/{model}'
    
    def generate_response(self, prompt: str, **kwargs) -> AIResponse:
        if not self.is_configured():
            return AIResponse(
                success=False,
                text="",
                error="Hugging Face API key not configured",
                provider=self.provider_name
            )
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'inputs': prompt,
                'parameters': {
                    'max_length': kwargs.get('max_tokens', 200),
                    'temperature': kwargs.get('temperature', 0.7),
                    'do_sample': True
                }
            }
            
            response = requests.post(
                self.base_url,
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    text = result[0].get('generated_text', '')
                    # Remove the original prompt from response if present
                    if text.startswith(prompt):
                        text = text[len(prompt):].strip()
                    
                    return AIResponse(
                        success=True,
                        text=text,
                        provider=self.provider_name
                    )
                else:
                    return AIResponse(
                        success=False,
                        text="",
                        error="Unexpected response format from Hugging Face",
                        provider=self.provider_name
                    )
            else:
                return AIResponse(
                    success=False,
                    text="",
                    error=f"Hugging Face API error: {response.status_code} - {response.text}",
                    provider=self.provider_name
                )
                
        except Exception as e:
            return AIResponse(
                success=False,
                text="",
                error=f"Hugging Face error: {str(e)}",
                provider=self.provider_name
            )
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())
    
    @property
    def provider_name(self) -> str:
        return f"Hugging Face ({self.model})"

class OpenRouterProvider(BaseAIProvider):
    """OpenRouter AI Provider (Provides access to multiple AI models)"""
    
    def __init__(self, api_key: str, model: str = "google/gemini-flash-1.5", **kwargs):
        super().__init__(api_key, **kwargs)
        self.model = model
        self.base_url = 'https://openrouter.ai/api/v1'
    
    def generate_response(self, prompt: str, **kwargs) -> AIResponse:
        if not self.is_configured():
            return AIResponse(
                success=False,
                text="",
                error="OpenRouter API key not configured",
                provider=self.provider_name
            )
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://lifecompass-ai.com',
                'X-Title': 'LifeCompass AI'
            }
            
            data = {
                'model': self.model,
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7)
            }
            
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    return AIResponse(
                        success=True,
                        text=result['choices'][0]['message']['content'],
                        provider=self.provider_name,
                        usage=result.get('usage')
                    )
                else:
                    return AIResponse(
                        success=False,
                        text="",
                        error="No response content from OpenRouter",
                        provider=self.provider_name
                    )
            else:
                return AIResponse(
                    success=False,
                    text="",
                    error=f"OpenRouter API error: {response.status_code} - {response.text}",
                    provider=self.provider_name
                )
                
        except Exception as e:
            return AIResponse(
                success=False,
                text="",
                error=f"OpenRouter error: {str(e)}",
                provider=self.provider_name
            )
    
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())
    
    @property
    def provider_name(self) -> str:
        return f"OpenRouter ({self.model})"

class OllamaProvider(BaseAIProvider):
    """Ollama Local AI Provider (Free)"""
    
    def __init__(self, api_key: str = "", model: str = "llama2", base_url: str = "http://localhost:11434", **kwargs):
        super().__init__(api_key, **kwargs)
        self.model = model
        self.base_url = base_url.rstrip('/')
    
    def generate_response(self, prompt: str, **kwargs) -> AIResponse:
        try:
            data = {
                'model': self.model,
                'prompt': prompt,
                'stream': False
            }
            
            response = requests.post(
                f'{self.base_url}/api/generate',
                json=data,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return AIResponse(
                    success=True,
                    text=result.get('response', ''),
                    provider=self.provider_name
                )
            else:
                return AIResponse(
                    success=False,
                    text="",
                    error=f"Ollama API error: {response.status_code} - {response.text}",
                    provider=self.provider_name
                )
                
        except Exception as e:
            return AIResponse(
                success=False,
                text="",
                error=f"Ollama error: {str(e)}. Make sure Ollama is running locally.",
                provider=self.provider_name
            )
    
    def is_configured(self) -> bool:
        # Check if Ollama is accessible
        try:
            response = requests.get(f'{self.base_url}/api/tags', timeout=5)
            return response.status_code == 200
        except:
            return False
    
    @property
    def provider_name(self) -> str:
        return f"Ollama ({self.model})"

class AIProviderManager:
    """Manages multiple AI providers and routing"""
    
    def __init__(self):
        self.providers: Dict[str, BaseAIProvider] = {}
        self.primary_provider: Optional[str] = None
        self._load_providers()
    
    def _load_providers(self):
        """Load providers based on environment variables"""
        
        # Google Gemini
        if os.getenv('GOOGLE_API_KEY'):
            self.providers['google'] = GoogleGeminiProvider(
                api_key=os.getenv('GOOGLE_API_KEY'),
                model=os.getenv('GOOGLE_MODEL', 'gemini-1.5-flash')
            )
        
        # OpenAI
        if os.getenv('OPENAI_API_KEY'):
            self.providers['openai'] = OpenAIProvider(
                api_key=os.getenv('OPENAI_API_KEY'),
                model=os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
            )
        
        # Anthropic
        if os.getenv('ANTHROPIC_API_KEY'):
            self.providers['anthropic'] = AnthropicProvider(
                api_key=os.getenv('ANTHROPIC_API_KEY'),
                model=os.getenv('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229')
            )
        
        # Hugging Face
        if os.getenv('HUGGINGFACE_API_KEY'):
            self.providers['huggingface'] = HuggingFaceProvider(
                api_key=os.getenv('HUGGINGFACE_API_KEY'),
                model=os.getenv('HUGGINGFACE_MODEL', 'microsoft/DialoGPT-medium')
            )
        
        # OpenRouter
        if os.getenv('OPENROUTER_API_KEY'):
            self.providers['openrouter'] = OpenRouterProvider(
                api_key=os.getenv('OPENROUTER_API_KEY'),
                model=os.getenv('OPENROUTER_MODEL', 'google/gemini-flash-1.5')
            )
        
        # Ollama (local)
        ollama_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
        ollama_provider = OllamaProvider(
            base_url=ollama_url,
            model=os.getenv('OLLAMA_MODEL', 'llama2')
        )
        if ollama_provider.is_configured():
            self.providers['ollama'] = ollama_provider
        
        # Set primary provider
        self.primary_provider = os.getenv('PRIMARY_AI_PROVIDER', self._get_first_available_provider())
    
    def _get_first_available_provider(self) -> Optional[str]:
        """Get the first configured provider"""
        for provider_id, provider in self.providers.items():
            if provider.is_configured():
                return provider_id
        return None
    
    def get_provider(self, provider_id: Optional[str] = None) -> Optional[BaseAIProvider]:
        """Get a specific provider or the primary one"""
        if provider_id and provider_id in self.providers:
            return self.providers[provider_id]
        elif self.primary_provider and self.primary_provider in self.providers:
            return self.providers[self.primary_provider]
        return None
    
    def generate_response(self, prompt: str, provider_id: Optional[str] = None, **kwargs) -> AIResponse:
        """Generate response using specified or primary provider"""
        provider = self.get_provider(provider_id)
        
        if not provider:
            return AIResponse(
                success=False,
                text="",
                error="No AI provider configured. Please set up at least one AI API key.",
                provider="None"
            )
        
        return provider.generate_response(prompt, **kwargs)
    
    def get_status(self) -> Dict[str, Any]:
        """Get status of all providers"""
        status = {
            'configured_providers': [],
            'available_providers': [
                'google', 'openai', 'anthropic', 'huggingface', 'openrouter', 'ollama'
            ],
            'primary_provider': self.primary_provider,
            'total_configured': 0
        }
        
        for provider_id, provider in self.providers.items():
            if provider.is_configured():
                status['configured_providers'].append({
                    'id': provider_id,
                    'name': provider.provider_name,
                    'status': 'ready'
                })
                status['total_configured'] += 1
        
        return status

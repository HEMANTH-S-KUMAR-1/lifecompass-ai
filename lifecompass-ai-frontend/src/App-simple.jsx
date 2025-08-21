import React, { useState } from 'react';

export default function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Test backend connection
  const testBackend = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/');
      if (response.ok) {
        setBackendStatus('connected');
        return true;
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('disconnected');
      return false;
    }
    return false;
  };

  // Send message to AI
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = { 
          role: 'assistant', 
          content: data.response || 'I received your message but couldn\'t generate a response.' 
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting to the AI service. Please make sure the backend is running on http://127.0.0.1:8000' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start chat and test backend
  const startChat = async () => {
    setIsLoading(true);
    const isConnected = await testBackend();
    setIsLoading(false);
    
    if (isConnected) {
      setShowChat(true);
      setMessages([
        { 
          role: 'assistant', 
          content: 'Hello! I\'m your AI career advisor. How can I help you with your career journey today?' 
        }
      ]);
    } else {
      alert('Backend server is not running. Please start the backend server first:\n\n1. Open terminal\n2. Run: cd lifecompass-ai-backend\n3. Run: uvicorn main:app --reload');
    }
  };

  // Chat interface
  if (showChat) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">🧭 LifeCompass AI Career Chat</h1>
          <button 
            onClick={() => setShowChat(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back to Home
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800 shadow'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow px-4 py-2 rounded-lg">
                <p className="text-sm">AI is typing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
              placeholder="Ask me about your career goals, skills, job search, or anything career-related..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button 
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🧭 LifeCompass AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your AI-powered career guidance platform is now running!
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Frontend Status</h3>
              <p className="text-green-700">React + Vite running on localhost:5173</p>
            </div>
            
            <div className={`border rounded-lg p-6 ${
              backendStatus === 'connected' ? 'bg-green-50 border-green-200' :
              backendStatus === 'disconnected' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${
                backendStatus === 'connected' ? 'text-green-800' :
                backendStatus === 'disconnected' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                🚀 Backend Status
              </h3>
              <p className={`${
                backendStatus === 'connected' ? 'text-green-700' :
                backendStatus === 'disconnected' ? 'text-red-700' :
                'text-yellow-700'
              }`}>
                {backendStatus === 'connected' ? 'FastAPI running on localhost:8000' :
                 backendStatus === 'disconnected' ? 'Backend server not responding' :
                 'Checking backend connection...'}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={startChat}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Connecting...' : 'Start Career Chat'}
            </button>
            
            <div className="text-sm text-gray-500">
              <p>Backend API Documentation: <a href="http://localhost:8000/docs" target="_blank" className="text-blue-600 hover:underline">localhost:8000/docs</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

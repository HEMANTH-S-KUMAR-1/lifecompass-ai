/**
 * API Configuration for LifeCompass AI Frontend
 * Centralized configuration for backend endpoints and settings
 */

// Environment-based API configuration
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:8000',
    timeout: 10000,
  },
  production: {
    baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-domain.com',
    timeout: 15000,
  }
};

// Determine current environment
const environment = process.env.NODE_ENV || 'development';
const config = API_CONFIG[environment];

// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  root: '/',
  health: '/api/health',
  config: '/api/config',
  
  // AI providers
  aiProviders: '/api/ai-providers',
  
  // Database
  databaseStatus: '/api/database/status',
  
  // User management
  signup: '/api/signup',
  
  // Chat and AI features
  chat: '/api/chat',
  
  // Career features (future endpoints)
  resume: '/api/resume',
  jobMatch: '/api/job-match',
  careerPlan: '/api/career-plan',
};

// Base configuration
export const API_BASE_URL = config.baseURL;
export const API_TIMEOUT = config.timeout;

// Request headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Create full URL for an endpoint
export const createApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// API client configuration for axios
export const API_CLIENT_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
};

export default {
  endpoints: API_ENDPOINTS,
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: DEFAULT_HEADERS,
  createUrl: createApiUrl,
  clientConfig: API_CLIENT_CONFIG,
};

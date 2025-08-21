/**
 * API Services for LifeCompass AI Frontend
 * Centralized API calls and data handling
 */

import axios from 'axios';
import { API_CLIENT_CONFIG, API_ENDPOINTS, createApiUrl } from '../config/api.js';

// Create axios instance with default configuration
const apiClient = axios.create(API_CLIENT_CONFIG);

// Request interceptor for adding auth tokens (future use)
apiClient.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      // Could trigger a redirect to login page
    }
    return Promise.reject(error);
  }
);

// Health and Configuration Services
export const healthService = {
  // Check backend connection and configuration
  checkStatus: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.root);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Connection failed'
      };
    }
  },

  // Get detailed configuration
  getConfig: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.config);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get configuration'
      };
    }
  },

  // Get AI providers information
  getAIProviders: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.aiProviders);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get AI providers'
      };
    }
  },

  // Get database status
  getDatabaseStatus: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.databaseStatus);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get database status'
      };
    }
  }
};

// User Services
export const userService = {
  // Create user profile
  signup: async (userData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.signup, userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Signup failed'
      };
    }
  }
};

// AI Chat Services
export const chatService = {
  // Send message to AI
  sendMessage: async (message, provider = null) => {
    try {
      const payload = { message };
      if (provider) {
        payload.provider = provider;
      }

      const response = await apiClient.post(API_ENDPOINTS.chat, payload);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Chat request failed'
      };
    }
  }
};

// Career Services (Future implementation)
export const careerService = {
  // Analyze resume
  analyzeResume: async (resumeData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.resume, resumeData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Resume analysis failed'
      };
    }
  },

  // Get job matches
  getJobMatches: async (preferences) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.jobMatch, preferences);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Job matching failed'
      };
    }
  },

  // Generate career plan
  generateCareerPlan: async (careerData) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.careerPlan, careerData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Career plan generation failed'
      };
    }
  }
};

// Utility function to handle API responses consistently
export const handleApiResponse = (response, successCallback, errorCallback) => {
  if (response.success) {
    successCallback(response.data);
  } else {
    errorCallback(response.error);
  }
};

export default {
  health: healthService,
  user: userService,
  chat: chatService,
  career: careerService,
  handleResponse: handleApiResponse,
};

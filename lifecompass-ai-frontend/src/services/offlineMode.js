/**
 * Offline Mode Service for LifeCompass AI Frontend
 * Provides mock data and responses when backend is unavailable
 */

// Check if offline mode is enabled in the config
import { API_CONFIG } from '../config/api.js';
const environment = process.env.NODE_ENV || 'development';
const config = API_CONFIG[environment];

// Mock data for offline development
const MOCK_DATA = {
  jobs: [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      description: 'We are looking for an experienced Frontend Developer to join our team...',
      requirements: ['5+ years of React experience', 'TypeScript', 'State management'],
      posted_at: '2023-05-15',
      type: 'Full-time',
      remote: true
    },
    {
      id: '2',
      title: 'Backend Engineer',
      company: 'DataSystems',
      location: 'New York, NY',
      salary: '$130,000 - $160,000',
      description: 'Join our backend team to build scalable APIs and microservices...',
      requirements: ['Python', 'FastAPI', 'PostgreSQL', 'AWS'],
      posted_at: '2023-05-12',
      type: 'Full-time',
      remote: false
    },
    {
      id: '3',
      title: 'DevOps Specialist',
      company: 'CloudNative',
      location: 'Remote',
      salary: '$110,000 - $140,000',
      description: 'Help us improve our CI/CD pipeline and infrastructure automation...',
      requirements: ['Kubernetes', 'Terraform', 'GitLab CI', 'AWS/GCP'],
      posted_at: '2023-05-10',
      type: 'Contract',
      remote: true
    }
  ],
  applications: [
    {
      id: '1',
      job_id: '1',
      status: 'applied',
      applied_at: '2023-05-16',
      notes: 'Initial application submitted'
    }
  ],
  chatHistory: [
    {
      id: '1',
      conversation_id: '1',
      sender: 'ai',
      content: 'Hello! How can I help with your job search today?',
      timestamp: '2023-05-16T10:30:00Z'
    }
  ]
};

// Simulate API delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Check if offline mode is enabled
export const isOfflineMode = () => {
  // Always check localStorage first to allow runtime toggling
  const offlineModeStorage = localStorage.getItem('offlineMode');
  if (offlineModeStorage !== null) {
    return offlineModeStorage === 'true';
  }
  
  // Fall back to config
  return config.offlineMode === true;
};

// Toggle offline mode
export const toggleOfflineMode = () => {
  const current = isOfflineMode();
  localStorage.setItem('offlineMode', (!current).toString());
  return !current;
};

// Get mock data based on entity type
export const getMockData = async (entity, delay = 500) => {
  await simulateDelay(delay);
  return MOCK_DATA[entity] || [];
};

// Mock API response
export const mockApiResponse = async (endpoint, data = null, delay = 500) => {
  await simulateDelay(delay);
  
  // Generate different responses based on endpoint
  switch (endpoint) {
    case 'health':
      return { status: 'ok', version: '1.0.0' };
    case 'chat':
      return { 
        response: 'This is a mock response from the AI assistant in offline mode. The backend is not connected.',
        provider: 'mock' 
      };
    default:
      return data || { success: true, message: 'Mock response' };
  }
};

export default {
  isOfflineMode,
  toggleOfflineMode,
  getMockData,
  mockApiResponse
};

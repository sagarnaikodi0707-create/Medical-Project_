import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s for document upload & AI extraction
});

export const checkHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

export const uploadReport = async (formData) => {
  const response = await apiClient.post('/api/reports/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const chatReport = async (question, reportContext) => {
  const response = await apiClient.post('/api/reports/chat', {
    question,
    report_context: reportContext,
  });
  return response.data;
};

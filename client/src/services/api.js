import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nirmal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Centralized API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
};

export const aqiAPI = {
  getCurrent: (params) => api.get('/air-quality/current', { params }),
  getHistory: (params) => api.get('/air-quality/history', { params }),
  getForecast: (params) => api.get('/air-quality/forecast', { params }),
  getNearbyStations: (params) => api.get('/air-quality/nearby', { params }),
  searchLocation: (query) => api.get('/air-quality/search', { params: { q: query } }),
};

export const recommendationsAPI = {
  getDaily: (params) => api.get('/recommendations/daily', { params }),
  generate: (data) => api.post('/recommendations/generate', data),
  updateStatus: (id, status) => api.patch(`/recommendations/${id}`, { status }),
};

export const simulatorAPI = {
  getPresets: () => api.get('/simulator/presets'),
  run: (data) => api.post('/simulator/run', data),
  save: (data) => api.post('/simulator/save', data),
  getHistory: () => api.get('/simulator/history'),
  getById: (id) => api.get(`/simulator/${id}`),
  deleteById: (id) => api.delete(`/simulator/${id}`),
  compare: (data) => api.post('/simulator/compare', data),
  generateActionPlan: (data) => api.post('/simulator/action-plan', data),
  exportReport: (id) => api.get(`/simulator/${id}/export`),
};

export const routesAPI = {
  compare: (data) => api.post('/routes/compare', data),
};

export const exposureAPI = {
  calculate: (data) => api.post('/exposure/calculate', data),
  logActivity: (data) => api.post('/exposure/log', data),
  getHistory: () => api.get('/exposure/history'),
};

export const indoorAPI = {
  analyze: (data) => api.post('/indoor/analyze', data),
};

export const communityAPI = {
  getReports: (params) => api.get('/community/reports', { params }),
  createReport: (data) => api.post('/community/reports', data),
  verifyReport: (id, data) => api.patch(`/community/reports/${id}/verify`, data),
  upvoteReport: (id) => api.post(`/community/reports/${id}/upvote`),
  getChallenges: () => api.get('/community/challenges'),
  joinChallenge: (id) => api.post(`/community/challenges/${id}/join`),
  completeChallenge: (id) => api.patch(`/community/challenges/${id}/complete`),
  getLeaderboard: () => api.get('/community/leaderboard'),
};

export const analyticsAPI = {
  getImpact: () => api.get('/analytics/impact'),
  logTrip: (data) => api.post('/analytics/log-trip', data),
};

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  explain: (data) => api.post('/ai/explain', data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export default api;

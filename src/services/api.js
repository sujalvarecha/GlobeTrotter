/**
 * GlobeTrotter — API Service Layer
 *
 * Configured to connect directly to the Java Spring Boot backend.
 */

import axios from 'axios';

// Configure API Base URL (reads from VITE_API_URL in production / Vercel, defaults to localhost:8080)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Configure Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    try {
      const authStorage = localStorage.getItem('globetrotter-auth');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.token || parsed?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.warn('Failed to parse auth token', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && !currentPath.startsWith('/share/')) {
        localStorage.removeItem('globetrotter-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Authentication ─────────────────────────────────────────────────────────
export const login = async ({ email, password }) => api.post('/auth/login', { email, password });
export const signup = async ({ name, email, password }) => api.post('/auth/signup', { name, email, password });
export const getCurrentUser = async () => api.get('/auth/me');
export const forgotPassword = async ({ email }) => api.post('/auth/forgot-password', { email });
export const resetPassword = async ({ token, newPassword }) => api.post('/auth/reset-password', { token, newPassword });

// ─── User Profile & Dashboard ───────────────────────────────────────────────
export const getUserProfile = async () => api.get('/users/me');
export const updateUserProfile = async (updates) => api.put('/users/me', updates);
export const deleteAccount = async () => api.delete('/users/me');
export const getDashboardSummary = async () => api.get('/dashboard/summary');

// ─── Trips ──────────────────────────────────────────────────────────────────
export const getTrips = async () => api.get('/trips');
export const getTrip = async (tripId) => api.get(`/trips/${tripId}`);
export const createTrip = async (tripData) => api.post('/trips', tripData);
export const updateTrip = async (tripId, updates) => api.put(`/trips/${tripId}`, updates);
export const deleteTrip = async (tripId) => api.delete(`/trips/${tripId}`);

// ─── Cities & Activities ────────────────────────────────────────────────────
export const getCities = async () => api.get('/cities');
export const getCity = async (cityId) => api.get(`/cities/${cityId}`);
export const searchCities = async (params) => api.get('/cities/search', { params });
export const getActivities = async (cityId, category) => {
  if (cityId) {
    return api.get(`/activities/city/${cityId}`, { params: category ? { category } : {} });
  }
  return api.get('/activities/search', { params: category ? { category } : {} });
};
export const searchActivities = async (params) => api.get('/activities/search', { params });

// ─── Itinerary (Stops) ──────────────────────────────────────────────────────
export const getTripStops = async (tripId) => api.get(`/trips/${tripId}/stops`);
export const addStop = async (tripId, stopData) => api.post(`/trips/${tripId}/stops`, stopData);
export const updateStop = async (tripId, stopId, updates) => api.put(`/trips/${tripId}/stops/${stopId}`, updates);
export const removeStop = async (tripId, stopId) => api.delete(`/trips/${tripId}/stops/${stopId}`);
export const reorderStops = async (tripId, orderedStopIds) => api.put(`/trips/${tripId}/stops/reorder`, { orderedStopIds });

// ─── Stop Activities ────────────────────────────────────────────────────────
export const getStopActivities = async (tripId, stopId) => api.get(`/trips/${tripId}/stops/${stopId}/activities`);
export const addActivity = async (tripId, stopId, activityData) => api.post(`/trips/${tripId}/stops/${stopId}/activities`, activityData);
export const removeActivity = async (tripId, stopId, tripActivityId) => api.delete(`/trips/${tripId}/stops/${stopId}/activities/${tripActivityId}`);

// ─── Budget & Route ─────────────────────────────────────────────────────────
export const getBudget = async (tripId, tier, currency) => {
  const params = {};
  if (tier) params.tier = tier;
  if (currency) params.currency = currency;
  return api.get(`/trips/${tripId}/budget`, { params });
};
export const getSupportedCurrencies = async (tripId) => api.get(`/trips/${tripId}/budget/currencies`);
export const getRoute = async (tripId) => api.get(`/trips/${tripId}/route`);

// ─── Recommendations ────────────────────────────────────────────────────────
export const getCityRecommendations = async (tripId) => api.get(`/trips/${tripId}/recommendations/cities`);
export const getActivityRecommendations = async (tripId, stopId, category) => {
  return api.get(`/trips/${tripId}/recommendations/activities`, {
    params: { stopId, ...(category ? { category } : {}) },
  });
};

// ─── Sharing & Export ───────────────────────────────────────────────────────
export const enableSharing = async (tripId) => api.post(`/trips/${tripId}/share`);
export const disableSharing = async (tripId) => api.delete(`/trips/${tripId}/share`);
export const getPublicTrip = async (shareToken) => api.get(`/public/trips/${shareToken}`);
export const copyTrip = async (shareToken) => api.post(`/public/trips/${shareToken}/fork`);
export const exportMarkdown = async (tripId) => api.get(`/trips/${tripId}/export/markdown`, { responseType: 'text' });
export const exportText = async (tripId) => api.get(`/trips/${tripId}/export/text`, { responseType: 'text' });

// ─── Admin & AI ─────────────────────────────────────────────────────────────
export const getAdminStats = async () => api.get('/admin/stats');
export const generateAiItinerary = async (params) => api.post('/ai/generate-itinerary', params);

export default api;

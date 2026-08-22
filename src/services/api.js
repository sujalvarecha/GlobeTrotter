/**
 * GlobeTrotter — API Service Layer
 *
 * Configured to connect to the Java Spring Boot backend.
 */

import axios from 'axios';

// Configure Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // We assume authStore saves token to localStorage as 'globetrotter-token' 
    // or we can read it directly from localStorage if persisted by Zustand.
    // Zustand persists auth store under 'auth-storage' by default.
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
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

// ─── Authentication ─────────────────────────────────────────────────────────
export const login = async ({ email, password }) => api.post('/auth/login', { email, password });
export const signup = async ({ name, email, password }) => api.post('/auth/signup', { name, email, password });
export const forgotPassword = async ({ email }) => api.post('/auth/forgot-password', { email });

// ─── User Profile ───────────────────────────────────────────────────────────
export const getUserProfile = async (userId) => api.get(`/users/${userId}`);
export const updateUserProfile = async (userId, updates) => api.put(`/users/${userId}`, updates);
export const deleteAccount = async (userId) => api.delete(`/users/${userId}`);
export const getDashboardSummary = async (userId) => api.get(`/users/${userId}/dashboard`);

// ─── Trips ──────────────────────────────────────────────────────────────────
export const getTrips = async (userId) => api.get(`/users/${userId}/trips`);
export const getTrip = async (tripId) => api.get(`/trips/${tripId}`);
export const createTrip = async (tripData) => api.post('/trips', tripData);
export const updateTrip = async (tripId, updates) => api.put(`/trips/${tripId}`, updates);
export const deleteTrip = async (tripId) => api.delete(`/trips/${tripId}`);

// ─── Cities & Activities ────────────────────────────────────────────────────
export const getCities = async () => api.get('/cities');
export const getCity = async (cityId) => api.get(`/cities/${cityId}`);
export const getActivities = async (cityId) => api.get(`/cities/${cityId}/activities`);
export const getActivity = async (activityId) => api.get(`/activities/${activityId}`);

// ─── Itinerary (Stops) ──────────────────────────────────────────────────────
export const getTripStops = async (tripId) => api.get(`/trips/${tripId}/stops`);
export const addStop = async (tripId, stopData) => api.post(`/trips/${tripId}/stops`, stopData);
export const updateStop = async (stopId, updates) => api.put(`/stops/${stopId}`, updates);
export const removeStop = async (stopId) => api.delete(`/stops/${stopId}`);
export const reorderStops = async (tripId, orderedStopIds) => api.put(`/trips/${tripId}/stops/reorder`, { orderedStopIds });

// ─── Stop Activities ────────────────────────────────────────────────────────
export const getStopActivities = async (stopId) => api.get(`/stops/${stopId}/activities`);
export const addActivity = async (stopId, activityData) => api.post(`/stops/${stopId}/activities`, activityData);
export const updateActivity = async (activityId, updates) => api.put(`/activities/${activityId}`, updates);
export const removeActivity = async (activityId) => api.delete(`/activities/${activityId}`);

// ─── Budget & Route ─────────────────────────────────────────────────────────
export const getBudget = async (tripId) => api.get(`/trips/${tripId}/budget`);
export const getRoute = async (tripId) => api.get(`/trips/${tripId}/route`);

// ─── Sharing & Export ───────────────────────────────────────────────────────
export const getPublicTrip = async (shareToken) => api.get(`/share/${shareToken}`);
export const copyTrip = async (shareToken, userId) => api.post(`/share/${shareToken}/copy`, { userId });
export const exportMarkdown = async (tripId) => api.get(`/trips/${tripId}/export/markdown`);
export const exportText = async (tripId) => api.get(`/trips/${tripId}/export/text`);

// ─── Admin & AI ─────────────────────────────────────────────────────────────
export const getAdminStats = async () => api.get('/admin/stats');
export const generateAiItinerary = async (params) => api.post('/ai/generate', params);

export default api;

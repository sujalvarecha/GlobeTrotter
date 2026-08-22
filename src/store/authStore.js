/**
 * Auth Store — Zustand
 * Handles user authentication state with localStorage persistence.
 */

import { create } from 'zustand';
import * as api from '../services/api';

const STORAGE_KEY = 'globetrotter-auth';

// Hydrate from localStorage
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed.token || parsed.accessToken;
      if (token) {
        return { user: parsed.user, token, isAuthenticated: true };
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const useAuthStore = create((set, get) => ({
  ...getStoredAuth(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.login({ email, password });
      const token = data.accessToken || data.token;
      const user = data.user;
      const authState = { user, token, isAuthenticated: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      set({ ...authState, isLoading: false });
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.signup({ name, email, password });
      const token = data.accessToken || data.token;
      const user = data.user;
      const authState = { user, token, isAuthenticated: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      set({ ...authState, isLoading: false });
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Signup failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.forgotPassword({ email });
      set({ isLoading: false });
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to send reset link';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  updateUser: (updatedFields) => {
    const currentUser = get().user;
    const newUser = { ...currentUser, ...updatedFields };
    const currentToken = get().token;
    const authState = { user: newUser, token: currentToken, isAuthenticated: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    set({ user: newUser });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

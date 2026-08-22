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
      return { user: parsed.user, token: parsed.token, isAuthenticated: true };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { user: null, token: null, isAuthenticated: false };
};

const useAuthStore = create((set) => ({
  ...getStoredAuth(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.login({ email, password });
      const authState = { user: data.user, token: data.token, isAuthenticated: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      set({ ...authState, isLoading: false });
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.signup({ name, email, password });
      const authState = { user: data.user, token: data.token, isAuthenticated: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      set({ ...authState, isLoading: false });
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || 'Signup failed';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.forgotPassword({ email });
      set({ isLoading: false });
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to send reset link';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

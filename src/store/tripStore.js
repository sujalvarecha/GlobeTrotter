/**
 * Trip Store — Zustand
 * Manages trips, stops, activities, and budget state.
 * All mutations go through api.js for future backend compatibility.
 */

import { create } from 'zustand';
import * as api from '../services/api';

const useTripStore = create((set, get) => ({
  // ─── State ──────────────────────────────
  trips: [],
  currentTrip: null,
  tripStops: [],
  tripActivities: {}, // keyed by stopId
  budget: null,
  cities: [],
  activities: [],
  isLoading: false,
  error: null,

  // ─── Trips CRUD ─────────────────────────
  fetchTrips: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.getTrips(userId);
      set({ trips: data, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: 'Failed to load trips' });
    }
  },

  fetchTrip: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.getTrip(tripId);
      set({ currentTrip: data, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: 'Trip not found' });
      return null;
    }
  },

  createTrip: async (tripData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.createTrip(tripData);
      set((state) => ({
        trips: [...state.trips, data],
        currentTrip: data,
        isLoading: false,
      }));
      return data;
    } catch (err) {
      set({ isLoading: false, error: 'Failed to create trip' });
      return null;
    }
  },

  updateTrip: async (tripId, updates) => {
    try {
      const { data } = await api.updateTrip(tripId, updates);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === tripId ? data : t)),
        currentTrip: state.currentTrip?.id === tripId ? data : state.currentTrip,
      }));
      return data;
    } catch (err) {
      set({ error: 'Failed to update trip' });
      return null;
    }
  },

  deleteTrip: async (tripId) => {
    try {
      await api.deleteTrip(tripId);
      set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId),
        currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
      }));
      return true;
    } catch (err) {
      set({ error: 'Failed to delete trip' });
      return false;
    }
  },

  // ─── Cities ─────────────────────────────
  fetchCities: async () => {
    try {
      const { data } = await api.getCities();
      set({ cities: data });
    } catch {
      // Backend not ready yet
      set({ cities: [] });
    }
  },

  fetchActivities: async (cityId) => {
    try {
      const { data } = await api.getActivities(cityId);
      set({ activities: data });
    } catch {
      set({ activities: [] });
    }
  },

  fetchAllActivities: async () => {
    try {
      // Assuming a generic endpoint to fetch all or we just wait for backend
      const { data } = await api.getActivities(); 
      set({ activities: data });
    } catch {
      set({ activities: [] });
    }
  },

  // ─── Trip Stops ─────────────────────────
  fetchTripStops: async (tripId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.getTripStops(tripId);
      set({ tripStops: data, isLoading: false });

      // Also fetch activities for each stop
      const activitiesMap = {};
      for (const stop of data) {
        const { data: acts } = await api.getStopActivities(stop.id);
        activitiesMap[stop.id] = acts;
      }
      set({ tripActivities: activitiesMap });
    } catch {
      set({ isLoading: false, error: 'Failed to load itinerary' });
    }
  },

  addStop: async (tripId, stopData) => {
    try {
      const { data } = await api.addStop(tripId, stopData);
      set((state) => ({
        tripStops: [...state.tripStops, data],
        tripActivities: { ...state.tripActivities, [data.id]: [] },
      }));
      return data;
    } catch {
      set({ error: 'Failed to add stop' });
      return null;
    }
  },

  updateStop: async (stopId, updates) => {
    try {
      const { data } = await api.updateStop(stopId, updates);
      set((state) => ({
        tripStops: state.tripStops.map((s) => (s.id === stopId ? data : s)),
      }));
      return data;
    } catch {
      set({ error: 'Failed to update stop' });
      return null;
    }
  },

  removeStop: async (stopId) => {
    try {
      await api.removeStop(stopId);
      set((state) => {
        const { [stopId]: _, ...restActivities } = state.tripActivities;
        return {
          tripStops: state.tripStops.filter((s) => s.id !== stopId),
          tripActivities: restActivities,
        };
      });
      return true;
    } catch {
      set({ error: 'Failed to remove stop' });
      return false;
    }
  },

  reorderStops: async (tripId, orderedStopIds) => {
    try {
      const { data } = await api.reorderStops(tripId, orderedStopIds);
      set({ tripStops: data });
    } catch {
      set({ error: 'Failed to reorder stops' });
    }
  },

  // ─── Trip Activities ────────────────────
  addActivity: async (stopId, activityData) => {
    try {
      const { data } = await api.addActivity(stopId, activityData);
      set((state) => ({
        tripActivities: {
          ...state.tripActivities,
          [stopId]: [...(state.tripActivities[stopId] || []), data],
        },
      }));
      return data;
    } catch {
      set({ error: 'Failed to add activity' });
      return null;
    }
  },

  removeActivity: async (activityId, stopId) => {
    try {
      await api.removeActivity(activityId);
      set((state) => ({
        tripActivities: {
          ...state.tripActivities,
          [stopId]: (state.tripActivities[stopId] || []).filter(
            (a) => a.id !== activityId
          ),
        },
      }));
      return true;
    } catch {
      set({ error: 'Failed to remove activity' });
      return false;
    }
  },

  // ─── Budget ─────────────────────────────
  fetchBudget: async (tripId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.getBudget(tripId);
      set({ budget: data, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Failed to load budget' });
    }
  },

  // ─── Helpers ────────────────────────────
  getCityById: (cityId) => get().cities.find((c) => c.id === cityId),
  getActivityById: (actId) => get().activities.find((a) => a.id === actId),

  clearCurrentTrip: () =>
    set({ currentTrip: null, tripStops: [], tripActivities: {}, budget: null }),

  clearError: () => set({ error: null }),
}));

export default useTripStore;

/**
 * Trip Store — Zustand
 * Manages trips, stops, activities, and budget state.
 * Fully integrated with GlobeTrotter Spring Boot backend.
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
  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.getTrips();
      set({ trips: data, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false, error: 'Failed to load trips' });
      return [];
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
      const payload = {
        name: tripData.name,
        description: tripData.description || '',
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        coverImage: tripData.coverImage || '',
        targetBudget: tripData.targetBudget !== undefined ? tripData.targetBudget : (tripData.budget ? Number(tripData.budget) : 0),
      };
      const { data } = await api.createTrip(payload);
      set((state) => ({
        trips: [data, ...state.trips],
        currentTrip: data,
        isLoading: false,
      }));
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create trip';
      set({ isLoading: false, error: message });
      return null;
    }
  },

  updateTrip: async (tripId, updates) => {
    try {
      const payload = {
        name: updates.name ?? get().currentTrip?.name,
        description: updates.description ?? get().currentTrip?.description,
        startDate: updates.startDate ?? get().currentTrip?.startDate,
        endDate: updates.endDate ?? get().currentTrip?.endDate,
        coverImage: updates.coverImage ?? get().currentTrip?.coverImage,
        targetBudget: updates.targetBudget ?? updates.budget ?? get().currentTrip?.targetBudget,
      };
      const { data } = await api.updateTrip(tripId, payload);
      set((state) => ({
        trips: state.trips.map((t) => (t.id === Number(tripId) ? data : t)),
        currentTrip: state.currentTrip?.id === Number(tripId) ? data : state.currentTrip,
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
        trips: state.trips.filter((t) => t.id !== Number(tripId)),
        currentTrip: state.currentTrip?.id === Number(tripId) ? null : state.currentTrip,
      }));
      return true;
    } catch (err) {
      set({ error: 'Failed to delete trip' });
      return false;
    }
  },

  // ─── Cities & Activities ─────────────────
  fetchCities: async () => {
    try {
      const { data } = await api.getCities();
      set({ cities: data });
      return data;
    } catch {
      set({ cities: [] });
      return [];
    }
  },

  fetchActivities: async (cityId) => {
    try {
      const { data } = await api.getActivities(cityId);
      set({ activities: data });
      return data;
    } catch {
      set({ activities: [] });
      return [];
    }
  },

  fetchAllActivities: async () => {
    try {
      const { data } = await api.getActivities();
      set({ activities: data });
      return data;
    } catch {
      set({ activities: [] });
      return [];
    }
  },

  // ─── Trip Stops ─────────────────────────
  fetchTripStops: async (tripId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.getTripStops(tripId);
      const activitiesMap = {};
      for (const stop of data) {
        activitiesMap[stop.id] = stop.activities || [];
      }
      set({ tripStops: data, tripActivities: activitiesMap, isLoading: false });
      return data;
    } catch {
      set({ isLoading: false, error: 'Failed to load itinerary' });
      return [];
    }
  },

  addStop: async (tripId, stopData) => {
    try {
      const { data } = await api.addStop(tripId, stopData);
      set((state) => ({
        tripStops: [...state.tripStops, data],
        tripActivities: { ...state.tripActivities, [data.id]: data.activities || [] },
      }));
      return data;
    } catch {
      set({ error: 'Failed to add stop' });
      return null;
    }
  },

  updateStop: async (tripId, stopId, updates) => {
    try {
      const { data } = await api.updateStop(tripId, stopId, updates);
      set((state) => ({
        tripStops: state.tripStops.map((s) => (s.id === Number(stopId) ? data : s)),
      }));
      return data;
    } catch {
      set({ error: 'Failed to update stop' });
      return null;
    }
  },

  removeStop: async (tripId, stopId) => {
    try {
      await api.removeStop(tripId, stopId);
      set((state) => {
        const { [stopId]: _, ...restActivities } = state.tripActivities;
        return {
          tripStops: state.tripStops.filter((s) => s.id !== Number(stopId)),
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
      return data;
    } catch {
      set({ error: 'Failed to reorder stops' });
      return null;
    }
  },

  // ─── Trip Activities ────────────────────
  addActivity: async (tripId, stopId, activityData) => {
    try {
      const { data } = await api.addActivity(tripId, stopId, activityData);
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

  removeActivity: async (tripId, stopId, activityId) => {
    try {
      await api.removeActivity(tripId, stopId, activityId);
      set((state) => ({
        tripActivities: {
          ...state.tripActivities,
          [stopId]: (state.tripActivities[stopId] || []).filter(
            (a) => a.id !== Number(activityId)
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
  fetchBudget: async (tripId, tier = 'standard', currency = 'INR') => {
    set({ isLoading: true });
    try {
      const { data } = await api.getBudget(tripId, tier, currency);
      set({ budget: data, isLoading: false });
      return data;
    } catch {
      set({ isLoading: false, error: 'Failed to load budget' });
      return null;
    }
  },

  // ─── Helpers ────────────────────────────
  getCityById: (cityId) => {
    const fromCities = get().cities.find((c) => c.id === Number(cityId));
    if (fromCities) return fromCities;
    const stopWithCity = get().tripStops.find((s) => s.city?.id === Number(cityId) || s.cityId === Number(cityId));
    return stopWithCity?.city || null;
  },

  getActivityById: (actId) => get().activities.find((a) => a.id === Number(actId)),

  clearCurrentTrip: () =>
    set({ currentTrip: null, tripStops: [], tripActivities: {}, budget: null }),

  clearError: () => set({ error: null }),
}));

export default useTripStore;

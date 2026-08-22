/**
 * GlobeTrotter — API Service Layer
 *
 * Currently resolves mock data with a simulated 150-400ms network delay.
 * When the real backend is ready, swap the internals of each function
 * to real Axios calls (e.g. axios.get('/api/trips')) — signatures stay identical.
 *
 * Every function returns a Promise<{ data }> matching Axios response shape.
 */

import {
  users,
  trips,
  cities,
  activities,
  tripStops,
  tripActivities,
} from './mockData';

// ─── Helpers ─────────────────────────────────────────────
const delay = () =>
  new Promise((resolve) =>
    setTimeout(resolve, 150 + Math.random() * 250)
  );

const response = (data) => ({ data });

let _trips = [...trips];
let _tripStops = [...tripStops];
let _tripActivities = [...tripActivities];

const generateId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Auth ────────────────────────────────────────────────
export const login = async ({ email, password }) => {
  await delay();
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) throw { response: { status: 401, data: { message: 'Invalid email or password' } } };
  const { password: _, ...safeUser } = user;
  return response({ user: safeUser, token: `mock-jwt-${user.id}` });
};

export const signup = async ({ name, email, password }) => {
  await delay();
  const exists = users.find((u) => u.email === email);
  if (exists) throw { response: { status: 409, data: { message: 'Email already registered' } } };
  const newUser = {
    id: generateId('user'),
    name,
    email,
    password,
    profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return response({ user: safeUser, token: `mock-jwt-${newUser.id}` });
};

// ─── Trips ───────────────────────────────────────────────
export const getTrips = async (userId) => {
  await delay();
  const userTrips = _trips.filter((t) => t.userId === userId);
  return response(userTrips);
};

export const getTrip = async (tripId) => {
  await delay();
  const trip = _trips.find((t) => t.id === tripId);
  if (!trip) throw { response: { status: 404, data: { message: 'Trip not found' } } };
  return response(trip);
};

export const createTrip = async (tripData) => {
  await delay();
  const newTrip = {
    id: generateId('trip'),
    shareToken: generateId('share'),
    isPublic: false,
    ...tripData,
  };
  _trips.push(newTrip);
  return response(newTrip);
};

export const updateTrip = async (tripId, updates) => {
  await delay();
  const idx = _trips.findIndex((t) => t.id === tripId);
  if (idx === -1) throw { response: { status: 404, data: { message: 'Trip not found' } } };
  _trips[idx] = { ..._trips[idx], ...updates };
  return response(_trips[idx]);
};

export const deleteTrip = async (tripId) => {
  await delay();
  _trips = _trips.filter((t) => t.id !== tripId);
  _tripStops = _tripStops.filter((s) => s.tripId !== tripId);
  // Also clean up activities for those stops
  const deletedStopIds = tripStops
    .filter((s) => s.tripId === tripId)
    .map((s) => s.id);
  _tripActivities = _tripActivities.filter(
    (a) => !deletedStopIds.includes(a.tripStopId)
  );
  return response({ success: true });
};

// ─── Cities ──────────────────────────────────────────────
export const getCities = async () => {
  await delay();
  return response(cities);
};

export const getCity = async (cityId) => {
  await delay();
  const city = cities.find((c) => c.id === cityId);
  if (!city) throw { response: { status: 404, data: { message: 'City not found' } } };
  return response(city);
};

// ─── Activities ──────────────────────────────────────────
export const getActivities = async (cityId) => {
  await delay();
  const cityActivities = activities.filter((a) => a.cityId === cityId);
  return response(cityActivities);
};

export const getActivity = async (activityId) => {
  await delay();
  const activity = activities.find((a) => a.id === activityId);
  if (!activity) throw { response: { status: 404, data: { message: 'Activity not found' } } };
  return response(activity);
};

// ─── Trip Stops ──────────────────────────────────────────
export const getTripStops = async (tripId) => {
  await delay();
  const stops = _tripStops
    .filter((s) => s.tripId === tripId)
    .sort((a, b) => a.stopOrder - b.stopOrder);
  return response(stops);
};

export const addStop = async (tripId, stopData) => {
  await delay();
  const existingStops = _tripStops.filter((s) => s.tripId === tripId);
  const newStop = {
    id: generateId('stop'),
    tripId,
    stopOrder: existingStops.length + 1,
    ...stopData,
  };
  _tripStops.push(newStop);
  return response(newStop);
};

export const updateStop = async (stopId, updates) => {
  await delay();
  const idx = _tripStops.findIndex((s) => s.id === stopId);
  if (idx === -1) throw { response: { status: 404, data: { message: 'Stop not found' } } };
  _tripStops[idx] = { ..._tripStops[idx], ...updates };
  return response(_tripStops[idx]);
};

export const removeStop = async (stopId) => {
  await delay();
  _tripStops = _tripStops.filter((s) => s.id !== stopId);
  _tripActivities = _tripActivities.filter((a) => a.tripStopId !== stopId);
  return response({ success: true });
};

export const reorderStops = async (tripId, orderedStopIds) => {
  await delay();
  orderedStopIds.forEach((stopId, index) => {
    const stop = _tripStops.find((s) => s.id === stopId);
    if (stop) stop.stopOrder = index + 1;
  });
  const updated = _tripStops
    .filter((s) => s.tripId === tripId)
    .sort((a, b) => a.stopOrder - b.stopOrder);
  return response(updated);
};

// ─── Trip Activities ─────────────────────────────────────
export const getStopActivities = async (stopId) => {
  await delay();
  const acts = _tripActivities.filter((a) => a.tripStopId === stopId);
  return response(acts);
};

export const addActivity = async (stopId, activityData) => {
  await delay();
  const newAct = {
    id: generateId('ta'),
    tripStopId: stopId,
    ...activityData,
  };
  _tripActivities.push(newAct);
  return response(newAct);
};

export const updateActivity = async (activityId, updates) => {
  await delay();
  const idx = _tripActivities.findIndex((a) => a.id === activityId);
  if (idx === -1) throw { response: { status: 404, data: { message: 'Activity not found' } } };
  _tripActivities[idx] = { ..._tripActivities[idx], ...updates };
  return response(_tripActivities[idx]);
};

export const removeActivity = async (activityId) => {
  await delay();
  _tripActivities = _tripActivities.filter((a) => a.id !== activityId);
  return response({ success: true });
};

// ─── Budget ──────────────────────────────────────────────
export const getBudget = async (tripId) => {
  await delay();
  const stops = _tripStops.filter((s) => s.tripId === tripId);
  const stopIds = stops.map((s) => s.id);
  const tas = _tripActivities.filter((a) => stopIds.includes(a.tripStopId));

  const breakdown = {
    transport: 0,
    accommodation: 0,
    activities: 0,
    food: 0,
    other: 0,
  };

  // Map activity categories to budget categories
  const categoryMap = {
    sightseeing: 'activities',
    culture: 'activities',
    adventure: 'activities',
    nature: 'activities',
    food: 'food',
    shopping: 'other',
    entertainment: 'other',
  };

  const dailySpend = {};
  const citySpend = {};

  tas.forEach((ta) => {
    const activity = activities.find((a) => a.id === ta.activityId);
    if (!activity) return;

    const budgetCategory = categoryMap[activity.category] || 'other';
    breakdown[budgetCategory] += activity.estimatedCost;

    // Daily
    if (!dailySpend[ta.date]) dailySpend[ta.date] = 0;
    dailySpend[ta.date] += activity.estimatedCost;

    // City
    const stop = stops.find((s) => s.id === ta.tripStopId);
    const city = cities.find((c) => c.id === stop?.cityId);
    if (city) {
      if (!citySpend[city.name]) citySpend[city.name] = 0;
      citySpend[city.name] += activity.estimatedCost;
    }
  });

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  const trip = _trips.find((t) => t.id === tripId);
  const startDate = new Date(trip?.startDate);
  const endDate = new Date(trip?.endDate);
  const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const averagePerDay = Math.round(total / totalDays);

  return response({
    breakdown,
    dailySpend,
    citySpend,
    total,
    averagePerDay,
    totalDays,
    budget: trip?.budget || 0,
    isOverBudget: trip?.budget ? total > trip.budget : false,
  });
};

// ─── Public / Shared ─────────────────────────────────────
export const getPublicTrip = async (shareToken) => {
  await delay();
  const trip = _trips.find(
    (t) => t.shareToken === shareToken && t.isPublic
  );
  if (!trip) throw { response: { status: 404, data: { message: 'Shared trip not found or is private' } } };

  const stops = _tripStops
    .filter((s) => s.tripId === trip.id)
    .sort((a, b) => a.stopOrder - b.stopOrder);

  const stopsWithDetails = stops.map((stop) => {
    const city = cities.find((c) => c.id === stop.cityId);
    const stopActs = _tripActivities
      .filter((a) => a.tripStopId === stop.id)
      .map((ta) => {
        const activity = activities.find((a) => a.id === ta.activityId);
        return { ...ta, activity };
      });
    return { ...stop, city, activities: stopActs };
  });

  return response({ trip, stops: stopsWithDetails });
};

export const copyTrip = async (shareToken, userId) => {
  await delay();
  const original = _trips.find((t) => t.shareToken === shareToken);
  if (!original) throw { response: { status: 404, data: { message: 'Trip not found' } } };

  const newTripId = generateId('trip');
  const newTrip = {
    ...original,
    id: newTripId,
    userId,
    name: `${original.name} (Copy)`,
    isPublic: false,
    shareToken: generateId('share'),
  };
  _trips.push(newTrip);

  // Copy stops and activities
  const originalStops = _tripStops.filter((s) => s.tripId === original.id);
  originalStops.forEach((stop) => {
    const newStopId = generateId('stop');
    _tripStops.push({ ...stop, id: newStopId, tripId: newTripId });

    const stopActs = _tripActivities.filter((a) => a.tripStopId === stop.id);
    stopActs.forEach((act) => {
      _tripActivities.push({
        ...act,
        id: generateId('ta'),
        tripStopId: newStopId,
      });
    });
  });

  return response(newTrip);
};

// ─── Phase 2: Missing Endpoints ──────────────────────────

export const forgotPassword = async ({ email }) => {
  await delay();
  return response({ message: 'Reset link sent' });
};

export const getUserProfile = async (userId) => {
  await delay();
  const user = users.find(u => u.id === userId);
  if (!user) throw { response: { status: 404, data: { message: 'User not found' } } };
  const userTrips = _trips.filter(t => t.userId === userId);
  const totalDestinations = new Set(
    _tripStops.filter(s => userTrips.some(t => t.id === s.tripId)).map(s => s.cityId)
  ).size;
  return response({
    ...user,
    stats: { trips: userTrips.length, destinations: totalDestinations },
    preferences: { language: 'en', currency: 'USD' }
  });
};

export const updateUserProfile = async (userId, updates) => {
  await delay();
  return response({ success: true, ...updates });
};

export const deleteAccount = async (userId) => {
  await delay();
  return response({ success: true });
};

export const getAdminStats = async () => {
  await delay();
  return response({
    totalUsers: users.length,
    totalTrips: _trips.length,
    totalStops: _tripStops.length,
    totalActivities: _tripActivities.length,
    topDestinations: cities.slice(0, 5)
  });
};

export const getDashboardSummary = async (userId) => {
  await delay();
  const userTrips = _trips.filter(t => t.userId === userId);
  const upcoming = userTrips.filter(t => new Date(t.startDate) > new Date()).slice(0, 3);
  const recent = userTrips.filter(t => new Date(t.startDate) <= new Date()).slice(0, 3);
  return response({
    metrics: { totalTrips: userTrips.length, totalSpent: 4500, totalDestinations: 8 },
    upcoming,
    recent,
    popularCities: cities.slice(0, 4)
  });
};

export const getRoute = async (tripId) => {
  await delay();
  const stops = _tripStops.filter(s => s.tripId === tripId).sort((a,b) => a.stopOrder - b.stopOrder);
  const routeLegs = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const fromCity = cities.find(c => c.id === stops[i].cityId);
    const toCity = cities.find(c => c.id === stops[i+1].cityId);
    routeLegs.push({
      id: generateId('leg'),
      from: fromCity?.name || 'Unknown',
      to: toCity?.name || 'Unknown',
      mode: ['Flight', 'Rail', 'Drive'][Math.floor(Math.random() * 3)],
      distance: Math.floor(Math.random() * 800) + 200 + ' km',
      duration: Math.floor(Math.random() * 5) + 1 + ' hours',
      cost: Math.floor(Math.random() * 150) + 50
    });
  }
  return response(routeLegs);
};

export const exportMarkdown = async (tripId) => {
  await delay();
  return response({ content: `# Trip Export\n\nYour amazing trip details here...` });
};

export const exportText = async (tripId) => {
  await delay();
  return response({ content: `Trip Export\n\nYour amazing trip details here...` });
};

export const generateAiItinerary = async (params) => {
  await delay();
  return response({
    id: 'ai-' + Date.now(),
    name: `Magic Trip to ${params.destination}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + params.duration * 86400000).toISOString().split('T')[0],
    budget: params.budget,
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800'
  });
};

/**
 * ItineraryViewPage — Read-only view grouped by city/day.
 *
 * Each activity shows time, name, cost, category badge.
 * Daily and city subtotals. Share toggle and edit button.
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useTripStore from '../store/tripStore';
import { activities as allActivitiesData } from '../services/mockData';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
};

const CATEGORIES = {
  sightseeing: { color: 'bg-blue-400/20 text-blue-300', icon: '🏛️' },
  culture: { color: 'bg-purple-400/20 text-purple-300', icon: '🎭' },
  food: { color: 'bg-orange-400/20 text-orange-300', icon: '🍜' },
  adventure: { color: 'bg-emerald-400/20 text-emerald-300', icon: '🏔️' },
  shopping: { color: 'bg-pink-400/20 text-pink-300', icon: '🛍️' },
  nature: { color: 'bg-green-400/20 text-green-300', icon: '🌿' },
  entertainment: { color: 'bg-yellow-400/20 text-yellow-300', icon: '🎪' },
};

export default function ItineraryViewPage() {
  const { tripId } = useParams();
  const {
    currentTrip,
    fetchTrip,
    tripStops,
    tripActivities,
    fetchTripStops,
    updateTrip,
    getCityById,
    isLoading,
  } = useTripStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTrip(tripId);
    fetchTripStops(tripId);
  }, [tripId, fetchTrip, fetchTripStops]);

  // Group activities by day for each stop
  const stopDetails = useMemo(() => {
    return tripStops.map((stop) => {
      const city = getCityById(stop.cityId);
      const acts = tripActivities[stop.id] || [];

      // Group by date
      const byDate = {};
      acts.forEach((ta) => {
        const date = ta.date || 'unscheduled';
        if (!byDate[date]) byDate[date] = [];
        const activity = allActivitiesData.find((a) => a.id === ta.activityId);
        byDate[date].push({ ...ta, activity });
      });

      // Sort each day by start time
      Object.keys(byDate).forEach((date) => {
        byDate[date].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      });

      // City subtotal
      const cityTotal = acts.reduce((sum, ta) => {
        const act = allActivitiesData.find((a) => a.id === ta.activityId);
        return sum + (act?.estimatedCost || 0);
      }, 0);

      return { stop, city, byDate, cityTotal };
    });
  }, [tripStops, tripActivities, getCityById]);

  const grandTotal = stopDetails.reduce((sum, s) => sum + s.cityTotal, 0);

  const handleTogglePublic = async () => {
    if (currentTrip) {
      await updateTrip(tripId, { isPublic: !currentTrip.isPublic });
    }
  };

  const handleCopyShareLink = () => {
    if (currentTrip?.shareToken) {
      navigator.clipboard.writeText(
        `${window.location.origin}/share/${currentTrip.shareToken}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading && !currentTrip) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-amber-400 text-2xl mb-3">✈</div>
        <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">Loading itinerary...</p>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="text-center py-20">
        <p className="text-xl mb-4">🔍</p>
        <h2 className="font-display text-xl text-cream mb-2">Trip not found</h2>
        <Link to="/trips" className="text-xs font-mono text-amber-400 hover:underline">← Back to trips</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
            Itinerary
          </span>
          <h1 className="font-display text-3xl text-cream">{currentTrip.name}</h1>
          <p className="text-sm text-slate-400 mt-1">{currentTrip.description}</p>
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-500">
            <span>{formatDateShort(currentTrip.startDate)} — {formatDateShort(currentTrip.endDate)}</span>
            <span>•</span>
            <span>{tripStops.length} cities</span>
            <span>•</span>
            <span className="text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Share controls */}
          <button
            onClick={handleTogglePublic}
            className={`px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono rounded border transition-colors ${
              currentTrip.isPublic
                ? 'text-success border-success/30 bg-success/5 hover:bg-success/10'
                : 'text-slate-500 border-navy-600 hover:border-slate-500'
            }`}
          >
            {currentTrip.isPublic ? '● Public' : '○ Private'}
          </button>
          {currentTrip.isPublic && (
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-amber-400/40 rounded transition-colors"
            >
              {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
          )}
          <Link
            to={`/trips/${tripId}/itinerary/edit`}
            className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 rounded transition-colors"
          >
            ✏ Edit
          </Link>
          <Link
            to={`/trips/${tripId}/budget`}
            className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-cream bg-amber-400/10 border border-amber-400/30 hover:bg-amber-400/20 rounded transition-colors"
          >
            Budget →
          </Link>
        </div>
      </div>

      {/* Route visualization */}
      {tripStops.length > 1 && (
        <div className="mb-8 bg-navy-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {tripStops.map((stop, i) => {
              const city = getCityById(stop.cityId);
              return (
                <div key={stop.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono font-bold text-amber-400">{city?.name}</span>
                    <span className="text-[9px] font-mono text-slate-600">{formatDateShort(stop.startDate)}</span>
                  </div>
                  {i < tripStops.length - 1 && (
                    <div className="mx-4 flex items-center">
                      <div className="w-16 border-t border-dashed border-amber-400/40" />
                      <span className="text-amber-400/60 text-xs -ml-1">✈</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {tripStops.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-display text-xl text-cream mb-2">No stops yet</h3>
          <p className="text-sm text-slate-500 mb-6">
            Start building your itinerary by adding city stops.
          </p>
          <Link
            to={`/trips/${tripId}/itinerary/edit`}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase px-6 py-3 rounded transition-colors"
          >
            Build Itinerary →
          </Link>
        </div>
      )}

      {/* Stops by city */}
      <div className="space-y-8">
        {stopDetails.map(({ stop, city, byDate, cityTotal }, stopIndex) => (
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stopIndex * 0.1 }}
          >
            {/* City header */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={city?.imageUrl}
                alt={city?.name}
                className="w-14 h-14 rounded-lg object-cover border border-navy-600"
              />
              <div className="flex-1">
                <h2 className="font-display text-xl text-cream">{city?.name}</h2>
                <span className="text-[10px] font-mono text-slate-500">
                  {city?.country} • {formatDateShort(stop.startDate)} — {formatDateShort(stop.endDate)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600 block">City Total</span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  ₹{cityTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-3 ml-4 border-l-2 border-navy-700 pl-6">
              {Object.entries(byDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, acts]) => {
                  const dayTotal = acts.reduce(
                    (sum, ta) => sum + (ta.activity?.estimatedCost || 0),
                    0
                  );
                  return (
                    <div key={date} className="relative">
                      {/* Day dot */}
                      <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-navy-800 border-2 border-amber-400" />

                      {/* Day header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono font-semibold text-cream">
                          {date === 'unscheduled' ? 'UNSCHEDULED' : formatDate(date)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ₹{dayTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Activities */}
                      <div className="space-y-1.5">
                        {acts.map((ta) => {
                          if (!ta.activity) return null;
                          const cat = CATEGORIES[ta.activity.category] || CATEGORIES.sightseeing;
                          return (
                            <div
                              key={ta.id}
                              className="flex items-center gap-3 bg-navy-900/50 rounded px-3 py-2.5 border border-navy-800 hover:border-navy-600 transition-colors"
                            >
                              <span className="text-sm flex-shrink-0">{cat.icon}</span>
                              {ta.startTime && (
                                <span className="text-[11px] font-mono text-amber-400/70 flex-shrink-0 w-24">
                                  {ta.startTime} – {ta.endTime}
                                </span>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-cream truncate block">
                                  {ta.activity.name}
                                </span>
                                {ta.notes && (
                                  <span className="text-[10px] text-slate-500 truncate block">
                                    📝 {ta.notes}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ${cat.color}`}>
                                {ta.activity.category}
                              </span>
                              <span className="text-xs font-mono text-amber-400/80 flex-shrink-0">
                                ₹{ta.activity.estimatedCost.toLocaleString('en-IN')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grand total footer */}
      {tripStops.length > 0 && (
        <div className="mt-10 pt-6 border-t border-navy-700">
          <div className="flex items-center justify-between">
            <span className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-500">
              Estimated Total
            </span>
            <span className="text-xl font-mono font-bold text-amber-400">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
          {currentTrip.budget > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-500">Budget</span>
                <span className={grandTotal > currentTrip.budget ? 'text-danger' : 'text-slate-400'}>
                  ₹{grandTotal.toLocaleString('en-IN')} / ₹{currentTrip.budget.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    grandTotal > currentTrip.budget ? 'bg-danger' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (grandTotal / currentTrip.budget) * 100)}%` }}
                />
              </div>
              {grandTotal > currentTrip.budget && (
                <p className="text-[10px] font-mono text-danger mt-1">
                  ⚠ Over budget by ₹{(grandTotal - currentTrip.budget).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

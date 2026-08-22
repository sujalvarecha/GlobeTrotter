/**
 * ItineraryViewPage — Read-only view grouped by city/day.
 *
 * Each activity shows time, name, cost, category badge.
 * Daily and city subtotals. Share toggle, interactive calendar with event popup, and transit route legs.
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import useTripStore from '../store/tripStore';
import * as api from '../services/api';

const localizer = momentLocalizer(moment);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
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

// ─── Event Detail Modal ──────────────────────────────────
function EventDetailModal({ event, onClose }) {
  if (!event) return null;
  const res = event.resource || {};
  const cat = (res.category || res.activity?.category || 'sightseeing').toLowerCase();
  const catConfig = CATEGORIES[cat] || CATEGORIES.sightseeing;
  const cost = res.estimatedCost !== undefined ? res.estimatedCost : (res.activity?.estimatedCost || 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-navy-900 border border-navy-700 rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{catConfig.icon}</span>
            <div>
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${catConfig.color}`}>
                {cat}
              </span>
              <h3 className="font-display text-xl text-cream mt-1">{event.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-cream text-lg font-mono">
            ✕
          </button>
        </div>

        {res.cityName && (
          <p className="text-xs font-mono text-amber-400 mb-3">📍 {res.cityName}</p>
        )}

        <div className="space-y-3 bg-navy-950/60 p-4 rounded-lg border border-navy-800 text-xs font-mono mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Scheduled Time:</span>
            <span className="text-cream">{moment(event.start).format('ddd, MMM D • hh:mm A')} – {moment(event.end).format('hh:mm A')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Cost:</span>
            <span className="text-amber-400 font-bold">₹{Math.round(cost * 83).toLocaleString('en-IN')}</span>
          </div>
          {res.notes && (
            <div className="pt-2 border-t border-navy-800">
              <span className="text-slate-500 block mb-1">Traveler Notes:</span>
              <span className="text-slate-300 font-sans text-xs">{res.notes}</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs uppercase tracking-widest rounded transition-colors"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ItineraryViewPage() {
  const { tripId } = useParams();
  const {
    currentTrip,
    fetchTrip,
    tripStops,
    tripActivities,
    fetchTripStops,
    fetchCities,
    fetchAllActivities,
    getCityById,
    getActivityById,
    isLoading,
  } = useTripStore();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');
  const [routeLegs, setRouteLegs] = useState([]);
  const [shareInfo, setShareInfo] = useState({
    isPublic: false,
    shareToken: null,
  });

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId);
      fetchTripStops(tripId);
      fetchCities();
      fetchAllActivities();
    }
  }, [tripId, fetchTrip, fetchTripStops, fetchCities, fetchAllActivities]);

  useEffect(() => {
    if (currentTrip) {
      setShareInfo({
        isPublic: !!currentTrip.isPublic,
        shareToken: currentTrip.shareToken,
      });
      if (currentTrip.startDate) {
        setCalendarDate(new Date(currentTrip.startDate));
      }
    }
  }, [currentTrip]);

  useEffect(() => {
    if (activeTab === 'route' && tripId) {
      api.getRoute(tripId)
        .then(({ data }) => {
          setRouteLegs(data.legs || []);
        })
        .catch((err) => console.warn('Could not load route', err));
    }
  }, [tripId, activeTab]);

  const handleExport = async (format) => {
    try {
      const fetcher = format === 'markdown' ? api.exportMarkdown : api.exportText;
      const { data } = await fetcher(tripId);
      const textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itinerary-trip-${tripId}.${format === 'markdown' ? 'md' : 'txt'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleTogglePublic = async () => {
    try {
      if (shareInfo.isPublic) {
        const { data } = await api.disableSharing(tripId);
        setShareInfo({ isPublic: false, shareToken: data.shareToken });
      } else {
        const { data } = await api.enableSharing(tripId);
        setShareInfo({ isPublic: true, shareToken: data.shareToken });
      }
      fetchTrip(tripId);
    } catch (err) {
      console.error('Failed to toggle sharing', err);
    }
  };

  const handleCopyShareLink = () => {
    const token = shareInfo.shareToken || currentTrip?.shareToken;
    if (token) {
      navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group activities by day for each stop
  const stopDetails = useMemo(() => {
    return tripStops.map((stop) => {
      const city = stop.city || getCityById(stop.cityId);
      const acts = tripActivities[stop.id] || stop.activities || [];

      const byDate = {};
      acts.forEach((ta) => {
        const date = ta.activityDate || ta.date || stop.startDate || 'unscheduled';
        if (!byDate[date]) byDate[date] = [];
        const activity = ta.activity || getActivityById(ta.activityId) || {
          name: ta.activityName,
          category: ta.category,
          estimatedCost: ta.estimatedCost,
        };
        byDate[date].push({ ...ta, activity, cityName: city?.name });
      });

      Object.keys(byDate).forEach((date) => {
        byDate[date].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
      });

      const cityTotal = acts.reduce((sum, ta) => {
        const act = ta.activity || getActivityById(ta.activityId);
        const cost = ta.estimatedCost !== undefined ? ta.estimatedCost : (act?.estimatedCost || 0);
        return sum + Math.round(cost * 83);
      }, 0);

      return { stop, city, byDate, cityTotal };
    });
  }, [tripStops, tripActivities, getCityById, getActivityById]);

  const grandTotal = stopDetails.reduce((sum, s) => sum + s.cityTotal, 0);

  // Parse events with accurate start/end timestamps
  const calendarEvents = useMemo(() => {
    const events = [];
    stopDetails.forEach(({ stop, city, byDate }) => {
      Object.entries(byDate).forEach(([date, acts]) => {
        const effectiveDateStr = date !== 'unscheduled' ? date : (stop.startDate || currentTrip?.startDate);
        if (!effectiveDateStr) return;

        acts.forEach((ta, idx) => {
          const name = ta.activityName || ta.activity?.name || 'Activity';
          const startTime = ta.startTime || (idx % 2 === 0 ? '10:00' : '15:00');
          const endTime = ta.endTime || (idx % 2 === 0 ? '12:30' : '17:30');
          
          const cleanStart = startTime.includes(':') ? startTime : '10:00';
          const cleanEnd = endTime.includes(':') ? endTime : '12:30';

          const start = moment(`${effectiveDateStr} ${cleanStart}`, 'YYYY-MM-DD HH:mm').toDate();
          const end = moment(`${effectiveDateStr} ${cleanEnd}`, 'YYYY-MM-DD HH:mm').toDate();

          events.push({
            id: ta.id || `${stop.id}-${idx}`,
            title: `${city?.name ? `${city.name}: ` : ''}${name}`,
            start: isNaN(start.getTime()) ? new Date(effectiveDateStr) : start,
            end: isNaN(end.getTime()) ? new Date(effectiveDateStr) : end,
            resource: { ...ta, cityName: city?.name },
          });
        });
      });
    });
    return events;
  }, [stopDetails, currentTrip]);

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

  const tripBudget = currentTrip.targetBudget !== undefined ? currentTrip.targetBudget : currentTrip.budget;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
            Itinerary
          </span>
          <h1 className="font-display text-3xl text-cream">{currentTrip.name}</h1>
          {currentTrip.description && (
            <p className="text-sm text-slate-400 mt-1">{currentTrip.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-slate-500">
            <span>{formatDateShort(currentTrip.startDate)} — {formatDateShort(currentTrip.endDate)}</span>
            <span>•</span>
            <span>{tripStops.length} {tripStops.length === 1 ? 'city' : 'cities'}</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Share controls */}
          <button
            onClick={handleTogglePublic}
            className={`px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono rounded border transition-colors ${
              shareInfo.isPublic
                ? 'text-success border-success/30 bg-success/5 hover:bg-success/10'
                : 'text-slate-400 border-navy-600 hover:border-slate-500'
            }`}
          >
            {shareInfo.isPublic ? '● Public' : '○ Private'}
          </button>
          {shareInfo.isPublic && (
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-300 border border-navy-600 hover:border-amber-400/40 rounded transition-colors"
            >
              {copied ? '✓ Copied Link!' : '🔗 Copy Share Link'}
            </button>
          )}
          <button
            onClick={() => handleExport('markdown')}
            className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-amber-400/40 rounded transition-colors"
          >
            Export MD
          </button>
          <button
            onClick={() => handleExport('text')}
            className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-amber-400/40 rounded transition-colors"
          >
            Export TXT
          </button>
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

      {/* Tabs */}
      <div className="flex border-b border-navy-700 mb-8 overflow-x-auto">
        {['timeline', 'calendar', 'route'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs tracking-[0.2em] uppercase font-mono transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Route visualization */}
      {tripStops.length > 1 && (
        <div className="mb-8 bg-navy-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {tripStops.map((stop, i) => {
              const city = stop.city || getCityById(stop.cityId);
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'timeline' && (
            <>
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
                      {city?.imageUrl ? (
                        <img
                          src={city.imageUrl}
                          alt={city.name}
                          className="w-14 h-14 rounded-lg object-cover border border-navy-600 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-navy-800 border border-navy-600 flex items-center justify-center text-xl">
                          🏙️
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="font-display text-xl text-cream">{city?.name || 'Destination'}</h2>
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
                          const dayTotal = acts.reduce((sum, ta) => {
                            const cost = ta.estimatedCost !== undefined ? ta.estimatedCost : (ta.activity?.estimatedCost || 0);
                            return sum + Math.round(cost * 83);
                          }, 0);

                          return (
                            <div key={date} className="relative">
                              {/* Day dot */}
                              <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-navy-800 border-2 border-amber-400" />

                              {/* Day header */}
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-mono font-semibold text-cream">
                                  {date === 'unscheduled' ? 'UNSCHEDULED' : formatDate(date)}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  ₹{dayTotal.toLocaleString('en-IN')}
                                </span>
                              </div>

                              {/* Activities */}
                              <div className="space-y-1.5">
                                {acts.map((ta) => {
                                  const name = ta.activityName || ta.activity?.name || 'Activity';
                                  const catName = (ta.category || ta.activity?.category || 'sightseeing').toLowerCase();
                                  const cost = ta.estimatedCost !== undefined ? ta.estimatedCost : (ta.activity?.estimatedCost || 0);
                                  const cat = CATEGORIES[catName] || CATEGORIES.sightseeing;

                                  return (
                                    <div
                                      key={ta.id}
                                      className="flex items-center gap-3 bg-navy-900/50 rounded px-3 py-2.5 border border-navy-800 hover:border-navy-600 transition-colors"
                                    >
                                      <span className="text-sm flex-shrink-0">{cat.icon}</span>
                                      {ta.startTime && (
                                        <span className="text-[11px] font-mono text-amber-400/70 flex-shrink-0 w-24">
                                          {ta.startTime} – {ta.endTime || ''}
                                        </span>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <span className="text-sm text-cream truncate block">
                                          {name}
                                        </span>
                                        {ta.notes && (
                                          <span className="text-[10px] text-slate-500 truncate block">
                                            📝 {ta.notes}
                                          </span>
                                        )}
                                      </div>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ${cat.color}`}>
                                        {catName}
                                      </span>
                                      <span className="text-xs font-mono text-amber-400/80 flex-shrink-0">
                                        ₹{Math.round(cost * 83).toLocaleString('en-IN')}
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
                  {tripBudget > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-500">Budget</span>
                        <span className={grandTotal > tripBudget ? 'text-danger' : 'text-slate-400'}>
                          ₹{grandTotal.toLocaleString('en-IN')} / ₹{tripBudget.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            grandTotal > tripBudget ? 'bg-danger' : 'bg-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, (grandTotal / tripBudget) * 100)}%` }}
                        />
                      </div>
                      {grandTotal > tripBudget && (
                        <p className="text-[10px] font-mono text-danger mt-1">
                          ⚠ Over budget by ₹{(grandTotal - tripBudget).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4">
              {/* Calendar Quick Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900 border border-navy-700 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentTrip?.startDate) setCalendarDate(new Date(currentTrip.startDate));
                    }}
                    className="px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-mono rounded"
                  >
                    Trip Start ({formatDateShort(currentTrip?.startDate)})
                  </button>
                  <button
                    onClick={() => {
                      const m = moment(calendarDate).subtract(1, calendarView === 'month' ? 'month' : 'week');
                      setCalendarDate(m.toDate());
                    }}
                    className="px-2.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-cream text-xs font-mono rounded border border-navy-600"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => {
                      const m = moment(calendarDate).add(1, calendarView === 'month' ? 'month' : 'week');
                      setCalendarDate(m.toDate());
                    }}
                    className="px-2.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-cream text-xs font-mono rounded border border-navy-600"
                  >
                    Next →
                  </button>
                  <span className="text-xs font-mono font-bold text-cream ml-2">
                    {moment(calendarDate).format('MMMM YYYY')}
                  </span>
                </div>

                <div className="flex gap-1 border border-navy-700 rounded overflow-hidden">
                  {['month', 'week', 'day', 'agenda'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalendarView(v)}
                      className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider ${
                        calendarView === v ? 'bg-amber-400 text-navy-950 font-bold' : 'text-slate-400 hover:text-cream bg-navy-800'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* BigCalendar Container */}
              <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 h-[650px] text-slate-200 shadow-xl overflow-hidden">
                <style>{`
                  .rbc-calendar { color: #f1f5f9; }
                  .rbc-header { color: #f5a623; font-family: monospace; font-size: 11px; padding: 8px; border-bottom-color: #334155; }
                  .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: #334155; background: #0f172a; }
                  .rbc-day-bg + .rbc-day-bg { border-left-color: #1e293b; }
                  .rbc-month-row + .rbc-month-row { border-top-color: #1e293b; }
                  .rbc-off-range-bg { background-color: #080e1a; }
                  .rbc-today { background-color: rgba(245, 166, 35, 0.12) !important; }
                  .rbc-event { background-color: #f5a623 !important; color: #0a1628 !important; border: 1px solid #d97706; font-weight: bold; font-family: monospace; font-size: 11px; border-radius: 4px; padding: 2px 4px; }
                  .rbc-event:hover { background-color: #fbbf24 !important; }
                  .rbc-time-header-content { border-left-color: #334155; }
                  .rbc-time-content { border-top-color: #334155; }
                  .rbc-time-content > * + * > * { border-left-color: #1e293b; }
                  .rbc-timeslot-group { border-bottom-color: #1e293b; }
                  .rbc-agenda-table { color: #f1f5f9; }
                  .rbc-agenda-table tbody > tr > td + td { border-left-color: #334155; }
                  .rbc-agenda-table tbody > tr + tr { border-top-color: #334155; }
                  .rbc-time-slot { border-top-color: #1e293b; }
                  .rbc-current-time-indicator { background-color: #ef4444; }
                `}</style>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  date={calendarDate}
                  onNavigate={(newDate) => setCalendarDate(newDate)}
                  view={calendarView}
                  onView={(newView) => setCalendarView(newView)}
                  views={['month', 'week', 'day', 'agenda']}
                  onSelectEvent={(event) => setSelectedEvent(event)}
                  tooltipAccessor={(event) => `${event.title} (Click to inspect)`}
                />
              </div>

              {/* Event detail popup modal */}
              <AnimatePresence>
                {selectedEvent && (
                  <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'route' && (
            <div className="space-y-4">
              {routeLegs.length > 0 ? (
                routeLegs.map((leg, index) => (
                  <div key={leg.legIndex ?? index} className="bg-navy-900 border border-navy-700 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg">
                    <div className="flex-1 flex items-center justify-between w-full">
                      <div className="text-center">
                        <span className="block text-2xl font-display text-amber-400">{leg.fromCity}</span>
                        <span className="text-[10px] tracking-widest font-mono text-slate-500 uppercase">{leg.fromCountry}</span>
                      </div>
                      <div className="flex-1 px-8 relative flex items-center justify-center">
                        <div className="w-full border-t-2 border-dashed border-navy-600" />
                        <div className="absolute bg-navy-800 px-3 py-1 rounded-full border border-navy-600 text-xs font-mono text-slate-300">
                          {leg.recommendedTransport === 'Flight' ? '✈️' : leg.recommendedTransport?.includes('Rail') ? '🚂' : '🚗'} {leg.recommendedTransport}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-display text-amber-400">{leg.toCity}</span>
                        <span className="text-[10px] tracking-widest font-mono text-slate-500 uppercase">{leg.toCountry}</span>
                      </div>
                    </div>
                    <div className="md:border-l md:border-navy-700 md:pl-6 flex flex-row md:flex-col gap-4 md:gap-2 w-full md:w-auto justify-center">
                      <div className="text-center md:text-left">
                        <span className="block text-[10px] tracking-[0.2em] font-mono text-slate-500 uppercase">Distance</span>
                        <span className="text-sm font-mono text-cream">{leg.distanceKm} km</span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="block text-[10px] tracking-[0.2em] font-mono text-slate-500 uppercase">Duration</span>
                        <span className="text-sm font-mono text-cream">{leg.estimatedTransitTime}</span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="block text-[10px] tracking-[0.2em] font-mono text-slate-500 uppercase">Est. Cost</span>
                        <span className="text-sm font-mono text-success">₹{Math.round((leg.estimatedTransitCostUsd || 0) * 83).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-500 font-mono text-sm bg-navy-900/40 rounded-lg border border-navy-800">
                  {tripStops.length < 2 ? 'Add at least 2 city stops to calculate transit routes.' : 'Calculating optimal transit routes...'}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

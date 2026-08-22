/**
 * SharedTripPage — Public read-only itinerary at /share/:shareToken.
 *
 * Minimal chrome — just GlobeTrotter wordmark, no full navbar.
 * Reuses itinerary view layout. "Copy Trip" button for logged-in users.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as api from '../services/api';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';

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

export default function SharedTripPage() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchTrips } = useTripStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: result } = await api.getPublicTrip(shareToken);
        setData(result);
      } catch (err) {
        setError(err?.response?.data?.message || 'Trip not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareToken]);

  const handleCopyTrip = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCopying(true);
    try {
      await api.copyTrip(shareToken, user.id);
      setCopied(true);
      // Refresh user's trips
      fetchTrips(user.id);
      setTimeout(() => {
        navigate('/trips');
      }, 1500);
    } catch {
      setError('Failed to copy trip');
    } finally {
      setCopying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl mb-4 inline-block"
          >
            ✈
          </motion.div>
          <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">
            Loading shared trip...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-6">🔒</div>
          <h2 className="font-display text-2xl text-cream mb-3">Trip Unavailable</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-4 mb-6">
            <p className="text-[10px] font-mono text-slate-500">
              This trip may be private, deleted, or the link may be incorrect.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:underline"
          >
            ← Go to GlobeTrotter
          </Link>
        </div>
      </div>
    );
  }

  const { trip, stops } = data;
  const grandTotal = stops.reduce((sum, stop) => {
    return (
      sum +
      stop.activities.reduce(
        (s, ta) => s + (ta.activity?.estimatedCost || 0),
        0
      )
    );
  }, 0);

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Amber accent strip */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      {/* Minimal header */}
      <header className="border-b border-navy-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-400 flex items-center justify-center text-navy-950 font-bold text-sm font-display">
              G
            </div>
            <span className="font-display text-base text-cream">GlobeTrotter</span>
          </Link>
          <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600">
            Shared Itinerary
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Trip header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {trip.coverImage && (
            <div className="h-48 sm:h-64 rounded-lg overflow-hidden mb-6 relative">
              <img
                src={trip.coverImage}
                alt={trip.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
                Shared Trip
              </span>
              <h1 className="font-display text-3xl text-cream">{trip.name}</h1>
              <p className="text-sm text-slate-400 mt-1">{trip.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-500">
                <span>{formatDateShort(trip.startDate)} — {formatDateShort(trip.endDate)}</span>
                <span>•</span>
                <span>{stops.length} cities</span>
                <span>•</span>
                <span className="text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleCopyTrip}
              disabled={copying || copied}
              className={`px-5 py-3 text-xs tracking-[0.15em] uppercase font-mono font-bold rounded transition-all ${
                copied
                  ? 'bg-success text-navy-950'
                  : 'bg-amber-400 hover:bg-amber-500 text-navy-950'
              } disabled:opacity-70`}
            >
              {copied ? '✓ Copied to Your Trips!' : copying ? 'Copying...' : '📋 Copy This Trip'}
            </button>
          </div>
        </motion.div>

        {/* Route visualization */}
        {stops.length > 1 && (
          <div className="mb-8 bg-navy-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {stops.map((stop, i) => (
                <div key={stop.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono font-bold text-amber-400">{stop.city?.name}</span>
                    <span className="text-[9px] font-mono text-slate-600">{stop.city?.country}</span>
                  </div>
                  {i < stops.length - 1 && (
                    <div className="mx-4 flex items-center">
                      <div className="w-16 border-t border-dashed border-amber-400/40" />
                      <span className="text-amber-400/60 text-xs -ml-1">✈</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stops */}
        <div className="space-y-8">
          {stops.map((stop, stopIndex) => {
            // Group activities by date
            const byDate = {};
            stop.activities.forEach((ta) => {
              const date = ta.date || 'unscheduled';
              if (!byDate[date]) byDate[date] = [];
              byDate[date].push(ta);
            });

            const cityTotal = stop.activities.reduce(
              (sum, ta) => sum + (ta.activity?.estimatedCost || 0),
              0
            );

            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stopIndex * 0.1 }}
              >
                {/* City header */}
                <div className="flex items-center gap-4 mb-4">
                  {stop.city?.imageUrl && (
                    <img
                      src={stop.city.imageUrl}
                      alt={stop.city.name}
                      className="w-14 h-14 rounded-lg object-cover border border-navy-600"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="font-display text-xl text-cream">{stop.city?.name}</h2>
                    <span className="text-[10px] font-mono text-slate-500">
                      {stop.city?.country} • {formatDateShort(stop.startDate)} — {formatDateShort(stop.endDate)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600 block">Subtotal</span>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      ₹{cityTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Days */}
                <div className="space-y-3 ml-4 border-l-2 border-navy-700 pl-6">
                  {Object.entries(byDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, acts]) => (
                      <div key={date} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-navy-800 border-2 border-amber-400" />
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-mono font-semibold text-cream">
                            {date === 'unscheduled' ? 'UNSCHEDULED' : formatDate(date)}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {acts
                            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                            .map((ta) => {
                              if (!ta.activity) return null;
                              const cat = CATEGORIES[ta.activity.category] || CATEGORIES.sightseeing;
                              return (
                                <div
                                  key={ta.id}
                                  className="flex items-center gap-3 bg-navy-900/50 rounded px-3 py-2.5 border border-navy-800"
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
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Grand total */}
        <div className="mt-10 pt-6 border-t border-navy-700 flex items-center justify-between">
          <span className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-500">
            Estimated Total
          </span>
          <span className="text-xl font-mono font-bold text-amber-400">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Copy CTA at bottom */}
        <div className="mt-8 text-center">
          <button
            onClick={handleCopyTrip}
            disabled={copying || copied}
            className={`px-8 py-3 text-xs tracking-[0.15em] uppercase font-mono font-bold rounded transition-all ${
              copied
                ? 'bg-success text-navy-950'
                : 'bg-amber-400 hover:bg-amber-500 text-navy-950'
            } disabled:opacity-70`}
          >
            {copied ? '✓ Added to Your Trips!' : '📋 Copy This Trip to Your Account'}
          </button>
          {!isAuthenticated && (
            <p className="text-[10px] font-mono text-slate-600 mt-2">
              You'll need to log in first
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-navy-800 py-4 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-navy-600">
            GlobeTrotter © 2026
          </span>
          <Link to="/" className="text-[10px] font-mono text-amber-400/60 hover:text-amber-400 transition-colors">
            Plan your own trip →
          </Link>
        </div>
      </footer>
    </div>
  );
}

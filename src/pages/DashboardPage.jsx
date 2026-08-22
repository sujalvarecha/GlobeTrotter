/**
 * DashboardPage — Welcome screen with trip cards and budget highlight.
 *
 * Layout: Welcome header, upcoming trip cards (boarding-pass stubs),
 * quick budget bar, and a prominent "Plan New Trip" CTA.
 */

import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';
import * as api from '../services/api';
import AiWizardModal from '../components/AiWizardModal';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const getDaysUntil = (dateStr) => {
  if (!dateStr) return 0;
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

function TripCard({ trip, index }) {
  const navigate = useNavigate();
  const cityStore = useTripStore();
  const [stops, setStops] = useState(trip.stops || []);

  useEffect(() => {
    if (!trip.stops || trip.stops.length === 0) {
      api.getTripStops(trip.id).then(({ data }) => setStops(data)).catch(() => {});
    }
  }, [trip.id, trip.stops]);

  const daysUntil = getDaysUntil(trip.startDate);
  const isUpcoming = daysUntil > 0;
  const cityNames = stops.map((s) => s.city?.name || cityStore.getCityById(s.cityId)?.name).filter(Boolean);
  const budgetValue = trip.targetBudget !== undefined ? trip.targetBudget : trip.budget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
      className="ticket-card rounded-lg cursor-pointer group hover:border-amber-400/40 transition-all duration-300"
    >
      {/* Cover image strip */}
      <div className="h-32 relative overflow-hidden">
        {trip.coverImage ? (
          <img
            src={trip.coverImage}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-navy-700 flex items-center justify-center">
            <span className="text-4xl">✈</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {isUpcoming ? (
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono font-bold bg-amber-400/90 text-navy-950 px-2 py-1 rounded">
              {daysUntil}d away
            </span>
          ) : (
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono font-bold bg-navy-600/90 text-slate-300 px-2 py-1 rounded">
              Completed
            </span>
          )}
        </div>

        {/* Trip name overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-lg text-cream leading-tight truncate">
            {trip.name}
          </h3>
        </div>
      </div>

      {/* Perforated divider */}
      <div className="border-t border-dashed border-navy-600 mx-2" />

      {/* Details stub */}
      <div className="p-4 space-y-3">
        {/* Date range */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600 block">
              Depart
            </span>
            <span className="text-xs font-mono font-semibold text-amber-400">
              {formatDate(trip.startDate)}
            </span>
          </div>
          <div className="flex-1 mx-3 relative">
            <div className="border-t border-dashed border-slate-600" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400 text-xs">
              ✈
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600 block">
              Return
            </span>
            <span className="text-xs font-mono font-semibold text-amber-400">
              {formatDate(trip.endDate)}
            </span>
          </div>
        </div>

        {/* Cities */}
        {cityNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cityNames.map((name) => (
              <span
                key={name}
                className="text-[10px] tracking-wider uppercase font-mono text-slate-400 bg-navy-700/50 px-2 py-0.5 rounded"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Budget hint */}
        {budgetValue > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-navy-700">
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600">
              Budget
            </span>
            <span className="text-xs font-mono font-semibold text-cream">
              ₹{budgetValue.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="inline-block mb-6">
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl"
        >
          🛫
        </motion.div>
      </div>
      <h3 className="font-display text-2xl text-cream mb-2">No trips yet</h3>
      <p className="text-sm text-slate-500 font-mono max-w-sm mx-auto mb-8">
        Your departure board is empty. Plan your first adventure and watch it come to life.
      </p>
      <Link
        to="/trips/new"
        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase px-6 py-3 rounded transition-colors"
      >
        <span>+</span> Plan First Trip
      </Link>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="ticket-card rounded-lg animate-pulse">
          <div className="h-32 bg-navy-700" />
          <div className="border-t border-dashed border-navy-600 mx-2" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="h-2 w-12 bg-navy-700 rounded" />
                <div className="h-3 w-20 bg-navy-700 rounded" />
              </div>
              <div className="space-y-1 text-right">
                <div className="h-2 w-12 bg-navy-700 rounded ml-auto" />
                <div className="h-3 w-20 bg-navy-700 rounded" />
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="h-4 w-16 bg-navy-700 rounded" />
              <div className="h-4 w-14 bg-navy-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { trips, fetchTrips, fetchCities, isLoading } = useTripStore();
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedSpotlightCity, setSelectedSpotlightCity] = useState(null);
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
  const [aiWizardDestination, setAiWizardDestination] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4;
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchCities();
  }, [fetchTrips, fetchCities]);

  useEffect(() => {
    api.getDashboardSummary()
      .then(({ data }) => setDashboardData(data))
      .catch((err) => console.warn('Could not load dashboard summary', err));
  }, []);

  // Fetch aggregate budget for trips
  useEffect(() => {
    const fetchBudgets = async () => {
      let totalSpent = 0;
      let totalBudget = 0;
      for (const trip of trips) {
        try {
          const { data } = await api.getBudget(trip.id);
          totalSpent += data.totalEstimatedCost || 0;
          totalBudget += data.targetBudget || trip.targetBudget || 0;
        } catch {
          // skip
        }
      }
      setBudgetSummary({ totalSpent, totalBudget });
    };
    if (trips.length > 0) fetchBudgets();
  }, [trips]);

  const now = new Date();
  const upcoming = trips.filter((t) => new Date(t.startDate) > now);
  const recent = trips.filter((t) => new Date(t.startDate) <= now);

  return (
    <div className="relative space-y-10 min-h-screen">
      {/* ── Fixed Looping Background Video ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedMetadata={(e) => {
            e.target.playbackRate = 0.6;
          }}
          onPlay={(e) => {
            e.target.playbackRate = 0.6;
          }}
          className="w-full h-full object-cover opacity-80 scale-105"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/50 to-navy-950/80" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 space-y-10">
        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-1"
            >
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60">
                Welcome back
              </span>
              <div className="h-px flex-1 bg-navy-700 max-w-[80px]" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl text-cream"
            >
              {user?.name || 'Traveler'}
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase px-5 py-3 rounded transition-colors group"
            >
              <span className="text-base group-hover:rotate-90 transition-transform">+</span>
              Plan New Trip
            </Link>
          </motion.div>
        </div>

        {/* ── Travel Metrics Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-navy-900/80 backdrop-blur-md border border-navy-700/80 rounded-lg p-5 shadow-lg">
            <span className="block text-3xl font-display text-amber-400 mb-1">
              {dashboardData?.totalTrips !== undefined ? dashboardData.totalTrips : trips.length}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400">Total Trips Planned</span>
          </div>
          <div className="bg-navy-900/80 backdrop-blur-md border border-navy-700/80 rounded-lg p-5 shadow-lg">
            <span className="block text-3xl font-display text-amber-400 mb-1">
              ₹{(dashboardData?.totalEstimatedSpendUsd ? Math.round(dashboardData.totalEstimatedSpendUsd * 83) : (budgetSummary?.totalSpent || 0)).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400">Estimated Total Spend</span>
          </div>
          <div className="bg-navy-900/80 backdrop-blur-md border border-navy-700/80 rounded-lg p-5 shadow-lg">
            <span className="block text-3xl font-display text-amber-400 mb-1">
              {dashboardData?.totalDestinations !== undefined ? dashboardData.totalDestinations : 0}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400">Destinations Visited</span>
          </div>
        </div>

        {/* ── Budget Summary Bar ── */}
        {budgetSummary && budgetSummary.totalBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-navy-900/80 backdrop-blur-md border border-navy-700/80 rounded-lg p-5 shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500">
                Total Spend Across All Trips
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-600">
                {trips.length} trip{trips.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-2xl font-mono font-bold text-cream">
                ₹{budgetSummary.totalSpent.toLocaleString('en-IN')}
              </span>
              <span className="text-sm font-mono text-slate-500">
                / ₹{budgetSummary.totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)}%`,
                }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  budgetSummary.totalSpent > budgetSummary.totalBudget
                    ? 'bg-danger'
                    : 'bg-amber-400'
                }`}
              />
            </div>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {isLoading && <LoadingSkeleton />}

        {/* ── Empty State ── */}
        {!isLoading && trips.length === 0 && <EmptyState />}

        {/* ── Upcoming Trips ── */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-[11px] tracking-[0.25em] uppercase font-mono text-amber-400 font-semibold">
                Upcoming Departures
              </h2>
              <div className="h-px flex-1 bg-navy-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Trips ── */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[11px] tracking-[0.25em] uppercase font-mono text-slate-500 font-semibold">
                Past Journeys
              </h2>
              <div className="h-px flex-1 bg-navy-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((trip, i) => (
                <TripCard key={trip.id} trip={trip} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── Popular Destinations ── */}
        {dashboardData && dashboardData.popularDestinations && dashboardData.popularDestinations.length > 0 && (
          <section className="pt-6">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-[11px] tracking-[0.25em] uppercase font-mono text-slate-500 font-semibold">
                Trending Destinations
              </h2>
              <div className="h-px flex-1 bg-navy-800" />
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
              {dashboardData.popularDestinations.map((city) => (
                <div
                  key={city.id}
                  onClick={() => setSelectedSpotlightCity(city)}
                  className="min-w-[240px] snap-center rounded-lg overflow-hidden border border-navy-700 hover:border-amber-400/50 group relative cursor-pointer shadow-lg transition-all"
                >
                  <div className="h-44 w-full relative">
                    <img
                      src={city.imageUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800'}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent opacity-90" />
                    <div className="absolute top-3 right-3 bg-navy-900/80 backdrop-blur-sm border border-navy-700 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400">
                      ★ {city.popularity || 95}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="block text-lg font-display text-cream drop-shadow-md group-hover:text-amber-400 transition-colors">
                        {city.name}
                      </span>
                      <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400">
                        {city.country}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Interactive Destination Spotlight Modal ── */}
        <AnimatePresence>
          {selectedSpotlightCity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
              onClick={() => setSelectedSpotlightCity(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="ticket-card max-w-lg w-full rounded-xl overflow-hidden shadow-2xl bg-navy-900 border border-navy-600"
              >
                {/* Header Image */}
                <div className="h-48 w-full relative">
                  <img
                    src={selectedSpotlightCity.imageUrl}
                    alt={selectedSpotlightCity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
                  <button
                    onClick={() => setSelectedSpotlightCity(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-navy-950/70 border border-navy-700 text-slate-300 hover:text-cream flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-4 left-6">
                    <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-400 font-bold block">
                      {selectedSpotlightCity.region} • {selectedSpotlightCity.country}
                    </span>
                    <h2 className="text-3xl font-display text-cream">
                      {selectedSpotlightCity.name}
                    </h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-navy-950 p-3.5 rounded border border-navy-800">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">Popularity Index</span>
                      <span className="text-sm font-mono text-cream font-bold">★ {selectedSpotlightCity.popularity || 95} / 100</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500 block">Cost Index</span>
                      <span className="text-sm font-mono text-amber-400 font-bold">
                        {selectedSpotlightCity.costIndex ? `Level ${selectedSpotlightCity.costIndex}x` : 'Moderate'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-slate-300 leading-relaxed">
                    Ready to explore {selectedSpotlightCity.name}? Synthesize a full day-by-day smart itinerary using the AI Wizard, or craft your personalized custom itinerary from scratch.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setAiWizardDestination(`${selectedSpotlightCity.name}, ${selectedSpotlightCity.country}`);
                        setIsAiWizardOpen(true);
                        setSelectedSpotlightCity(null);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs tracking-wider uppercase py-3 rounded text-center transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>✨</span> AI Generate Trip
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/trips/new?destination=${encodeURIComponent(selectedSpotlightCity.name + ', ' + selectedSpotlightCity.country)}&image=${encodeURIComponent(selectedSpotlightCity.imageUrl || '')}`);
                        setSelectedSpotlightCity(null);
                      }}
                      className="flex-1 bg-navy-800 hover:bg-navy-700 text-amber-400 border border-amber-400/40 hover:border-amber-400 font-mono font-bold text-xs tracking-wider uppercase py-3 rounded text-center transition-colors"
                    >
                      + Custom Trip
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Wizard Modal with pre-filled destination */}
        <AiWizardModal
          isOpen={isAiWizardOpen}
          onClose={() => {
            setIsAiWizardOpen(false);
            setAiWizardDestination('');
          }}
          initialDestination={aiWizardDestination}
        />
      </div>
    </div>
  );
}

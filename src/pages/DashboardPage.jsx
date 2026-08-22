/**
 * DashboardPage — Welcome screen with trip cards and budget highlight.
 *
 * Layout: Welcome header, upcoming trip cards (boarding-pass stubs),
 * quick budget bar, and a prominent "Plan New Trip" CTA.
 */

import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';
import * as api from '../services/api';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

const getDaysUntil = (dateStr) => {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

function TripCard({ trip, index }) {
  const navigate = useNavigate();
  const cityStore = useTripStore();
  const [stops, setStops] = useState([]);

  useEffect(() => {
    api.getTripStops(trip.id).then(({ data }) => setStops(data));
  }, [trip.id]);

  const daysUntil = getDaysUntil(trip.startDate);
  const isUpcoming = daysUntil > 0;
  const cityNames = stops.map((s) => cityStore.getCityById(s.cityId)?.name).filter(Boolean);

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
        {trip.budget && (
          <div className="flex items-center justify-between pt-2 border-t border-navy-700">
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600">
              Budget
            </span>
            <span className="text-xs font-mono font-semibold text-cream">
              ₹{trip.budget.toLocaleString('en-IN')}
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
  const { trips, fetchTrips, isLoading } = useTripStore();
  const [budgetSummary, setBudgetSummary] = useState(null);
  const videoRef = useRef(null);

  // Slow down video playback speed (0.4 = 40% speed for smooth slow-mo motion)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.4;
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchTrips(user.id);
    }
  }, [user?.id, fetchTrips]);

  // Fetch aggregate budget for all trips
  useEffect(() => {
    const fetchBudgets = async () => {
      let totalSpent = 0;
      let totalBudget = 0;
      for (const trip of trips) {
        try {
          const { data } = await api.getBudget(trip.id);
          totalSpent += data.total;
          totalBudget += data.budget;
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
        {/* Balanced overlay gradient — video is clearly visible while text stays 100% readable */}
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
      </div>
    </div>
  );
}

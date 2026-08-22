/**
 * MyTripsPage — Grid/list of all user trips with view/edit/delete.
 *
 * Boarding-pass stub cards with cover images, trip details,
 * and action buttons. Toggle between grid and list views.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';
import * as api from '../services/api';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
};

function DeleteModal({ trip, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-navy-900 border border-navy-600 rounded-lg p-6 max-w-sm w-full"
      >
        <div className="text-center mb-6">
          <div className="text-3xl mb-3">⚠️</div>
          <h3 className="font-display text-xl text-cream mb-2">Cancel Boarding?</h3>
          <p className="text-sm text-slate-400">
            This will permanently delete{' '}
            <span className="font-semibold text-cream">"{trip.name}"</span> and
            its entire itinerary. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-xs tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-slate-500 rounded transition-colors"
          >
            Keep Trip
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-xs tracking-[0.15em] uppercase font-mono text-cream bg-danger hover:bg-danger-dark rounded transition-colors"
          >
            Delete Trip
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TripCardGrid({ trip, onDelete, index }) {
  const navigate = useNavigate();
  const getCityById = useTripStore((s) => s.getCityById);
  const [stops, setStops] = useState([]);

  useEffect(() => {
    api.getTripStops(trip.id).then(({ data }) => setStops(data));
  }, [trip.id]);

  const cityNames = stops.map((s) => getCityById(s.cityId)?.name).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="ticket-card rounded-lg overflow-hidden group"
    >
      {/* Cover */}
      <div className="h-36 relative overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-navy-700 flex items-center justify-center">
            <span className="text-4xl">🗺️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-lg text-cream truncate">{trip.name}</h3>
        </div>
        {trip.isPublic && (
          <span className="absolute top-3 right-3 text-[8px] tracking-[0.2em] uppercase font-mono font-bold bg-success/80 text-navy-950 px-2 py-0.5 rounded">
            Public
          </span>
        )}
      </div>

      {/* Perforated divider */}
      <div className="border-t border-dashed border-navy-600 relative">
        <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-navy-950" />
        <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-navy-950" />
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600 block">Dates</span>
            <span className="text-[11px] font-mono text-amber-400">
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600 block">Stops</span>
            <span className="text-sm font-mono font-bold text-cream">{stops.length}</span>
          </div>
        </div>

        {cityNames.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cityNames.map((name) => (
              <span key={name} className="text-[9px] tracking-wider uppercase font-mono text-slate-400 bg-navy-700/50 px-1.5 py-0.5 rounded">
                {name}
              </span>
            ))}
          </div>
        )}

        {trip.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{trip.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-navy-700">
          <button
            onClick={() => navigate(`/trips/${trip.id}/itinerary`)}
            className="flex-1 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 rounded transition-colors"
          >
            View
          </button>
          <button
            onClick={() => navigate(`/trips/${trip.id}/itinerary/edit`)}
            className="flex-1 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-slate-500 rounded transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(trip)}
            className="py-2 px-3 text-[10px] tracking-[0.15em] uppercase font-mono text-danger/70 border border-navy-600 hover:border-danger/30 hover:bg-danger/5 rounded transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TripCardList({ trip, onDelete, index }) {
  const navigate = useNavigate();
  const getCityById = useTripStore((s) => s.getCityById);
  const [stops, setStops] = useState([]);

  useEffect(() => {
    api.getTripStops(trip.id).then(({ data }) => setStops(data));
  }, [trip.id]);

  const cityNames = stops.map((s) => getCityById(s.cityId)?.name).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="ticket-card rounded-lg flex overflow-hidden group"
    >
      {/* Cover thumbnail */}
      <div className="w-32 sm:w-48 flex-shrink-0 relative overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-navy-700 flex items-center justify-center">
            <span className="text-2xl">🗺️</span>
          </div>
        )}
      </div>

      {/* Vertical perforated divider */}
      <div className="border-l border-dashed border-navy-600 relative">
        <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-navy-950" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-navy-950" />
      </div>

      {/* Details */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display text-lg text-cream truncate">{trip.name}</h3>
            {trip.isPublic && (
              <span className="text-[8px] tracking-[0.2em] uppercase font-mono font-bold bg-success/80 text-navy-950 px-2 py-0.5 rounded flex-shrink-0">
                Public
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
            <span className="text-[11px] font-mono text-amber-400">
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </span>
          </div>
          {cityNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {cityNames.map((name) => (
                <span key={name} className="text-[9px] tracking-wider uppercase font-mono text-slate-400 bg-navy-700/50 px-1.5 py-0.5 rounded">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => navigate(`/trips/${trip.id}/itinerary`)} className="py-1.5 px-3 text-[10px] tracking-[0.15em] uppercase font-mono text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 rounded transition-colors">View</button>
          <button onClick={() => navigate(`/trips/${trip.id}/itinerary/edit`)} className="py-1.5 px-3 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-slate-500 rounded transition-colors">Edit</button>
          <button onClick={() => navigate(`/trips/${trip.id}/budget`)} className="py-1.5 px-3 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-slate-500 rounded transition-colors">Budget</button>
          <button onClick={() => onDelete(trip)} className="py-1.5 px-3 text-[10px] tracking-[0.15em] uppercase font-mono text-danger/70 border border-navy-600 hover:border-danger/30 rounded transition-colors ml-auto">Delete</button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyTripsPage() {
  const { user } = useAuthStore();
  const { trips, fetchTrips, deleteTrip, isLoading } = useTripStore();
  const [viewMode, setViewMode] = useState('grid');
  const [deletingTrip, setDeletingTrip] = useState(null);

  useEffect(() => {
    if (user?.id) fetchTrips(user.id);
  }, [user?.id, fetchTrips]);

  const handleDelete = async () => {
    if (deletingTrip) {
      await deleteTrip(deletingTrip.id);
      setDeletingTrip(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
            Your Journeys
          </span>
          <h1 className="font-display text-3xl text-cream">My Trips</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border border-navy-700 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-[10px] tracking-wider uppercase font-mono transition-colors ${
                viewMode === 'grid' ? 'bg-amber-400/10 text-amber-400' : 'text-slate-500 hover:text-cream'
              }`}
            >
              ▦ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-[10px] tracking-wider uppercase font-mono transition-colors ${
                viewMode === 'list' ? 'bg-amber-400/10 text-amber-400' : 'text-slate-500 hover:text-cream'
              }`}
            >
              ☰ List
            </button>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.15em] uppercase px-4 py-2 rounded transition-colors"
          >
            <span>+</span> New Trip
          </Link>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin text-amber-400 text-2xl mb-3">✈</div>
          <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">Loading trips...</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && trips.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            🧳
          </motion.div>
          <h3 className="font-display text-2xl text-cream mb-2">No trips yet</h3>
          <p className="text-sm text-slate-500 mb-6">Time to pack your bags!</p>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase px-6 py-3 rounded transition-colors"
          >
            <span>+</span> Plan First Trip
          </Link>
        </motion.div>
      )}

      {/* Grid view */}
      {!isLoading && trips.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, i) => (
            <TripCardGrid key={trip.id} trip={trip} index={i} onDelete={setDeletingTrip} />
          ))}
        </div>
      )}

      {/* List view */}
      {!isLoading && trips.length > 0 && viewMode === 'list' && (
        <div className="space-y-4">
          {trips.map((trip, i) => (
            <TripCardList key={trip.id} trip={trip} index={i} onDelete={setDeletingTrip} />
          ))}
        </div>
      )}

      {/* Delete modal */}
      <AnimatePresence>
        {deletingTrip && (
          <DeleteModal
            trip={deletingTrip}
            onConfirm={handleDelete}
            onCancel={() => setDeletingTrip(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

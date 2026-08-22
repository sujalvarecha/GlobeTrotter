/**
 * ItineraryBuilderPage — Add stops, add activities, reorder via drag-and-drop.
 *
 * Left column: stops list with drag handles (@dnd-kit).
 * Each stop expands to show activities and an "add activity" dropdown.
 * Inline city search for adding new stops.
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTripStore from '../store/tripStore';
import * as api from '../services/api';

const formatDate = (dateStr) => {
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

// ─── Sortable Stop Item ──────────────────────────────────
function SortableStop({ stop, isExpanded, onToggle, onRemove, city, activities, tripActivities, onAddActivity, onRemoveActivity }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`ticket-card rounded-lg overflow-hidden ${isDragging ? 'ring-2 ring-amber-400/50' : ''}`}>
      {/* Stop header */}
      <div className="flex items-center gap-3 p-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors touch-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>

        {/* Stop order badge */}
        <div className="w-7 h-7 rounded bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-mono font-bold text-amber-400">{stop.stopOrder}</span>
        </div>

        {/* City info */}
        <div className="flex-1 min-w-0" onClick={onToggle}>
          <h3 className="font-display text-base text-cream truncate cursor-pointer hover:text-amber-400 transition-colors">
            {city?.name || 'Unknown City'}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>{city?.country}</span>
            {stop.startDate && stop.endDate && (
              <>
                <span>•</span>
                <span className="text-amber-400/60">
                  {formatDate(stop.startDate)} — {formatDate(stop.endDate)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Activity count */}
        <span className="text-[10px] font-mono text-slate-600">
          {(tripActivities || []).length} act.
        </span>

        {/* Expand/collapse */}
        <button onClick={onToggle} className="text-slate-500 hover:text-cream transition-colors">
          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Remove */}
        <button onClick={onRemove} className="text-slate-600 hover:text-danger transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-dashed border-navy-600 mx-4" />
            <div className="p-4 space-y-3">
              {/* Activity list */}
              {(tripActivities || []).length > 0 ? (
                <div className="space-y-2">
                  {tripActivities.map((ta) => {
                    const act = activities.find((a) => a.id === ta.activityId);
                    if (!act) return null;
                    const cat = CATEGORIES[act.category] || CATEGORIES.sightseeing;
                    return (
                      <div
                        key={ta.id}
                        className="flex items-center gap-3 bg-navy-950/50 rounded px-3 py-2 group/act"
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-cream truncate block">{act.name}</span>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                            {ta.startTime && <span>{ta.startTime}–{ta.endTime}</span>}
                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${cat.color}`}>
                              {act.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-amber-400/80">
                          ₹{act.estimatedCost.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => onRemoveActivity(ta.id, stop.id)}
                          className="opacity-0 group-hover/act:opacity-100 text-slate-600 hover:text-danger transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-xs font-mono text-slate-600">
                  No activities yet — add some below
                </div>
              )}

              {/* Add activity dropdown */}
              <AddActivityWidget
                cityId={stop.cityId}
                allActivities={activities}
                existingIds={(tripActivities || []).map((ta) => ta.activityId)}
                stopId={stop.id}
                stopStartDate={stop.startDate}
                onAdd={onAddActivity}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Add Activity Widget ─────────────────────────────────
function AddActivityWidget({ cityId, allActivities, existingIds, stopId, stopStartDate, onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const cityActivities = allActivities
    .filter((a) => a.cityId === cityId && !existingIds.includes(a.id))
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = async (activity) => {
    await onAdd(stopId, {
      activityId: activity.id,
      date: stopStartDate || '',
      startTime: '09:00',
      endTime: `${Math.floor(9 + activity.duration / 60).toString().padStart(2, '0')}:${(activity.duration % 60).toString().padStart(2, '0')}`,
      notes: '',
    });
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 border border-dashed border-navy-600 hover:border-amber-400/40 rounded text-[10px] tracking-[0.15em] uppercase font-mono text-slate-500 hover:text-amber-400 transition-colors"
      >
        + Add Activity
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="bg-navy-950 border border-navy-600 rounded overflow-hidden">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activities..."
                autoFocus
                className="w-full bg-transparent border-b border-navy-700 px-3 py-2 text-xs text-cream placeholder:text-navy-500 focus:outline-none font-mono"
              />
              <div className="max-h-48 overflow-y-auto">
                {cityActivities.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[10px] font-mono text-slate-600">
                    No activities found for this city
                  </div>
                ) : (
                  cityActivities.map((act) => {
                    const cat = CATEGORIES[act.category] || CATEGORIES.sightseeing;
                    return (
                      <button
                        key={act.id}
                        onClick={() => handleAdd(act)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-navy-800 transition-colors text-left"
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-cream truncate block">{act.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${cat.color}`}>
                            {act.category}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-mono text-amber-400/80 block">
                            ₹{act.estimatedCost.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] font-mono text-slate-600">
                            {Math.floor(act.duration / 60)}h{act.duration % 60 > 0 ? ` ${act.duration % 60}m` : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Add Stop Widget ─────────────────────────────────────
function AddStopWidget({ cities, existingCityIds, tripId, tripStartDate, tripEndDate, onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const available = cities
    .filter((c) => !existingCityIds.includes(c.id))
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
    );

  const handleAdd = async (city) => {
    await onAdd(tripId, {
      cityId: city.id,
      startDate: tripStartDate || '',
      endDate: tripEndDate || '',
    });
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 border-2 border-dashed border-navy-700 hover:border-amber-400/40 rounded-lg text-xs tracking-[0.15em] uppercase font-mono text-slate-500 hover:text-amber-400 transition-colors"
      >
        + Add City Stop
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities..."
                autoFocus
                className="w-full bg-transparent border-b border-navy-700 px-4 py-3 text-sm text-cream placeholder:text-navy-500 focus:outline-none font-mono"
              />
              <div className="max-h-64 overflow-y-auto">
                {available.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs font-mono text-slate-600">
                    {search ? 'No cities match your search' : 'All cities already added'}
                  </div>
                ) : (
                  available.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleAdd(city)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-navy-800 transition-colors text-left"
                    >
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-cream block">{city.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {city.country} • {city.region}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-mono text-amber-400/60 block">
                          Cost Index: {city.costIndex}/10
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function ItineraryBuilderPage() {
  const { tripId } = useParams();
  const {
    currentTrip,
    fetchTrip,
    tripStops,
    fetchTripStops,
    addStop,
    removeStop,
    reorderStops,
    cities,
    fetchCities,
    tripActivities,
    addActivity,
    removeActivity,
    getCityById,
    isLoading,
    activities: allActivities,
    fetchAllActivities
  } = useTripStore();

  const [expandedStops, setExpandedStops] = useState({});

  useEffect(() => {
    fetchTrip(tripId);
    fetchTripStops(tripId);
    fetchCities();
    fetchAllActivities();
  }, [tripId, fetchTrip, fetchTripStops, fetchCities, fetchAllActivities]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tripStops.findIndex((s) => s.id === active.id);
      const newIndex = tripStops.findIndex((s) => s.id === over.id);
      const newOrder = arrayMove(tripStops, oldIndex, newIndex);
      reorderStops(tripId, newOrder.map((s) => s.id));
    }
  };

  const toggleStop = (stopId) => {
    setExpandedStops((prev) => ({ ...prev, [stopId]: !prev[stopId] }));
  };

  const handleRemoveStop = async (stopId) => {
    await removeStop(stopId);
  };

  const existingCityIds = tripStops.map((s) => s.cityId);

  // Calculate total cost
  const totalCost = useMemo(() => {
    let total = 0;
    Object.values(tripActivities).forEach((acts) => {
      acts.forEach((ta) => {
        const act = allActivities.find((a) => a.id === ta.activityId);
        if (act) total += act.estimatedCost;
      });
    });
    return total;
  }, [tripActivities, allActivities]);

  if (isLoading && !currentTrip) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-amber-400 text-2xl mb-3">✈</div>
        <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">Loading itinerary...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
            Building Itinerary
          </span>
          <h1 className="font-display text-3xl text-cream">
            {currentTrip?.name || 'Trip'}
          </h1>
          {currentTrip && (
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-500">
              <span>{formatDate(currentTrip.startDate)} — {formatDate(currentTrip.endDate)}</span>
              <span>•</span>
              <span>{tripStops.length} stop{tripStops.length !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className="text-amber-400/80">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/trips/${tripId}/itinerary`}
            className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-slate-500 rounded transition-colors"
          >
            View Itinerary
          </Link>
          <Link
            to={`/trips/${tripId}/budget`}
            className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 rounded transition-colors"
          >
            Budget →
          </Link>
        </div>
      </div>

      {/* Route visualization */}
      {tripStops.length > 1 && (
        <div className="mb-6 bg-navy-900/50 rounded-lg p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {tripStops.map((stop, i) => {
              const city = getCityById(stop.cityId);
              return (
                <div key={stop.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-mono font-bold text-amber-400">{city?.name}</span>
                    <span className="text-[9px] font-mono text-slate-600">{city?.country}</span>
                  </div>
                  {i < tripStops.length - 1 && (
                    <div className="mx-3 flex items-center">
                      <div className="w-12 border-t border-dashed border-amber-400/40" />
                      <span className="text-amber-400/60 text-xs -ml-1">✈</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stops list with DnD */}
      <div className="space-y-4 mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tripStops.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {tripStops.map((stop) => {
              const city = getCityById(stop.cityId);
              return (
                <SortableStop
                  key={stop.id}
                  stop={stop}
                  city={city}
                  isExpanded={expandedStops[stop.id]}
                  onToggle={() => toggleStop(stop.id)}
                  onRemove={() => handleRemoveStop(stop.id)}
                  activities={allActivities}
                  tripActivities={tripActivities[stop.id] || []}
                  onAddActivity={addActivity}
                  onRemoveActivity={removeActivity}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add stop */}
      <AddStopWidget
        cities={cities}
        existingCityIds={existingCityIds}
        tripId={tripId}
        tripStartDate={currentTrip?.startDate}
        tripEndDate={currentTrip?.endDate}
        onAdd={addStop}
      />
    </div>
  );
}

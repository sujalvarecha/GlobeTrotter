/**
 * CreateTripPage — Form styled as filling out a boarding pass.
 *
 * Fields: name, dates, description, cover image, optional budget.
 * Submitting creates the trip and navigates to the itinerary builder.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useTripStore from '../store/tripStore';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createTrip, isLoading } = useTripStore();

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      setCoverImage(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tripData = {
      userId: user.id,
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      coverImage: coverImage || '',
      budget: form.budget ? parseInt(form.budget, 10) : 0,
    };
    const created = await createTrip(tripData);
    if (created) {
      navigate(`/trips/${created.id}/itinerary/edit`);
    }
  };

  const totalDays =
    form.startDate && form.endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(form.endDate) - new Date(form.startDate)) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
          New Boarding Pass
        </span>
        <h1 className="font-display text-3xl text-cream">Plan Your Trip</h1>
      </motion.div>

      {/* Form card — boarding pass shape */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden"
      >
        {/* Cover image zone */}
        <div className="relative h-48 bg-navy-800 overflow-hidden group">
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="text-3xl text-slate-600">📷</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-600">
                Cover Image (Optional)
              </span>
            </div>
          )}
          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-navy-950/0 hover:bg-navy-950/60 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <span className="text-xs font-mono text-cream opacity-0 group-hover:opacity-100 transition-opacity bg-navy-800/80 px-4 py-2 rounded">
              {coverPreview ? 'Change Image' : 'Upload Cover'}
            </span>
          </label>
        </div>

        {/* Perforated divider */}
        <div className="border-t border-dashed border-navy-600 relative">
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-navy-950" />
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-navy-950" />
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Trip name */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
              Trip Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. East Asia Explorer"
              className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-cream font-display text-lg placeholder:text-navy-500 placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
                Departure Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
                Return Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                min={form.startDate}
                className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Duration indicator */}
          {totalDays > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-3 bg-amber-400/5 border border-amber-400/20 rounded px-4 py-2"
            >
              <span className="text-amber-400 text-sm">✈</span>
              <span className="text-xs font-mono text-amber-400">
                {totalDays} day{totalDays !== 1 ? 's' : ''} journey
              </span>
            </motion.div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="What's this trip about?"
              className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream placeholder:text-navy-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none font-sans"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
              Budget (₹) — Optional
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
                ₹
              </span>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="150000"
                min="0"
                className="w-full bg-navy-950 border border-navy-600 rounded pl-8 pr-4 py-3 text-sm text-cream font-mono placeholder:text-navy-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase py-3.5 rounded transition-all disabled:opacity-50 relative overflow-hidden group"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Trip & Build Itinerary →'
              )}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

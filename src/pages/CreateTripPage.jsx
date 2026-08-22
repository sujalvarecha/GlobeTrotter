/**
 * CreateTripPage — Form styled as filling out a boarding pass.
 *
 * Fields: name, dates, description, cover image, optional budget.
 * Submitting creates the trip and navigates to the itinerary builder.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useTripStore from '../store/tripStore';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createTrip, isLoading, error } = useTripStore();

  const destParam = searchParams.get('destination');
  const imgParam = searchParams.get('image');

  const [form, setForm] = useState({
    name: destParam ? `Journey to ${destParam}` : '',
    description: destParam ? `Exciting voyage exploring ${destParam}` : '',
    startDate: '',
    endDate: '',
    budget: '',
    coverImage: imgParam || '',
  });
  const [coverPreview, setCoverPreview] = useState(imgParam || null);
  const [useUrlInput, setUseUrlInput] = useState(!!imgParam);

  useEffect(() => {
    if (destParam && !form.name) {
      setForm((prev) => ({
        ...prev,
        name: `Journey to ${destParam}`,
        description: `Exciting voyage exploring ${destParam}`,
      }));
    }
    if (imgParam && !form.coverImage) {
      setForm((prev) => ({ ...prev, coverImage: imgParam }));
      setCoverPreview(imgParam);
      setUseUrlInput(true);
    }
  }, [destParam, imgParam]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Compress & resize image to max 1200px
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCoverPreview(compressedDataUrl);
          setForm((prev) => ({ ...prev, coverImage: compressedDataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tripData = {
      name: form.name,
      description: form.description,
      startDate: form.startDate,
      endDate: form.endDate,
      coverImage: form.coverImage || coverPreview || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200',
      targetBudget: form.budget ? parseFloat(form.budget) : 0.0,
    };
    const created = await createTrip(tripData);
    if (created && created.id) {
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
          ) + 1
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
        className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden shadow-2xl"
      >
        {/* Cover image zone */}
        <div className="relative h-48 bg-navy-800 overflow-hidden group">
          {coverPreview || form.coverImage ? (
            <img
              src={coverPreview || form.coverImage}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="text-3xl text-slate-600">📷</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500">
                Upload Custom Photo or Choose Web Image
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
            <span className="text-xs font-mono text-cream opacity-0 group-hover:opacity-100 transition-opacity bg-navy-800/90 px-4 py-2 rounded shadow-lg">
              {coverPreview || form.coverImage ? 'Change Image' : 'Upload From Computer'}
            </span>
          </label>
        </div>

        {/* Optional Image URL Toggle */}
        <div className="px-6 py-2 bg-navy-950/80 border-b border-navy-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setUseUrlInput(!useUrlInput)}
            className="text-[10px] font-mono text-amber-400/80 hover:text-amber-400 tracking-wider uppercase underline"
          >
            {useUrlInput ? '✕ Hide Image URL' : '🔗 Or Paste Online Image URL'}
          </button>
        </div>

        {useUrlInput && (
          <div className="p-4 bg-navy-950/90 border-b border-navy-800">
            <input
              type="url"
              name="coverImage"
              value={form.coverImage}
              onChange={(e) => {
                handleChange(e);
                setCoverPreview(e.target.value);
              }}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-xs text-cream font-mono placeholder:text-navy-600 focus:border-amber-400 focus:outline-none"
            />
          </div>
        )}

        {/* Perforated divider */}
        <div className="border-t border-dashed border-navy-600 relative">
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-navy-950" />
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-navy-950" />
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-xs font-mono p-3 rounded">
              ⚠ {error}
            </div>
          )}

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
              placeholder="e.g. Grand Tour of India & Japan"
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
              Target Budget (₹) — Optional
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
              className="w-full bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase py-3.5 rounded transition-all disabled:opacity-50 relative overflow-hidden group shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Boarding Pass...
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

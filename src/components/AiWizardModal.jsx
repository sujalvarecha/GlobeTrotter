/**
 * AiWizardModal — AI Travel Assistant itinerary synthesizer.
 *
 * Connected to POST /api/ai/generate-itinerary with auto-persistence.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import useTripStore from '../store/tripStore';

export default function AiWizardModal({ isOpen, onClose, initialDestination = '' }) {
  const navigate = useNavigate();
  const { fetchTrips } = useTripStore();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    destination: initialDestination || '',
    duration: 5,
    budget: 50000,
    tier: 'standard',
    interests: 'culture, food, sightseeing',
  });

  useEffect(() => {
    if (initialDestination) {
      setFormData((prev) => ({ ...prev, destination: initialDestination }));
    }
  }, [initialDestination]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.destination) return;
    setIsGenerating(true);
    setError(null);
    try {
      const interestsList = formData.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        destination: formData.destination,
        durationDays: parseInt(formData.duration, 10) || 5,
        targetBudget: parseFloat(formData.budget) || 50000,
        tier: formData.tier,
        interests: interestsList,
        saveToAccount: true, // auto-persists to Supabase DB
      };

      const { data } = await api.generateAiItinerary(payload);
      setResult(data);
      setStep(2);
      fetchTrips();
    } catch (err) {
      console.error('AI generation error', err);
      setError(err?.response?.data?.message || 'Failed to synthesize itinerary with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndView = () => {
    onClose();
    if (result?.tripId) {
      navigate(`/trips/${result.tripId}/itinerary`);
    } else {
      navigate('/trips');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-navy-900 border border-navy-700 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-navy-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-transparent">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-lg">✨</span>
              <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-purple-300 font-bold">
                AI Travel Wizard
              </h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-cream text-xl font-mono">
              ×
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-danger/10 border border-danger/30 text-danger text-xs font-mono p-3 rounded">
                ⚠ {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <p className="text-xs font-mono text-slate-300">
                  Where would you like to travel? I will compose a personalized, day-by-day itinerary with activities, cost estimates, and optimal routes.
                </p>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-1">
                    Destination (City or Region)
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Paris, Tokyo, Bali, Rome, London"
                    required
                    className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-1">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      min="1"
                      max="30"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-1">
                      Budget (₹ INR)
                    </label>
                    <input
                      type="number"
                      name="budget"
                      min="0"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-1">
                    Travel Style & Comfort
                  </label>
                  <select
                    name="tier"
                    value={formData.tier}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                  >
                    <option value="budget">Backpacker / Budget Tier</option>
                    <option value="standard">Standard / Comfort Tier</option>
                    <option value="luxury">Luxury / Premium Tier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-1">
                    Interests (comma separated)
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g. food, culture, adventure, nature, sightseeing"
                    className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.destination}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase py-3.5 rounded transition-all disabled:opacity-50 shadow-lg"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2 text-white">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Composing Itinerary...
                      </span>
                    ) : (
                      '✨ Generate Magic Itinerary'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🎉</span>
                  <h3 className="font-display text-2xl text-cream mb-1">Itinerary Ready!</h3>
                  <p className="text-xs font-mono text-slate-400">
                    {result.aiRecommendationsSummary || `Your ${result.durationDays}-day curated journey is generated and saved.`}
                  </p>
                </div>

                <div className="bg-navy-950 border border-navy-800 rounded-lg p-4 flex gap-4 shadow-md">
                  {result.coverImage && (
                    <img src={result.coverImage} alt={result.tripName} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-display text-purple-300 font-bold truncate">{result.tripName}</span>
                    <span className="block text-[10px] font-mono text-slate-400 mt-1">
                      {result.durationDays} Days • {result.plannedCities?.join(', ')}
                    </span>
                    <span className="block text-[10px] font-mono text-amber-400 mt-0.5 font-bold">
                      Est. Total: ₹{Math.round(result.totalEstimatedCostUsd * 83).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-navy-600 hover:bg-navy-800 text-slate-300 font-mono text-xs uppercase tracking-widest py-3 rounded transition-colors"
                  >
                    Customize
                  </button>
                  <button
                    onClick={handleSaveAndView}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold font-mono text-xs uppercase tracking-widest py-3 rounded transition-colors shadow-lg"
                  >
                    View Itinerary →
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

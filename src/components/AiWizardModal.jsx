import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import useTripStore from '../store/tripStore';

export default function AiWizardModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { addTrip } = useTripStore();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    destination: '',
    duration: 5,
    budget: 20000,
    tier: 'standard',
    interests: 'culture, food',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data } = await api.generateAiItinerary(formData);
      setResult(data);
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndView = async () => {
    // In our mock logic, we'll create the trip manually
    // The real backend would create the stops/activities automatically
    const trip = await addTrip({
      name: result.name,
      startDate: result.startDate,
      endDate: result.endDate,
      budget: result.budget,
      coverImage: result.imageUrl,
    });
    onClose();
    navigate(`/trips/${trip.id}/itinerary`);
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
              <span className="text-purple-400">✨</span>
              <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-purple-300 font-bold">
                AI Travel Wizard
              </h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-cream text-lg">
              ×
            </button>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div className="space-y-5">
                <p className="text-sm font-mono text-slate-300">
                  Tell me where you want to go, and I'll craft the perfect itinerary.
                </p>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-1">
                    Destination City / Country
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-1">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-1">
                      Budget (INR)
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-1">
                    Travel Style
                  </label>
                  <select
                    name="tier"
                    value={formData.tier}
                    onChange={handleChange}
                    className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                  >
                    <option value="budget">Backpacker / Budget</option>
                    <option value="standard">Standard / Comfort</option>
                    <option value="luxury">Luxury / Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-1">
                    Interests (comma separated)
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder="e.g. food, history, nightlife"
                    className="w-full bg-navy-950 border border-navy-700 rounded px-3 py-2 text-sm text-cream font-mono focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.destination}
                    className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-mono font-bold text-xs tracking-[0.2em] uppercase py-3 rounded transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating Magic...
                      </span>
                    ) : (
                      'Generate Magic Itinerary'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🎉</span>
                  <h3 className="font-display text-2xl text-cream mb-1">Trip Generated!</h3>
                  <p className="text-xs font-mono text-slate-400">
                    Your {formData.duration}-day AI crafted journey to {formData.destination} is ready.
                  </p>
                </div>

                <div className="bg-navy-950 border border-navy-800 rounded p-4 flex gap-4">
                  <img src={result.imageUrl} alt={result.name} className="w-16 h-16 rounded object-cover" />
                  <div>
                    <span className="block text-sm font-display text-purple-300">{result.name}</span>
                    <span className="block text-[10px] font-mono text-slate-500 mt-1">Starts: {result.startDate}</span>
                    <span className="block text-[10px] font-mono text-slate-500">Budget: ₹{result.budget.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-navy-600 hover:bg-navy-800 text-slate-300 font-mono text-xs uppercase tracking-widest py-3 rounded transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleSaveAndView}
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-navy-950 font-bold font-mono text-xs uppercase tracking-widest py-3 rounded transition-colors"
                  >
                    Save & View →
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

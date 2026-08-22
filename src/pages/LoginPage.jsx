/**
 * LoginPage — Boarding-pass style auth screen.
 *
 * Split layout: left panel is a decorative departure board,
 * right panel is the auth form styled as a boarding pass stub.
 * Tab toggle flips between Login and Signup with an animated underline.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';

const DESTINATIONS = [
  { code: 'TYO', city: 'TOKYO', status: 'ON TIME', gate: 'A12' },
  { code: 'CDG', city: 'PARIS', status: 'BOARDING', gate: 'B07' },
  { code: 'IST', city: 'ISTANBUL', status: 'ON TIME', gate: 'C23' },
  { code: 'CPT', city: 'CAPE TOWN', status: 'DELAYED', gate: 'D04' },
  { code: 'RAK', city: 'MARRAKECH', status: 'ON TIME', gate: 'E15' },
  { code: 'LIS', city: 'LISBON', status: 'BOARDING', gate: 'F09' },
  { code: 'EZE', city: 'BUENOS AIRES', status: 'ON TIME', gate: 'G31' },
  { code: 'JAI', city: 'JAIPUR', status: 'ON TIME', gate: 'H08' },
  { code: 'ICN', city: 'SEOUL', status: 'FINAL CALL', gate: 'A22' },
  { code: 'KEF', city: 'REYKJAVIK', status: 'ON TIME', gate: 'B14' },
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const { login, signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch {
      // Error is already set in the store
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormData({ name: '', email: '', password: '' });
    clearError();
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Amber accent strip */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ── Left: Departure Board ── */}
        <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-center items-center p-12 relative overflow-hidden">
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(rgba(245,166,35,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,166,35,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 w-full max-w-md">
            {/* Board header */}
            <div className="bg-navy-800 border border-navy-600 rounded-t-lg px-6 py-3 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400">
                Departures
              </span>
              <span className="text-[10px] tracking-[0.2em] font-mono text-slate-500">
                GlobeTrotter Intl.
              </span>
            </div>

            {/* Board rows */}
            <div className="bg-navy-800/60 border-x border-navy-600">
              {/* Column headers */}
              <div className="grid grid-cols-4 px-6 py-2 border-b border-navy-700">
                {['DEST', 'CITY', 'STATUS', 'GATE'].map((h) => (
                  <span
                    key={h}
                    className="text-[9px] tracking-[0.2em] font-mono text-slate-600 uppercase"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {DESTINATIONS.map((dest, i) => (
                <motion.div
                  key={dest.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="grid grid-cols-4 px-6 py-2.5 border-b border-navy-800 hover:bg-navy-700/30 transition-colors"
                >
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {dest.code}
                  </span>
                  <span className="text-xs font-mono text-cream truncate">
                    {dest.city}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold tracking-wider ${
                      dest.status === 'BOARDING'
                        ? 'text-success'
                        : dest.status === 'DELAYED'
                        ? 'text-danger'
                        : dest.status === 'FINAL CALL'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {dest.status}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {dest.gate}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Board footer */}
            <div className="bg-navy-800 border border-t-0 border-navy-600 rounded-b-lg px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] tracking-[0.15em] font-mono text-slate-500">
                  LIVE DEPARTURES — ALL TIMES LOCAL
                </span>
              </div>
            </div>
          </div>

          {/* Brand */}
          <div className="mt-12 text-center relative z-10">
            <h1 className="font-display text-4xl text-cream tracking-wide">
              GlobeTrotter
            </h1>
            <p className="text-[11px] tracking-[0.25em] uppercase font-mono text-amber-400/70 mt-2">
              Your boarding pass to adventure
            </p>
          </div>
        </div>

        {/* ── Right: Auth Form ── */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="lg:hidden text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded bg-amber-400 flex items-center justify-center text-navy-950 font-bold text-xl font-display">
                  G
                </div>
                <h1 className="font-display text-3xl text-cream tracking-wide">
                  GlobeTrotter
                </h1>
              </div>
              <p className="text-[11px] tracking-[0.25em] uppercase font-mono text-amber-400/70">
                Your boarding pass to adventure
              </p>
            </div>

            {/* Boarding pass card */}
            <div className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden">
              {/* Card header with perforated bottom */}
              <div className="bg-navy-800 px-8 pt-6 pb-5 border-b border-dashed border-navy-600">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-slate-500">
                    Passenger Access
                  </span>
                  <span className="text-[10px] tracking-[0.2em] font-mono text-amber-400/60">
                    GATE GT-01
                  </span>
                </div>

                {/* Tab toggle */}
                <div className="flex gap-0">
                  {['login', 'signup'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => switchTab(tab)}
                      className={`relative flex-1 py-3 text-xs tracking-[0.2em] uppercase font-mono transition-colors ${
                        activeTab === tab
                          ? 'text-amber-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab === 'login' ? 'Board' : 'Register'}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form body */}
              <div className="px-8 py-8">
                <AnimatePresence mode="wait">
                  <motion.form
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {activeTab === 'signup' && (
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="e.g. Arjun Mehta"
                          className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream font-mono placeholder:text-navy-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="traveler@example.com"
                        className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream font-mono placeholder:text-navy-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream font-mono placeholder:text-navy-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                      />
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-danger/10 border border-danger/30 rounded px-4 py-2.5 text-xs text-danger font-mono"
                        >
                          ⚠ {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase py-3.5 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : activeTab === 'login' ? (
                        'Board Now →'
                      ) : (
                        'Get Your Pass →'
                      )}
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                    </button>
                  </motion.form>
                </AnimatePresence>

                {/* Demo credentials hint */}
                <div className="mt-6 pt-5 border-t border-dashed border-navy-700">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-mono text-slate-600 text-center mb-2">
                    Demo Credentials
                  </p>
                  <div className="bg-navy-950/50 rounded px-4 py-3 space-y-1">
                    <p className="text-[11px] font-mono text-slate-400">
                      <span className="text-amber-400/60">EMAIL</span>{' '}
                      arjun@globetrotter.dev
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      <span className="text-amber-400/60">PASS</span>{' '}
                      password123
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom flourish */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-navy-800" />
              <span className="text-[9px] tracking-[0.3em] uppercase font-mono text-navy-600">
                ✈ Safe travels
              </span>
              <div className="h-px flex-1 bg-navy-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

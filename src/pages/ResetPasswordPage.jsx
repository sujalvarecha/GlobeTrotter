/**
 * ResetPasswordPage — Secure Password Reset screen accessed via email link.
 *
 * Route: /reset-password?token=<secure_token>
 */

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../store/themeStore';
import * as api from '../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await api.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid or expired password reset link. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6 relative">
      {/* Amber accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      {/* Top right Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-full bg-navy-900 border border-navy-700 text-amber-400 hover:border-amber-400/50 transition-colors shadow-md"
        >
          <span>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-amber-400 flex items-center justify-center text-navy-950 font-bold font-display text-sm">
              G
            </div>
            <span className="font-display text-2xl text-cream">GlobeTrotter</span>
          </Link>
          <p className="text-[10px] font-mono text-amber-400/80 tracking-[0.2em] uppercase">
            Account Security Portal
          </p>
        </div>

        {/* Ticket stub container */}
        <div className="ticket-card rounded-lg overflow-hidden shadow-2xl bg-navy-900 border border-navy-700">
          {/* Header */}
          <div className="p-6 pb-4 bg-navy-900 border-b border-navy-700 flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-400 font-bold">
              Secure Password Reset
            </span>
            <span className="text-[10px] tracking-[0.2em] font-mono text-slate-500">
              AUTH VERIFIED
            </span>
          </div>

          <div className="p-6 bg-navy-900/90">
            {!token ? (
              <div className="space-y-4 text-center">
                <div className="bg-danger/10 border border-danger/30 rounded p-4 text-xs font-mono text-danger">
                  ⚠ No reset token provided. Please click the exact reset link sent to your email.
                </div>
                <Link
                  to="/login"
                  className="inline-block bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-wider uppercase px-6 py-3 rounded transition-colors"
                >
                  ← Go to Login
                </Link>
              </div>
            ) : success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center py-4"
              >
                <div className="w-12 h-12 rounded-full bg-success/20 border border-success/40 text-success flex items-center justify-center text-2xl mx-auto">
                  ✓
                </div>
                <h3 className="text-lg font-display text-cream">Password Updated!</h3>
                <p className="text-xs font-mono text-slate-300">
                  Your new password is active. Redirecting you to Check In...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  Enter your new secure password below to regain access to your GlobeTrotter account.
                </p>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-1.5">
                    New Password (Min. 6 characters)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream font-mono placeholder:text-navy-500 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-navy-950 border border-navy-600 rounded px-4 py-3 text-sm text-cream font-mono placeholder:text-navy-500 focus:outline-none focus:border-amber-400 transition-all"
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
                  className="w-full bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase py-3.5 rounded transition-all disabled:opacity-50 shadow-lg"
                >
                  {isLoading ? 'Updating Password...' : 'Save New Password →'}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

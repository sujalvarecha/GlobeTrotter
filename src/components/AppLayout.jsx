/**
 * AppLayout — Boarding-pass style navigation shell.
 * 
 * Top bar styled as a departure board header with amber accent strip.
 * Navigation uses monospace, uppercase labels like airport signage.
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/trips', label: 'My Trips', icon: '✈' },
  { to: '/trips/new', label: 'New Trip', icon: '+' },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* ── Amber accent strip ── */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      {/* ── Navigation bar ── */}
      <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-md border-b border-navy-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded bg-amber-400 flex items-center justify-center text-navy-950 font-bold text-lg font-display shadow-md group-hover:scale-105 transition-transform">
                G
              </div>
              <div>
                <span className="font-display text-xl text-cream font-bold tracking-wide group-hover:text-amber-400 transition-colors">
                  GlobeTrotter
                </span>
                <div className="text-[10px] tracking-[0.3em] uppercase text-amber-400 font-mono -mt-0.5">
                  Travel Planner
                </div>
              </div>
            </NavLink>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 text-xs tracking-[0.15em] uppercase font-mono font-semibold transition-all duration-200 rounded border ${
                      isActive
                        ? 'text-amber-400 border-amber-400/50 bg-amber-400/10 shadow-sm'
                        : 'text-slate-200 border-transparent hover:text-cream hover:bg-navy-800/80 hover:border-navy-600'
                    }`
                  }
                >
                  <span className="mr-1.5 text-amber-400/80">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User section */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-3 bg-navy-950/60 px-3 py-1.5 rounded-full border border-navy-700">
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-amber-400/50"
                  />
                  <span className="text-xs text-cream font-mono font-semibold">
                    {user.name}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-xs tracking-[0.15em] uppercase font-mono font-semibold text-slate-300 hover:text-danger transition-colors px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-navy-600 hover:border-danger/40 rounded"
              >
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-400 hover:text-cream"
              onClick={() => {
                const menu = document.getElementById('mobile-nav');
                menu?.classList.toggle('hidden');
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile nav */}
          <div id="mobile-nav" className="hidden md:hidden pb-4 space-y-1">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => document.getElementById('mobile-nav')?.classList.add('hidden')}
                className={({ isActive }) =>
                  `block px-4 py-2.5 text-xs tracking-[0.15em] uppercase font-mono transition-all border-l-2 ${
                    isActive
                      ? 'text-amber-400 border-amber-400 bg-amber-400/5'
                      : 'text-slate-400 border-transparent hover:text-cream hover:border-navy-500'
                  }`
                }
              >
                <span className="mr-2">{icon}</span>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-navy-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-navy-600">
            GlobeTrotter © 2026
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-navy-600">
            Boarding Pass #GT-2026
          </span>
        </div>
      </footer>
    </div>
  );
}

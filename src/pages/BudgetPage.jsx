/**
 * BudgetPage — Recharts pie + bar, category breakdown, daily spend, over-budget flag.
 *
 * All numbers in monospace ₹ formatting. Departure-board color scheme.
 */

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import useTripStore from '../store/tripStore';

const CATEGORY_COLORS = {
  transport: '#3B82F6',
  accommodation: '#8B5CF6',
  activities: '#F59E0B',
  food: '#EF4444',
  other: '#6B7280',
};

const CATEGORY_LABELS = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activities: 'Activities',
  food: 'Food & Drink',
  other: 'Other',
};

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
};

// Custom tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-800 border border-navy-600 rounded px-3 py-2">
        <p className="text-xs text-cream font-mono">{payload[0].name || payload[0].payload?.name}</p>
        <p className="text-xs text-amber-400 font-mono font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function BudgetPage() {
  const { tripId } = useParams();
  const { currentTrip, fetchTrip, budget, fetchBudget, isLoading } = useTripStore();

  useEffect(() => {
    fetchTrip(tripId);
    fetchBudget(tripId);
  }, [tripId, fetchTrip, fetchBudget]);

  if (isLoading || !budget) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-amber-400 text-2xl mb-3">✈</div>
        <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">Calculating budget...</p>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = Object.entries(budget.breakdown)
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => ({
      name: CATEGORY_LABELS[key] || key,
      value: val,
      color: CATEGORY_COLORS[key] || '#6B7280',
    }));

  // Prepare bar chart data (daily spend)
  const barData = Object.entries(budget.dailySpend)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      name: formatDateShort(date),
      amount,
      fullDate: date,
    }));

  // City spend data
  const cityData = Object.entries(budget.citySpend)
    .sort(([, a], [, b]) => b - a);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
            Budget Breakdown
          </span>
          <h1 className="font-display text-3xl text-cream">{currentTrip?.name || 'Trip'}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/trips/${tripId}/itinerary`}
            className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-slate-400 border border-navy-600 hover:border-slate-500 rounded transition-colors"
          >
            ← Itinerary
          </Link>
          <Link
            to={`/trips/${tripId}/itinerary/edit`}
            className="px-3 py-2 text-[10px] tracking-[0.15em] uppercase font-mono text-amber-400 border border-amber-400/30 hover:bg-amber-400/10 rounded transition-colors"
          >
            Edit Itinerary
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Estimated',
            value: formatCurrency(budget.total),
            highlight: true,
          },
          {
            label: 'Daily Average',
            value: formatCurrency(budget.averagePerDay),
          },
          {
            label: 'Trip Duration',
            value: `${budget.totalDays} days`,
          },
          {
            label: 'Budget',
            value: budget.budget > 0 ? formatCurrency(budget.budget) : 'Not set',
            alert: budget.isOverBudget,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-navy-900 border rounded-lg p-4 ${
              card.alert
                ? 'border-danger/40'
                : card.highlight
                ? 'border-amber-400/30'
                : 'border-navy-700'
            }`}
          >
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-600 block mb-1">
              {card.label}
            </span>
            <span
              className={`text-lg font-mono font-bold ${
                card.alert ? 'text-danger' : card.highlight ? 'text-amber-400' : 'text-cream'
              }`}
            >
              {card.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Over budget warning */}
      {budget.isOverBudget && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 bg-danger/5 border border-danger/30 rounded-lg p-4 flex items-center gap-3"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <span className="text-sm font-mono font-bold text-danger block">Over Budget</span>
            <span className="text-xs font-mono text-danger/70">
              You're ₹{(budget.total - budget.budget).toLocaleString('en-IN')} over your ₹{budget.budget.toLocaleString('en-IN')} budget
            </span>
          </div>
        </motion.div>
      )}

      {/* Budget progress bar */}
      {budget.budget > 0 && (
        <div className="mb-8 bg-navy-900 border border-navy-700 rounded-lg p-4">
          <div className="flex justify-between text-[10px] font-mono mb-2">
            <span className="text-slate-500">Budget Progress</span>
            <span className={budget.isOverBudget ? 'text-danger' : 'text-slate-400'}>
              {Math.round((budget.total / budget.budget) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (budget.total / budget.budget) * 100)}%`,
              }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${budget.isOverBudget ? 'bg-danger' : 'bg-amber-400'}`}
            />
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie chart — category breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-navy-900 border border-navy-700 rounded-lg p-5"
        >
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-4">
            Spend by Category
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => (
                    <span className="text-[10px] font-mono text-slate-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-xs font-mono text-slate-600">
              No spend data
            </div>
          )}
        </motion.div>

        {/* Bar chart — daily spend */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-navy-900 border border-navy-700 rounded-lg p-5"
        >
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-4">
            Daily Spend
          </h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2D4A" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#7B8A9E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1B2D4A' }}
                  tickLine={{ stroke: '#1B2D4A' }}
                />
                <YAxis
                  tick={{ fill: '#7B8A9E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1B2D4A' }}
                  tickLine={{ stroke: '#1B2D4A' }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#F5A623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-xs font-mono text-slate-600">
              No daily data
            </div>
          )}
        </motion.div>
      </div>

      {/* Category breakdown table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden mb-8"
      >
        <div className="px-5 py-3 border-b border-navy-700">
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-400">
            Category Details
          </h3>
        </div>
        <div className="divide-y divide-navy-800">
          {Object.entries(budget.breakdown).map(([cat, amount]) => {
            const pct = budget.total > 0 ? Math.round((amount / budget.total) * 100) : 0;
            return (
              <div key={cat} className="flex items-center gap-4 px-5 py-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                <span className="text-sm text-cream flex-1">
                  {CATEGORY_LABELS[cat]}
                </span>
                <div className="w-32 h-1.5 bg-navy-800 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CATEGORY_COLORS[cat],
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 w-10 text-right">
                  {pct}%
                </span>
                <span className="text-sm font-mono font-semibold text-cream w-24 text-right">
                  {formatCurrency(amount)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 px-5 py-3 bg-navy-800/50 border-t border-navy-700">
          <span className="text-sm font-semibold text-cream flex-1">Total</span>
          <span className="text-sm font-mono font-bold text-amber-400 w-24 text-right">
            {formatCurrency(budget.total)}
          </span>
        </div>
      </motion.div>

      {/* City breakdown */}
      {cityData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-navy-700">
            <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-400">
              Spend by City
            </h3>
          </div>
          <div className="divide-y divide-navy-800">
            {cityData.map(([cityName, amount]) => {
              const pct = budget.total > 0 ? Math.round((amount / budget.total) * 100) : 0;
              return (
                <div key={cityName} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-sm text-cream flex-1">{cityName}</span>
                  <div className="w-32 h-1.5 bg-navy-800 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 w-10 text-right">
                    {pct}%
                  </span>
                  <span className="text-sm font-mono font-semibold text-cream w-24 text-right">
                    {formatCurrency(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

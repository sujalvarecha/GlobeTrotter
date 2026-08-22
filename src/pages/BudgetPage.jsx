/**
 * BudgetPage — Recharts pie + bar, category breakdown, daily spend, over-budget flag.
 *
 * All numbers in monospace formatted with selected currency. Departure-board color scheme.
 */

import { useEffect, useState } from 'react';
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
  'Activities': '#F59E0B',
  'Accommodation': '#8B5CF6',
  'Food & Dining': '#EF4444',
  'Local Transport': '#3B82F6',
  'Other': '#6B7280',
};

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export default function BudgetPage() {
  const { tripId } = useParams();
  const { currentTrip, fetchTrip, budget, fetchBudget, isLoading } = useTripStore();
  const [currency, setCurrency] = useState('INR');
  const [tier, setTier] = useState('standard');

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId);
      fetchBudget(tripId, tier, currency);
    }
  }, [tripId, tier, currency, fetchTrip, fetchBudget]);

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return `${symbol}0`;
    const options = ['JPY', 'INR'].includes(currency)
      ? { maximumFractionDigits: 0 }
      : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    return `${symbol}${Number(val).toLocaleString('en-US', options)}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-800 border border-navy-600 rounded px-3 py-2 shadow-xl">
          <p className="text-xs text-cream font-mono font-medium">{payload[0].name}</p>
          <p className="text-xs text-amber-400 font-mono font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading || !budget) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin text-amber-400 text-2xl mb-3">✈</div>
        <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">Calculating live budget analytics...</p>
      </div>
    );
  }

  // Prepare pie chart data
  const pieData = Object.entries(budget.categoryBreakdown || {})
    .filter(([_, val]) => val > 0)
    .map(([key, val]) => ({
      name: key,
      value: val,
      color: CATEGORY_COLORS[key] || '#F5A623',
    }));

  // Prepare stop budgets data for bar chart
  const stopBarData = (budget.stopBudgets || []).map((stop) => ({
    name: stop.cityName,
    amount: stop.totalStopCost,
    activities: stop.activitiesCost,
    lodging: stop.accommodationCost,
    food: stop.foodCost,
    transport: stop.localTransportCost,
  }));

  const totalCost = budget.totalEstimatedCost || 0;
  const targetBudget = budget.targetBudget || currentTrip?.targetBudget || 0;
  const isOver = budget.isOverBudget || (targetBudget > 0 && totalCost > targetBudget);
  const diff = Math.abs(totalCost - targetBudget);

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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-navy-950 border border-navy-600 text-cream text-xs font-mono rounded px-3 py-1.5 focus:border-amber-400 focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="bg-navy-950 border border-navy-600 text-cream text-xs font-mono rounded px-3 py-1.5 focus:border-amber-400 focus:outline-none"
            >
              <option value="budget">Budget Tier</option>
              <option value="standard">Standard Tier</option>
              <option value="luxury">Luxury Tier</option>
            </select>
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
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Total Estimated Cost',
            value: formatCurrency(totalCost),
            highlight: true,
          },
          {
            label: 'Daily Average',
            value: formatCurrency(budget.averageCostPerDay),
          },
          {
            label: 'Trip Duration',
            value: `${budget.totalDays || 1} day${budget.totalDays !== 1 ? 's' : ''}`,
          },
          {
            label: 'Target Budget',
            value: targetBudget > 0 ? formatCurrency(targetBudget) : 'Not set',
            alert: isOver,
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-navy-900 border rounded-lg p-4 shadow-lg ${
              card.alert
                ? 'border-danger/40 bg-danger/5'
                : card.highlight
                ? 'border-amber-400/30'
                : 'border-navy-700'
            }`}
          >
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono text-slate-500 block mb-1">
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
      {isOver && targetBudget > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-center gap-3 shadow-lg"
        >
          <span className="text-xl">⚠️</span>
          <div>
            <span className="text-sm font-mono font-bold text-danger block">Over Target Budget</span>
            <span className="text-xs font-mono text-danger/80">
              Estimated total exceeds your target by {formatCurrency(diff)}.
            </span>
          </div>
        </motion.div>
      )}

      {/* Budget progress bar */}
      {targetBudget > 0 && (
        <div className="mb-8 bg-navy-900 border border-navy-700 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between text-[10px] font-mono mb-2">
            <span className="text-slate-400 uppercase tracking-wider">Budget Allocation</span>
            <span className={isOver ? 'text-danger font-bold' : 'text-slate-300'}>
              {Math.round((totalCost / targetBudget) * 100)}% Used
            </span>
          </div>
          <div className="h-3 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (totalCost / targetBudget) * 100)}%`,
              }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${isOver ? 'bg-danger' : 'bg-amber-400'}`}
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
          className="bg-navy-900 border border-navy-700 rounded-lg p-5 shadow-lg"
        >
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-4 font-semibold">
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
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#0f172a"
                  strokeWidth={2}
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
              No category spend data
            </div>
          )}
        </motion.div>

        {/* Bar chart — spend by city stop */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-navy-900 border border-navy-700 rounded-lg p-5 shadow-lg"
        >
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-400 mb-4 font-semibold">
            Spend by Destination Stop
          </h3>
          {stopBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stopBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B2D4A" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#7B8A9E', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#1B2D4A' }}
                  tickLine={{ stroke: '#1B2D4A' }}
                />
                <YAxis
                  tick={{ fill: '#7B8A9E', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#1B2D4A' }}
                  tickLine={{ stroke: '#1B2D4A' }}
                  tickFormatter={(v) => `${symbol}${Number(v).toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Total Stop Cost" fill="#F5A623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-xs font-mono text-slate-600">
              No destination stops added yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Category breakdown table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden mb-8 shadow-lg"
      >
        <div className="px-5 py-3 border-b border-navy-700 bg-navy-800/40">
          <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-300 font-semibold">
            Category Breakdown
          </h3>
        </div>
        <div className="divide-y divide-navy-800">
          {Object.entries(budget.categoryBreakdown || {}).map(([cat, amount]) => {
            const pct = totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0;
            return (
              <div key={cat} className="flex items-center gap-4 px-5 py-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] || '#F5A623' }}
                />
                <span className="text-sm text-cream flex-1 font-medium">
                  {cat}
                </span>
                <div className="w-32 h-1.5 bg-navy-950 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CATEGORY_COLORS[cat] || '#F5A623',
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 w-12 text-right">
                  {pct}%
                </span>
                <span className="text-sm font-mono font-semibold text-cream w-28 text-right">
                  {formatCurrency(amount)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 px-5 py-3 bg-navy-800/60 border-t border-navy-700">
          <span className="text-sm font-semibold text-cream flex-1">Total Estimated</span>
          <span className="text-base font-mono font-bold text-amber-400 w-28 text-right">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </motion.div>

      {/* Destination stops breakdown table */}
      {budget.stopBudgets && budget.stopBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-navy-900 border border-navy-700 rounded-lg overflow-hidden shadow-lg"
        >
          <div className="px-5 py-3 border-b border-navy-700 bg-navy-800/40">
            <h3 className="text-[11px] tracking-[0.2em] uppercase font-mono text-slate-300 font-semibold">
              Per-Stop Breakdown
            </h3>
          </div>
          <div className="divide-y divide-navy-800">
            {budget.stopBudgets.map((stop) => {
              const pct = totalCost > 0 ? Math.round((stop.totalStopCost / totalCost) * 100) : 0;
              return (
                <div key={stop.stopId} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5">
                  <div className="flex-1">
                    <span className="text-sm text-cream font-medium block">{stop.cityName}</span>
                    <span className="text-[10px] font-mono text-slate-500">{stop.country} • {stop.durationDays} days</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-[11px] font-mono text-slate-400 hidden md:block">
                      <span>Acts: {formatCurrency(stop.activitiesCost)} | Lodging: {formatCurrency(stop.accommodationCost)}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-navy-950 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono font-semibold text-amber-400 w-24 text-right">
                      {formatCurrency(stop.totalStopCost)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

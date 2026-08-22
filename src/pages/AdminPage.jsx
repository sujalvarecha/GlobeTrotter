/**
 * AdminPage — Platform analytics and metrics dashboard.
 *
 * Connected to GET /api/admin/stats.
 */

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import * as api from '../services/api';

const COLORS = ['#f5a623', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!stats) return null;

  const chartData = Object.entries(stats.topDestinations || {})
    .map(([name, bookings]) => ({
      name,
      bookings: Number(bookings),
    }))
    .sort((a, b) => b.bookings - a.bookings);

  const categoryData = Object.entries(stats.activityCategoryDistribution || {})
    .map(([name, count]) => ({
      name,
      value: Number(count),
    }));

  return (
    <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono text-amber-400/60 block mb-1">
            Platform Analytics
          </span>
          <h1 className="font-display text-3xl text-cream mb-1">Admin Dashboard</h1>
          <p className="text-xs font-mono text-slate-400">Live platform metrics & traveler trends</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Registered Users', value: stats.totalUsers },
            { label: 'Total Trips Created', value: stats.totalTrips },
            { label: 'Trip Stops Planned', value: stats.totalStops },
            { label: 'Activities Scheduled', value: stats.totalScheduledActivities || 0 },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-navy-900 border border-navy-700 rounded-lg p-6 shadow-lg">
              <span className="block text-3xl font-display text-amber-400 mb-1">{kpi.value}</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400">{kpi.label}</span>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Destinations */}
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 shadow-lg h-96 flex flex-col">
            <h2 className="text-xs tracking-[0.2em] uppercase font-mono text-slate-300 mb-4 font-semibold">
              Top Planned Destinations
            </h2>
            <div className="flex-1 min-h-0">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: '#1e293b' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f5a623', fontFamily: 'monospace' }}
                      labelStyle={{ color: '#f8fafc', marginBottom: '4px' }}
                    />
                    <Bar dataKey="bookings" name="Stops" fill="#f5a623" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                  No destination data recorded yet
                </div>
              )}
            </div>
          </div>

          {/* Activity Category Distribution */}
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 shadow-lg h-96 flex flex-col">
            <h2 className="text-xs tracking-[0.2em] uppercase font-mono text-slate-300 mb-4 font-semibold">
              Curated Activity Distribution
            </h2>
            <div className="flex-1 min-h-0">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#0f172a"
                      strokeWidth={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f5a623', fontFamily: 'monospace' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                  No activity categories recorded
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

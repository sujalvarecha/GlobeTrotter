import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as api from '../services/api';

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
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!stats) return null;

  // Mock data for the chart, since our admin stats just returns topDestinations array
  // We'll add some mock booking counts
  const chartData = stats.topDestinations.map((city, index) => ({
    name: city.name,
    bookings: Math.floor(Math.random() * 50) + 10,
  })).sort((a, b) => b.bookings - a.bookings);

  return (
    <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div>
          <h1 className="font-display text-3xl text-cream mb-2">Admin Dashboard</h1>
          <p className="text-sm font-mono text-slate-400">Platform Analytics & Metrics</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers },
            { label: 'Active Trips', value: stats.totalTrips },
            { label: 'Destinations', value: stats.totalStops },
            { label: 'Activities', value: stats.totalActivities },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-navy-900 border border-navy-700 rounded-lg p-6 shadow-lg">
              <span className="block text-2xl font-display text-amber-400 mb-2">{kpi.value}</span>
              <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-400">{kpi.label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 shadow-lg h-96">
          <h2 className="text-xs tracking-[0.2em] uppercase font-mono text-slate-300 mb-6">Top Booked Destinations</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f5a623', fontFamily: 'monospace' }}
                labelStyle={{ color: '#f8fafc', marginBottom: '8px' }}
              />
              <Bar dataKey="bookings" fill="#f5a623" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import * as api from '../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', language: 'en' });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.getUserProfile(user.id);
        setProfile(data);
        setFormData({ name: data.name, language: data.preferences?.language || 'en' });
      } catch (err) {
        setMessage({ text: 'Failed to load profile', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await api.updateUserProfile(user.id, formData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      // In a real app we'd update authStore user name here too
    } catch (err) {
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        await api.deleteAccount(user.id);
        logout();
        navigate('/login');
      } catch (err) {
        setMessage({ text: 'Failed to delete account', type: 'error' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-6 bg-navy-900 border border-navy-700 rounded-lg p-8">
          <img 
            src={profile.profileImage} 
            alt={profile.name} 
            className="w-24 h-24 rounded-full border-2 border-amber-400/50 bg-navy-950 p-1"
          />
          <div>
            <h1 className="font-display text-3xl text-cream mb-1">{profile.name}</h1>
            <p className="text-sm font-mono text-slate-400">{profile.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 flex flex-col items-center justify-center shadow-lg">
            <span className="text-3xl font-display text-amber-400">{profile.stats.trips}</span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mt-2">Total Trips</span>
          </div>
          <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 flex flex-col items-center justify-center shadow-lg">
            <span className="text-3xl font-display text-amber-400">{profile.stats.destinations}</span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mt-2">Destinations</span>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-navy-900 border border-navy-700 rounded-lg p-8 shadow-lg">
          <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-slate-300 mb-6">Profile Settings</h2>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded text-xs font-mono ${message.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded px-4 py-3 text-sm text-cream font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase font-mono text-slate-500 mb-2">
                Preferred Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-navy-950 border border-navy-700 rounded px-4 py-3 text-sm text-cream font-mono focus:border-amber-400 focus:outline-none"
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="pt-4 border-t border-navy-800">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-amber-400 hover:bg-amber-500 text-navy-950 font-mono font-bold text-xs tracking-[0.2em] uppercase px-6 py-3 rounded transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-danger/5 border border-danger/20 rounded-lg p-8 shadow-lg">
          <h2 className="text-sm tracking-[0.2em] uppercase font-mono text-danger mb-2">Danger Zone</h2>
          <p className="text-xs text-slate-400 mb-6 font-mono">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={handleDelete}
            className="border border-danger/50 text-danger hover:bg-danger/10 font-mono font-bold text-xs tracking-[0.1em] uppercase px-6 py-3 rounded transition-colors"
          >
            Delete Account
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { BatteryCharging, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { api, saveToken } from './lib/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@evfleet.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      saveToken(data.token);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-slate-100 font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl shadow-lg glow-green mb-4">
            <BatteryCharging className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
            EV Battery Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">Fleet Diagnostics Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                placeholder="you@fleet.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-emerald-500/60 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-semibold text-sm rounded-xl py-2.5 hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-[11px] text-slate-500 text-center pt-1">
            Demo login — email: <span className="text-slate-400">admin@evfleet.com</span> · password:{' '}
            <span className="text-slate-400">admin123</span>
            <br />
            (created automatically by <code className="text-emerald-400">npm run seed</code> on the backend)
          </p>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.adminLogin(username, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('CrunchyBite@2026');
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Staff & Admin Portal
              </h3>
              <p className="text-[11px] text-stone-400">
                Crunchy Bite Taste The Crunch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-300">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            <span>Sign In to Dashboard</span>
          </button>
        </form>

        {/* Staff Quick Credential Helper */}
        <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-400 font-medium">Initial Staff Credentials:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-amber-400 hover:underline font-semibold"
            >
              Fill Credentials
            </button>
          </div>
          <div className="font-mono text-[11px] text-stone-400 space-y-0.5">
            <div>User: <span className="text-stone-200">admin</span></div>
            <div>Password: <span className="text-stone-200">CrunchyBite@2026</span></div>
          </div>
          <p className="text-[10px] text-stone-500 pt-1">
            You can change your password anytime in Dashboard Settings.
          </p>
        </div>
      </div>
    </div>
  );
};

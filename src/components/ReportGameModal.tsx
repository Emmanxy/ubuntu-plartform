import React, { useState } from 'react';
import { Game } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Flag, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportGameModalProps {
  game: Game | null;
  onClose: () => void;
}

export function ReportGameModal({ game, onClose }: ReportGameModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState('Broken Game Engine / Cannot Load');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!game) return null;
  const gameId = game.id || game.gameId || '';
  const title = game.title || game.name || 'Traditional Game';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide specific details about the issue.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.submitReport({
        gameId,
        reason,
        details,
        reportedBy: user ? user.username : 'Anonymous Player'
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100">Report Game</h3>
            <p className="text-xs text-stone-400">Module: {title}</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-emerald-300">Report Transmitted</div>
            <p className="text-xs text-stone-400">
              Our moderation team will inspect this game module and review its integration.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Issue Category
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Broken Game Engine / Cannot Load">Broken Game Engine / Cannot Load</option>
                <option value="Inaccurate Cultural Lore or Misrepresentation">Inaccurate Cultural Lore or Misrepresentation</option>
                <option value="SDK Score Submission Malfunction">SDK Score Submission Malfunction</option>
                <option value="Offensive Content or Inappropriate Assets">Offensive Content or Inappropriate Assets</option>
                <option value="Other Technical Glitch">Other Technical Glitch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Description of Issue
              </label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what happened when launching or playing this game module..."
                className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Submitting...' : 'Submit to Moderation Team'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

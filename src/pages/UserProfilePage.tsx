import React, { useState, useEffect } from 'react';
import { Game, GameScore } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Heart, 
  Trophy, 
  ShieldCheck, 
  Key, 
  Sparkles, 
  Clock, 
  Play, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Mail, 
  Layers 
} from 'lucide-react';

interface UserProfilePageProps {
  onPlayGame: (game: Game) => void;
  onViewGameDetails: (game: Game) => void;
  onNavigate: (view: string) => void;
}

export function UserProfilePage({ onPlayGame, onViewGameDetails, onNavigate }: UserProfilePageProps) {
  const { user, loading, updateUserProfile, triggerPasswordReset, setAuthModalOpen } = useAuth();
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [scores, setScores] = useState<GameScore[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');

      api.getGames().then(res => {
        const favs = res.games.filter(g => user.favorites?.includes(g.id));
        setFavoriteGames(favs);
      }).catch(console.error);

      api.getUserScores(user.id).then(res => {
        setScores(res.scores);
      }).catch(console.error);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl max-w-md mx-auto my-12 space-y-4">
        <User className="w-12 h-12 text-stone-600 mx-auto" />
        <h2 className="text-xl font-bold text-stone-100">Sign In Required</h2>
        <p className="text-xs text-stone-400">Please sign in to view your profile and saved favorites.</p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-5 py-2.5 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile({ bio, avatarUrl });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleSendResetEmail = async () => {
    try {
      const res = await triggerPasswordReset(user.email);
      setResetMsg(res.message);
      setTimeout(() => setResetMsg(''), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger reset');
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      
      {/* Profile Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-amber-500/20 text-amber-400 border-2 border-amber-500/40 overflow-hidden flex items-center justify-center text-3xl font-black shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-extrabold text-stone-100">{user.username}</h1>
                <p className="text-xs text-stone-400 font-mono">{user.email}</p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {user.role}
                </span>
                {user.isVerified && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed max-w-xl">
              {user.bio || 'Passionate African traditional strategy player and cultural preserver.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>

              <button
                onClick={handleSendResetEmail}
                className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-300 text-xs font-medium rounded-xl border border-stone-800 flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Send Password Reset Email
              </button>
            </div>

            {resetMsg && (
              <div className="p-3 bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs rounded-xl flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{resetMsg} (Check Simulated Email Inbox!)</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="pt-4 border-t border-stone-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">Personal Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief biography..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bookmarked Favorites Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            Bookmarked Favorite Games ({favoriteGames.length})
          </h2>
        </div>

        {favoriteGames.length === 0 ? (
          <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-2xl text-stone-400 text-xs space-y-2">
            <p>You haven't bookmarked any favorite games yet.</p>
            <button
              onClick={() => onNavigate('library')}
              className="text-amber-400 font-bold underline"
            >
              Browse the Game Library
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {favoriteGames.map((game, idx) => {
              const title = game.title || game.name || 'Untitled Game';
              return (
                <div
                  key={game.id || game.gameId || `fav-game-${idx}`}
                  className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 truncate">
                    <h4 className="font-bold text-stone-100 text-xs truncate">{title}</h4>
                    <p className="text-[11px] text-stone-400">{game.category}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onPlayGame(game)}
                      disabled={loading}
                      className="p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl disabled:opacity-60"
                      title="Play"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* High Scores Activity Log */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Recent High Scores & Achievements
        </h2>

        {scores.length === 0 ? (
          <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-2xl text-stone-400 text-xs">
            No score records logged yet. Play games to record match stats!
          </div>
        ) : (
          <div className="space-y-2">
            {scores.map((sc, idx) => (
              <div
                key={sc.id || `score-${sc.gameId}-${sc.timestamp}-${idx}`}
                className="p-3.5 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-stone-200">Game: {sc.gameId}</span>
                  <span className="text-stone-500 text-[11px]">{new Date(sc.timestamp).toLocaleString()}</span>
                </div>
                <div className="font-mono font-extrabold text-amber-400 text-sm">
                  {sc.score.toLocaleString()} PTS
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

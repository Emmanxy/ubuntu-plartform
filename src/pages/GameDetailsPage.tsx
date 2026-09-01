import React, { useState, useEffect } from 'react';
import { Game, GameScore } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  Play, 
  Heart, 
  ExternalLink, 
  Flag, 
  Star, 
  BookOpen, 
  Sparkles, 
  Code2, 
  Trophy, 
  ArrowLeft, 
  Share2, 
  ShieldCheck 
} from 'lucide-react';

interface GameDetailsPageProps {
  gameId: string;
  onBack: () => void;
  onPlayGame: (game: Game) => void;
  onOpenReport: (game: Game) => void;
}

export function GameDetailsPage({ gameId, onBack, onPlayGame, onOpenReport }: GameDetailsPageProps) {
  const { user, toggleFavorite } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [leaderboard, setLeaderboard] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'culture' | 'rules' | 'integration' | 'scores'>('overview');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getGameById(gameId),
      api.getGameLeaderboard(gameId)
    ]).then(([gameRes, lbRes]) => {
      setGame(gameRes.game);
      setLeaderboard(lbRes.leaderboard);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [gameId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-64 bg-stone-900 rounded-3xl border border-stone-800" />
        <div className="h-40 bg-stone-900 rounded-2xl border border-stone-800" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold text-stone-200">Game Not Found</h2>
        <p className="text-xs text-stone-400">The requested game module does not exist in the Ubuntu Games Registry.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#d9583b] text-white font-bold text-xs rounded-xl"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const isFavorited = user?.favorites?.includes(game.id) || false;

  return (
    <div className="space-y-8 pb-20">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-[#d9583b] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Registry
      </button>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl bg-stone-900 border border-stone-800 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
          
          {/* Thumbnail & Badges */}
          <div className="lg:col-span-5 relative aspect-video rounded-2xl overflow-hidden bg-stone-950 border border-stone-800">
            <img
              src={game.thumbnailUrl || '/images/morabaraba-board.jpg'}
              alt={game.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/morabaraba-board.jpg';
              }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-amber-500 text-stone-950 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Traditional Game
              </span>
            </div>
          </div>

          {/* Metadata & Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#d9583b]/15 text-[#d9583b] border border-[#d9583b]/30">
                {game.category}
              </span>
              <span className="text-xs text-stone-400">
                Origin: <strong className="text-stone-200">{game.culturalContent.historicalOrigin}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
              {game.title}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {game.shortDescription}
            </p>

            <div className="flex items-center gap-4 text-xs text-stone-400 py-1">
              <div className="flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{game.rating.toFixed(1)} / 5.0</span>
              </div>
              <div><strong>{game.playsCount.toLocaleString()}</strong> total plays</div>
              <div>Developed by <strong className="text-stone-200">{game.developer.name}</strong></div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onPlayGame(game)}
                className="px-6 py-3 bg-[#d9583b] hover:bg-[#c2410c] text-white font-extrabold text-sm rounded-xl shadow-xl shadow-orange-950/40 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                Play in Platform HUD
              </button>

              <a
                href={game.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-stone-950 hover:bg-stone-850 border border-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Standalone Tab
              </a>

              <button
                onClick={() => toggleFavorite(game.id)}
                className={`p-3 rounded-xl border transition-all ${
                  isFavorited
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-stone-950 text-stone-400 hover:text-rose-400 border-stone-800'
                }`}
                title={isFavorited ? 'Remove favorite' : 'Bookmark favorite'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => onOpenReport(game)}
                className="p-3 bg-stone-950 text-stone-400 hover:text-red-400 border border-stone-800 rounded-xl transition-colors"
                title="Report issue"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-stone-800 gap-2 sm:gap-6 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Story', icon: BookOpen },
          { id: 'culture', label: 'Cultural Heritage & Lore', icon: Sparkles },
          { id: 'rules', label: 'Traditional Rules', icon: ShieldCheck },
          { id: 'scores', label: 'High Scores', icon: Trophy },
          { id: 'integration', label: 'Integration Architecture', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-2 flex items-center gap-2 whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8">
        
        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-sm text-stone-300 leading-relaxed">
            <div>
              <h3 className="text-base font-bold text-stone-100 mb-2">Game Description</h3>
              <p className="whitespace-pre-wrap">{game.longDescription || game.shortDescription}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-800">
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <div className="text-xs text-stone-400">Target Audience</div>
                <div className="text-sm font-bold text-stone-200 mt-1">All Ages & Strategists</div>
              </div>
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <div className="text-xs text-stone-400">Match Duration</div>
                <div className="text-sm font-bold text-stone-200 mt-1">5 - 15 Minutes</div>
              </div>
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
                <div className="text-xs text-stone-400">Players</div>
                <div className="text-sm font-bold text-stone-200 mt-1">1 vs AI / 2 Player Pass & Play</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CULTURAL HERITAGE */}
        {activeTab === 'culture' && (
          <div className="space-y-6 text-sm text-stone-300 leading-relaxed">
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-950 border border-amber-500/30 rounded-xl">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Historical Significance
              </div>
              <p className="text-xs sm:text-sm text-stone-200">{game.culturalContent.significance}</p>
            </div>

            {game.culturalContent.oralLore && (
              <div>
                <h3 className="text-sm font-bold text-stone-100 mb-2">Oral Tradition & Legend</h3>
                <p className="text-xs sm:text-sm text-stone-300 italic p-4 bg-stone-950 rounded-xl border border-stone-800">
                  "{game.culturalContent.oralLore}"
                </p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-stone-100 mb-3">Traditional Zulu Gaming Vocabulary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {game.culturalContent.traditionalTerms.map((term, idx) => (
                  <div key={idx} className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-400 text-sm">{term.term}</strong>
                      <span className="text-xs text-stone-500 font-mono">{term.pronunciation}</span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1">{term.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. TRADITIONAL RULES */}
        {activeTab === 'rules' && (
          <div className="space-y-6 text-sm text-stone-300 leading-relaxed">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800">
              <h3 className="text-sm font-bold text-amber-400 mb-1">Victory Condition</h3>
              <p className="text-xs sm:text-sm text-stone-200">{game.rules.winCondition}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-stone-100 mb-2">Rulebook & Mechanics:</h3>
              <ul className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-stone-300">
                {game.rules.overview.map((rule, idx) => (
                  <li key={idx} className="p-2.5 bg-stone-950/60 rounded-lg border border-stone-850">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 4. LEADERBOARD */}
        {activeTab === 'scores' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-100">Top Platform Champions</h3>
              <span className="text-xs text-stone-500">Live integration via ZululandSDK</span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="p-8 text-center bg-stone-950 rounded-xl text-stone-500 text-xs">
                No scores recorded for this game yet. Launch the game to set the first record!
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((score, idx) => (
                  <div
                    key={score.id || idx}
                    className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-bold text-stone-500 text-center">{idx + 1}</span>
                      <span className="font-bold text-stone-200">{score.playerName}</span>
                      <span className="text-stone-500 text-[11px] hidden sm:inline">
                        {new Date(score.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-mono font-extrabold text-amber-400 text-sm">
                      {score.score.toLocaleString()} PTS
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. INTEGRATION ARCHITECTURE */}
        {activeTab === 'integration' && (
          <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
            <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2 font-mono">
              <div className="flex justify-between text-stone-400">
                <span>Independent Launch URL:</span>
                <span className="text-amber-300 font-bold">{game.launchUrl}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Engine Implementation:</span>
                <span className="text-stone-200">{game.engine}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>SDK Version:</span>
                <span className="text-stone-200">{game.sdkVersion || '1.0.0'}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Registry ID:</span>
                <span className="text-stone-200">{game.id}</span>
              </div>
            </div>

            <p className="text-stone-400">
              This game is deployed as an independent module. The Zululand Games Platform loads it inside an isolated sandbox iframe and exchanges session/score telemetry using the bidirectional <code>ZululandSDK</code> postMessage protocol.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}

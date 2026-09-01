import React, { useState, useEffect, useRef } from 'react';
import { Game } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  BookOpen, 
  Trophy, 
  Flag, 
  Sparkles
} from 'lucide-react';

interface GameLauncherModalProps {
  game: Game | null;
  onClose: () => void;
  onOpenReport?: (game: Game) => void;
}

export function GameLauncherModal({ game, onClose, onOpenReport }: GameLauncherModalProps) {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'rules' | 'culture' | 'scores'>('none');
  const [liveScores, setLiveScores] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!game) return;

    // Record launch play count on backend
    api.launchGame(game.id).catch(console.error);

    // Fetch leaderboard
    api.getGameLeaderboard(game.id)
      .then(res => setLiveScores(res.leaderboard))
      .catch(console.error);
  }, [game]);

  if (!game) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div 
        ref={containerRef}
        className={`bg-stone-950 border border-amber-500/30 rounded-2xl w-full flex flex-col shadow-2xl overflow-hidden transition-all relative ${
          isFullscreen ? 'h-screen max-w-none rounded-none border-none' : 'max-w-6xl h-[90vh]'
        }`}
      >
        {/* Top Platform HUD Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900 border-b border-stone-800 text-stone-200 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-sm font-bold text-amber-300">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-100">{game.title}</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Traditional Game
                </span>
                <span className="hidden sm:inline text-xs text-stone-400">
                  by {game.developer.name}
                </span>
              </div>
            </div>
          </div>

          {/* Center HUD Tabs */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'rules' ? 'none' : 'rules')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeDrawer === 'rules' ? 'bg-amber-500/20 text-amber-300' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Rules
            </button>
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'culture' ? 'none' : 'culture')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeDrawer === 'culture' ? 'bg-amber-500/20 text-amber-300' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cultural Lore
            </button>
            <button
              onClick={() => setActiveDrawer(activeDrawer === 'scores' ? 'none' : 'scores')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                activeDrawer === 'scores' ? 'bg-amber-500/20 text-amber-300' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Leaderboard
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            <a
              href={game.launchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors"
              title="Open Standalone in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {onOpenReport && (
              <button
                onClick={() => onOpenReport(game)}
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors"
                title="Report issue"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Stage & Drawers */}
        <div className="flex-1 relative flex overflow-hidden bg-black">
          {/* Direct Sandboxed Iframe for the Game Module */}
          <iframe
            src={game.launchUrl}
            title={game.title}
            className="w-full h-full border-none bg-stone-950"
            allow="autoplay; fullscreen; clipboard-write; focus-without-user-activation; accelerometer; gyroscope"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />

          {/* Quick Drawer Panel */}
          {activeDrawer !== 'none' && (
            <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-stone-900/95 border-l border-stone-800 backdrop-blur-md p-5 overflow-y-auto z-20 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  {activeDrawer === 'rules' && <><BookOpen className="w-4 h-4" /> Traditional Rules</>}
                  {activeDrawer === 'culture' && <><Sparkles className="w-4 h-4" /> Cultural Heritage</>}
                  {activeDrawer === 'scores' && <><Trophy className="w-4 h-4" /> Top Herdmasters</>}
                </h4>
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rules Content */}
              {activeDrawer === 'rules' && (
                <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <div className="font-bold text-amber-300 mb-1">Victory Condition</div>
                    <div>{typeof game.rules === 'object' && 'winCondition' in game.rules ? game.rules.winCondition : 'Eliminate opposing pieces or achieve traditional victory objective.'}</div>
                  </div>
                  <div>
                    <div className="font-bold text-stone-200 mb-2">Gameplay Mechanics:</div>
                    <ul className="space-y-1.5 list-disc list-inside text-stone-400">
                      {Array.isArray(game.rules) 
                        ? game.rules.map((rule: string, idx: number) => (<li key={idx}><span className="text-stone-200">{rule}</span></li>))
                        : (game.rules?.overview || []).map((rule: string, idx: number) => (<li key={idx}><span className="text-stone-200">{rule}</span></li>))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Cultural Content */}
              {activeDrawer === 'culture' && (
                <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
                  <div>
                    <span className="text-stone-400">Historical Origin: </span>
                    <strong className="text-amber-300">{game.culturalContent?.historicalOrigin || game.culturalContent?.originRegion || 'Traditional African Heritage'}</strong>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <div className="font-bold text-stone-200 mb-1">Cultural Significance</div>
                    <p className="text-stone-400">{game.culturalContent?.significance || game.culturalContent?.culturalSignificance || 'Traditional strategic discipline and tactical mastery.'}</p>
                  </div>
                  <div>
                    <div className="font-bold text-stone-200 mb-2">Traditional Zulu Vocabulary:</div>
                    <div className="space-y-2">
                      {(game.culturalContent?.traditionalTerms || game.culturalContent?.zuluTerms || []).map((term, idx) => (
                        <div key={idx} className="p-2 bg-stone-950/60 rounded-lg border border-stone-800">
                          <span className="font-bold text-amber-400">{term.term}</span>
                          {term.pronunciation && <span className="text-stone-500"> ({term.pronunciation})</span>}:
                          <span className="text-stone-300 ml-1">{term.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Content */}
              {activeDrawer === 'scores' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-stone-400 mb-2">
                    Top recorded players:
                  </div>
                  {liveScores.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-500 bg-stone-950 rounded-xl">
                      No scores recorded yet. Be the first champion!
                    </div>
                  ) : (
                    liveScores.slice(0, 10).map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          idx === 0
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                            : idx === 1
                            ? 'bg-stone-800/60 border-stone-700 text-stone-200'
                            : 'bg-stone-950 border-stone-850 text-stone-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold w-4 text-center">{idx + 1}</span>
                          <span className="font-semibold text-stone-200">{s.playerName}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-400">
                          {s.score.toLocaleString()} PTS
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { api } from '../lib/api';
import { GameCard } from '../components/GameCard';
import { 
  Gamepad2, 
  Layers, 
  ArrowRight, 
  Play, 
  Code2, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Flame,
  Award,
  Globe2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string, param?: any) => void;
  onPlayGame: (game: Game) => void;
  onViewGameDetails: (game: Game) => void;
}

export function HomePage({ onNavigate, onPlayGame, onViewGameDetails }: HomePageProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGames()
      .then((gamesRes) => {
        setGames(gamesRes.games);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed loading home data:', err);
        setLoading(false);
      });
  }, []);

  const featuredGame = games.find(g => g.gameId === 'game_umurabhalaba_01') || games[0];

  return (
    <div className="space-y-16 pb-24 text-stone-100">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tracked Eyebrow */}
            <div className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#d9583b] uppercase">
              PLAY. DISCOVER. PRESERVE.
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-100 tracking-tight leading-[1.1]">
              Rediscover Africa Through Play
            </h1>

            {/* Subtitle */}
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Ubuntu Games is the premier centralized African traditional games registry. Discover, launch, and celebrate iconic ancestral board, pit-and-pebble, and reflex games digitally.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('library')}
                className="px-6 py-3.5 rounded-xl bg-[#d9583b] hover:bg-[#c2410c] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-950/50 transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Explore Gaming Hub</span>
              </button>

              <a
                href="https://studio.ubuntugames.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-700 hover:border-amber-500/40 text-stone-200 hover:text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Open Ubuntu Studio</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              </a>
            </div>

            {/* Quick Registry Metrics */}
            <div className="flex items-center gap-6 pt-4 border-t border-stone-850 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-200">{games.length || 3}+</span>
                <span>Active Games</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Instant In-Browser Play</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">100%</span>
                <span>Indigenous Heritage</span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Interactive Showcase Card */}
          <div className="lg:col-span-5">
            <div 
              onClick={() => featuredGame && onPlayGame(featuredGame)}
              className="group relative rounded-3xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 p-7 sm:p-9 shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[340px] sm:min-h-[380px]"
            >
              {/* Authentic Board Image Background with rich dark gradient */}
              <img
                src="/images/morabaraba-board.jpg"
                alt="Morabaraba Board"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500 pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40 pointer-events-none" />
              
              {/* Radiant diagonal terracotta glow overlay */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#d9583b]/35 via-amber-600/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform" />

              {/* Top Row: Play Emblem */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-14 h-14 rounded-full border border-stone-600 group-hover:border-amber-400 bg-stone-950/80 backdrop-blur-md flex items-center justify-center text-stone-100 group-hover:text-amber-400 group-hover:scale-110 transition-all shadow-xl">
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </div>
                <span className="text-[11px] font-bold text-amber-400 bg-stone-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-md">
                  Featured Traditional Game
                </span>
              </div>

              {/* Bottom Row: Large Headline & Serial Number */}
              <div className="relative z-10 space-y-2 pt-12">
                <h2 className="text-xl sm:text-2xl font-black text-stone-100 group-hover:text-amber-200 uppercase tracking-tight leading-snug">
                  {featuredGame?.title || 'UMURABHALABA / MORABARABA'}
                </h2>
                <div className="text-xs sm:text-sm font-mono text-stone-400 group-hover:text-stone-300 flex items-center gap-2">
                  <span>01 — Authentic African 12-Cow Strategy</span>
                  <span>•</span>
                  <span className="text-[#d9583b] font-bold">Launch Now &rarr;</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. GAMING HUB */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-[#d9583b]" />
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100">Gaming Hub</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Discover and play authentic African traditional games
            </p>
          </div>

          <button
            onClick={() => onNavigate('library')}
            className="text-xs font-bold text-[#d9583b] hover:text-amber-400 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Explore All Games</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={`skel-${i}`} className="h-72 rounded-3xl bg-stone-900 animate-pulse border border-stone-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, idx) => (
              <GameCard
                key={game.id || game.gameId || `home-game-${idx}`}
                game={game}
                onPlay={onPlayGame}
                onViewDetails={onViewGameDetails}
              />
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW THE UBUNTU GAMES ECOSYSTEM WORKS */}
      {/* ========================================================================= */}
      <section className="p-8 sm:p-10 rounded-3xl bg-stone-900 border border-stone-800 space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-bold">
            <Layers className="w-4 h-4" />
            <span>Platform Overview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100">
            How the Ubuntu Games Ecosystem Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Ubuntu Games is a simple and focused gaming hub built for authentic African traditional games. The platform connects players, games, and creators in a clean and modern way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm">
              T1
            </div>
            <h3 className="text-base font-bold text-stone-100">T1 – Gaming Hub</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              The central platform where players discover and play games. It handles user accounts (with Google and email sign-in), game listings, and the overall player experience.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#d9583b]/10 border border-[#d9583b]/30 text-[#d9583b] flex items-center justify-center font-black text-sm">
              T2
            </div>
            <h3 className="text-base font-bold text-stone-100">T2 – Games</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Games are independently hosted and launched directly from the hub. Currently featuring Umurabhalaba (Morabaraba), with more authentic African games to be added over time.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-sm">
              T3
            </div>
            <h3 className="text-base font-bold text-stone-100">T3 – Studio</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              A separate creation space (coming soon) where designers and players will be able to build, customize, and submit new games to the hub.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('library')}
            className="px-4 py-2.5 bg-[#d9583b] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Explore Gaming Hub</span>
          </button>

          <a
            href="https://studio.ubuntugames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ubuntu Studio</span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </a>
        </div>
      </section>

    </div>
  );
}

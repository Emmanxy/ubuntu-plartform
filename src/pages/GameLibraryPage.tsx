import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { api } from '../lib/api';
import { GameCard } from '../components/GameCard';
import { 
  Gamepad2, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Plus 
} from 'lucide-react';

interface GameLibraryPageProps {
  onPlayGame: (game: Game) => void;
  onViewGameDetails: (game: Game) => void;
  onNavigate: (view: string, param?: any) => void;
}

export function GameLibraryPage({ onPlayGame, onViewGameDetails, onNavigate }: GameLibraryPageProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedEngine, setSelectedEngine] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('POPULAR');

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Strategy & Tactics', label: 'Strategy & Tactics' },
    { id: 'Pit & Pebble Sowing', label: 'Pit & Sowing' },
    { id: 'Reflex & Coordination', label: 'Reflex & Agility' },
    { id: 'Tactical Puzzle', label: 'Tactical Puzzle' }
  ];

  const engines = [
    { id: 'ALL', label: 'All Engines' },
    { id: 'Custom HTML5 Canvas', label: 'HTML5 Canvas' },
    { id: 'Phaser 3', label: 'Phaser 3' },
    { id: 'Godot 4 Web', label: 'Godot Web' },
    { id: 'Unity WebGL', label: 'Unity WebGL' }
  ];

  const fetchGames = async () => {
    setLoading(true);
    try {
      const res = await api.getGames({
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        engine: selectedEngine !== 'ALL' ? selectedEngine : undefined,
        search: search.trim() || undefined,
        sort: selectedSort
      });
      setGames(res.games);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [selectedCategory, selectedEngine, selectedSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGames();
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#d9583b]/20 text-[#d9583b] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100">Gaming Hub</h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Discover and play authentic African traditional games.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('dev-portal')}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-700 text-stone-300 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            Register Game
          </button>
          <a
            href="https://studio.ubuntugames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#d9583b] hover:bg-[#c2410c] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-950/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ubuntu Studio
          </a>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800">
        {/* Top search & sort row */}
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by game title, cultural origin (e.g. Zulu, Sotho), or tags..."
              className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-amber-500"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs font-medium text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="POPULAR">Most Popular</option>
              <option value="RATING">Highest Rated</option>
              <option value="NEWEST">Newest Releases</option>
              <option value="NAME">Alphabetical</option>
            </select>

            <button
              onClick={fetchGames}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl transition-colors"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-stone-400 font-semibold text-[11px] mr-1">Category:</span>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCategory === c.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Engine Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 border-t border-stone-800/60">
          <span className="text-stone-400 font-semibold text-[11px] mr-1">Engine / Stack:</span>
          {engines.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedEngine(e.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium transition-all ${
                selectedEngine === e.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Games List / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={`lib-skel-${i}`} className="h-72 rounded-2xl bg-stone-900 animate-pulse border border-stone-800" />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="p-12 text-center bg-stone-900/60 border border-stone-800 rounded-2xl space-y-3">
          <Gamepad2 className="w-12 h-12 text-stone-600 mx-auto" />
          <h3 className="text-base font-bold text-stone-200">No games matched your filters</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try resetting your search query, or register a new independently hosted game module.
          </p>
          <button
            onClick={() => { setSelectedCategory('ALL'); setSelectedEngine('ALL'); setSearch(''); }}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <span>Showing <strong>{games.length}</strong> games registered in catalogue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, idx) => (
              <GameCard
                key={game.id || game.gameId || `lib-game-${idx}`}
                game={game}
                onPlay={onPlayGame}
                onViewDetails={onViewGameDetails}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

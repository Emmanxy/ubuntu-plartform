import React from 'react';
import { Game } from '../types';
import { useAuth } from '../context/AuthContext';
import { Play, Star, Eye, Heart, Code, Sparkles } from 'lucide-react';

export interface GameCardProps {
  key?: React.Key;
  game: Game;
  onPlay: (game: Game) => void;
  onViewDetails: (game: Game) => void;
}

export function GameCard({ game, onPlay, onViewDetails }: GameCardProps) {
  const { user, toggleFavorite } = useAuth();
  const gameId = game.id || game.gameId || '';
  const title = game.title || game.name || 'Umurabhalaba / Morabaraba';
  const thumbnail = game.thumbnailUrl || game.thumbnail || '/images/morabaraba-board.jpg';
  const origin = game.culturalContent?.historicalOrigin || game.culturalContent?.originRegion || 'Southern African Origin';
  const isFavorited = user?.favorites?.includes(gameId) || false;

  return (
    <div className="group bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail & Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-stone-950">
        <img
          src={thumbnail}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/morabaraba-board.jpg';
          }}
        />
        
        {/* Fallback graphic backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none" />

        {/* Traditional Game Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-amber-500 text-stone-950 shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Traditional Game
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (gameId) toggleFavorite(gameId);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
            isFavorited
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-stone-900/80 text-stone-400 hover:text-rose-400 border border-stone-700/50'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Origin tag at bottom of thumbnail */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-stone-300 z-10">
          <span className="font-semibold text-amber-200/90 truncate">
            {origin}
          </span>
          <span className="text-[11px] font-medium text-stone-400 px-2 py-0.5 rounded bg-stone-950/70">
            {game.category}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 
              onClick={() => onViewDetails(game)}
              className="font-bold text-base text-stone-100 group-hover:text-amber-400 transition-colors cursor-pointer"
            >
              {title}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{game.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3">
            {game.shortDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(game.tags || []).slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 bg-stone-950 text-stone-400 rounded-md border border-stone-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer actions & stats */}
        <div className="pt-3 border-t border-stone-850 flex items-center justify-between gap-2">
          <div className="text-[11px] text-stone-500">
            <span className="text-stone-300 font-semibold">{(game.playsCount || 0).toLocaleString()}</span> plays
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onViewDetails(game)}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors text-xs font-medium"
              title="Game Details & Lore"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPlay(game)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

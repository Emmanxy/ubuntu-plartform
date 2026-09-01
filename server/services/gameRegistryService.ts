import { db } from '../dataStore';
import { Game, GameCategory, GameEngine, GameStatus } from '../../src/types';

export class GameRegistryService {
  // Retrieve games for catalogue (filtered for public view or admin view)
  static getAllGames(options?: {
    category?: string;
    engine?: string;
    search?: string;
    status?: string;
    tag?: string;
    sort?: string;
  }) {
    let games = db.getGames(options?.status || 'PUBLISHED');

    if (options?.category && options.category !== 'All') {
      games = games.filter(g => g.category.toLowerCase() === options.category?.toLowerCase());
    }

    if (options?.engine && options.engine !== 'All') {
      games = games.filter(g => g.engine.toLowerCase() === options.engine?.toLowerCase());
    }

    if (options?.tag) {
      games = games.filter(g => g.tags.some(t => t.toLowerCase() === options.tag?.toLowerCase()));
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      games = games.filter(g => 
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.culturalContent.originRegion.toLowerCase().includes(q) ||
        g.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (options?.sort) {
      if (options.sort === 'popular') {
        games.sort((a, b) => b.playsCount - a.playsCount);
      } else if (options.sort === 'rating') {
        games.sort((a, b) => b.rating - a.rating);
      } else if (options.sort === 'newest') {
        games.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return games;
  }

  // Get single game with full cultural lore & rules
  static getGameById(gameId: string) {
    const game = db.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found in Zululand registry.');
    }
    return game;
  }

  // Record a play launch
  static recordPlay(gameId: string) {
    return db.incrementGamePlays(gameId);
  }

  // Register an independently deployed game directly (Game Integration Layer)
  static registerIndependentGame(data: {
    name: string;
    description: string;
    shortDescription?: string;
    thumbnail: string;
    bannerImage?: string;
    category: GameCategory;
    developer: {
      id?: string;
      name: string;
      organization?: string;
    };
    culturalContent: {
      originRegion: string;
      historicalEra: string;
      culturalSignificance: string;
      traditionalRules: string;
      oralLore?: string;
      zuluTerms?: { term: string; meaning: string }[];
      sources?: string[];
    };
    rules: string[];
    engine: GameEngine;
    version: string;
    launchUrl: string;
    embedType?: 'iframe_sandboxed' | 'new_tab' | 'custom_canvas';
    tags?: string[];
    supportedFeatures?: {
      scoreReporting: boolean;
      cloudSave: boolean;
      multiplayer: boolean;
      touchOptimized: boolean;
    };
    autoPublish?: boolean;
  }) {
    if (!data.name || !data.launchUrl || !data.category) {
      throw new Error('Game name, category, and launch URL are mandatory integration fields.');
    }

    // Validate URL format
    if (!data.launchUrl.startsWith('http://') && !data.launchUrl.startsWith('https://') && !data.launchUrl.startsWith('/')) {
      throw new Error('Launch URL must be a valid HTTPS URL or relative local path (e.g., /games/mygame/index.html).');
    }

    const gameId = 'game_' + data.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 6);

    const newGame: Game = {
      gameId,
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription || data.description.substring(0, 120) + '...',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      bannerImage: data.bannerImage,
      category: data.category,
      developer: {
        id: data.developer.id,
        name: data.developer.name || 'Independent Artisan',
        organization: data.developer.organization,
        verified: true
      },
      culturalContent: {
        originRegion: data.culturalContent.originRegion || 'Zululand, Southern Africa',
        historicalEra: data.culturalContent.historicalEra || 'Traditional',
        culturalSignificance: data.culturalContent.culturalSignificance || 'Preserving African board game heritage.',
        traditionalRules: data.culturalContent.traditionalRules || 'Standard traditional gameplay rules apply.',
        oralLore: data.culturalContent.oralLore,
        zuluTerms: data.culturalContent.zuluTerms || [],
        sources: data.culturalContent.sources || []
      },
      rules: data.rules && data.rules.length > 0 ? data.rules : ['Launch game and follow on-screen instructions.'],
      engine: data.engine || 'Phaser',
      version: data.version || '1.0.0',
      launchUrl: data.launchUrl,
      embedType: data.embedType || 'iframe_sandboxed',
      status: data.autoPublish ? 'PUBLISHED' : 'PUBLISHED',
      rating: 5.0,
      ratingCount: 1,
      playsCount: 0,
      tags: data.tags || ['Independent', 'Traditional', 'African Games'],
      supportedFeatures: {
        scoreReporting: data.supportedFeatures?.scoreReporting ?? true,
        cloudSave: data.supportedFeatures?.cloudSave ?? false,
        multiplayer: data.supportedFeatures?.multiplayer ?? false,
        touchOptimized: data.supportedFeatures?.touchOptimized ?? true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return db.addGame(newGame);
  }

  // Update Game metadata in registry
  static updateGame(gameId: string, updates: Partial<Game>) {
    const updated = db.updateGame(gameId, updates);
    if (!updated) {
      throw new Error('Game not found.');
    }
    return updated;
  }
}

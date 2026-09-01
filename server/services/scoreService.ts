import { db } from '../dataStore';
import { GameScore } from '../../src/types';

export class ScoreService {
  // Submit score from independent game via integration contract
  static submitScore(data: {
    gameId: string;
    userId?: string;
    playerName: string;
    score: number;
    scoreMetadata?: Record<string, any>;
  }) {
    if (!data.gameId || typeof data.score !== 'number') {
      throw new Error('Game ID and numeric score are required.');
    }

    const game = db.getGameById(data.gameId);
    const gameName = game ? game.name : 'Unknown Game';

    const newScore: GameScore = {
      id: 'score_' + Math.random().toString(36).substring(2, 9),
      gameId: data.gameId,
      gameName,
      userId: data.userId,
      playerName: data.playerName || 'Anonymous Warrior',
      score: data.score,
      scoreMetadata: data.scoreMetadata || {},
      createdAt: new Date().toISOString()
    };

    db.addScore(newScore);

    // If user is authenticated, award score achievement if applicable
    if (data.userId) {
      const user = db.getUserById(data.userId);
      if (user && !user.achievements.includes('High Scorer') && data.score >= 1000) {
        db.updateUser(user.id, {
          achievements: [...user.achievements, 'High Scorer']
        });
      }
    }

    return {
      success: true,
      message: 'Score recorded on Zululand Leaderboard.',
      score: newScore
    };
  }

  // Get leaderboard for a game
  static getLeaderboard(gameId: string, limit = 20) {
    const scores = db.getScores(gameId);
    return scores.slice(0, limit);
  }

  // Get scores for a user
  static getUserScores(userId: string) {
    return db.getScores().filter(s => s.userId === userId);
  }
}

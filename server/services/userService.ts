import { db } from '../dataStore';

export class UserService {
  // Get user public profile and stats
  static getUserProfile(userId: string) {
    const user = db.getUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const { passwordHash, verificationCode, verificationCodeExpires, resetToken, resetTokenExpires, ...profile } = user;
    
    // Compute stats
    const userProjects = db.getProjects(userId);
    const userScores = db.getScores().filter(s => s.userId === userId);
    
    return {
      ...profile,
      stats: {
        projectsCount: userProjects.length,
        publishedProjectsCount: userProjects.filter(p => p.status === 'APPROVED').length,
        pendingProjectsCount: userProjects.filter(p => p.status === 'PENDING_REVIEW').length,
        scoresRecordedCount: userScores.length,
        highestScore: userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0
      }
    };
  }

  // Update profile
  static updateProfile(userId: string, data: { bio?: string; avatar?: string; username?: string }) {
    const user = db.getUserById(userId);
    if (!user) throw new Error('User not found.');

    if (data.username && data.username !== user.username) {
      const existing = db.getUserByUsername(data.username);
      if (existing) throw new Error('Username already taken.');
    }

    const updated = db.updateUser(userId, {
      bio: data.bio !== undefined ? data.bio : user.bio,
      avatar: data.avatar !== undefined ? data.avatar : user.avatar,
      username: data.username ? data.username.trim() : user.username
    });

    if (!updated) throw new Error('Failed to update profile.');

    const { passwordHash, verificationCode, verificationCodeExpires, resetToken, resetTokenExpires, ...profile } = updated;
    return profile;
  }

  // Toggle favorite game
  static toggleFavorite(userId: string, gameId: string) {
    const user = db.getUserById(userId);
    if (!user) throw new Error('User not found.');

    let favorites = [...(user.favorites || [])];
    const exists = favorites.includes(gameId);

    if (exists) {
      favorites = favorites.filter(id => id !== gameId);
    } else {
      favorites.push(gameId);
    }

    db.updateUser(userId, { favorites });
    return { favorited: !exists, favorites };
  }
}

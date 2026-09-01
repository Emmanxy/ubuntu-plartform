import { db } from '../dataStore';
import { Game, PublicationReview, GameReport } from '../../src/types';

export class ModerationService {
  // Get all projects awaiting moderation review
  static getPendingProjects() {
    return db.getProjects().filter(p => p.status === 'PENDING_REVIEW');
  }

  // Get all publication reviews
  static getReviews() {
    return db.getReviews();
  }

  // Get user reports
  static getReports(statusFilter?: string) {
    const reports = db.getReports();
    if (statusFilter && statusFilter !== 'ALL') {
      return reports.filter(r => r.status === statusFilter);
    }
    return reports;
  }

  // Approve a submitted project and publish it to the Game Registry
  static approveProject(data: {
    projectId: string;
    moderatorId: string;
    moderatorName: string;
    comments?: string;
  }) {
    const project = db.getProjectById(data.projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    const reviewId = 'rev_' + Math.random().toString(36).substring(2, 9);
    const gameId = 'game_' + project.projectId.replace('proj_', '');

    // 1. Create or update the Game entry in the Game Registry
    const gameThumbnail = project.thumbnail || project.assetUrls?.thumbnailUrl || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80';

    const registeredGame: Game = {
      gameId,
      name: project.title,
      description: project.description,
      shortDescription: project.shortDescription || project.description.substring(0, 100) + '...',
      thumbnail: gameThumbnail,
      category: project.category,
      developer: {
        id: project.userId,
        name: project.creatorName,
        organization: 'Zululand Studio Creator',
        verified: true
      },
      culturalContent: {
        originRegion: 'KwaZulu-Natal / Southern Africa',
        historicalEra: 'Traditional African Game Heritage',
        culturalSignificance: project.culturalLore?.historicalContext || 'Traditional community game fostering strategic foresight.',
        traditionalRules: project.rulesConfig?.specialMovesDescription || 'Follow standard board rules and turn limits.',
        oralLore: project.culturalLore?.originStory,
        zuluTerms: [
          { term: project.culturalLore?.traditionalNameZulu || 'Umdlalo', meaning: 'Traditional Name' }
        ],
        sources: ['Zululand Games Creation Studio Community Archive']
      },
      rules: [
        `Win Condition: ${project.rulesConfig?.winCondition || 'Defeat opponent'}`,
        `Turn limit: ${project.rulesConfig?.turnTimeLimitSeconds || 60} seconds`,
        project.rulesConfig?.specialMovesDescription || 'Standard piece interactions apply.'
      ],
      engine: 'Phaser',
      version: '1.0.0',
      launchUrl: `/games/umurabhalaba/index.html?projectId=${project.projectId}&theme=${project.boardConfig.theme}`,
      embedType: 'iframe_sandboxed',
      status: 'PUBLISHED',
      rating: 5.0,
      ratingCount: 1,
      playsCount: 0,
      tags: ['Community Created', project.category, 'Studio Project'],
      supportedFeatures: {
        scoreReporting: true,
        cloudSave: false,
        multiplayer: true,
        touchOptimized: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if game already existed
    const existingGame = db.getGameById(gameId);
    if (existingGame) {
      db.updateGame(gameId, registeredGame);
    } else {
      db.addGame(registeredGame);
    }

    // 2. Update project status to APPROVED
    db.updateProject(project.projectId, {
      status: 'APPROVED',
      moderationFeedback: data.comments || 'Project complies with Zululand Games cultural integrity & gameplay standards.'
    });

    // 3. Record the Publication Review
    const review: PublicationReview = {
      reviewId,
      projectId: project.projectId,
      gameId,
      projectTitle: project.title,
      creatorId: project.userId,
      creatorName: project.creatorName,
      moderatorId: data.moderatorId,
      moderatorName: data.moderatorName,
      action: 'APPROVE',
      comments: data.comments || 'Approved for public listing in the Game Registry.',
      reviewedAt: new Date().toISOString()
    };
    db.addReview(review);

    // 4. Dispatch notification to Creator's inbox
    const creator = db.getUserById(project.userId);
    if (creator) {
      db.addEmail({
        to: creator.email,
        subject: `Congratulations! "${project.title}" has been Approved and Published`,
        type: 'MODERATION_UPDATE',
        body: `Halala ${creator.username}! Your game "${project.title}" has been reviewed and approved by moderator ${data.moderatorName}. It is now live in the Zululand Games public Game Library!\n\nModerator notes: "${data.comments || 'Approved'}"`
      });
    }

    return {
      message: `Project "${project.title}" approved and published to the Game Registry.`,
      game: registeredGame,
      review
    };
  }

  // Reject a submitted project with feedback
  static rejectProject(data: {
    projectId: string;
    moderatorId: string;
    moderatorName: string;
    reason: string;
  }) {
    const project = db.getProjectById(data.projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (!data.reason || data.reason.trim().length < 5) {
      throw new Error('Please provide constructive feedback or rejection reason.');
    }

    const reviewId = 'rev_' + Math.random().toString(36).substring(2, 9);

    // Update project
    db.updateProject(project.projectId, {
      status: 'REJECTED',
      moderationFeedback: data.reason
    });

    // Record review
    const review: PublicationReview = {
      reviewId,
      projectId: project.projectId,
      projectTitle: project.title,
      creatorId: project.userId,
      creatorName: project.creatorName,
      moderatorId: data.moderatorId,
      moderatorName: data.moderatorName,
      action: 'REJECT',
      comments: data.reason,
      reviewedAt: new Date().toISOString()
    };
    db.addReview(review);

    // Dispatch email
    const creator = db.getUserById(project.userId);
    if (creator) {
      db.addEmail({
        to: creator.email,
        subject: `Update on your project submission: "${project.title}"`,
        type: 'MODERATION_UPDATE',
        body: `Sawubona ${creator.username}. Your project "${project.title}" was reviewed by moderator ${data.moderatorName}. It requires some adjustments before it can be published.\n\nFeedback: ${data.reason}\n\nYou can edit your project in My Projects and resubmit anytime.`
      });
    }

    return {
      message: `Project "${project.title}" rejected with feedback sent to creator.`,
      review
    };
  }

  // Suspend or un-suspend a game
  static setGameStatus(gameId: string, status: 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED') {
    const game = db.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found.');
    }
    const updated = db.updateGame(gameId, { status });
    return { message: `Game status changed to ${status}`, game: updated };
  }

  // Submit a user report
  static submitReport(data: {
    gameId: string;
    reportedBy: string;
    reason: 'INAPPROPRIATE_CONTENT' | 'BROKEN_LAUNCH_URL' | 'CULTURAL_MISREPRESENTATION' | 'COPYRIGHT' | 'OTHER';
    details: string;
  }) {
    const game = db.getGameById(data.gameId);
    const gameName = game ? game.name : 'Unknown Game';

    const report: GameReport = {
      reportId: 'rep_' + Math.random().toString(36).substring(2, 9),
      gameId: data.gameId,
      gameName,
      reportedBy: data.reportedBy,
      reason: data.reason,
      details: data.details,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };

    db.addReport(report);
    return { message: 'Report submitted to moderators. Siyabonga for helping keep the platform safe.', report };
  }

  // Update report status
  static updateReportStatus(reportId: string, status: 'RESOLVED' | 'DISMISSED') {
    const updated = db.updateReport(reportId, { status });
    if (!updated) throw new Error('Report not found.');
    return updated;
  }
}

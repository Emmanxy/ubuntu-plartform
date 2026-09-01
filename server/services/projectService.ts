import { db } from '../dataStore';
import { GameProject, TemplateId, GameCategory } from '../../src/types';

export class ProjectService {
  // Get all projects for a user
  static getUserProjects(userId: string) {
    return db.getProjects(userId);
  }

  // Get single project
  static getProjectById(projectId: string, requestingUserId?: string, userRole?: string) {
    const project = db.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    // Permission check: only creator or moderator/admin can view non-public projects
    if (requestingUserId && project.userId !== requestingUserId && userRole !== 'admin' && userRole !== 'moderator') {
      throw new Error('Unauthorized to view this project.');
    }

    return project;
  }

  // Create new project from a board game template
  static createProject(data: {
    userId: string;
    creatorName: string;
    title: string;
    description: string;
    shortDescription?: string;
    templateId: TemplateId;
    category?: GameCategory;
    boardConfig?: any;
    pieceConfig?: any;
    rulesConfig?: any;
    culturalLore?: any;
    thumbnail?: string;
  }) {
    const template = db.getTemplateById(data.templateId);
    if (!template) {
      throw new Error(`Template "${data.templateId}" not supported.`);
    }

    const projectId = 'proj_' + Math.random().toString(36).substring(2, 10);

    const newProject: GameProject = {
      projectId,
      userId: data.userId,
      creatorName: data.creatorName,
      title: data.title.trim() || 'Untitled Zulu Board Game',
      description: data.description || 'A custom crafted board game created in the Zululand Game Studio.',
      shortDescription: data.shortDescription || data.description?.substring(0, 100) || 'Custom board game project.',
      templateId: data.templateId,
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80',
      category: data.category || template.category,
      boardConfig: data.boardConfig || { ...template.defaultBoardConfig },
      pieceConfig: data.pieceConfig || { ...template.defaultPieceConfig },
      rulesConfig: data.rulesConfig || { ...template.defaultRulesConfig },
      culturalLore: data.culturalLore || {
        originStory: 'Created to honor traditional Zulu and Southern African gaming heritage.',
        historicalContext: 'Rooted in historic communal play and tactical mastery.',
        traditionalNameZulu: 'Umdlalo Wesintu',
        proverbAssociated: 'Ukubambisana kungamandla (Unity is strength).'
      },
      assetUrls: {},
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return db.addProject(newProject);
  }

  // Update project draft
  static updateProject(projectId: string, userId: string, updates: Partial<GameProject>, userRole?: string) {
    const project = db.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (project.userId !== userId && userRole !== 'admin') {
      throw new Error('You can only modify your own projects.');
    }

    // If project was rejected, editing resets it to DRAFT
    if (project.status === 'REJECTED') {
      updates.status = 'DRAFT';
      updates.moderationFeedback = undefined;
    }

    const updated = db.updateProject(projectId, updates);
    return updated;
  }

  // Submit project for moderation review
  static submitForReview(projectId: string, userId: string) {
    const project = db.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (project.userId !== userId) {
      throw new Error('You can only submit your own projects for review.');
    }

    if (project.status === 'PENDING_REVIEW') {
      throw new Error('This project is already awaiting moderation review.');
    }

    // Validation checks before submission
    if (!project.title || project.title.trim().length < 3) {
      throw new Error('Project title must be at least 3 characters.');
    }

    if (!project.description || project.description.trim().length < 10) {
      throw new Error('Please provide a comprehensive description (at least 10 characters).');
    }

    const updated = db.updateProject(projectId, {
      status: 'PENDING_REVIEW',
      submittedAt: new Date().toISOString(),
      moderationFeedback: undefined
    });

    // Notify user in simulated email outbox
    const user = db.getUserById(userId);
    if (user) {
      db.addEmail({
        to: user.email,
        subject: `Project Submitted for Moderation: "${project.title}"`,
        type: 'MODERATION_UPDATE',
        body: `Sawubona ${user.username}! Your project "${project.title}" has been successfully submitted to the Zululand Games Moderation Council. You will receive an update once reviewed.`
      });
    }

    return {
      message: 'Project successfully submitted for moderation review! Our team will review your cultural lore and game parameters.',
      project: updated
    };
  }

  // Delete project
  static deleteProject(projectId: string, userId: string, userRole?: string) {
    const project = db.getProjectById(projectId);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (project.userId !== userId && userRole !== 'admin') {
      throw new Error('You can only delete your own projects.');
    }

    db.deleteProject(projectId);
    return { success: true, message: 'Project deleted.' };
  }

  // Get templates
  static getTemplates() {
    return db.getTemplates();
  }
}

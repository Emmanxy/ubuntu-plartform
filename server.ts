import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { AuthService } from './server/services/authService';
import { GameRegistryService } from './server/services/gameRegistryService';
import { ProjectService } from './server/services/projectService';
import { ModerationService } from './server/services/moderationService';
import { ScoreService } from './server/services/scoreService';
import { CulturalContentService } from './server/services/culturalContentService';
import { AIServiceAdapter } from './server/services/aiServiceAdapter';
import { UserService } from './server/services/userService';
// REPLACED OLD JWT MIDDLEWARE: Use Firebase ID token verification and Firestore profile alignment
import { 
  authenticateFirebaseToken, 
  optionalFirebaseAuth, 
  requireRole, 
  AuthenticatedRequest, 
  adminDb 
} from './server/middleware/firebaseAuth';
import { db } from './server/dataStore';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve static assets from public/ (including standalone independent games and SDK)
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // ==========================================
  // 1. AUTHENTICATION & VERIFICATION ENDPOINTS
  // ==========================================
  
  // Helper to extract base application URL
  const getBaseUrl = (req: express.Request) => {
    return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  };

  // Register user (dispatches verification code and secure token to email)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, username, password, role, bio } = req.body;
      if (!email || !username || !password) {
        return res.status(400).json({ error: 'Email, username, and password are required.' });
      }
      const baseUrl = getBaseUrl(req);
      const result = await AuthService.register({ email, username, password, role, bio, baseUrl });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Validate verification token endpoint (GET /api/auth/verify-token?token=...)
  app.get('/api/auth/verify-token', async (req, res) => {
    try {
      const token = (req.query.token as string) || '';
      if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
      }
      const result = await AuthService.validateVerificationToken(token);
      
      // If accessed directly from browser link click, redirect to client app with verified flag
      const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
      if (acceptsHtml) {
        return res.redirect(`/?verified=true&token=${encodeURIComponent(result.token || '')}`);
      }

      res.json(result);
    } catch (err: any) {
      const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
      if (acceptsHtml) {
        return res.redirect(`/?verifyError=${encodeURIComponent(err.message || 'Invalid or expired verification token')}`);
      }
      res.status(400).json({ error: err.message });
    }
  });

  // Validate verification token endpoint (POST /api/auth/verify-token)
  app.post('/api/auth/verify-token', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
      }
      const result = await AuthService.validateVerificationToken(token);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Verify email using 6-digit code or token
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const { email, code, token } = req.body;
      const verificationValue = code || token;
      if (!email || !verificationValue) {
        return res.status(400).json({ error: 'Email and verification code/token are required.' });
      }
      const result = await AuthService.verifyEmail(email, verificationValue);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Resend verification code & link
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }
      const baseUrl = getBaseUrl(req);
      const result = await AuthService.resendVerification(email, baseUrl);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Login (enforces verification check before granting session)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { emailOrUsername, password } = req.body;
      if (!emailOrUsername || !password) {
        return res.status(400).json({ error: 'Please enter your email/username and password.' });
      }
      const baseUrl = getBaseUrl(req);
      const result = await AuthService.login(emailOrUsername, password, baseUrl);
      res.json(result);
    } catch (err: any) {
      if (err.requiresVerification) {
        return res.status(403).json({
          error: err.message,
          requiresVerification: true,
          email: err.email,
          previewCode: err.previewCode,
          previewToken: err.previewToken
        });
      }
      res.status(401).json({ error: err.message });
    }
  });

  // Forgot password (request reset token)
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }
      const baseUrl = getBaseUrl(req);
      const result = await AuthService.requestPasswordReset(email, baseUrl);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Confirm password reset
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Reset token and new password are required.' });
      }
      const result = await AuthService.confirmPasswordReset(token, newPassword);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // REPLACED OLD JWT: Get current user session from verified Firebase token and Firestore users/{uid}
  app.get('/api/auth/me', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const uid = req.user!.uid;
      const userDoc = await adminDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        return res.json({ user: { id: uid, ...userDoc.data() } });
      }
      res.json({
        user: {
          id: uid,
          email: req.user!.email || '',
          username: req.user!.name || 'Player',
          role: req.user!.role || 'player',
          isVerified: true,
          favorites: req.user!.favorites || []
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // 2. USER PROFILE & FAVORITES ENDPOINTS
  // ==========================================
  
  app.get('/api/users/profile/:id', async (req, res) => {
    try {
      const uid = req.params.id;
      // Look up user profile from Firestore users/{uid} first
      try {
        const userDoc = await adminDb.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const profile = userDoc.data() || {};
          const userProjects = ProjectService.getUserProjects(uid);
          const userScores = ScoreService.getUserScores(uid);
          return res.json({
            user: {
              id: uid,
              ...profile,
              stats: {
                projectsCount: userProjects.length,
                publishedProjectsCount: userProjects.filter(p => p.status === 'APPROVED').length,
                pendingProjectsCount: userProjects.filter(p => p.status === 'PENDING_REVIEW').length,
                scoresRecordedCount: userScores.length,
                highestScore: userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0
              }
            }
          });
        }
      } catch (e) {
        // Fallback to local store if Firestore read fails
      }

      const profile = UserService.getUserProfile(uid);
      res.json({ user: profile });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.put('/api/users/profile', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { bio, avatar, username } = req.body;
      const updateData: Record<string, any> = {};
      if (bio !== undefined) updateData.bio = bio;
      if (avatar !== undefined) updateData.avatar = avatar;
      if (username !== undefined) updateData.username = username.trim();

      // Persist to Firestore users/{uid}
      try {
        await adminDb.collection('users').doc(uid).set(updateData, { merge: true });
      } catch (err) {
        console.warn('Could not persist profile update to Firestore:', err);
      }

      // Also update local mock dataStore if record exists
      try {
        UserService.updateProfile(uid, req.body);
      } catch {
        // Safe to ignore if only in Firestore
      }

      const updatedSnap = await adminDb.collection('users').doc(uid).get();
      const userData = updatedSnap.exists ? updatedSnap.data() : { id: uid, ...updateData };

      res.json({ message: 'Profile updated successfully.', user: { id: uid, ...userData } });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/users/favorites/:gameId', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const uid = req.user!.uid;
      const gameId = req.params.gameId;

      // Look up current favorites in Firestore users/{uid}
      let currentFavorites: string[] = req.user!.favorites || [];
      try {
        const snap = await adminDb.collection('users').doc(uid).get();
        if (snap.exists && snap.data()?.favorites) {
          currentFavorites = snap.data()!.favorites;
        }
      } catch (e) {
        // fallback
      }

      const exists = currentFavorites.includes(gameId);
      const newFavorites = exists 
        ? currentFavorites.filter(id => id !== gameId)
        : [...currentFavorites, gameId];

      try {
        await adminDb.collection('users').doc(uid).set({ favorites: newFavorites }, { merge: true });
      } catch (e) {
        console.warn('Could not persist favorite update to Firestore:', e);
      }

      try {
        UserService.toggleFavorite(uid, gameId);
      } catch {
        // ignored if user is Firestore-native
      }

      res.json({ favorited: !exists, favorites: newFavorites });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // 3. GAME REGISTRY & CATALOGUE ENDPOINTS
  // ==========================================
  
  // Public games catalogue
  app.get('/api/games', async (req, res) => {
    try {
      const { category, engine, search, tag, sort } = req.query;
      const games = GameRegistryService.getAllGames({
        category: category as string,
        engine: engine as string,
        search: search as string,
        tag: tag as string,
        sort: sort as string,
        status: 'PUBLISHED'
      });
      res.json({ games, total: games.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin/Moderator view all games (including suspended/archived)
  app.get('/api/games/admin-all', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
      const games = GameRegistryService.getAllGames({ status: 'ALL' });
      res.json({ games, total: games.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Single game details
  app.get('/api/games/:id', async (req, res) => {
    try {
      const game = GameRegistryService.getGameById(req.params.id);
      res.json({ game });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // Record play launch
  app.post('/api/games/:id/launch', async (req, res) => {
    try {
      const game = GameRegistryService.recordPlay(req.params.id);
      res.json({ success: true, playsCount: game?.playsCount });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Register independent game directly (Game Integration Layer)
  app.post('/api/games/register', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const gameData = {
        ...req.body,
        developer: {
          id: req.user!.id,
          name: req.body.developerName || req.user!.username,
          organization: req.body.developerOrg
        },
        autoPublish: req.user!.role === 'admin' || req.user!.role === 'moderator'
      };
      const game = GameRegistryService.registerIndependentGame(gameData);
      res.status(201).json({
        message: 'Game registered in Zululand Game Registry successfully.',
        game
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // 4. GAME CREATION STUDIO & PROJECTS
  // ==========================================

  // List templates
  app.get('/api/projects/templates', async (req, res) => {
    try {
      const templates = ProjectService.getTemplates();
      res.json({ templates });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get current user projects
  app.get('/api/projects', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const projects = ProjectService.getUserProjects(req.user!.id);
      res.json({ projects });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get single project
  app.get('/api/projects/:id', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const project = ProjectService.getProjectById(req.params.id, req.user!.id, req.user!.role);
      res.json({ project });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // Create project draft
  app.post('/api/projects', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const project = ProjectService.createProject({
        ...req.body,
        userId: req.user!.id,
        creatorName: req.user!.username
      });
      res.status(201).json({ message: 'Project draft created.', project });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update project
  app.put('/api/projects/:id', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const updated = ProjectService.updateProject(req.params.id, req.user!.id, req.body, req.user!.role);
      res.json({ message: 'Project saved.', project: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete project
  app.delete('/api/projects/:id', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const result = ProjectService.deleteProject(req.params.id, req.user!.id, req.user!.role);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Submit project for moderation review
  app.post('/api/projects/:id/submit', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const result = ProjectService.submitForReview(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // AI-assisted Game Lore & Config Generator
  app.post('/api/projects/ai-generate', authenticateFirebaseToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { prompt, templateId } = req.body;
      if (!prompt || !templateId) {
        return res.status(400).json({ error: 'Prompt and templateId are required.' });
      }
      const result = await AIServiceAdapter.generateGameIdea(prompt, templateId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Ubuntu Games AI Assistant Chat Endpoint
  app.post('/api/ai/assistant', async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required.' });
      }
      const result = await AIServiceAdapter.chatWithAssistant(messages);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // 5. PUBLISHING & MODERATION WORKFLOW
  // ==========================================

  // Get pending submissions queue
  app.get('/api/moderation/pending', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
      const pending = ModerationService.getPendingProjects();
      res.json({ pending, count: pending.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get publication reviews history
  app.get('/api/moderation/reviews', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
      const reviews = ModerationService.getReviews();
      res.json({ reviews });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Approve project -> published to Game Registry
  app.post('/api/moderation/approve', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { projectId, comments } = req.body;
      if (!projectId) {
        return res.status(400).json({ error: 'projectId is required.' });
      }
      const result = ModerationService.approveProject({
        projectId,
        moderatorId: req.user!.id,
        moderatorName: req.user!.username,
        comments
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Reject project with feedback
  app.post('/api/moderation/reject', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req: AuthenticatedRequest, res) => {
    try {
      const { projectId, reason } = req.body;
      if (!projectId || !reason) {
        return res.status(400).json({ error: 'projectId and constructive reason are required.' });
      }
      const result = ModerationService.rejectProject({
        projectId,
        moderatorId: req.user!.id,
        moderatorName: req.user!.username,
        reason
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Suspend/archive published game
  app.put('/api/moderation/games/:id/status', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
      const { status } = req.body;
      if (!['PUBLISHED', 'SUSPENDED', 'ARCHIVED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid game status.' });
      }
      const result = ModerationService.setGameStatus(req.params.id, status);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Submit user report
  app.post('/api/moderation/reports', optionalFirebaseAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { gameId, reason, details } = req.body;
      if (!gameId || !reason || !details) {
        return res.status(400).json({ error: 'gameId, reason, and details are required.' });
      }
      const reporter = req.user ? req.user.username : req.body.reportedBy || 'Anonymous Explorer';
      const result = ModerationService.submitReport({
        gameId,
        reportedBy: reporter,
        reason,
        details
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // List user reports
  app.get('/api/moderation/reports', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
      const reports = ModerationService.getReports(req.query.status as string);
      res.json({ reports });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update report
  app.put('/api/moderation/reports/:id', authenticateFirebaseToken, requireRole(['moderator', 'admin']), async (req, res) => {
    try {
      const { status } = req.body;
      const updated = ModerationService.updateReportStatus(req.params.id, status);
      res.json({ message: 'Report updated.', report: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // 6. CULTURAL ARCHIVE & GLOSSARY
  // ==========================================

  app.get('/api/cultural/articles', async (req, res) => {
    try {
      const articles = CulturalContentService.getAllArticles();
      res.json({ articles });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/cultural/articles/:slug', async (req, res) => {
    try {
      const article = CulturalContentService.getArticleBySlug(req.params.slug);
      res.json({ article });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.get('/api/cultural/glossary', async (req, res) => {
    try {
      const glossary = CulturalContentService.getZuluGlossary();
      res.json({ glossary });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // 7. SCORE PERSISTENCE & LEADERBOARDS
  // ==========================================

  // Standard Score Submission Integration Contract
  app.post('/api/scores', optionalFirebaseAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { gameId, playerName, score, scoreMetadata } = req.body;
      const userId = req.user?.id;
      const finalPlayerName = playerName || req.user?.username || 'Guest Player';
      const result = ScoreService.submitScore({
        gameId,
        userId,
        playerName: finalPlayerName,
        score: Number(score),
        scoreMetadata
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get game leaderboard
  app.get('/api/scores/game/:gameId', async (req, res) => {
    try {
      const leaderboard = ScoreService.getLeaderboard(req.params.gameId);
      res.json({ leaderboard });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get user scores
  app.get('/api/scores/user/:userId', async (req, res) => {
    try {
      const scores = ScoreService.getUserScores(req.params.userId);
      res.json({ scores });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // 8. SIMULATED EMAIL OUTBOX (Preview Helper)
  // ==========================================

  app.get('/api/simulated-emails', async (req, res) => {
    res.json({ emails: db.getEmails() });
  });

  app.post('/api/simulated-emails/:id/read', async (req, res) => {
    const email = db.markEmailRead(req.params.id);
    res.json({ success: true, email });
  });

  app.delete('/api/simulated-emails', async (req, res) => {
    db.clearEmails();
    res.json({ success: true });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      platform: 'Ubuntu Games Platform',
      version: '3.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // 9. VITE SPA MIDDLEWARE / PRODUCTION STATIC
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zululand Games Platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

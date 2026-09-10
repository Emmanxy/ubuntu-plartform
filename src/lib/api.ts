import { 
  Game, 
  GameProject, 
  BoardTemplate, 
  PublicationReview, 
  GameReport, 
  GameScore, 
  CulturalArticle, 
  User, 
  SimulatedEmail 
} from '../types';
import { auth } from './firebase';

const API_BASE = '/api';

/**
 * REPLACED OLD JWT LOGIC:
 * Previously retrieved custom signed JWT from localStorage ('zululand_jwt_token').
 * Now retrieves the cryptographically verified Firebase ID token from the active Firebase user session.
 */
export async function getAuthToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    return await currentUser.getIdToken();
  } catch (err) {
    console.warn('Failed to retrieve Firebase ID token:', err);
    return null;
  }
}

/**
 * REPLACED OLD JWT LOGIC:
 * Deprecated no-op helper preserved for backwards compatibility.
 * Firebase Auth manages session tokens and rotation internally.
 */
export function setAuthToken(_token: string | null): void {
  // No-op: Firebase Auth manages token state automatically
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // REPLACED OLD JWT LOGIC: Dynamically attach the Firebase ID token if signed in
  const token = await getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();

  if (!res.ok) {
    const error: any = new Error(data.error || 'Network request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth & Email Verification & Password Reset
  register: (body: { email: string; username: string; password: string; role?: string; bio?: string }) =>
    request<{ message: string; userId: string; email: string; previewCode?: string; previewToken?: string; sentRealEmail?: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  verifyEmail: (body: { email: string; code?: string; token?: string }) =>
    request<{ message: string; token: string; user: User; alreadyVerified?: boolean }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  verifyToken: (token: string) =>
    request<{ message: string; token: string; user: User; alreadyVerified?: boolean }>('/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    }),

  resendVerification: (email: string) =>
    request<{ message: string; previewCode?: string; previewToken?: string; sentRealEmail?: boolean }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  login: (body: { emailOrUsername: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; previewToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (body: { token: string; newPassword: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  // Users
  getUserProfile: (userId: string) => request<{ user: User & { stats: any } }>(`/users/profile/${userId}`),
  updateProfile: (body: { bio?: string; avatar?: string; username?: string }) =>
    request<{ message: string; user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
  toggleFavorite: (gameId: string) =>
    request<{ favorited: boolean; favorites: string[] }>(`/users/favorites/${gameId}`, {
      method: 'POST'
    }),

  // Games (Game Registry)
  getGames: (params?: { category?: string; engine?: string; search?: string; tag?: string; sort?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.engine) q.set('engine', params.engine);
    if (params?.search) q.set('search', params.search);
    if (params?.tag) q.set('tag', params.tag);
    if (params?.sort) q.set('sort', params.sort);
    return request<{ games: Game[]; total: number }>(`/games?${q.toString()}`);
  },

  getAllGamesAdmin: () => request<{ games: Game[]; total: number }>('/games/admin-all'),

  getGameById: (id: string) => request<{ game: Game }>(`/games/${id}`),

  launchGame: (id: string) =>
    request<{ success: boolean; playsCount: number }>(`/games/${id}/launch`, {
      method: 'POST'
    }),

  registerIndependentGame: (body: any) =>
    request<{ message: string; game: Game }>('/games/register', {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  // Creation Studio & Projects
  getTemplates: () => request<{ templates: BoardTemplate[] }>('/projects/templates'),
  getMyProjects: () => request<{ projects: GameProject[] }>('/projects'),
  getProjectById: (id: string) => request<{ project: GameProject }>(`/projects/${id}`),
  createProject: (body: any) =>
    request<{ message: string; project: GameProject }>('/projects', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  updateProject: (id: string, body: any) =>
    request<{ message: string; project: GameProject }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),
  deleteProject: (id: string) =>
    request<{ success: boolean; message: string }>(`/projects/${id}`, {
      method: 'DELETE'
    }),
  submitProjectForReview: (id: string) =>
    request<{ message: string; project: GameProject }>(`/projects/${id}/submit`, {
      method: 'POST'
    }),
  aiGenerateIdea: (prompt: string, templateId: string) =>
    request<{ success: boolean; data: any; aiGenerated: boolean }>('/projects/ai-generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, templateId })
    }),

  // Moderation
  getPendingModeration: () => request<{ pending: GameProject[]; count: number }>('/moderation/pending'),
  getModerationReviews: () => request<{ reviews: PublicationReview[] }>('/moderation/reviews'),
  approveProject: (projectId: string, comments?: string) =>
    request<{ message: string; game: Game; review: PublicationReview }>('/moderation/approve', {
      method: 'POST',
      body: JSON.stringify({ projectId, comments })
    }),
  rejectProject: (projectId: string, reason: string) =>
    request<{ message: string; review: PublicationReview }>('/moderation/reject', {
      method: 'POST',
      body: JSON.stringify({ projectId, reason })
    }),
  setGameStatus: (gameId: string, status: string) =>
    request<{ message: string; game: Game }>(`/moderation/games/${gameId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  submitReport: (body: { gameId: string; reason: string; details: string; reportedBy?: string }) =>
    request<{ message: string; report: GameReport }>('/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  getReports: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<{ reports: GameReport[] }>(`/moderation/reports${q}`);
  },
  updateReport: (id: string, status: string) =>
    request<{ message: string; report: GameReport }>(`/moderation/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  // Cultural
  getCulturalArticles: () => request<{ articles: CulturalArticle[] }>('/cultural/articles'),
  getCulturalArticleBySlug: (slug: string) => request<{ article: CulturalArticle }>(`/cultural/articles/${slug}`),
  getCulturalGlossary: () => request<{ glossary: any[] }>('/cultural/glossary'),

  // Scores
  submitScore: (body: { gameId: string; score: number; playerName?: string; scoreMetadata?: any }) =>
    request<{ success: boolean; message: string; score: GameScore }>('/scores', {
      method: 'POST',
      body: JSON.stringify(body)
    }),
  getGameLeaderboard: (gameId: string) => request<{ leaderboard: GameScore[] }>(`/scores/game/${gameId}`),
  getUserScores: (userId: string) => request<{ scores: GameScore[] }>(`/scores/user/${userId}`),

  // Ubuntu Games AI Assistant
  askAssistant: (messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) =>
    request<{ reply: string; aiGenerated: boolean }>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ messages })
    }),

  // Simulated Email Outbox
  getSimulatedEmails: () => request<{ emails: SimulatedEmail[] }>('/simulated-emails'),
  markEmailRead: (id: string) => request<{ success: boolean }>(`/simulated-emails/${id}/read`, { method: 'POST' }),
  clearEmails: () => request<{ success: boolean }>('/simulated-emails', { method: 'DELETE' })
};

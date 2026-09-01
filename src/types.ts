export type UserRole = 'player' | 'creator' | 'moderator' | 'admin';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isVerified: boolean;
  verified?: boolean;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  favorites: string[]; // gameIds
  achievements?: string[];
}

export type GameCategory = 
  | 'Strategy & Tactics'
  | 'Pit & Pebble Sowing'
  | 'Reflex & Coordination'
  | 'Tactical Puzzle'
  | 'Strategy & Warfare' 
  | 'Pit & Pebble (Mancala)' 
  | 'Agility & Coordination' 
  | 'Rhythm & Song' 
  | 'Royal Court & Wisdom'
  | 'Developer Sandbox'
  | string;

export type GameEngine = 
  | 'Phaser 3'
  | 'Godot 4 Web'
  | 'Unity WebGL'
  | 'Custom HTML5 Canvas'
  | 'Phaser'
  | 'Godot Web'
  | 'Custom HTML5'
  | 'PixiJS'
  | 'Three.js'
  | 'Construct 3'
  | 'Custom WebGL / Canvas'
  | string;

export type GameStatus = 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';

export type TemplateId = string;

export interface TraditionalTerm {
  term: string;
  pronunciation?: string;
  meaning: string;
}

export interface CulturalContent {
  historicalOrigin?: string;
  originRegion?: string;
  historicalEra?: string;
  significance?: string;
  culturalSignificance?: string;
  oralLore?: string;
  traditionalRules?: string | string[];
  traditionalTerms?: TraditionalTerm[];
  zuluTerms?: TraditionalTerm[];
  sources?: string[];
  [key: string]: any;
}

export interface GameRules {
  winCondition: string;
  overview: string[];
  [key: string]: any;
}

export interface Game {
  id?: string;
  gameId?: string;
  title?: string;
  name?: string;
  description?: string;
  shortDescription: string;
  longDescription?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  bannerImage?: string;
  category: GameCategory;
  developer: {
    id?: string;
    name: string;
    organization?: string;
    verified: boolean;
  };
  culturalContent: CulturalContent;
  rules: GameRules | string[] | any;
  engine: GameEngine;
  version?: string;
  sdkVersion?: string;
  launchUrl: string;
  embedType?: 'iframe_sandboxed' | 'new_tab' | 'custom_canvas';
  status: GameStatus | string;
  featured?: boolean;
  rating: number;
  ratingCount?: number;
  playsCount: number;
  tags: string[];
  supportedFeatures?: {
    scoreReporting: boolean;
    cloudSave: boolean;
    multiplayer: boolean;
    touchOptimized: boolean;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface BoardTemplate {
  id: TemplateId;
  name: string;
  description: string;
  category: GameCategory;
  icon?: string;
  culturalEra?: string;
  defaultTheme?: string;
  defaultGrid?: { x: number; y: number }[];
  defaultBoardConfig?: Record<string, any>;
  defaultPieceConfig?: Record<string, any>;
  defaultRulesConfig?: Record<string, any>;
  rulesPreset?: {
    winCondition: string;
    coreRules: string[];
  };
  [key: string]: any;
}

export interface GameProject {
  id?: string;
  projectId?: string;
  userId?: string;
  creatorName: string;
  title: string;
  description: string;
  shortDescription?: string;
  templateId: TemplateId;
  thumbnail?: string;
  category?: GameCategory;
  boardConfig: {
    gridType?: string;
    theme: string;
    width?: number;
    height?: number;
    gridPoints?: { x: number; y: number }[];
    [key: string]: any;
  };
  pieceConfig: {
    player1Name?: string;
    player1Color: string;
    player1PieceType?: string;
    player2Name?: string;
    player2Color: string;
    player2PieceType?: string;
    player1Count?: number;
    player2Count?: number;
    piecesPerPlayer?: number;
    shape?: string;
    [key: string]: any;
  };
  ruleConfig?: {
    winCondition?: string;
    allowedMoves?: string[];
    flyingAllowed?: boolean;
    [key: string]: any;
  };
  rulesConfig?: {
    winCondition?: string;
    allowedMoves?: string[];
    flyingAllowed?: boolean;
    turnTimeLimitSeconds?: number;
    scoringMultiplier?: number;
    specialMovesDescription?: string;
    [key: string]: any;
  };
  culturalLore: {
    originStory?: string;
    historicalContext?: string;
    traditionalNameZulu?: string;
    proverbAssociated?: string;
    historicalEra?: string;
    significance?: string;
    oralStory?: string;
    zuluTerms?: TraditionalTerm[];
    [key: string]: any;
  };
  assetUrls?: {
    thumbnailUrl?: string;
    soundtrackUrl?: string;
  };
  status: ProjectStatus;
  moderationFeedback?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationReview {
  reviewId: string;
  projectId: string;
  gameId?: string;
  projectTitle: string;
  creatorId: string;
  creatorName: string;
  moderatorId: string;
  moderatorName: string;
  action: 'APPROVE' | 'REJECT' | 'SUSPEND';
  comments: string;
  reviewedAt: string;
}

export interface GameReport {
  id?: string;
  reportId?: string;
  gameId: string;
  gameName?: string;
  reportedBy: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'OPEN';
  createdAt?: string;
}

export interface GameScore {
  id: string;
  gameId: string;
  gameTitle?: string;
  gameName?: string;
  userId?: string;
  playerName: string;
  score: number;
  timestamp?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
  scoreMetadata?: Record<string, any>;
}

export interface CulturalArticle {
  id: string;
  slug: string;
  title: string;
  traditionalName?: string;
  author?: string;
  region?: string;
  era: string;
  summary: string;
  content?: string;
  fullHistory?: string;
  traditionalRules?: string[];
  philosophicalValue?: string;
  image?: string;
  sources?: string[];
  culturalThemes?: string[];
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET' | 'MODERATION_UPDATE';
  code?: string;
  token?: string;
  body: string;
  timestamp: string;
  read: boolean;
}

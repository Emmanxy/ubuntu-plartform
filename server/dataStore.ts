import bcrypt from 'bcryptjs';
import { 
  User, 
  Game, 
  GameProject, 
  BoardTemplate, 
  PublicationReview, 
  GameReport, 
  GameScore, 
  CulturalArticle, 
  SimulatedEmail 
} from '../src/types';

// In-memory data store with stateful operations
export interface DBState {
  users: (User & { 
    passwordHash: string; 
    verificationCode?: string; 
    verificationCodeExpires?: number; 
    verificationToken?: string; 
    verificationTokenExpires?: number;
    resetToken?: string; 
    resetTokenExpires?: number 
  })[];
  games: Game[];
  projects: GameProject[];
  templates: BoardTemplate[];
  reviews: PublicationReview[];
  reports: GameReport[];
  scores: GameScore[];
  articles: CulturalArticle[];
  emails: SimulatedEmail[];
}

const salt = bcrypt.genSaltSync(10);

// Pre-seeded users (password is 'zulugames123' for all demo accounts)
const demoPasswordHash = bcrypt.hashSync('zulugames123', salt);

export const initialDBState: DBState = {
  users: [
    {
      id: 'usr_admin_1',
      email: 'admin@zulugames.org',
      username: 'Sipho_Khanyile',
      role: 'admin',
      isVerified: true,
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Cultural Archivist & Platform Administrator for the Zululand Games Heritage Initiative.',
      createdAt: '2026-01-15T08:00:00.000Z',
      favorites: ['game_umurabhalaba_01', 'game_moruba_02'],
      achievements: ['Grand Master Archivist', 'Platform Guardian', '100+ Moderations']
    },
    {
      id: 'usr_moderator_1',
      email: 'moderator@zulugames.org',
      username: 'Nomvula_Dlamini',
      role: 'moderator',
      isVerified: true,
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Indigenous Knowledge Systems Specialist and Game Reviewer.',
      createdAt: '2026-02-01T10:00:00.000Z',
      favorites: ['game_diketo_03'],
      achievements: ['Cultural Integrity Badge', 'Vigilant Eye']
    },
    {
      id: 'usr_creator_1',
      email: 'creator@zulugames.org',
      username: 'Themba_Mthembu',
      role: 'creator',
      isVerified: true,
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Indie Game Architect specializing in traditional African tactical board systems & WebGL engines.',
      createdAt: '2026-02-10T12:00:00.000Z',
      favorites: ['game_umurabhalaba_01', 'game_moruba_02'],
      achievements: ['Master Artisan', 'Published 1 Game', 'Zulu Grid Innovator']
    },
    {
      id: 'usr_player_1',
      email: 'player@zulugames.org',
      username: 'Thabo_Zulu',
      role: 'player',
      isVerified: true,
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Avid Umurabhalaba strategist & tournament participant.',
      createdAt: '2026-03-01T14:30:00.000Z',
      favorites: ['game_umurabhalaba_01', 'game_diketo_03'],
      achievements: ['First Victory', '10 Games Played', 'Top 10 Leaderboard']
    }
  ],

  games: [
    {
      gameId: 'game_umurabhalaba_01',
      name: 'Umurabhalaba / Morabaraba',
      description: 'The legendary two-player strategy board game played for centuries across Southern Africa and the Zulu kingdom. Known as Zulu chess, players place 12 "cows" (izinkomo) upon intersecting geometric lines, aiming to form mills (imigqa) and capture opponent cattle.',
      shortDescription: 'The ancient 12-cow Zulu strategy game of cunning spatial tactics and mill captures.',
      thumbnail: '/images/morabaraba-board.jpg',
      bannerImage: '/images/morabaraba-board.jpg',
      category: 'Strategy & Warfare',
      developer: {
        id: 'usr_creator_1',
        name: 'Themba Mthembu',
        organization: 'Indabuko Interactive',
        verified: true
      },
      culturalContent: {
        originRegion: 'KwaZulu-Natal, Southern Africa',
        historicalEra: 'Pre-Colonial (Documented over 800+ years in stone petroglyphs)',
        culturalSignificance: 'Traditionally taught young Zulu herders spatial discipline, strategic patience, herd defense tactics, and military foresight.',
        traditionalRules: 'Phase 1: Placing pieces on vacant intersections one by one. Phase 2: Moving along connecting lines to adjacent points. Phase 3 (Flying/Ukundiza): When reduced to 3 pieces, a player may jump to any vacant intersection. Forming 3 pieces in a straight line creates a mill (umugqa), permitting removal of one opponent cow not in a mill.',
        oralLore: 'In Zulu kraals, cattle were the bedrock of wealth and honour. Umurabhalaba symbolized pastoral defense and clan loyalty.',
        zuluTerms: [
          { term: 'Izinkomo', meaning: 'Cows / Tokens (12 per player)' },
          { term: 'Umugqa', meaning: 'Mill (3 tokens aligned in a straight line)' },
          { term: 'Ukudla', meaning: 'Capturing an opponent piece' },
          { term: 'Ukundiza', meaning: 'Flying (jumping anywhere when only 3 cows remain)' }
        ],
        sources: ['Historical Society of KwaZulu-Natal', 'Traditional African Board Games Archive, Prof. D. Mosimege']
      },
      rules: [
        'Each player starts with 12 cows (izinkomo) of their chosen colour.',
        'Players alternate placing one cow on any empty intersection point.',
        'Aligning 3 cows in a straight line forms an "Umugqa" (Mill) and permits capturing one enemy cow.',
        'Once all cows are placed, players move one cow along marked lines to an adjacent vacant point.',
        'When down to exactly 3 cows, the "Ukundiza" (Flying) rule unlocks—allowing jumps to any free spot.',
        'Victory is attained when the opponent is reduced to 2 cows or has no valid legal moves.'
      ],
      engine: 'Traditional Strategy',
      version: '2.4.0',
      launchUrl: 'https://mlabalaba-7gr2-nu.vercel.app/',
      embedType: 'iframe_sandboxed',
      status: 'PUBLISHED',
      rating: 4.9,
      ratingCount: 142,
      playsCount: 3890,
      tags: ['Traditional', '2-Player', 'Strategy', 'Ancient', 'Turn-Based'],
      supportedFeatures: {
        scoreReporting: false,
        cloudSave: false,
        multiplayer: true,
        touchOptimized: true
      },
      createdAt: '2026-01-20T10:00:00.000Z',
      updatedAt: '2026-02-18T16:00:00.000Z'
    }
  ],

  projects: [
    {
      projectId: 'proj_morabaraba_royal',
      userId: 'usr_creator_1',
      creatorName: 'Themba_Mthembu',
      title: 'Umurabhalaba Royal Court Edition',
      description: 'A deluxe edition of the 12-cow strategy game with engraved cowhide aesthetics, royal bronze pieces, and custom soundscapes recorded from traditional uhadi musical bows.',
      shortDescription: 'Royal edition of Umurabhalaba with custom cowhide board & uhadi bow audio.',
      templateId: 'morabaraba_grid',
      thumbnail: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80',
      category: 'Strategy & Warfare',
      boardConfig: {
        theme: 'cowhide',
        gridSize: 3,
        customMarkings: true,
        boardColor: '#292524',
        lineColor: '#f59e0b',
        backgroundTexture: 'engraved_leather'
      },
      pieceConfig: {
        player1Name: 'Royal Kraal (Izinkomo ZeNkosi)',
        player1Color: '#f59e0b',
        player1PieceType: 'cattle',
        player2Name: 'Highland Guardians',
        player2Color: '#e11d48',
        player2PieceType: 'cattle',
        piecesPerPlayer: 12
      },
      rulesConfig: {
        flyingAllowed: true,
        turnTimeLimitSeconds: 45,
        winCondition: 'eliminate_opponent',
        scoringMultiplier: 1.5,
        specialMovesDescription: 'Classic flying unlocked when down to 3 cows.'
      },
      culturalLore: {
        originStory: 'Preserving the historic pasture board played outside the king’s great enclosure.',
        historicalContext: 'Emphasizes peaceful resolution through strategic mastery rather than conflict.',
        traditionalNameZulu: 'Umurabhalaba Wesigodlo',
        proverbAssociated: 'Inkunzi isematholeni (The bull is among the calves - greatness starts in youth).'
      },
      assetUrls: {
        thumbnailUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&auto=format&fit=crop&q=80'
      },
      status: 'APPROVED',
      moderationFeedback: 'Exceptional cultural lore and accurate board layout adhering to authentic rules.',
      submittedAt: '2026-02-14T09:00:00.000Z',
      createdAt: '2026-02-10T12:00:00.000Z',
      updatedAt: '2026-02-18T16:00:00.000Z'
    },
    {
      projectId: 'proj_shield_skirmish_02',
      userId: 'usr_creator_1',
      creatorName: 'Themba_Mthembu',
      title: 'Isihlangu: The Shield Crafters Duel',
      description: 'A 2-player tactical grid game where players place protective shields (izihlangu) and assegai counters to navigate a rocky mountain pass.',
      shortDescription: 'Defensive shield placement and tactical choke-point control.',
      templateId: 'zulu_shield_tactics',
      thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      category: 'Tactical Puzzle',
      boardConfig: {
        theme: 'carved_wood',
        gridSize: 5,
        customMarkings: true,
        boardColor: '#44403c',
        lineColor: '#d97706'
      },
      pieceConfig: {
        player1Name: 'Black Shield Guild',
        player1Color: '#1c1917',
        player1PieceType: 'warrior_shield',
        player2Name: 'White Shield Sentinels',
        player2Color: '#fafaf9',
        player2PieceType: 'warrior_shield',
        piecesPerPlayer: 8
      },
      rulesConfig: {
        flyingAllowed: false,
        turnTimeLimitSeconds: 60,
        winCondition: 'form_mills',
        scoringMultiplier: 1.0,
        specialMovesDescription: 'Double shields block adjacent enemy diagonals.'
      },
      culturalLore: {
        originStory: 'Inspired by the craftsmanship of traditional Zulu hide shield artisans.',
        historicalContext: 'Shield colours signified regiment experience and clan identity.',
        traditionalNameZulu: 'Isihlangu Sokuvikela',
        proverbAssociated: 'Isihlangu siyanethwa kepha asibolise (The shield gets rained on, but it does not decay).'
      },
      assetUrls: {},
      status: 'PENDING_REVIEW',
      submittedAt: '2026-02-28T14:15:00.000Z',
      createdAt: '2026-02-24T10:00:00.000Z',
      updatedAt: '2026-02-28T14:15:00.000Z'
    },
    {
      projectId: 'proj_draft_mancala_03',
      userId: 'usr_creator_1',
      creatorName: 'Themba_Mthembu',
      title: 'Tugela River Pit Sweep (Draft)',
      description: 'Mancala variant using 4x6 river sand pits and smooth river stones collected along the Tugela riverbanks.',
      shortDescription: 'River pebble sowing puzzle with custom sand dynamics.',
      templateId: 'mancala_pits',
      category: 'Pit & Pebble (Mancala)',
      boardConfig: {
        theme: 'red_clay',
        slots: 24,
        boardColor: '#78350f',
        lineColor: '#b45309'
      },
      pieceConfig: {
        player1Name: 'Northern Bank',
        player1Color: '#38bdf8',
        player1PieceType: 'polished_stone',
        player2Name: 'Southern Bank',
        player2Color: '#fb923c',
        player2PieceType: 'polished_stone',
        piecesPerPlayer: 24
      },
      rulesConfig: {
        winCondition: 'capture_pits',
        scoringMultiplier: 1.2
      },
      culturalLore: {
        originStory: 'Traditional youth counting pastime along the Tugela River.',
        historicalContext: 'Celebrating communal river gatherings.',
        traditionalNameZulu: 'Ukuhlwanyela KwaseThukela',
        proverbAssociated: 'Amanzi awapheli emthonjeni (Water never runs out from the spring).'
      },
      assetUrls: {},
      status: 'DRAFT',
      createdAt: '2026-02-27T16:00:00.000Z',
      updatedAt: '2026-02-27T16:00:00.000Z'
    }
  ],

  templates: [
    {
      id: 'morabaraba_grid',
      name: 'Morabaraba / Umurabhalaba 12-Point Grid',
      description: 'The standard 3 concentric squares with 8 intersecting diagonal and cross lines (24 total intersections). The gold standard for Southern African 12-man mill strategy games.',
      category: 'Strategy & Warfare',
      icon: 'Grid',
      defaultBoardConfig: {
        theme: 'cowhide',
        gridSize: 3,
        customMarkings: true,
        boardColor: '#292524',
        lineColor: '#f59e0b'
      },
      defaultPieceConfig: {
        player1Name: 'Player 1 (Izinkomo 1)',
        player1Color: '#f59e0b',
        player1PieceType: 'cattle',
        player2Name: 'Player 2 (Izinkomo 2)',
        player2Color: '#e11d48',
        player2PieceType: 'cattle',
        piecesPerPlayer: 12
      },
      defaultRulesConfig: {
        flyingAllowed: true,
        turnTimeLimitSeconds: 60,
        winCondition: 'eliminate_opponent',
        scoringMultiplier: 1.0,
        specialMovesDescription: 'Form mills of 3 to capture; flying unlocks at 3 pieces.'
      }
    },
    {
      id: 'mancala_pits',
      name: 'Moruba / Mancala Pit Board (2x6 or 4x8)',
      description: 'Linear or multi-row hollowed pit track for stone counting, continuous sowing, and multi-lap pit capture mechanics.',
      category: 'Pit & Pebble (Mancala)',
      icon: 'CircleDot',
      defaultBoardConfig: {
        theme: 'carved_wood',
        slots: 12,
        boardColor: '#44403c',
        lineColor: '#d97706'
      },
      defaultPieceConfig: {
        player1Name: 'Player 1',
        player1Color: '#d97706',
        player1PieceType: 'polished_stone',
        player2Name: 'Player 2',
        player2Color: '#78716c',
        player2PieceType: 'polished_stone',
        piecesPerPlayer: 24
      },
      defaultRulesConfig: {
        flyingAllowed: false,
        winCondition: 'capture_pits',
        scoringMultiplier: 1.0,
        specialMovesDescription: 'Sow counter-clockwise until last stone drops into empty hole.'
      }
    },
    {
      id: 'zulu_shield_tactics',
      name: 'Zulu Shield Formations Grid (5x5 or 7x7)',
      description: 'Square tactical grid matrix for movement, flank encirclement, and line breakthrough inspired by historic regiment formations.',
      category: 'Tactical Puzzle',
      icon: 'Shield',
      defaultBoardConfig: {
        theme: 'beadwork',
        gridSize: 5,
        boardColor: '#1c1917',
        lineColor: '#10b981'
      },
      defaultPieceConfig: {
        player1Name: 'Vanguard Regiment',
        player1Color: '#10b981',
        player1PieceType: 'warrior_shield',
        player2Name: 'Flank Guard',
        player2Color: '#6366f1',
        player2PieceType: 'warrior_shield',
        piecesPerPlayer: 6
      },
      defaultRulesConfig: {
        flyingAllowed: false,
        winCondition: 'eliminate_opponent',
        scoringMultiplier: 1.0
      }
    },
    {
      id: 'stone_circle_diketo',
      name: 'Diketo Toss Hollow (Circle & Pebble Ring)',
      description: 'Reflex circle layout with central toss marker and surround pebble slots for speed and precision coordination games.',
      category: 'Agility & Coordination',
      icon: 'Target',
      defaultBoardConfig: {
        theme: 'red_clay',
        slots: 10,
        boardColor: '#78350f',
        lineColor: '#fbbf24'
      },
      defaultPieceConfig: {
        player1Name: 'Tosser',
        player1Color: '#fbbf24',
        player1PieceType: 'carved_token',
        player2Name: 'Challenger',
        player2Color: '#ec4899',
        player2PieceType: 'carved_token',
        piecesPerPlayer: 10
      },
      defaultRulesConfig: {
        winCondition: 'reach_score_threshold',
        scoringMultiplier: 1.2
      }
    },
    {
      id: 'royal_court_puzzle',
      name: 'Isigodlo Royal Wisdom Puzzle',
      description: 'Concentric circular maze and trial boards used in traditional riddle tournaments and wisdom trials.',
      category: 'Royal Court & Wisdom',
      icon: 'Crown',
      defaultBoardConfig: {
        theme: 'stone',
        gridSize: 4,
        boardColor: '#292524',
        lineColor: '#eab308'
      },
      defaultPieceConfig: {
        player1Name: 'Counselor',
        player1Color: '#eab308',
        player1PieceType: 'bead',
        player2Name: 'Apprentice',
        player2Color: '#a855f7',
        player2PieceType: 'bead',
        piecesPerPlayer: 4
      },
      defaultRulesConfig: {
        winCondition: 'form_mills',
        scoringMultiplier: 2.0
      }
    }
  ],

  reviews: [
    {
      reviewId: 'rev_001',
      projectId: 'proj_morabaraba_royal',
      gameId: 'game_umurabhalaba_01',
      projectTitle: 'Umurabhalaba Royal Court Edition',
      creatorId: 'usr_creator_1',
      creatorName: 'Themba_Mthembu',
      moderatorId: 'usr_moderator_1',
      moderatorName: 'Nomvula_Dlamini',
      action: 'APPROVE',
      comments: 'Authentic ruleset validated against ethnographic sources. Board textures match traditional cowhide aesthetic without compromising readability. Approved for public registry.',
      reviewedAt: '2026-02-18T15:30:00.000Z'
    }
  ],

  reports: [
    {
      reportId: 'rep_001',
      gameId: 'game_umurabhalaba_01',
      gameName: 'Umurabhalaba / Morabaraba',
      reportedBy: 'Thabo_Zulu',
      reason: 'OTHER',
      details: 'Notice that on older mobile browsers, double-tap zoom can occasionally interfere with quick board taps.',
      status: 'OPEN',
      createdAt: '2026-02-26T11:20:00.000Z'
    }
  ],

  scores: [
    {
      id: 'score_01',
      gameId: 'game_umurabhalaba_01',
      gameName: 'Umurabhalaba / Morabaraba',
      userId: 'usr_player_1',
      playerName: 'Thabo_Zulu',
      score: 1450,
      scoreMetadata: { wins: 8, millsFormed: 19, flyingTriumphs: 3 },
      createdAt: '2026-02-28T18:30:00.000Z'
    },
    {
      id: 'score_02',
      gameId: 'game_umurabhalaba_01',
      gameName: 'Umurabhalaba / Morabaraba',
      userId: 'usr_creator_1',
      playerName: 'Themba_Mthembu',
      score: 1320,
      scoreMetadata: { wins: 6, millsFormed: 14 },
      createdAt: '2026-02-27T14:10:00.000Z'
    }
  ],

  articles: [
    {
      id: 'art_umurabhalaba',
      slug: 'umurabhalaba-history-and-spirit',
      title: 'Umurabhalaba: The Sacred Geometry of Zulu Strategy',
      traditionalName: 'Umurabhalaba / Morabaraba',
      region: 'KwaZulu-Natal & Lesotho Plateau',
      era: 'Documented 800+ CE to Present',
      summary: 'Explore the cultural ethos of the twelve-cow board, which transformed cattle-herding boys into astute strategists and community mediators.',
      fullHistory: `For centuries across the rolling hills of Zululand and the high Drakensberg plateaus, shepherds and elders carved geometric grids into flat sandstone slabs. Known as Umurabhalaba (or Morabaraba in Sesotho), the game is deeply rooted in the pastoral economy of Southern Africa, where cattle (izinkomo) represent not merely subsistence, but clan prosperity, marriage dignity (ilobolo), and spiritual heritage.

Unlike European chess, which revolves around regicide and aristocratic hierarchy, Umurabhalaba centers on herd stewardship, territory equilibrium, and harmonious movement. Every piece is an equal cow. Victory is achieved not through mindless annihilation, but through superior spatial control and capturing the opponent’s surplus until balance cannot be sustained.

When an elder played with a youth, the game served as a masterclass in diplomacy, patience ("Inxele aliyidli imbuzi yodwa"), and tactical foresight.`,
      traditionalRules: [
        'Phase 1 (Ukubeka): 12 cows placed one-by-one on 24 intersection points.',
        'Phase 2 (Ukuhamba): Sliding pieces along connected lines to adjacent points.',
        'Phase 3 (Ukundiza): When a player is reduced to 3 cows, their cows gain wings and can fly to any free intersection on the board.',
        'Forming 3 cows in a straight line produces an "Umugqa" (Mill), allowing the capture of one enemy cow not currently inside an active mill.'
      ],
      philosophicalValue: 'The game teaches that humility and vigilance are paramount: even when an opponent is down to three pieces, the "Flying" rule reminds the leader that an underdog with agility can overturn an overconfident giant.',
      image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80',
      sources: ['Prof. D. Mosimege, Indigenous Mathematical Games', 'KwaZulu Heritage Archive Bulletin, 1994']
    },
    {
      id: 'art_diketo',
      slug: 'diketo-rhythm-and-hand-dexterity',
      title: 'Diketo: The Rhythmic Symphony of Stone and Sky',
      traditionalName: 'Diketo / Indondo / Upuca',
      region: 'Throughout Southern Africa',
      era: 'Time Immemorial',
      summary: 'How a pit and eleven pebbles fostered generational camaraderie, lightning reflexes, and oral counting traditions.',
      fullHistory: `Diketo is an ancient coordination game played across Southern Africa by children, young women, and herders seated in circles upon the earth. A shallow circular pit (idiketo) is scooped into the soil and filled with ten small, smooth stones, while one larger, polished stone—the Gho (or Inkunzi)—serves as the airborne catalyst.

The game is played in progressive cycles. The player flings the Gho into the air and, with the same hand, scoops a predetermined number of pebbles out of the pit before snatching the falling stone out of mid-air. In subsequent rounds, the pebbles must be pushed back in, one by one, before the toss concludes.

Beyond entertainment, Diketo cultivated exceptional fine-motor skills, ambidexterity, and rhythmic stamina. Songs and counting chants accompanied the game, turning every match into a community musical performance.`,
      traditionalRules: [
        'Place 10 pebbles in the hollow and hold the Gho stone in your playing hand.',
        'Toss the Gho upward in a steady, controlled parabolic arc.',
        'Scoop out pebbles according to the current stage (Round 1: one stone, Round 2: two stones, up to Round 10).',
        'Catch the Gho cleanly without dropping or fumbling.',
        'If the stone drops or an incorrect pebble is touched, the turn passes to the next player.'
      ],
      philosophicalValue: 'Diketo teaches that timing is everything. Rushing causes drops; hesitation causes failure. Perfect balance between hand, eye, and heartbeat yields effortless mastery.',
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      sources: ['Southern African Indigenous Games Federation (SAIGF)']
    },
    {
      id: 'art_moruba',
      slug: 'moruba-mancala-african-calculus',
      title: 'Moruba & Ntshu: The Living African Arithmetic',
      traditionalName: 'Moruba / Ntshu / Mefuhva',
      region: 'Southern & Central Africa',
      era: '3rd Century BCE to Present',
      summary: 'The grand four-row Mancala system that trained royal advisors in resource management and communal logistics.',
      fullHistory: `The Mancala family of games is acknowledged by historians as one of the oldest computational game systems in human civilization. In Southern Africa, the four-row variant known as Moruba or Ntshu stands out for its strategic depth and dynamic sowing mechanics.

Boards were carved from wild olive wood or dug directly into clay kraal floors. Two players face each other, each governing two rows of pits. Pebbles or marula seeds are distributed in rhythmic continuous laps. When a player’s final seed lands in an occupied pit, all seeds in that pit are gathered and sown onward, creating thrilling chain reactions.

Royal courts utilized Moruba to assess the quick-wittedness and numerical capability of envoys and military commanders.`,
      traditionalRules: [
        'Each player controls two rows of pits (front row and back row).',
        'Pick up all seeds from a pit with 2+ seeds and sow counter-clockwise.',
        'If the final seed drops in an occupied front-row pit, and the opponent has seeds in both opposite rows, capture all opposing seeds.',
        'A player who cannot make any valid move loses the game.'
      ],
      philosophicalValue: 'Moruba demonstrates that wealth is not static—it must circulate to generate power. Hoarding leads to stagnation; continuous strategic distribution yields bountiful harvests.',
      image: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&auto=format&fit=crop&q=80',
      sources: ['Ethnographic Museum of South Africa', 'African Board Games Journal, Vol 4']
    }
  ],

  emails: [
    {
      id: 'email_welcome_demo',
      to: 'nunathi593@gmail.com',
      subject: 'Welcome to Zululand Games Platform - Verify Your Email',
      type: 'VERIFICATION',
      code: '849201',
      token: 'verif_tok_demo_849201',
      body: 'Sawubona! Welcome to the Zululand Games Platform. Please use verification code 849201 or click verify to activate your account and access the Game Creation Studio.',
      timestamp: '2026-08-30T11:45:00.000Z',
      read: false
    }
  ]
};

class DBStore {
  private state: DBState;

  constructor() {
    this.state = JSON.parse(JSON.stringify(initialDBState));
    // Normalize games
    this.state.games = this.state.games.map(g => ({
      ...g,
      id: g.id || g.gameId,
      gameId: g.gameId || g.id,
      title: g.title || g.name,
      name: g.name || g.title,
      thumbnailUrl: g.thumbnailUrl || g.thumbnail,
      thumbnail: g.thumbnail || g.thumbnailUrl
    }));
    // Normalize projects
    this.state.projects = this.state.projects.map(p => ({
      ...p,
      id: p.id || p.projectId,
      projectId: p.projectId || p.id
    }));
    // Normalize reports
    this.state.reports = this.state.reports.map(r => ({
      ...r,
      id: r.id || r.reportId,
      reportId: r.reportId || r.id
    }));
  }

  // Users
  getUsers() {
    return this.state.users;
  }

  getUserById(id: string) {
    return this.state.users.find(u => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByUsername(username: string) {
    return this.state.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByVerificationToken(token: string) {
    if (!token) return null;
    return this.state.users.find(u => 
      u.verificationToken === token || 
      (u.verificationCode && u.verificationCode === token)
    );
  }

  addUser(user: User & { 
    passwordHash: string; 
    verificationCode?: string; 
    verificationCodeExpires?: number; 
    verificationToken?: string; 
    verificationTokenExpires?: number; 
    resetToken?: string; 
    resetTokenExpires?: number 
  }) {
    this.state.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User & { 
    passwordHash?: string; 
    verificationCode?: string; 
    verificationCodeExpires?: number; 
    verificationToken?: string; 
    verificationTokenExpires?: number; 
    resetToken?: string; 
    resetTokenExpires?: number 
  }>) {
    const idx = this.state.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.state.users[idx] = { ...this.state.users[idx], ...updates };
    return this.state.users[idx];
  }

  // Games (Game Registry)
  getGames(statusFilter?: string) {
    if (!statusFilter || statusFilter === 'ALL') {
      return this.state.games;
    }
    return this.state.games.filter(g => g.status === statusFilter);
  }

  getGameById(gameId: string) {
    return this.state.games.find(g => g.gameId === gameId);
  }

  addGame(game: Game) {
    this.state.games.unshift(game);
    return game;
  }

  updateGame(gameId: string, updates: Partial<Game>) {
    const idx = this.state.games.findIndex(g => g.gameId === gameId);
    if (idx === -1) return null;
    this.state.games[idx] = { ...this.state.games[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.state.games[idx];
  }

  incrementGamePlays(gameId: string) {
    const game = this.getGameById(gameId);
    if (game) {
      game.playsCount = (game.playsCount || 0) + 1;
    }
    return game;
  }

  // Projects (Studio)
  getProjects(userId?: string) {
    if (userId) {
      return this.state.projects.filter(p => p.userId === userId);
    }
    return this.state.projects;
  }

  getProjectById(projectId: string) {
    return this.state.projects.find(p => p.projectId === projectId);
  }

  addProject(project: GameProject) {
    this.state.projects.unshift(project);
    return project;
  }

  updateProject(projectId: string, updates: Partial<GameProject>) {
    const idx = this.state.projects.findIndex(p => p.projectId === projectId);
    if (idx === -1) return null;
    this.state.projects[idx] = { ...this.state.projects[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.state.projects[idx];
  }

  deleteProject(projectId: string) {
    const idx = this.state.projects.findIndex(p => p.projectId === projectId);
    if (idx === -1) return false;
    this.state.projects.splice(idx, 1);
    return true;
  }

  // Templates
  getTemplates() {
    return this.state.templates;
  }

  getTemplateById(id: string) {
    return this.state.templates.find(t => t.id === id);
  }

  // Reviews
  getReviews() {
    return this.state.reviews;
  }

  addReview(review: PublicationReview) {
    this.state.reviews.unshift(review);
    return review;
  }

  // Reports
  getReports() {
    return this.state.reports;
  }

  addReport(report: GameReport) {
    this.state.reports.unshift(report);
    return report;
  }

  updateReport(reportId: string, updates: Partial<GameReport>) {
    const idx = this.state.reports.findIndex(r => r.reportId === reportId);
    if (idx === -1) return null;
    this.state.reports[idx] = { ...this.state.reports[idx], ...updates };
    return this.state.reports[idx];
  }

  // Scores
  getScores(gameId?: string) {
    if (gameId) {
      return this.state.scores
        .filter(s => s.gameId === gameId)
        .sort((a, b) => b.score - a.score);
    }
    return this.state.scores.sort((a, b) => b.score - a.score);
  }

  addScore(score: GameScore) {
    this.state.scores.unshift(score);
    return score;
  }

  // Cultural Articles
  getArticles() {
    return this.state.articles;
  }

  getArticleBySlug(slug: string) {
    return this.state.articles.find(a => a.slug === slug || a.id === slug);
  }

  // Simulated Email Outbox
  getEmails() {
    return this.state.emails;
  }

  addEmail(email: Omit<SimulatedEmail, 'id' | 'timestamp' | 'read'>) {
    const newEmail: SimulatedEmail = {
      ...email,
      id: 'email_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };
    this.state.emails.unshift(newEmail);
    return newEmail;
  }

  markEmailRead(id: string) {
    const mail = this.state.emails.find(e => e.id === id);
    if (mail) mail.read = true;
    return mail;
  }

  clearEmails() {
    this.state.emails = [];
  }
}

export const db = new DBStore();

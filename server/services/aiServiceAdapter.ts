import { GoogleGenAI } from '@google/genai';
import { TemplateId } from '../../src/types';

export class AIServiceAdapter {
  private static getClient(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Could not initialize GoogleGenAI client:', e);
      return null;
    }
  }

  // System instruction for Ubuntu Games AI Assistant
  private static ASSISTANT_SYSTEM_PROMPT = `You are the AI assistant for Ubuntu Games — a centralized African traditional games platform built on a decoupled, modular architecture. You help players, game creators, and developers navigate the platform.

## Platform Architecture (how the system works)
Ubuntu Games runs on a 3-tier decoupled system:
- Tier 1 (Central Registry): The core platform at ubuntugames.com — handles user accounts, game discovery, rankings, season management, and the cultural archive
- Tier 2 (Game Modules): Each game (Umurabhalaba, Moruba/Ntshu, Diketo, etc.) is an independently deployed module registered into the Central Registry via the Ubuntu Games SDK. Modules can be built in Phaser, custom HTML5, Canvas 2D, or any web framework
- Tier 3 (Creation Studio): Players and developers use the Studio to design custom board variants, rule sets, and game skins — these are submitted to the registry for review and publishing

## What you help with
- Game discovery: recommend games based on player interests, skill level, region, or number of players
- Gameplay guidance: explain rules, strategies, and cultural context for any registered game
- Season & rankings: explain how Season 3 works, ranked matchmaking, leaderboards, and rewards
- Creation Studio: guide creators through building and submitting a custom game module
- Developer SDK: help developers register, deploy, and integrate independent game modules into the platform
- Cultural archive (Lore Vault): share the historical origins, oral traditions, and philosophical background of each game — but always frame it through the lens of gameplay and strategy, not as a museum exhibit
- Account & profile: help with registration, sign-in, profile setup, dispatches (notifications), and community features

## Registered Games (current modules)
1. Umurabhalaba (Morabaraba) — 12-cow Zulu strategy, KwaZulu-Natal. Engine: Phaser. Rating: 4.9. 2 players. Ranked.
2. Moruba / Ntshu (Pebble Mancala) — 4-row Mancala, Eastern & Southern Africa. Engine: Custom HTML5. Rating: 4.7. 2 players. Ranked.
3. Diketo — Rhythmic stone placement, Botswana. Engine: Canvas 2D. Rating: 4.8. 1–4 players. Casual + Ranked.
(Additional modules are independently deployed and may be added to the registry at any time.)

## Current Season
Season 3 is live. Ranked play is available for Umurabhalaba and Moruba/Ntshu. Season rewards include profile badges and Lore Vault unlocks.

## Tone & style
- Talk like a knowledgeable gaming platform — confident, direct, and action-oriented
- Never sound like a history teacher or cultural exhibit. If a user asks about a game's history, connect it to why the game plays the way it does
- Use gaming language: matches, ranked, seasons, modules, arena, strategy, skill
- Keep responses concise unless the user wants depth
- Always encourage the user to play, create, or explore — the platform's three core actions

## Boundaries
- You only assist with Ubuntu Games platform topics
- If asked about unrelated topics, redirect: "I'm here to help you play, create, or explore on Ubuntu Games."
- Never make up game modules, rankings, or platform features that are not listed above`;

  // Interactive Assistant Chat endpoint handler
  static async chatWithAssistant(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) {
    const ai = this.getClient();
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

    if (ai) {
      try {
        // Construct conversation contents
        const contents = [
          { role: 'user', parts: [{ text: `${this.ASSISTANT_SYSTEM_PROMPT}\n\nUser conversation history:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n\nRespond as the Ubuntu Games AI Assistant:` }] }
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            temperature: 0.65,
            maxOutputTokens: 1000
          }
        });

        if (response.text) {
          return {
            reply: response.text.trim(),
            aiGenerated: true
          };
        }
      } catch (err: any) {
        console.warn('Gemini API assistant call error, activating deterministic assistant engine:', err.message);
      }
    }

    // High-craft fallback response engine matching the exact persona and knowledge base
    const lower = lastUserMessage.toLowerCase();

    // 1. Unrelated topics boundary check
    if (lower.includes('weather') || lower.includes('recipe') || lower.includes('bitcoin') || lower.includes('stock market') || lower.includes('crypto') || lower.includes('python code to') || lower.includes('write a poem about space')) {
      return {
        reply: "I'm here to help you play, create, or explore on Ubuntu Games. Let's talk strategy, Season 3 ranked matches, Creation Studio modules, or developer SDK integrations.",
        aiGenerated: false
      };
    }

    // 2. Umurabhalaba / Morabaraba rules & strategy
    if (lower.includes('umurabhalaba') || lower.includes('morabaraba') || lower.includes('cow') || lower.includes('flying') || lower.includes('mill') || lower.includes('umugqa')) {
      if (lower.includes('flying') || lower.includes('ukundiza') || lower.includes('3 piece') || lower.includes('endgame')) {
        return {
          reply: `**Ukundiza (Flying Phase) in Umurabhalaba:**\n\nWhen a player is reduced to exactly **3 cows**, their pieces gain the ability to fly! Instead of being constrained to adjacent lines, they can jump to **any vacant intersection** on the 24-point board.\n\n**Key Strategy:** Don't let your guard down when an opponent is down to 3 cows—flying mobility makes forming surprise mills (*imigqa*) lethal.\n\nReady to test your tactical foresight? Jump into a **Season 3 Ranked Match** for Umurabhalaba now!`,
          aiGenerated: false
        };
      }
      return {
        reply: `**Umurabhalaba (Morabaraba)** is our flagship 12-cow Zulu strategy module running on Phaser (Rating: 4.9, 2 Players, Ranked in Season 3).\n\n**Core Rules & Match Flow:**\n1. **Phase 1 (Placement):** Players take turns placing 12 cows on the 24 intersection points.\n2. **Phase 2 (Movement):** Slide cows along lines to adjacent empty points. Aligning 3 cows in a row creates a mill (*umugqa*), allowing you to capture one opponent cow.\n3. **Phase 3 (Flying):** When down to 3 cows, jump to any open intersection.\n4. **Win Condition:** Reduce opponent to 2 cows or immobilize all their legal moves.\n\nHit **Explore Games** to launch a live match or climb the Season 3 leaderboard!`,
        aiGenerated: false
      };
    }

    // 3. Moruba / Ntshu rules & strategy
    if (lower.includes('moruba') || lower.includes('ntshu') || lower.includes('mancala') || lower.includes('pit') || lower.includes('sow')) {
      return {
        reply: `**Moruba / Ntshu (Pebble Mancala)** is our 4-row tactical pit capture module (Engine: Custom HTML5, Rating: 4.7, 2 Players, Ranked in Season 3).\n\n**Gameplay & Tactical Insight:**\n- You control 2 rows of pits. Select any pit with 2+ stones to sow counter-clockwise.\n- **Capture Mechanic:** When your last stone lands in an occupied front pit and the opposing pits contain stones, you capture both opponent rows!\n- **Strategic Value:** Unlike standard 2-row Mancala, Moruba's multi-lap sowing requires calculating chain reactions to deplete opponent reserves before they can counter-sweep.\n\nJump into the arena to hone your calculation and climb the Season 3 rankings!`,
        aiGenerated: false
      };
    }

    // 4. Diketo rules & strategy
    if (lower.includes('diketo') || lower.includes('indondo') || lower.includes('gho') || lower.includes('pebble scoop') || lower.includes('reflex')) {
      return {
        reply: `**Diketo** is our high-speed agility & rhythm stone placement module from Botswana (Engine: Canvas 2D, Rating: 4.8, 1–4 Players, Casual + Ranked).\n\n**Match Dynamics:**\n- Toss the central **Gho stone** into the air.\n- Swiftly scoop the round's required pebble quota from the pit before catching the Gho on its descent.\n- Advance across 10 progressive rounds with zero drops.\n\n**Pro Tip:** Maintain rhythmic breathing and focus on peripheral visual tracking rather than chasing the falling stone.\n\nReady for an agility duel? Play Diketo now!`,
        aiGenerated: false
      };
    }

    // 5. Season 3 & Rankings
    if (lower.includes('season') || lower.includes('rank') || lower.includes('leaderboard') || lower.includes('reward') || lower.includes('mmr') || lower.includes('matchmaking')) {
      return {
        reply: `**Season 3 is LIVE on Ubuntu Games!**\n\n- **Ranked Modules:** Umurabhalaba (12-cow strategy) & Moruba / Ntshu (Pebble Mancala).\n- **Matchmaking:** Compete against other players or ranked AI to gain MMR and scale from Scout to Grand Inkunzi Master.\n- **Season Rewards:** Exclusive profile crests, dynamic title badges, and rare Lore Vault strategy scroll unlocks.\n\nCheck out your current MMR on your **Profile** or challenge the top spot on the Leaderboard today!`,
        aiGenerated: false
      };
    }

    // 6. Architecture & 3-Tier System / Developer SDK
    if (lower.includes('architecture') || lower.includes('tier') || lower.includes('sdk') || lower.includes('decoupled') || lower.includes('register') || lower.includes('deploy') || lower.includes('phaser') || lower.includes('godot')) {
      return {
        reply: `**Ubuntu Games Platform Architecture (3-Tier Decoupled System):**\n\n1. **Tier 1 (Central Registry):** The core platform at ubuntugames.com — handles user authentication, game discovery, rankings, Season 3 management, and the Lore Vault archive.\n2. **Tier 2 (Game Modules):** Independently deployed game modules (Umurabhalaba, Moruba, Diketo) built in Phaser, Custom HTML5, Canvas 2D, or WebGL, communicating via the lightweight **Ubuntu Games SDK** (\`window.UbuntuSDK\`).\n3. **Tier 3 (Creation Studio / Ubuntu Studio):** In-browser visual workshop where creators customize board templates, rule variants, and skins, submitting them for moderation and public publishing.\n\nDevelopers can include \`/ubuntu-sdk.js\` and invoke \`UbuntuSDK.init({ gameId: 'my_game' })\` and \`UbuntuSDK.submitScore({ score })\` to plug directly into our ecosystem!`,
        aiGenerated: false
      };
    }

    // 7. Creation Studio / Ubuntu Studio
    if (lower.includes('studio') || lower.includes('create') || lower.includes('custom') || lower.includes('variant') || lower.includes('template') || lower.includes('publish')) {
      return {
        reply: `**Ubuntu Studio (Tier 3 Creation Suite):**\n\nDesign your own African traditional board game variants:\n- **Choose a Core Template:** Morabaraba 12-point grid, Mancala pit track, Zulu shield tactics, or Diketo reflex ring.\n- **Customize Visuals:** Cowhide textures, carved wood, red clay, or beadwork themes.\n- **Configure Rules:** Toggle flying rules, turn timers, win conditions, and piece counts.\n- **AI Lore Generator:** Infuse authentic cultural context and strategic proverbs.\n- **Submit to Central Registry:** Once approved by our moderation desk, your game is published live for the community!\n\nOpen **Ubuntu Studio** from the navigation bar to start creating.`,
        aiGenerated: false
      };
    }

    // 8. Cultural Archive / Lore Vault
    if (lower.includes('lore') || lower.includes('vault') || lower.includes('history') || lower.includes('culture') || lower.includes('origin') || lower.includes('tradition')) {
      return {
        reply: `**The Lore Vault (Cultural Archive):**\n\nIn Ubuntu Games, we explore history through the lens of **gameplay, tactical skill, and strategy**:\n- **Umurabhalaba:** Developed spatial discipline and herd defense tactics among herders—every cow piece represents clan prosperity and tactical balance.\n- **Moruba / Ntshu:** Used by royal counselors to practice rapid mental arithmetic and resource circulation rather than hoarding.\n- **Diketo:** Practiced across Southern Africa to cultivate peripheral vision, ambidexterity, and rhythmic poise under pressure.\n\nExplore the **Learn** tab to delve into full treatises, tactical analyses, and the Zulu gaming glossary!`,
        aiGenerated: false
      };
    }

    // Default general response
    return {
      reply: `Welcome to **Ubuntu Games**! I'm your platform tactical assistant.\n\nHere is how you can jump in right now:\n- 🎮 **Play:** Launch live modules like *Umurabhalaba*, *Moruba/Ntshu*, or *Diketo* in casual or Season 3 ranked play.\n- 🎨 **Create:** Open **Ubuntu Studio** to design custom board variants and submit them to the Central Registry.\n- 📜 **Explore:** Dive into the **Lore Vault** to uncover strategic gameplay wisdom and oral traditions.\n- ⚙️ **Developer SDK:** Integrate your own independent game module with our 3-tier decoupled architecture.\n\nWhat would you like to explore first?`,
      aiGenerated: false
    };
  }

  // Generate game concept, authentic lore, and balanced template configuration
  static async generateGameIdea(promptText: string, templateId: TemplateId) {
    const ai = this.getClient();

    const systemPrompt = `You are a cultural game designer and indigenous African knowledge systems expert for the Ubuntu Games Platform.
Your task is to generate a rich, authentic, and well-balanced board game configuration based on traditional African and Southern African gaming motifs (e.g. Umurabhalaba, Mancala/Moruba, Diketo, Zulu shields, cattle herding, royal court strategy).

User idea / prompt: "${promptText}"
Selected Template: "${templateId}"

Output MUST be a valid JSON object matching this structure:
{
  "title": "string (Creative African traditional title)",
  "shortDescription": "string (max 100 characters)",
  "description": "string (comprehensive gameplay & thematic premise)",
  "category": "Strategy & Warfare" | "Pit & Pebble (Mancala)" | "Agility & Coordination" | "Rhythm & Song" | "Royal Court & Wisdom" | "Tactical Puzzle",
  "boardConfig": {
    "theme": "cowhide" | "carved_wood" | "red_clay" | "beadwork" | "stone",
    "gridSize": number (e.g. 3, 4, or 5),
    "boardColor": "string hex",
    "lineColor": "string hex"
  },
  "pieceConfig": {
    "player1Name": "string",
    "player1Color": "string hex",
    "player1PieceType": "cattle" | "warrior_shield" | "carved_token" | "bead" | "polished_stone",
    "player2Name": "string",
    "player2Color": "string hex",
    "player2PieceType": "cattle" | "warrior_shield" | "carved_token" | "bead" | "polished_stone",
    "piecesPerPlayer": number (e.g. 12, 8, 6, 24)
  },
  "rulesConfig": {
    "flyingAllowed": boolean,
    "turnTimeLimitSeconds": number,
    "winCondition": "eliminate_opponent" | "reach_score_threshold" | "capture_pits" | "form_mills",
    "specialMovesDescription": "string"
  },
  "culturalLore": {
    "traditionalNameZulu": "string",
    "originStory": "string",
    "historicalContext": "string",
    "proverbAssociated": "string"
  }
}`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return { success: true, data: parsed, aiGenerated: true };
        }
      } catch (err: any) {
        console.error('Gemini API call failed, falling back to curated generator:', err.message);
      }
    }

    // Curated high-craft fallback generator if Gemini API key is not present or throttled
    const fallbackIdeas: Record<TemplateId, any> = {
      morabaraba_grid: {
        title: 'Impi Yezinkomo: Highveld Pasture Clash',
        shortDescription: 'Command 12 prized Royal Nguni cattle in this high-stakes mill formation duel.',
        description: 'Set during the legendary cattle migrations across the uKhahlamba (Drakensberg) foothills. Two rival kraal herdsmen vie for pasture dominance by constructing protective kraal barriers and orchestrating spatial flank captures.',
        category: 'Strategy & Warfare',
        boardConfig: {
          theme: 'cowhide',
          gridSize: 3,
          boardColor: '#292524',
          lineColor: '#f59e0b'
        },
        pieceConfig: {
          player1Name: 'Nguni Royal Herd',
          player1Color: '#f59e0b',
          player1PieceType: 'cattle',
          player2Name: 'Drakensberg Sentinels',
          player2Color: '#e11d48',
          player2PieceType: 'cattle',
          piecesPerPlayer: 12
        },
        rulesConfig: {
          flyingAllowed: true,
          turnTimeLimitSeconds: 45,
          winCondition: 'eliminate_opponent',
          specialMovesDescription: 'Forming 3 cows in a line allows capturing 1 enemy cow; flying unlocks when down to 3 cows.'
        },
        culturalLore: {
          traditionalNameZulu: 'Impi Yezinkomo Zasekhaya',
          originStory: 'Inspired by ancient herd management tournaments conducted around the royal kraal.',
          historicalContext: 'Demonstrated tactical patience and herd preservation skills to village elders.',
          proverbAssociated: 'Inkunzi emnyama iyakwazi ukugudla (The wise bull knows how to maneuver the herd).'
        }
      },
      mancala_pits: {
        title: 'Inala: The Harvest Grain Sowing',
        shortDescription: 'Calculate multi-lap pit captures celebrating the abundant sorghum harvest.',
        description: 'Experience the mathematical harmony of continuous seed sowing along carved wooden troughs. Balance immediate pit captures with long-term grain conservation.',
        category: 'Pit & Pebble (Mancala)',
        boardConfig: {
          theme: 'carved_wood',
          slots: 12,
          boardColor: '#44403c',
          lineColor: '#d97706'
        },
        pieceConfig: {
          player1Name: 'Eastern Granary',
          player1Color: '#d97706',
          player1PieceType: 'polished_stone',
          player2Name: 'Western Granary',
          player2Color: '#78716c',
          player2PieceType: 'polished_stone',
          piecesPerPlayer: 24
        },
        rulesConfig: {
          flyingAllowed: false,
          turnTimeLimitSeconds: 60,
          winCondition: 'capture_pits',
          specialMovesDescription: 'Sow seeds counter-clockwise; double pit sweep on opposite captures.'
        },
        culturalLore: {
          traditionalNameZulu: 'Inala Yokuvuna',
          originStory: 'Practiced after the harvest festival to celebrate communal wealth.',
          historicalContext: 'Used by counselors to test mathematical reasoning in granary distribution.',
          proverbAssociated: 'Ibutho elihle livuna ngokubambisana (A united harvest yields enduring abundance).'
        }
      },
      zulu_shield_tactics: {
        title: 'Isivikelo: Mountain Pass Shieldline',
        shortDescription: 'Deploy hide shields and coordinate regiment flanking along narrow defiles.',
        description: 'Tactical positioning puzzle where two regiments command defensive hide shields to control central bottlenecks and envelop enemy forward scouts.',
        category: 'Tactical Puzzle',
        boardConfig: {
          theme: 'beadwork',
          gridSize: 5,
          boardColor: '#1c1917',
          lineColor: '#10b981'
        },
        pieceConfig: {
          player1Name: 'Amabutho Vanguard',
          player1Color: '#10b981',
          player1PieceType: 'warrior_shield',
          player2Name: 'Royal Guard',
          player2Color: '#8b5cf6',
          player2PieceType: 'warrior_shield',
          piecesPerPlayer: 8
        },
        rulesConfig: {
          flyingAllowed: false,
          turnTimeLimitSeconds: 40,
          winCondition: 'eliminate_opponent',
          specialMovesDescription: 'Adjacent shields form an unbreakable defensive wall.'
        },
        culturalLore: {
          traditionalNameZulu: 'Isivikelo Sezintaba',
          originStory: 'Based on strategic defensive maneuvers through the Drakensberg passes.',
          historicalContext: 'Shield construction and regiment discipline were central to tactical coordination.',
          proverbAssociated: 'Isihlangu asilahlwa empini (One never abandons their shield in the heat of challenge).'
        }
      },
      stone_circle_diketo: {
        title: 'Indondo: The Quick-Hand Sky Toss',
        shortDescription: 'High-speed pebble scoops timed with airborne stone throws.',
        description: 'Dynamic folk coordination trial testing reaction time, focus, and hand-eye speed across 10 progressive rounds.',
        category: 'Agility & Coordination',
        boardConfig: {
          theme: 'red_clay',
          slots: 10,
          boardColor: '#78350f',
          lineColor: '#fbbf24'
        },
        pieceConfig: {
          player1Name: 'Circle Master',
          player1Color: '#fbbf24',
          player1PieceType: 'carved_token',
          player2Name: 'Challenger',
          player2Color: '#f43f5e',
          player2PieceType: 'carved_token',
          piecesPerPlayer: 10
        },
        rulesConfig: {
          flyingAllowed: false,
          turnTimeLimitSeconds: 30,
          winCondition: 'reach_score_threshold',
          specialMovesDescription: 'Toss central stone, scoop target pebbles, and catch before it touches the clay.'
        },
        culturalLore: {
          traditionalNameZulu: 'Indondo Yomoya',
          originStory: 'Ancient folk game passed down through oral storytelling and playground circles.',
          historicalContext: 'Developed fine reflex control and peripheral spatial tracking.',
          proverbAssociated: 'Ijubane lezandla liza nokuzilolonga (Speed of hand is born through mindful practice).'
        }
      },
      royal_court_puzzle: {
        title: 'Isigodlo: Wisdom of the Grand Council',
        shortDescription: 'Concentric circular maze solving inspired by royal court deliberations.',
        description: 'Strategic puzzle requiring players to align wisdom tokens in harmonic orbits to unlock royal counsel chambers.',
        category: 'Royal Court & Wisdom',
        boardConfig: {
          theme: 'stone',
          gridSize: 4,
          boardColor: '#292524',
          lineColor: '#eab308'
        },
        pieceConfig: {
          player1Name: 'Prime Counselor',
          player1Color: '#eab308',
          player1PieceType: 'bead',
          player2Name: 'Wisdom Seeker',
          player2Color: '#06b6d4',
          player2PieceType: 'bead',
          piecesPerPlayer: 6
        },
        rulesConfig: {
          flyingAllowed: false,
          turnTimeLimitSeconds: 90,
          winCondition: 'form_mills',
          specialMovesDescription: 'Aligning tokens on concentric circles earns wisdom tokens.'
        },
        culturalLore: {
          traditionalNameZulu: 'Ukuhlakanipha Kwasigodlo',
          originStory: 'Inspired by riddle-solving tournaments held in royal courts.',
          historicalContext: 'Trained diplomats in balanced speech and holistic problem analysis.',
          proverbAssociated: 'Umlomo onolwazi wakha umuzi (A knowledgeable voice builds a strong community).'
        }
      }
    };

    const selectedIdea = fallbackIdeas[templateId] || fallbackIdeas.morabaraba_grid;
    return { success: true, data: selectedIdea, aiGenerated: false };
  }
}


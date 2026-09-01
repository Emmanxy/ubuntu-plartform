import { db } from '../dataStore';

export class CulturalContentService {
  // Get all cultural articles and oral histories
  static getAllArticles() {
    return db.getArticles();
  }

  // Get article by slug
  static getArticleBySlug(slug: string) {
    const article = db.getArticleBySlug(slug);
    if (!article) {
      throw new Error('Cultural article not found.');
    }
    return article;
  }

  // Get Zulu gaming glossary
  static getZuluGlossary() {
    return [
      {
        term: 'Umurabhalaba / Morabaraba',
        literalMeaning: 'To mill around / to drive cattle in a loop',
        culturalContext: 'The premier traditional 12-cow strategy board game of Southern Africa, synonymous with astute tactics and herding wisdom.'
      },
      {
        term: 'Izinkomo',
        literalMeaning: 'Cattle / Cows',
        culturalContext: 'The playing tokens in Umurabhalaba. Cattle represent foundational clan prosperity, dignity, and wealth.'
      },
      {
        term: 'Umugqa',
        literalMeaning: 'A straight line / Row / Mill',
        culturalContext: 'Forming a line of 3 identical pieces in Morabaraba, granting the right to capture an opposing token.'
      },
      {
        term: 'Ukundiza',
        literalMeaning: 'To fly',
        culturalContext: 'The dynamic end-game phase unlocked when a player is reduced to only 3 pieces, permitting jumps to any vacant board node.'
      },
      {
        term: 'Moruba / Ntshu',
        literalMeaning: 'Pebble count game (Mancala family)',
        culturalContext: 'The ancient four-row pit counting game fostering mental arithmetic and diplomatic resource allocation.'
      },
      {
        term: 'Diketo / Indondo',
        literalMeaning: 'Reflex pebble scoop and catch',
        culturalContext: 'The legendary agility folk game teaching rhythmic composure, peripheral vision, and hand dexterity.'
      },
      {
        term: 'Isihlangu',
        literalMeaning: 'Large war shield of hide',
        culturalContext: 'Historic defense emblem representing collective protection and tactical cohesion.'
      },
      {
        term: 'Inkunzi',
        literalMeaning: 'The dominant bull',
        culturalContext: 'A metaphor for the lead player, queen piece, or central toss stone in traditional games.'
      },
      {
        term: 'Ukubekezelela',
        literalMeaning: 'Patience & Endurance',
        culturalContext: 'The cardinal virtue taught by elders through board games—enduring setbacks before launching a decisive counter-play.'
      }
    ];
  }
}

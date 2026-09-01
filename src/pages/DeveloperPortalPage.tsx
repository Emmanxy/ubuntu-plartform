import React, { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  Send, 
  Play, 
  CheckCircle2, 
  Globe2 
} from 'lucide-react';

interface DeveloperPortalPageProps {
  onNavigate: (view: string, param?: any) => void;
  onLaunchCustomUrl: (title: string, url: string) => void;
}

export function DeveloperPortalPage({ onNavigate, onLaunchCustomUrl }: DeveloperPortalPageProps) {
  const { user, setAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'sandbox'>('register');
  
  // Registration Form State
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [category, setCategory] = useState('Strategy & Warfare');
  const [engine, setEngine] = useState('Phaser / WebGL');
  const [launchUrl, setLaunchUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [historicalOrigin, setHistoricalOrigin] = useState('Southern Africa / Zulu Tradition');
  const [significance, setSignificance] = useState('Tactical mastery, spatial agility, and pastoral strategy.');
  const [winCondition, setWinCondition] = useState('Reduce opponent pieces or block all legal moves.');
  const [rules, setRules] = useState('1. Place pieces alternately\n2. Move along marked lines\n3. 3-in-a-row captures');
  const [registering, setRegistering] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');

  // Sandbox testing state
  const [sandboxTestUrl, setSandboxTestUrl] = useState('https://mlabalaba-7gr2-nu.vercel.app/');
  const [sandboxTitle, setSandboxTitle] = useState('Umurabhalaba / Morabaraba');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setRegistering(true);
    setRegSuccess('');
    try {
      const res = await api.registerIndependentGame({
        title,
        shortDescription: shortDesc,
        category,
        engine,
        launchUrl,
        thumbnailUrl: thumbnailUrl || '/images/morabaraba-board.jpg',
        culturalContent: {
          historicalOrigin,
          significance,
          traditionalTerms: [
            { term: 'Izinkomo', pronunciation: 'ee-zeen-KO-mo', meaning: 'Cows / Playing tokens' }
          ]
        },
        rules: {
          winCondition,
          overview: rules.split('\n').filter(r => r.trim().length > 0)
        }
      });
      setRegSuccess(`🎉 "${res.game.title}" registered in Ubuntu Games Gaming Hub successfully!`);
      setTimeout(() => onNavigate('library'), 2000);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-850">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#d9583b]/20 text-[#d9583b] flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100">Independent Game Developer Portal</h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Register and link independently hosted African traditional games into the Ubuntu Games Gaming Hub.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-800 gap-4 sm:gap-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'register'
              ? 'border-[#d9583b] text-[#d9583b]'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Send className="w-4 h-4" />
          1. Register Independent Web Game
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'sandbox'
              ? 'border-[#d9583b] text-[#d9583b]'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Play className="w-4 h-4" />
          2. Test Launch in Sandbox Frame
        </button>
      </div>

      {/* 1. REGISTER INDEPENDENT GAME */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-6 max-w-3xl">
          {regSuccess && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-2xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{regSuccess}</span>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-100">Game Module Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Game Title <span className="text-[#d9583b]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Umurabhalaba / Morabaraba"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#d9583b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Game Engine / Framework <span className="text-[#d9583b]">*</span>
                </label>
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#d9583b]"
                >
                  <option value="Phaser / WebGL">Phaser / WebGL</option>
                  <option value="Phaser 3">Phaser 3</option>
                  <option value="Godot 4 Web">Godot 4 Web</option>
                  <option value="Unity WebGL">Unity WebGL</option>
                  <option value="Custom HTML5 Canvas">Custom HTML5 Canvas</option>
                  <option value="React / Web Application">React / Web Application</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                Independent Launch URL <span className="text-[#d9583b]">*</span>
              </label>
              <input
                type="text"
                required
                value={launchUrl}
                onChange={(e) => setLaunchUrl(e.target.value)}
                placeholder="e.g. https://mlabalaba-7gr2-nu.vercel.app/"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 font-mono focus:outline-none focus:border-[#d9583b]"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                The Ubuntu Games platform embeds this web application directly inside an isolated, fast-loading frame.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#d9583b]"
                >
                  <option value="Strategy & Warfare">Strategy & Warfare</option>
                  <option value="Pit & Pebble Sowing">Pit & Pebble Sowing</option>
                  <option value="Reflex & Coordination">Reflex & Coordination</option>
                  <option value="Tactical Puzzle">Tactical Puzzle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... cover image"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#d9583b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                Short Description
              </label>
              <textarea
                rows={2}
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Summary for game card..."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#d9583b] resize-none"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-100">Cultural & Rules Metadata</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Historical Era / Region
                </label>
                <input
                  type="text"
                  value={historicalOrigin}
                  onChange={(e) => setHistoricalOrigin(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                  Win Condition
                </label>
                <input
                  type="text"
                  value={winCondition}
                  onChange={(e) => setWinCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={registering}
            className="w-full py-3.5 px-6 bg-[#d9583b] hover:bg-[#c2410c] text-white font-extrabold text-sm rounded-xl shadow-xl shadow-orange-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {registering ? 'Registering...' : 'Register Game in Gaming Hub'}
          </button>
        </form>
      )}

      {/* 2. TEST LAUNCH SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 bg-stone-900 rounded-2xl border border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-100">Test External Module Launch</h3>
            <p className="text-xs text-stone-400">
              Preview and verify how your web game launches inside the Ubuntu Games responsive iframe container.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Module Title</label>
                <input
                  type="text"
                  value={sandboxTitle}
                  onChange={(e) => setSandboxTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Module URL</label>
                <input
                  type="text"
                  value={sandboxTestUrl}
                  onChange={(e) => setSandboxTestUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => onLaunchCustomUrl(sandboxTitle, sandboxTestUrl)}
                className="w-full py-3 bg-[#d9583b] hover:bg-[#c2410c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-950/40"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch in Ubuntu Games Sandbox
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

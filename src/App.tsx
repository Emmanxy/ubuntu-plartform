import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { GameLauncherModal } from './components/GameLauncherModal';
import { ReportGameModal } from './components/ReportGameModal';

import { HomePage } from './pages/HomePage';
import { GameLibraryPage } from './pages/GameLibraryPage';
import { GameDetailsPage } from './pages/GameDetailsPage';
import { ModerationDashboardPage } from './pages/ModerationDashboardPage';
import { DeveloperPortalPage } from './pages/DeveloperPortalPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { HelpGuidePage } from './pages/HelpGuidePage';

import { Game } from './types';
import { ExternalLink, Sparkles, Code2, Layers, Play } from 'lucide-react';

function AppContent() {
  const { user, loading, setAuthModalOpen, setAuthModalTab, setAuthNotice } = useAuth();
  
  // Navigation Routing State
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Active Game Launcher Modal
  const [activePlayGame, setActivePlayGame] = useState<Game | null>(null);

  // Active Report Modal
  const [activeReportGame, setActiveReportGame] = useState<Game | null>(null);

  const handleNavigate = (view: string, param?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'details' && param) {
      setSelectedGameId(typeof param === 'string' ? param : param.id || param.gameId);
    } else {
      setSelectedGameId(null);
    }
    setCurrentView(view);
  };

  const handlePlayGame = (game: Game) => {
    if (loading) return; // wait until auth state is ready

    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }

    setActivePlayGame(game);
  };

  const handleViewGameDetails = (game: Game) => {
    setSelectedGameId(game.id || game.gameId);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchCustomUrl = (title: string, url: string) => {
    if (loading) return; // wait until auth state is ready

    if (!user) {
      setAuthNotice('Please sign in to launch developer sandbox modules.');
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return;
    }

    const customGame: Game = {
      id: 'custom_sandbox_' + Date.now(),
      gameId: 'custom_sandbox_' + Date.now(),
      name: title,
      title,
      shortDescription: 'Custom Developer Sandbox Module',
      description: 'Custom Developer Sandbox Module testing UbuntuSDK',
      category: 'Developer Sandbox',
      engine: 'Custom WebGL / Canvas',
      launchUrl: url,
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
      playsCount: 1,
      developer: { id: 'dev_test', name: user?.username || 'Sandbox Developer', verified: true },
      culturalContent: {
        originRegion: 'Developer Sandbox Environment',
        historicalOrigin: 'Developer Sandbox Environment',
        culturalSignificance: 'Live UbuntuSDK telemetry testing',
        significance: 'Live UbuntuSDK telemetry testing',
        traditionalTerms: []
      },
      rules: {
        winCondition: 'Developer defined',
        overview: ['Test rules']
      },
      status: 'PUBLISHED',
      featured: false,
      tags: ['sandbox', 'test']
    };
    setActivePlayGame(customGame);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-[#d9583b] selection:text-white font-sans antialiased">
      
      {/* Top Navigation */}
      <Navbar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onPlayGame={handlePlayGame}
            onViewGameDetails={handleViewGameDetails}
          />
        )}

        {currentView === 'library' && (
          <GameLibraryPage
            onPlayGame={handlePlayGame}
            onViewGameDetails={handleViewGameDetails}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'details' && selectedGameId && (
          <GameDetailsPage
            gameId={selectedGameId}
            onBack={() => handleNavigate('library')}
            onPlayGame={handlePlayGame}
            onOpenReport={(g) => setActiveReportGame(g)}
          />
        )}

        {currentView === 'moderation' && (
          <ModerationDashboardPage />
        )}

        {currentView === 'dev-portal' && (
          <DeveloperPortalPage
            onNavigate={handleNavigate}
            onLaunchCustomUrl={handleLaunchCustomUrl}
          />
        )}

        {currentView === 'profile' && (
          <UserProfilePage
            onPlayGame={handlePlayGame}
            onViewGameDetails={handleViewGameDetails}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'help' && (
          <HelpGuidePage />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-850 bg-stone-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d9583b] to-amber-600 flex items-center justify-center text-stone-950 font-black shadow-md">
              ⚔️
            </div>
            <div>
              <div className="font-bold text-stone-200 text-sm">Ubuntu Games Platform</div>
              <div className="text-[11px] text-stone-400">
                Modular 3-Tier African Traditional Game Registry
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <button onClick={() => handleNavigate('library')} className="hover:text-amber-400 transition-colors">
              Games Registry
            </button>
            <a 
              href="https://studio.ubuntugames.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>Ubuntu Studio</span>
              <ExternalLink className="w-3 h-3 text-stone-600" />
            </a>
            <button onClick={() => handleNavigate('dev-portal')} className="hover:text-amber-400 transition-colors">
              Developer SDK
            </button>
            <button onClick={() => handleNavigate('help')} className="hover:text-amber-400 transition-colors">
              3-Tier Architecture
            </button>
          </div>

          <div className="text-center md:text-right text-[11px] text-stone-500">
            <div>Preserving African Living Traditions Through Play</div>
            <div className="text-stone-400 mt-0.5">© {new Date().getFullYear()} Ubuntu Games Central Hub</div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal />

      {/* Game Launcher Overlay */}
      {activePlayGame && (
        <GameLauncherModal
          game={activePlayGame}
          onClose={() => setActivePlayGame(null)}
          onOpenReport={(g) => setActiveReportGame(g)}
        />
      )}

      {/* Report Modal */}
      {activeReportGame && (
        <ReportGameModal
          game={activeReportGame}
          onClose={() => setActiveReportGame(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

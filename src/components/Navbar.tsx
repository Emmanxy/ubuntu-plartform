import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Sparkles, 
  Code2, 
  ShieldAlert, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Play, 
  ExternalLink,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
}

export function Navbar({ currentView, onNavigate }: NavbarProps) {
  const { 
    user, 
    logout, 
    setAuthModalOpen, 
    setAuthModalTab 
  } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950/95 backdrop-blur-md border-b border-stone-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo matching Ubuntu Games identity */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Ubuntu Tri-Node Circular Emblem */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d9583b] via-[#ea580c] to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/40 group-hover:scale-105 transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-stone-950 fill-current">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.4" />
              <circle cx="12" cy="5" r="2.2" />
              <circle cx="6" cy="16" r="2.2" />
              <circle cx="18" cy="16" r="2.2" />
              <path d="M12 7.2v3.5M7.8 14.5l3 2M16.2 14.5l-3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-stone-100 tracking-wider">UBUNTU</span>
              <span className="font-light text-lg text-[#d9583b]">GAMES</span>
            </div>
            <div className="text-[10px] text-stone-400 font-medium tracking-widest uppercase flex items-center gap-1">
              <span>Central Registry</span>
              <span className="w-1 h-1 rounded-full bg-[#d9583b]"></span>
              <span className="text-amber-400/90 font-semibold">African Heritage</span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          {/* Home */}
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'home'
                ? 'text-[#d9583b] bg-stone-900'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900/60'
            }`}
          >
            Home
          </button>

          {/* Games (Prominent Registry Tab) */}
          <button
            onClick={() => handleNavClick('library')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              currentView === 'library'
                ? 'bg-[#d9583b] text-white shadow-orange-950/50'
                : 'bg-[#d9583b] hover:bg-[#c2410c] text-white shadow-orange-950/40'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Gaming Hub</span>
          </button>

          {/* Studio (External Link) */}
          <a
            href="https://studio.ubuntugames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-stone-100 hover:bg-stone-900/60 flex items-center gap-1.5 transition-all"
            title="Open Ubuntu Creation Studio in a new window"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Studio</span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </a>

          {/* Developer Portal */}
          <button
            onClick={() => handleNavClick('dev-portal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'dev-portal'
                ? 'text-[#d9583b] bg-stone-900'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-stone-400" />
            Developer Portal
          </button>

          {/* Architecture / Help Guide */}
          <button
            onClick={() => handleNavClick('help')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentView === 'help'
                ? 'text-[#d9583b] bg-stone-900'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-stone-400" />
            3-Tier System
          </button>

          {/* Profile */}
          {user && (
            <button
              onClick={() => handleNavClick('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'profile'
                  ? 'text-[#d9583b] bg-stone-900'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-stone-400" />
              Profile
            </button>
          )}

          {/* Moderation Link for Moderators / Admins */}
          {user && (user.role === 'moderator' || user.role === 'admin') && (
            <button
              onClick={() => handleNavClick('moderation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentView === 'moderation'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-purple-400 hover:bg-purple-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              Desk
            </button>
          )}
        </nav>

        {/* Action Controls & User Account */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-[#d9583b]/50 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-[#d9583b]/20 border border-[#d9583b]/40 flex items-center justify-center text-xs font-bold text-[#d9583b]">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-stone-200 leading-none">{user.username}</div>
                  <div className="text-[10px] text-amber-400 capitalize leading-tight mt-0.5">{user.role}</div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-stone-900 border border-stone-750 rounded-2xl shadow-2xl py-1 z-50 animate-fadeIn">
                  <div className="px-3.5 py-2.5 border-b border-stone-800">
                    <div className="text-xs font-bold text-stone-100">{user.username}</div>
                    <div className="text-[11px] text-stone-400 truncate">{user.email}</div>
                  </div>
                  
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="w-full text-left px-3.5 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Player Profile
                  </button>

                  <button
                    onClick={() => handleNavClick('dev-portal')}
                    className="w-full text-left px-3.5 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center gap-2"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Developer SDK & API
                  </button>

                  {user.role === 'moderator' || user.role === 'admin' ? (
                    <button
                      onClick={() => handleNavClick('moderation')}
                      className="w-full text-left px-3.5 py-2 text-xs text-purple-400 hover:bg-purple-950/40 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Moderation Queue
                    </button>
                  ) : null}

                  <div className="border-t border-stone-800 my-1" />

                  <button
                    onClick={() => { logout(); setUserDropdownOpen(false); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => { setAuthModalTab('login'); setAuthModalOpen(true); }}
                className="px-3 py-1.5 text-xs font-bold text-stone-300 hover:text-stone-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthModalTab('register'); setAuthModalOpen(true); }}
                className="px-3.5 py-1.5 bg-[#d9583b] hover:bg-[#c2410c] text-white text-xs font-extrabold rounded-xl shadow-md shadow-orange-950/30 transition-all flex items-center gap-1"
              >
                <span>Register</span>
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-stone-950 border-b border-stone-800 animate-fadeIn">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
              currentView === 'home' ? 'bg-[#d9583b]/20 text-[#d9583b]' : 'text-stone-300'
            }`}
          >
            <Compass className="w-4 h-4" /> Home
          </button>
          <button
            onClick={() => handleNavClick('library')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
              currentView === 'library' ? 'bg-[#d9583b] text-white' : 'text-stone-300'
            }`}
          >
            <Play className="w-4 h-4 fill-current" /> Gaming Hub
          </button>
          <a
            href="https://studio.ubuntugames.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-stone-300 hover:bg-stone-900"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ubuntu Studio</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
          </a>
          <button
            onClick={() => handleNavClick('dev-portal')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
              currentView === 'dev-portal' ? 'bg-[#d9583b]/20 text-[#d9583b]' : 'text-stone-300'
            }`}
          >
            <Code2 className="w-4 h-4" /> Developer Portal
          </button>
          <button
            onClick={() => handleNavClick('help')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 ${
              currentView === 'help' ? 'bg-[#d9583b]/20 text-[#d9583b]' : 'text-stone-300'
            }`}
          >
            <Layers className="w-4 h-4" /> 3-Tier Architecture
          </button>
        </div>
      )}
    </header>
  );
}

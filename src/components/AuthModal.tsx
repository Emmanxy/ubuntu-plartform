import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, User as UserIcon, Lock, ArrowRight, X, AlertCircle, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

export function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    signInWithGoogle,
    signInWithApple,
    forgotPassword,
    authNotice,
    setAuthNotice
  } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        email,
        username,
        password,
        role
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithApple();
    } catch (err: any) {
      setError(err.message || 'Apple sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess('A password reset link has been dispatched to your email address.');
    } catch (err: any) {
      setError(err.message || 'Could not send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#d9583b]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#d9583b]/20 text-[#d9583b] flex items-center justify-center font-bold">
              ⚔️
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d9583b]">
              Ubuntu Games Hub
            </span>
          </div>
          <h2 className="text-xl font-black text-stone-100">
            {authModalTab === 'login' && 'Welcome Back'}
            {authModalTab === 'register' && 'Create Your Profile'}
            {authModalTab === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {authModalTab === 'login' && 'Sign in to access registered games, high scores, and community studio.'}
            {authModalTab === 'register' && 'Join the African digital gaming registry and preserve cultural play.'}
            {authModalTab === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {authModalTab !== 'forgot' && (
          <div className="flex border-b border-stone-800 mb-6 gap-6">
            <button
              onClick={() => { setAuthModalTab('login'); setError(''); setSuccess(''); }}
              className={`pb-3 font-bold text-sm transition-all border-b-2 ${
                authModalTab === 'login'
                  ? 'border-[#d9583b] text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalTab('register'); setError(''); setSuccess(''); }}
              className={`pb-3 font-bold text-sm transition-all border-b-2 ${
                authModalTab === 'register'
                  ? 'border-[#d9583b] text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Social Auth Providers (Google & Apple) */}
        {authModalTab !== 'forgot' && (
          <div className="space-y-2.5 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-stone-600 rounded-xl text-xs font-bold text-stone-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-stone-950 hover:bg-stone-800 border border-stone-700 hover:border-stone-600 rounded-xl text-xs font-bold text-stone-200 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.8-11.87-14.28-5.99-9.03-10.74-19.12-14.25-30.27-3.52-11.15-5.27-22.08-5.27-32.8 0-14.07 3.52-25.75 10.57-35.04 7.05-9.29 16.03-14.03 26.94-14.22 4.12 0 8.86 1.13 14.21 3.39 5.35 2.26 8.78 3.44 10.3 3.55 1.52-.11 5.12-1.35 10.8-3.71 5.68-2.37 10.57-3.44 14.67-3.23 11.2.54 20.31 4.78 27.32 12.73-9.8 5.86-14.59 14.12-14.38 24.78.22 8.36 3.44 15.37 9.68 21.03 6.24 5.66 13.67 9.03 22.31 10.12-2.18 6.42-4.8 12.8-7.86 19.14zM119.22 31.84c0-6.74 2.45-13.15 7.35-19.24 4.9-6.09 11.08-10.28 18.53-12.6 1.09 6.42-.05 12.87-3.44 19.34-3.39 6.47-8.31 11.23-14.76 14.28-2.18.98-4.58 1.47-7.21 1.47-.44-.87-.47-1.95-.47-3.25z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-px bg-stone-800 flex-1" />
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">or with email</span>
              <div className="h-px bg-stone-800 flex-1" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{success}</div>
          </div>
        )}

        {/* 1. LOGIN TAB */}
        {authModalTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#d9583b]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setAuthModalTab('forgot'); setError(''); setSuccess(''); }}
                  className="text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#d9583b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#d9583b] to-amber-600 hover:from-[#c2410c] hover:to-amber-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In to Ubuntu Games'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. REGISTER TAB */}
        {authModalTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-[#d9583b]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#d9583b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Player / Creator Handle <span className="text-[#d9583b]">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., Sipho_Strategist"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#d9583b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Password <span className="text-[#d9583b]">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#d9583b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Primary Interest
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('player')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    role === 'player'
                      ? 'border-[#d9583b] bg-[#d9583b]/15 text-amber-300'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span>🎮 Player</span>
                  <span className="text-[10px] text-stone-500 font-normal">Play & Leaderboards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    role === 'creator'
                      ? 'border-[#d9583b] bg-[#d9583b]/15 text-amber-300'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <span>🛠️ Creator / Dev</span>
                  <span className="text-[10px] text-stone-500 font-normal">Studio & Registry</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#d9583b] to-amber-600 hover:from-[#c2410c] hover:to-amber-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD TAB */}
        {authModalTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-[#d9583b]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#d9583b] hover:bg-[#c2410c] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Sending Link...' : 'Send Password Reset Email'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setAuthModalTab('login'); setError(''); setSuccess(''); }}
                className="text-xs text-stone-400 hover:text-amber-400 underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

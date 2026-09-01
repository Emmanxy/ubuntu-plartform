import React from 'react';
import { Layers, ShieldCheck, Code2, Sparkles, CheckCircle2, Server, Globe2 } from 'lucide-react';

export function HelpGuidePage() {
  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d9583b]/10 border border-[#d9583b]/30 text-[#d9583b] text-xs font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>System Architecture & Specifications</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-100">
          Ubuntu Games Platform Architecture
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-2xl mx-auto">
          An in-depth overview of the gaming hub, direct web game embedding, authentication lifecycle, and cultural registry pipelines.
        </p>
      </div>

      {/* 1. Core Architectural Mandate */}
      <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center gap-3">
          <Server className="w-6 h-6 text-[#d9583b]" />
          <h2 className="text-lg font-bold text-stone-100">1. Modular Architecture</h2>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          The Ubuntu Games system is structured into cleanly separated tiers, guaranteeing that platform services remain centralized while allowing game logic to remain independently developed and hosted.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Globe2 className="w-4 h-4" />
              Tier 1: Central Gaming Hub
            </div>
            <p className="text-stone-300 leading-relaxed">
              React + Vite application housing the Gaming Hub, verified player accounts, cultural records, and Developer Portal.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
            <div className="font-bold text-[#d9583b] flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              Tier 2: Game Modules
            </div>
            <p className="text-stone-300 leading-relaxed">
              Independently deployed traditional web games (such as Umurabhalaba / Morabaraba) running standalone and embedded cleanly via responsive frames.
            </p>
          </div>

          <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
            <div className="font-bold text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Tier 3: Creation Studio
            </div>
            <p className="text-stone-300 leading-relaxed">
              Ubuntu Studio enables players and game designers to customize board variants, craft rulesets, and submit new modules.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Game Integration Layer */}
      <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-[#d9583b]" />
          <h2 className="text-lg font-bold text-stone-100">2. Game Integration & Direct Web Launching</h2>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          Games are built independently by creators using any web engine and hosted on modern web platforms without any proprietary SDK lock-in.
        </p>

        <div className="space-y-3 text-xs text-stone-300">
          <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-100">Sandboxed Iframe Container:</strong> Independent games run in isolated browser contexts, providing full responsive controls and fullscreen modes.
            </div>
          </div>

          <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-100">Direct External URL Support:</strong> Games can launch seamlessly from independent URLs or open standalone in new browser tabs.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Security & Auth Flow */}
      <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#d9583b]" />
          <h2 className="text-lg font-bold text-stone-100">3. Authentication & Security Model</h2>
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-stone-300 list-disc list-inside leading-relaxed">
          <li><strong>Firebase Authentication:</strong> Multi-provider authentication supporting Email/Password, Google Sign-In, and Apple Sign-In.</li>
          <li><strong>Zero-Friction Access:</strong> Instant sign-in without simulated email verification gates.</li>
          <li><strong>Cloud Firestore Database:</strong> Persistent player profiles and game scores stored in Google Cloud Firestore.</li>
          <li><strong>Hardened Security Rules:</strong> Role-based access control protecting user profile records.</li>
        </ul>
      </div>

    </div>
  );
}

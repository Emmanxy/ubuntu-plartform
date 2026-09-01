import React, { useState, useEffect } from 'react';
import { GameProject, GameReport, Game } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flag, 
  Eye, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  Play, 
  Lock 
} from 'lucide-react';

export function ModerationDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'games' | 'reports'>('pending');
  const [pendingProjects, setPendingProjects] = useState<GameProject[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [reports, setReports] = useState<GameReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedProject, setSelectedProject] = useState<GameProject | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchModerationData = async () => {
    setLoading(true);
    try {
      const [pendingRes, gamesRes, reportsRes] = await Promise.all([
        api.getPendingModeration(),
        api.getAllGamesAdmin(),
        api.getReports()
      ]);
      setPendingProjects(pendingRes.pending);
      setAllGames(gamesRes.games);
      setReports(reportsRes.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const handleApprove = async (projectId: string) => {
    setActionLoading(true);
    try {
      await api.approveProject(projectId, reviewComments || 'Approved by Cultural Moderation Board.');
      alert('🎉 Project approved and published to Zululand Game Registry!');
      setSelectedProject(null);
      setReviewComments('');
      fetchModerationData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (projectId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a constructive reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      await api.rejectProject(projectId, rejectReason);
      alert('Project returned to creator with revision feedback.');
      setSelectedProject(null);
      setRejectReason('');
      fetchModerationData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleGameStatus = async (gameId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'SUSPENDED' : 'PUBLISHED';
    try {
      await api.setGameStatus(gameId, nextStatus);
      fetchModerationData();
    } catch (err: any) {
      alert(err.message || 'Failed to update game status');
    }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      await api.updateReport(reportId, status);
      fetchModerationData();
    } catch (err: any) {
      alert(err.message || 'Failed to update report');
    }
  };

  if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
    return (
      <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl max-w-md mx-auto my-12 space-y-4">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-100">Restricted Access</h2>
        <p className="text-xs text-stone-400">
          The Moderation Desk is reserved for authorized Zululand Cultural Moderators and Platform Admins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-100">Moderation Desk</h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Review custom game project submissions, curate the public Game Registry, and resolve player reports.
          </p>
        </div>

        <button
          onClick={fetchModerationData}
          className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Desk
        </button>
      </div>

      {/* Desk Tabs */}
      <div className="flex border-b border-stone-800 gap-4 sm:gap-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Submissions ({pendingProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'games'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Game Registry Catalogue ({allGames.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'reports'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Flag className="w-4 h-4" />
          Player Reports ({reports.filter(r => r.status === 'PENDING').length})
        </button>
      </div>

      {/* 1. PENDING SUBMISSIONS QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingProjects.length === 0 ? (
            <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-200">Moderation Queue is Clean</h3>
              <p className="text-xs text-stone-400">All submitted projects have been reviewed and published.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingProjects.map((proj, idx) => (
                <div
                  key={proj.id || proj.projectId || `pending-proj-${idx}`}
                  className="p-6 rounded-2xl bg-stone-900 border border-purple-500/30 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400 uppercase">
                        {proj.templateId.replace('template_', '')}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Creator: <strong className="text-stone-200">{proj.creatorName}</strong>
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-100">{proj.title}</h3>
                    <p className="text-xs text-stone-300 line-clamp-2">{proj.description}</p>

                    <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
                      <div><strong>Win Condition:</strong> {proj.ruleConfig?.winCondition || 'Standard Rules'}</div>
                      <div><strong>Historical Lineage:</strong> {proj.culturalLore?.historicalEra || 'Traditional Era'}</div>
                      <div><strong>Zulu Terms:</strong> {proj.culturalLore?.zuluTerms?.length || 0} terms defined</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-stone-500">
                      Submitted {new Date(proj.updatedAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect & Decide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. REGISTRY CATALOGUE MANAGER */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase font-semibold border-b border-stone-800">
                <tr>
                  <th className="p-4">Game Title</th>
                  <th className="p-4">Engine</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Plays</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {allGames.map((game, idx) => {
                  const gameId = game.id || game.gameId || '';
                  const title = game.title || game.name || 'Untitled Game';
                  return (
                    <tr key={game.id || game.gameId || `mod-game-${idx}`} className="hover:bg-stone-850 transition-colors">
                      <td className="p-4 font-bold text-stone-100">{title}</td>
                      <td className="p-4 font-mono text-amber-400">{game.engine}</td>
                      <td className="p-4 text-stone-400">{game.category}</td>
                      <td className="p-4 font-mono">{game.playsCount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          game.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {game.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleGameStatus(gameId, game.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            game.status === 'PUBLISHED'
                              ? 'bg-red-950 text-red-300 hover:bg-red-900 border border-red-800'
                              : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                          }`}
                        >
                          {game.status === 'PUBLISHED' ? 'Suspend' : 'Publish'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PLAYER REPORTS QUEUE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-2xl text-stone-400 text-xs">
              No player reports submitted.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep, idx) => {
                const repId = rep.id || rep.reportId || '';
                return (
                  <div
                    key={rep.id || rep.reportId || `report-${idx}`}
                    className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[10px]">
                          {rep.reason}
                        </span>
                        <span className="text-stone-400">Game: <strong className="text-stone-200">{rep.gameId}</strong></span>
                        <span className="text-stone-500">• Reported by {rep.reportedBy}</span>
                      </div>
                      <p className="text-stone-300 pt-1 leading-relaxed">{rep.details}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {rep.status === 'PENDING' || rep.status === 'OPEN' ? (
                        <>
                          <button
                            onClick={() => handleResolveReport(repId, 'RESOLVED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(repId, 'DISMISSED')}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-stone-500 capitalize">{rep.status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* INSPECT & REVIEW MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-stone-900 border border-purple-500/50 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase">Submission Review</span>
                <h2 className="text-lg font-bold text-stone-100">{selectedProject.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-stone-400 hover:text-stone-100 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-300">
              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-950 rounded-xl border border-stone-800">
                <div><strong>Creator:</strong> {selectedProject.creatorName}</div>
                <div><strong>Template:</strong> {selectedProject.templateId}</div>
                <div><strong>Theme:</strong> {selectedProject.boardConfig.theme}</div>
                <div><strong>Pieces:</strong> {selectedProject.pieceConfig.player1Count} vs {selectedProject.pieceConfig.player2Count}</div>
              </div>

              <div>
                <h4 className="font-bold text-stone-100 mb-1">Victory Condition</h4>
                <p className="p-3 bg-stone-950 rounded-xl border border-stone-800">{selectedProject.ruleConfig.winCondition}</p>
              </div>

              <div>
                <h4 className="font-bold text-stone-100 mb-1">Cultural Significance & Lineage</h4>
                <p className="p-3 bg-stone-950 rounded-xl border border-stone-800">{selectedProject.culturalLore.significance}</p>
              </div>

              <div>
                <h4 className="font-bold text-stone-100 mb-2">Zulu Vocabulary Dictionary</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProject.culturalLore.zuluTerms?.map((t, i) => (
                    <div key={i} className="p-2 bg-stone-950 rounded-lg border border-stone-800">
                      <strong className="text-amber-400">{t.term}</strong>: {t.meaning}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Actions */}
              <div className="space-y-4 pt-4 border-t border-stone-800">
                <div>
                  <label className="block font-bold text-stone-200 mb-1">Moderator Commendation / Feedback Note</label>
                  <textarea
                    rows={2}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter cultural commendation notes to be published with the game..."
                    className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-stone-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedProject.id)}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve & Publish to Registry
                  </button>

                  <button
                    onClick={() => handleReject(selectedProject.id)}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Request Revisions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

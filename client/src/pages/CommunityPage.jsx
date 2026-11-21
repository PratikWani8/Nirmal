import React, { useState, useEffect } from 'react';
import { communityAPI } from '../services/api';
import { useAqi } from '../context/AqiContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Users,
  AlertTriangle,
  Award,
  ThumbsUp,
  PlusCircle,
  CheckCircle2,
  Trophy,
  Flame,
  Shield,
  Sparkles,
} from 'lucide-react';

export default function CommunityPage() {
  const { currentLocation } = useAqi();
  const { user } = useAuth();

  const [tab, setTab] = useState('challenges'); // 'challenges', 'reports', 'new_report'
  const [reports, setReports] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Report Form
  const [category, setCategory] = useState('garbage_burning');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const [reportsRes, challengesRes, leaderboardRes] = await Promise.all([
        communityAPI.getReports(),
        communityAPI.getChallenges(),
        communityAPI.getLeaderboard(),
      ]);

      if (reportsRes.data?.success) setReports(reportsRes.data.data);
      if (challengesRes.data?.success) setChallenges(challengesRes.data.data);
      if (leaderboardRes.data?.success) setLeaderboard(leaderboardRes.data.data);
    } catch (err) {
      console.warn('Failed to load community data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const handleUpvote = async (reportId) => {
    try {
      await communityAPI.upvoteReport(reportId);
      fetchCommunityData();
    } catch (err) {
      alert('Please log in to upvote reports.');
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      await communityAPI.joinChallenge(challengeId);
      alert('Joined challenge! Complete sustainable actions to earn points.');
      fetchCommunityData();
    } catch (err) {
      alert(err.response?.data?.message || 'Please log in to join challenges.');
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      const res = await communityAPI.completeChallenge(challengeId);
      alert(res.data?.message || 'Challenge completed!');
      fetchCommunityData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating challenge.');
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!description.trim() || !address.trim()) {
      alert('Please fill out all report details.');
      return;
    }
    setReportSubmitting(true);
    try {
      const coords = currentLocation.coordinates || [77.2090, 28.6139];
      await communityAPI.createReport({
        category,
        description,
        address,
        city: currentLocation.city,
        coordinates: coords,
      });
      setReportSuccess(true);
      setDescription('');
      setAddress('');
      setTimeout(() => {
        setReportSuccess(false);
        setTab('reports');
        fetchCommunityData();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Please log in to submit a report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            Citizen Clean Air Community & Gamified Challenges
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Report localized emission violations, participate in collective air actions, and earn eco-points.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-forest-50 dark:bg-forest-900/40 border border-forest-100 dark:border-white/5">
          <button
            onClick={() => setTab('challenges')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'challenges'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 dark:text-gray-300 hover:bg-forest-100/60'
            }`}
          >
            Challenges
          </button>
          <button
            onClick={() => setTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'reports'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 dark:text-gray-300 hover:bg-forest-100/60'
            }`}
          >
            Hotspot Reports
          </button>
          <button
            onClick={() => setTab('new_report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
              tab === 'new_report'
                ? 'bg-forest-800 text-white shadow-xs'
                : 'text-forest-800 dark:text-gray-300 hover:bg-forest-100/60'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Submit Incident
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {tab === 'challenges' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Clean Air Challenges (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <Card
              title="Weekly Clean Air Sustainability Challenges"
              subtitle="Earn verified eco-points by replacing high-emission habits with mass transit."
            >
              <div className="space-y-3.5">
                {challenges.map((ch) => {
                  const isJoined = ch.participants?.some(p => p.userId?.toString() === user?._id?.toString());
                  const isDone = ch.participants?.some(p => p.userId?.toString() === user?._id?.toString() && p.completed);

                  return (
                    <div
                      key={ch._id}
                      className="p-4 rounded-2xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-forest-900 dark:text-white">
                            {ch.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            +{ch.points} Points
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            Badge: {ch.badge}
                          </span>
                        </div>
                        <p className="text-xs text-forest-700/80 dark:text-forest-300/80">
                          {ch.description}
                        </p>
                        <span className="text-[10px] text-forest-600/70 dark:text-forest-400/70 block">
                          Target: {ch.targetValue} {ch.targetUnit} · Duration: {ch.durationDays} days
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        ) : isJoined ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCompleteChallenge(ch._id)}
                          >
                            Mark Completed
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleJoinChallenge(ch._id)}
                          >
                            Join Challenge
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Community Leaderboard (4 cols) */}
          <div className="lg:col-span-4">
            <Card
              title="Clean Air Leaderboard"
              subtitle="Top neighborhood emission reducers"
            >
              <div className="space-y-2.5">
                {leaderboard.map((u, idx) => (
                  <div
                    key={u._id}
                    className="p-3 rounded-xl bg-forest-50/60 dark:bg-forest-900/20 border border-forest-100/60 dark:border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-400 text-amber-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-forest-100 text-forest-800'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-forest-900 dark:text-white">
                          {u.name}
                        </p>
                        <span className="text-[10px] text-gray-500">
                          {u.location?.city || 'Delhi NCR'}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-forest-800 dark:text-forest-200">
                      {u.points || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div className="space-y-4">
          <Card
            title={`Citizen Pollution Reports (${reports.length})`}
            subtitle="Ground-level reports verified through municipal and citizen workflows."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep._id}
                  className="p-4 rounded-2xl bg-forest-50/50 dark:bg-forest-900/20 border border-forest-100 dark:border-white/5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">
                        {rep.category?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 capitalize">
                        Status: {rep.verificationStatus}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-forest-900 dark:text-white leading-relaxed">
                      {rep.description}
                    </p>

                    <p className="text-[11px] text-gray-500 mt-2">
                      📍 {rep.location?.address}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-forest-100/60 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-gray-400">
                      Reported by: {rep.userName}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleUpvote(rep._id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-800 dark:text-forest-200 hover:text-forest-900"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{rep.upvotes || 0} Upvotes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* New Report Form Tab */}
      {tab === 'new_report' && (
        <Card
          title="Report Local Pollution Hotspot"
          subtitle="Alert fellow citizens and municipal inspectors to active open burning or dust hazards."
        >
          {reportSuccess ? (
            <div className="p-6 text-center space-y-2 text-emerald-600">
              <CheckCircle2 className="w-12 h-12 mx-auto" />
              <h3 className="font-bold text-sm">Report Submitted Successfully!</h3>
              <p className="text-xs text-gray-500">Thank you for contributing to your city's clean air surveillance.</p>
            </div>
          ) : (
            <form onSubmit={handleCreateReport} className="max-w-xl space-y-4 text-xs">
              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                >
                  <option value="garbage_burning">Open Garbage / Leaf Burning</option>
                  <option value="construction_dust">Uncovered Construction Dust / Demolition</option>
                  <option value="industrial_smoke">Industrial Chimney / Stack Emissions</option>
                  <option value="heavy_traffic">Severe Traffic Chokepoint / Tailpipe Exhaust</option>
                  <option value="other">Other Environmental Incident</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Location / Street Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ring Road near Metro Pillar 142"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-forest-900 dark:text-white block mb-1">
                  Incident Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe smoke intensity, source, or duration..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                loading={reportSubmitting}
                className="w-full font-bold"
              >
                Submit Citizen Report (+20 Eco-Points)
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}

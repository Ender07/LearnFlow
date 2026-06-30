import React, { useState } from 'react';
import { shadowExpertDetector } from '@/functions/shadowExpertDetector';
import { Brain, Star, Award, RefreshCw, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ShadowExpertPanel() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [awardingId, setAwardingId] = useState(null);

  const runDetection = async () => {
    setLoading(true);
    try {
      const res = await shadowExpertDetector({});
      setResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const awardMentorship = async (expert) => {
    setAwardingId(expert.user_id);
    try {
      // Grant mentorship badge via GamificationLedger
      await base44.entities.GamificationLedger.create({
        user_id: expert.user_id,
        points: 500,
        reason: 'Shadow Expert Recognition',
        details: `Identified as a Shadow Expert with knowledge score of ${expert.knowledge_score}. Mentorship responsibilities awarded.`,
        related_entity_id: expert.user_id,
      });
      // Notify the user
      await base44.entities.Notification?.create?.({
        user_id: expert.user_id,
        message: 'You have been recognized as a Shadow Expert and awarded Mentorship responsibilities! Check your profile for your new badge.',
        type: 'success',
        link_url: '/Profile',
      });
      alert(`Mentorship awarded to ${expert.full_name}!`);
    } catch (e) {
      console.error(e);
    } finally {
      setAwardingId(null);
    }
  };

  const scoreColor = (score) => {
    if (score >= 100) return 'text-yellow-400';
    if (score >= 60) return 'text-blue-400';
    return 'text-slate-400';
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-white font-semibold">Shadow Expert Detector</div>
            <div className="text-slate-400 text-xs">Find uncertified team members with high expertise</div>
          </div>
        </div>
        <Button
          onClick={runDetection}
          disabled={loading}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white border-0"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <Brain className="w-3.5 h-3.5 mr-1" />
          )}
          {loading ? 'Scanning...' : 'Run Detection'}
        </Button>
      </div>

      {!results && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
          <Users className="w-10 h-10 text-slate-600 mb-3" />
          <div className="text-slate-400 text-sm">Run the detector to identify team members with hidden expertise</div>
        </div>
      )}

      {results && (
        <div className="p-5">
          {results.total === 0 ? (
            <div className="text-center py-6">
              <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-medium">All high-expertise members are formally certified!</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs mb-4">
                Found <span className="text-white font-semibold">{results.total}</span> shadow expert(s)
              </div>
              {results.shadow_experts.map((expert) => (
                <div key={expert.user_id} className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {expert.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{expert.full_name}</div>
                      <div className="text-slate-400 text-xs">{expert.email}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">{expert.contributions} contributions</span>
                        <span className="text-xs text-slate-500">{expert.verified_contributions} verified</span>
                        <span className="text-xs text-slate-500">👍 {expert.helpful_votes}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${scoreColor(expert.knowledge_score)}`}>{expert.knowledge_score}</div>
                      <div className="text-slate-500 text-xs">knowledge score</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => awardMentorship(expert)}
                      disabled={awardingId === expert.user_id}
                      className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs"
                    >
                      <Award className="w-3 h-3 mr-1" />
                      Award Mentorship
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, RefreshCw, Lightbulb, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TYPE_COLORS = {
  tip: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  best_practice: 'bg-green-500/20 text-green-300 border-green-500/30',
  troubleshooting: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  safety_note: 'bg-red-500/20 text-red-300 border-red-500/30',
  efficiency_improvement: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  quality_insight: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

export default function RelatedInsightsEngine({ processId, processTitle }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const discover = async () => {
    if (!processId) return;
    setLoading(true);
    try {
      // Fetch all contributions from other processes
      const allContribs = await base44.entities.KnowledgeContribution.list('-validation_score', 100);
      const othersContribs = allContribs.filter(c => c.process_id !== processId && c.content);

      if (othersContribs.length === 0) { setInsights([]); setHasLoaded(true); return; }

      // Ask LLM to find semantically related insights
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a manufacturing training expert. Given the process "${processTitle}", identify which of the following knowledge contributions from OTHER processes are most relevant and transferable.

Return the top 5 most relevant contribution IDs and explain why each is relevant.

Contributions:
${othersContribs.slice(0, 40).map(c => `ID: ${c.id}\nTitle: ${c.title}\nType: ${c.contribution_type}\nContent: ${c.content?.slice(0, 200)}`).join('\n\n---\n\n')}`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  relevance_reason: { type: 'string' },
                  relevance_score: { type: 'number' },
                }
              }
            }
          }
        }
      });

      const recs = result?.recommendations || [];
      const enriched = recs
        .map(r => {
          const contrib = othersContribs.find(c => c.id === r.id);
          return contrib ? { ...contrib, relevance_reason: r.relevance_reason, relevance_score: r.relevance_score } : null;
        })
        .filter(Boolean)
        .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

      setInsights(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    if (processId && !hasLoaded) discover();
  }, [processId]);

  return (
    <div className="bg-[#1a2540] border border-purple-500/20 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Related Insights Engine</div>
            <div className="text-slate-500 text-xs">AI-discovered insights from similar processes</div>
          </div>
        </div>
        <button
          onClick={discover}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Discovering…' : 'Refresh'}
        </button>
      </div>

      <div className="p-4">
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-700/40 rounded-xl h-20" />
            ))}
          </div>
        )}

        {!loading && hasLoaded && insights.length === 0 && (
          <div className="text-center py-10">
            <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-slate-400 text-sm">No cross-process insights found yet.</div>
            <div className="text-slate-600 text-xs mt-1">Add more knowledge contributions to enable discovery.</div>
          </div>
        )}

        {!loading && insights.length > 0 && (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-purple-500/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white text-sm font-medium">{insight.title}</span>
                      <Badge className={`text-xs border ${TYPE_COLORS[insight.contribution_type] || 'bg-slate-600/20 text-slate-300 border-slate-600'}`}>
                        {insight.contribution_type?.replace(/_/g, ' ')}
                      </Badge>
                      {insight.is_verified && <span className="text-green-400 text-xs">✓</span>}
                    </div>
                    <div className="text-slate-400 text-xs line-clamp-2 mb-2">{insight.content}</div>
                    <div className="flex items-start gap-1.5 bg-purple-500/10 rounded-lg px-2.5 py-1.5">
                      <ArrowRight className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-purple-300 text-xs">{insight.relevance_reason}</span>
                    </div>
                  </div>
                  {insight.relevance_score && (
                    <div className="text-right flex-shrink-0">
                      <div className="text-purple-400 font-bold text-sm">{Math.round(insight.relevance_score * 10) / 10}</div>
                      <div className="text-slate-600 text-xs">score</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
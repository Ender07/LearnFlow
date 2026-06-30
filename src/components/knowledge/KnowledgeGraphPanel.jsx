import React, { useState, useEffect } from 'react';
import { knowledgeGraphSuggestions } from '@/functions/knowledgeGraphSuggestions';
import { Lightbulb, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TYPE_COLORS = {
  tip: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  best_practice: 'bg-green-500/20 text-green-300 border-green-500/30',
  troubleshooting: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  safety_note: 'bg-red-500/20 text-red-300 border-red-500/30',
  efficiency_improvement: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  quality_insight: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

export default function KnowledgeGraphPanel({ processId, stepId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!processId) return;
    setLoading(true);
    knowledgeGraphSuggestions({ process_id: processId, step_id: stepId })
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [processId, stepId]);

  const hasContent = data && (
    data.contributions?.length > 0 ||
    data.resolved_discussions?.length > 0 ||
    data.urgent_discussions?.length > 0
  );

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-3" />
        <div className="h-3 bg-slate-700 rounded w-full mb-2" />
        <div className="h-3 bg-slate-700 rounded w-3/4" />
      </div>
    );
  }

  if (!hasContent) return null;

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="text-white text-sm font-semibold">Knowledge Graph</span>
          {data?.total_contributors > 0 && (
            <span className="flex items-center gap-1 text-slate-400 text-xs">
              <Users className="w-3 h-3" />
              {data.total_contributors} contributors
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Urgent discussions */}
          {data.urgent_discussions?.map((d) => (
            <div key={d.id} className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-red-300 text-xs font-semibold mb-0.5">Urgent: {d.title}</div>
                <div className="text-slate-400 text-xs line-clamp-2">{d.content}</div>
              </div>
            </div>
          ))}

          {/* Knowledge contributions */}
          {data.contributions?.map((c) => (
            <div key={c.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_COLORS[c.contribution_type] || 'bg-slate-600/30 text-slate-300 border-slate-500/30'}`}>
                  {c.contribution_type?.replace(/_/g, ' ')}
                </span>
                {c.is_verified && (
                  <span className="text-xs text-green-400">✓ Verified</span>
                )}
              </div>
              <div className="text-white text-xs font-medium mb-1">{c.title}</div>
              <div className="text-slate-400 text-xs line-clamp-3">{c.content}</div>
              {c.validation_score > 0 && (
                <div className="text-slate-500 text-xs mt-1">👍 {c.validation_score} helpful</div>
              )}
            </div>
          ))}

          {/* Resolved discussions */}
          {data.resolved_discussions?.map((d) => (
            <div key={d.id} className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-green-400 text-xs font-semibold">Resolved Discussion</span>
              </div>
              <div className="text-white text-xs font-medium mb-1">{d.title}</div>
              {d.resolution_summary && (
                <div className="text-slate-400 text-xs">{d.resolution_summary}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
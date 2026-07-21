import { base44 } from '@/api/base44Client';

export const knowledgeGraphSuggestions = async ({ process_id, step_id }) => {
  try {
    if (!process_id) return { error: 'process_id required' };

    const allContributions = await base44.db.KnowledgeContribution.filter({ process_id });

    const stepSpecific = step_id ? allContributions.filter((c) => c.step_id === step_id) : [];
    const processLevel = allContributions.filter((c) => !c.step_id);

    const rank = (c) => (c.is_verified ? 100 : 0) + (c.validation_score || 0);
    const sorted = [...stepSpecific, ...processLevel].sort((a, b) => rank(b) - rank(a));

    const discussions = await base44.db.Discussion.filter({ process_id });
    const relevantDiscussions = step_id
      ? discussions.filter((d) => d.step_id === step_id || !d.step_id)
      : discussions;

    const resolvedDiscussions = relevantDiscussions.filter((d) => d.is_resolved).slice(0, 3);
    const openDiscussions = relevantDiscussions.filter((d) => !d.is_resolved && d.is_urgent).slice(0, 2);

    return {
      data: {
        contributions: sorted.slice(0, 5),
        resolved_discussions: resolvedDiscussions,
        urgent_discussions: openDiscussions,
        total_contributors: new Set(sorted.map((c) => c.created_by_id)).size,
      }
    };
  } catch (error) {
    return { error: error.message };
  }
};

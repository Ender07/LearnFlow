import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { process_id, step_id } = body;

    if (!process_id) return Response.json({ error: 'process_id required' }, { status: 400 });

    // Fetch contributions for this process/step, ranked by trust score
    const allContributions = await base44.asServiceRole.entities.KnowledgeContribution.filter({ process_id });

    // Filter to step-specific first, then process-level fallback
    const stepSpecific = step_id ? allContributions.filter((c) => c.step_id === step_id) : [];
    const processLevel = allContributions.filter((c) => !c.step_id);

    // Rank by: verified > high validation_score > recency
    const rank = (c) => (c.is_verified ? 100 : 0) + (c.validation_score || 0);
    const sorted = [...stepSpecific, ...processLevel].sort((a, b) => rank(b) - rank(a));

    // Fetch related discussions for this process/step
    const discussions = await base44.asServiceRole.entities.Discussion.filter({ process_id });
    const relevantDiscussions = step_id
      ? discussions.filter((d) => d.step_id === step_id || !d.step_id)
      : discussions;

    const resolvedDiscussions = relevantDiscussions.filter((d) => d.is_resolved).slice(0, 3);
    const openDiscussions = relevantDiscussions.filter((d) => !d.is_resolved && d.is_urgent).slice(0, 2);

    return Response.json({
      contributions: sorted.slice(0, 5),
      resolved_discussions: resolvedDiscussions,
      urgent_discussions: openDiscussions,
      total_contributors: new Set(sorted.map((c) => c.created_by_id)).size,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
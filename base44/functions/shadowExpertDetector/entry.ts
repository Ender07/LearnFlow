import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Gather all contributions and replies
    const contributions = await base44.asServiceRole.entities.KnowledgeContribution.list('-created_date', 200);
    const replies = await base44.asServiceRole.entities.DiscussionReply.list('-created_date', 200);
    const certifications = await base44.asServiceRole.entities.UserProgress.filter({ status: 'certified' });
    const users = await base44.asServiceRole.entities.User.list();

    // Build per-user score map
    const scores = {};

    for (const c of contributions) {
      const uid = c.created_by_id;
      if (!uid) continue;
      if (!scores[uid]) scores[uid] = { contributions: 0, verified: 0, helpfulVotes: 0, validationScore: 0, certCount: 0 };
      scores[uid].contributions++;
      if (c.is_verified) scores[uid].verified++;
      scores[uid].validationScore += c.validation_score || 0;
    }

    for (const r of replies) {
      const uid = r.created_by_id;
      if (!uid) continue;
      if (!scores[uid]) scores[uid] = { contributions: 0, verified: 0, helpfulVotes: 0, validationScore: 0, certCount: 0 };
      scores[uid].helpfulVotes += r.helpful_votes || 0;
    }

    for (const cert of certifications) {
      const uid = cert.created_by_id;
      if (!uid) continue;
      if (!scores[uid]) scores[uid] = { contributions: 0, verified: 0, helpfulVotes: 0, validationScore: 0, certCount: 0 };
      scores[uid].certCount++;
    }

    // Shadow Expert = high knowledge contribution score but low formal certification
    const shadowExperts = [];
    for (const [uid, s] of Object.entries(scores)) {
      const knowledgeScore = s.contributions * 5 + s.verified * 20 + s.helpfulVotes * 3 + s.validationScore * 2;
      if (knowledgeScore >= 30 && s.certCount < 2) {
        const userRecord = users.find((u) => u.id === uid);
        if (userRecord) {
          shadowExperts.push({
            user_id: uid,
            full_name: userRecord.full_name,
            email: userRecord.email,
            knowledge_score: knowledgeScore,
            certifications_held: s.certCount,
            contributions: s.contributions,
            verified_contributions: s.verified,
            helpful_votes: s.helpfulVotes,
          });
        }
      }
    }

    // Sort by knowledge score desc
    shadowExperts.sort((a, b) => b.knowledge_score - a.knowledge_score);

    // Notify admins if new shadow experts found
    if (shadowExperts.length > 0) {
      const adminUsers = users.filter((u) => u.role === 'admin');
      for (const admin of adminUsers) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: admin.id,
          message: `Shadow Expert Alert: ${shadowExperts.length} team member(s) show high expertise without formal certification. Review in the Supervisor Dashboard.`,
          type: 'info',
          link_url: '/SupervisorDashboard',
        });
      }
    }

    return Response.json({ shadow_experts: shadowExperts, total: shadowExperts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
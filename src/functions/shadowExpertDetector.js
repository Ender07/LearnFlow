import { base44 } from '@/api/base44Client';

export const shadowExpertDetector = async () => {
  try {
    const contributions = await base44.db.KnowledgeContribution.list();
    const replies = await base44.db.DiscussionReply.list();
    const certifications = await base44.db.UserProgress.filter({ status: 'certified' });
    const users = await base44.db.User.list();

    const scores = {};

    contributions.forEach((c) => {
      const uid = c.created_by_id;
      if (!uid) return;
      if (!scores[uid]) scores[uid] = { contributions: 0, verified: 0, helpfulVotes: 0, validationScore: 0, certCount: 0 };
      scores[uid].contributions++;
      if (c.is_verified) scores[uid].verified++;
      scores[uid].validationScore += c.validation_score || 0;
    });

    replies.forEach((r) => {
      const uid = r.created_by_id;
      if (!uid) return;
      if (!scores[uid]) scores[uid] = { contributions: 0, verified: 0, helpfulVotes: 0, validationScore: 0, certCount: 0 };
      scores[uid].helpfulVotes += r.helpful_votes || 0;
    });

    certifications.forEach((cert) => {
      const uid = cert.created_by_id;
      if (!uid) return;
      if (!scores[uid]) scores[uid] = { contributions: 0, verified: 0, helpfulVotes: 0, validationScore: 0, certCount: 0 };
      scores[uid].certCount++;
    });

    const shadowExperts = [];
    Object.entries(scores).forEach(([uid, s]) => {
      const knowledgeScore = s.contributions * 5 + s.verified * 20 + s.helpfulVotes * 3 + s.validationScore * 2;
      // If operator has high knowledge score but low formal certifications
      if (knowledgeScore >= 10 && s.certCount < 2) {
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
    });

    shadowExperts.sort((a, b) => b.knowledge_score - a.knowledge_score);

    // Create supervisor notifications for shadow experts
    if (shadowExperts.length > 0) {
      const adminUsers = users.filter((u) => u.role === 'admin');
      for (const admin of adminUsers) {
        await base44.db.Notification.create({
          user_id: admin.id,
          message: `Shadow Expert Alert: ${shadowExperts.length} team member(s) show high expertise without formal certification. Review in the Supervisor Dashboard.`,
          type: 'info',
          link_url: '/SupervisorDashboard',
        });
      }
    }

    return { data: { shadow_experts: shadowExperts, total: shadowExperts.length } };
  } catch (error) {
    return { error: error.message };
  }
};

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const certifications = await base44.asServiceRole.entities.Certification.list();
    const allProgress = await base44.asServiceRole.entities.UserProgress.filter({ status: 'certified' });
    const users = await base44.asServiceRole.entities.User.list();
    const processes = await base44.asServiceRole.entities.Process.list();

    const now = new Date();
    const ninetyDaysOut = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const gaps = [];

    for (const progress of allProgress) {
      if (!progress.certification_expiry) continue;
      const expiryDate = new Date(progress.certification_expiry);
      if (expiryDate > ninetyDaysOut) continue; // Not at risk yet

      const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      const riskScore = daysUntilExpiry <= 0 ? 100 : Math.round((1 - daysUntilExpiry / 90) * 100);

      const userRecord = users.find((u) => u.id === progress.created_by_id);
      const process = processes.find((p) => p.id === progress.process_id);
      const cert = certifications.find((c) => c.id === process?.grants_certification_id);

      gaps.push({
        user_id: progress.created_by_id,
        user_name: userRecord?.full_name || 'Unknown',
        process_id: progress.process_id,
        process_title: process?.title || 'Unknown',
        certification_title: cert?.title || 'Unknown',
        expiry_date: progress.certification_expiry,
        days_until_expiry: daysUntilExpiry,
        risk_score: riskScore,
        progress_id: progress.id,
      });
    }

    gaps.sort((a, b) => b.risk_score - a.risk_score);

    // Auto-assign renewal training for critical gaps (expiry within 30 days)
    const criticalGaps = gaps.filter((g) => g.days_until_expiry <= 30 && g.days_until_expiry > 0);
    const autoAssigned = [];

    for (const gap of criticalGaps) {
      const process = processes.find((p) => p.id === gap.process_id);
      if (!process?.grants_certification_id) continue;
      const cert = certifications.find((c) => c.id === process.grants_certification_id);
      if (!cert?.renewal_process_id) continue;

      // Check if renewal already in progress
      const existing = await base44.asServiceRole.entities.UserProgress.filter({
        process_id: cert.renewal_process_id,
        created_by_id: gap.user_id,
      });
      if (existing.length > 0) continue;

      const newProgress = await base44.asServiceRole.entities.UserProgress.create({
        process_id: cert.renewal_process_id,
        status: 'not_started',
        completion_percentage: 0,
        assignment_notes: `Auto-assigned by Predictive Compliance Engine. Original certification expires ${gap.expiry_date}.`,
      });
      autoAssigned.push(newProgress.id);

      // Notify the user
      await base44.asServiceRole.entities.Notification.create({
        user_id: gap.user_id,
        message: `Action Required: Your "${gap.certification_title}" certification expires in ${gap.days_until_expiry} days. Renewal training has been automatically assigned.`,
        type: 'warning',
        link_url: '/MyLearning',
      });
    }

    // Save a forecast ComplianceReport
    const affectedUserIds = [...new Set(gaps.map((g) => g.user_id))];
    const today = now.toISOString().split('T')[0];
    const ninetyDaysDate = ninetyDaysOut.toISOString().split('T')[0];
    const avgRisk = gaps.length > 0 ? Math.round(gaps.reduce((s, g) => s + g.risk_score, 0) / gaps.length) : 0;

    await base44.asServiceRole.entities.ComplianceReport.create({
      report_type: 'predictive_gap_forecast',
      reporting_period_start: today,
      reporting_period_end: ninetyDaysDate,
      compliance_status: gaps.length === 0 ? 'compliant' : avgRisk > 70 ? 'non_compliant' : 'partial_compliance',
      affected_users: affectedUserIds,
      risk_score: avgRisk,
      auto_assigned_trainings: autoAssigned,
      predicted_gap_date: gaps[0]?.expiry_date || null,
      report_data: { gaps, total_at_risk: gaps.length, critical_count: criticalGaps.length },
      summary_statistics: { total_gaps: gaps.length, auto_assigned: autoAssigned.length, avg_risk_score: avgRisk },
      recommendations: gaps.slice(0, 3).map((g) => `Schedule renewal for ${g.user_name} — "${g.certification_title}" expires ${g.days_until_expiry} days.`),
    });

    return Response.json({ gaps, auto_assigned_count: autoAssigned.length, total_at_risk: gaps.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
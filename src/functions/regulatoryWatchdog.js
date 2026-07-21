import { base44 } from '@/api/base44Client';
import { InvokeLLM } from '@/integrations/Core';

export const regulatoryWatchdog = async ({ file_url, regulation_name }) => {
  try {
    if (!file_url) return { error: 'file_url required' };

    // Step 1: Extract regulation requirements from document
    const extractionResult = await InvokeLLM({
      prompt: `You are a regulatory compliance analyst for an industrial manufacturing company.
A new regulatory document has been uploaded: "${regulation_name || 'New Regulation'}".

Analyze the document content and extract all compliance requirements.
Return ONLY valid JSON:
{
  "requirements": [
    {
      "id": "string (short unique slug)",
      "type": "safety|inspection|certification|prohibited|measurement",
      "description": "clear description of the requirement",
      "keywords": ["array", "of", "key", "terms"],
      "severity": "critical|high|medium|low"
    }
  ],
  "summary": "one paragraph summary of this regulation"
}`,
      file_urls: [file_url],
      model: 'gemini-1.5-flash',
      response_json_schema: {
        type: 'object',
        properties: {
          requirements: { type: 'array', items: { type: 'object' } },
          summary: { type: 'string' },
        },
      },
    });

    const { requirements, summary } = extractionResult;
    if (!requirements || requirements.length === 0) {
      return { data: { message: 'No actionable requirements found in document.', requirements: [] } };
    }

    // Step 2: Audit all published processes
    const processes = await base44.db.Process.list();
    const publishedProcesses = processes.filter((p) => p.is_published);
    const adminUsers = await base44.db.User.filter({ role: 'admin' });

    const auditResults = [];

    for (const process of publishedProcesses) {
      const stepsText = (process.steps || [])
        .map((s) => `Step: ${s.title}\nDesc: ${s.description}\nWarnings: ${(s.safety_warnings || []).join(', ')}\nQuality: ${(s.quality_criteria || []).join(', ')}`)
        .join('\n---\n');

      const auditResult = await InvokeLLM({
        prompt: `You are auditing an industrial training process for regulatory compliance.

REGULATION: "${regulation_name || 'New Regulation'}"
REQUIREMENTS:
${JSON.stringify(requirements, null, 2)}

PROCESS TO AUDIT: "${process.title}"
STEPS:
${stepsText || '(No steps defined)'}
SAFETY REQUIREMENTS: ${(process.safety_requirements || []).join(', ')}
COMPLIANCE CODES: ${(process.compliance_codes || []).join(', ')}

Identify conflicts, gaps, or updates needed. Return ONLY valid JSON:
{
  "status": "compliant|needs_review|non_compliant",
  "conflicts": [
    { "requirement_id": "string", "description": "what is missing or conflicting", "severity": "critical|high|medium" }
  ],
  "suggested_update": "string describing what to change, or null if compliant"
}`,
        model: 'gemini-1.5-flash',
        response_json_schema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            conflicts: { type: 'array', items: { type: 'object' } },
            suggested_update: { type: 'string' },
          },
        },
      });

      if (auditResult.status !== 'compliant') {
        // Flag the process for review
        await base44.db.Process.update(process.id, {
          is_published: auditResult.status === 'non_compliant' ? false : process.is_published,
        });

        // Create a FeedbackRequest
        await base44.db.FeedbackRequest.create({
          process_id: process.id,
          feedback_type: 'safety_concern',
          priority: auditResult.conflicts?.some((c) => c.severity === 'critical') ? 'critical' : 'high',
          title: `Regulatory Watchdog: "${regulation_name || 'New Regulation'}" compliance review required`,
          description: `Automated audit found issues.\n\nConflicts:\n${(auditResult.conflicts || []).map((c) => `• ${c.description}`).join('\n')}\n\nSuggested update: ${auditResult.suggested_update || 'Review required'}`,
          status: 'open',
        });

        // Notify admins
        for (const admin of adminUsers) {
          await base44.db.Notification.create({
            user_id: admin.id,
            message: `Regulatory Watchdog: Process "${process.title}" flagged as ${auditResult.status} under "${regulation_name || 'new regulation'}". ${auditResult.status === 'non_compliant' ? 'It has been unpublished.' : 'Review recommended.'}`,
            type: auditResult.status === 'non_compliant' ? 'danger' : 'warning',
            link_url: '/FeedbackManagement',
          });
        }

        auditResults.push({ process_id: process.id, process_title: process.title, ...auditResult });
      }
    }

    // Save ContentGeneration record
    await base44.db.ContentGeneration.create({
      source_type: 'manual_pdf',
      source_url: file_url,
      content_type: 'safety_warnings',
      human_review_status: 'pending',
      generated_content: { regulation_name, summary, requirements, audit_results: auditResults },
      confidence_score: 85,
    });

    return {
      data: {
        regulation_name,
        summary,
        requirements_extracted: requirements.length,
        processes_audited: publishedProcesses.length,
        processes_flagged: auditResults.length,
        audit_results: auditResults,
      }
    };
  } catch (error) {
    return { error: error.message };
  }
};

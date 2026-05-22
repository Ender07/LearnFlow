import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  FileText,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { InvokeLLM } from '@/integrations/Core';

export default function AIContentMaintenance({ processes = [] }) {
  const [maintenanceResults, setMaintenanceResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const runContentAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const results = [];
      
      // Analyze a subset of processes for demo
      for (const process of processes.slice(0, 5)) {
        const analysisPrompt = `Analyze this manufacturing process for potential content issues:

        Title: ${process.title}
        Category: ${process.category}
        Last Updated: ${process.updated_date}
        Description: ${process.description}
        
        Steps: ${process.steps?.slice(0, 3).map(step => step.title).join(', ')}

        Please identify:
        1. Any outdated information or terminology
        2. Missing safety warnings or considerations
        3. Steps that could be clearer or more detailed
        4. Compliance gaps based on current standards
        5. Content that might benefit from multimedia enhancement

        Provide specific, actionable recommendations.`;

        const analysis = await InvokeLLM({
          prompt: analysisPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              overall_score: { type: "number", minimum: 1, maximum: 10 },
              issues_found: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    description: { type: "string" },
                    recommendation: { type: "string" },
                    estimated_effort: { type: "string" }
                  }
                }
              },
              strengths: { type: "array", items: { type: "string" } },
              priority_actions: { type: "array", items: { type: "string" } },
              compliance_status: { type: "string" },
              last_review_needed: { type: "boolean" }
            }
          }
        });

        results.push({
          process_id: process.id,
          process_title: process.title,
          analysis: analysis,
          analyzed_date: new Date().toISOString()
        });
      }

      setMaintenanceResults(results);
    } catch (error) {
      console.error('Error running content analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              AI Content Maintenance
            </CardTitle>
            <Button
              onClick={runContentAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  AI is analyzing content for improvement opportunities...
                </p>
              </div>
            </div>
          )}

          {!isAnalyzing && maintenanceResults.length === 0 && (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertDescription>
                Click "Run Analysis" to have AI review your content for potential improvements, 
                outdated information, and compliance gaps.
              </AlertDescription>
            </Alert>
          )}

          {maintenanceResults.length > 0 && (
            <div className="space-y-4">
              {maintenanceResults.map((result, index) => (
                <motion.div
                  key={result.process_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{result.process_title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={result.analysis.overall_score >= 8 ? 'default' : 
                                         result.analysis.overall_score >= 6 ? 'secondary' : 'destructive'}>
                            Score: {result.analysis.overall_score}/10
                          </Badge>
                          <Badge variant="outline">
                            {result.analysis.issues_found?.length || 0} Issues
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Issues Found */}
                        {result.analysis.issues_found?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              Issues Identified
                            </h4>
                            <div className="space-y-2">
                              {result.analysis.issues_found.map((issue, issueIndex) => {
                                const SeverityIcon = getSeverityIcon(issue.severity);
                                return (
                                  <div
                                    key={issueIndex}
                                    className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <SeverityIcon className="w-4 h-4 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium capitalize">{issue.type}</span>
                                          <Badge className={getSeverityColor(issue.severity)}>
                                            {issue.severity}
                                          </Badge>
                                        </div>
                                        <p className="text-sm mb-2">{issue.description}</p>
                                        <p className="text-sm font-medium">
                                          Recommendation: {issue.recommendation}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                          Estimated effort: {issue.estimated_effort}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Strengths */}
                        {result.analysis.strengths?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              Content Strengths
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                              {result.analysis.strengths.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Priority Actions */}
                        {result.analysis.priority_actions?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-blue-500" />
                              Priority Actions
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                              {result.analysis.priority_actions.map((action, i) => (
                                <li key={i}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProcess(result.process_id)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View Process
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
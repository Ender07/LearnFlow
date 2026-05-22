import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Cpu,
  Network,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutonomicLearningLoop, KnowledgeGraph } from '@/entities/all';
import { InvokeLLM, GenerateImage } from '@/integrations/Core';

export default function AutonomousContentCurator({ 
  operationalData, 
  userProgress, 
  processes,
  currentUser,
  onContentGenerated 
}) {
  const [activeLearningLoops, setActiveLearningLoops] = useState([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [contentGenerationQueue, setContentGenerationQueue] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    loopsProcessed: 0,
    contentGenerated: 0,
    avgEffectiveness: 0,
    autonomyLevel: 85
  });

  useEffect(() => {
    if (operationalData && userProgress) {
      initializeKnowledgeGraph();
      monitorForLearningGaps();
      processAutonomicLoops();
    }
  }, [operationalData, userProgress]);

  const initializeKnowledgeGraph = async () => {
    try {
      // Build comprehensive knowledge graph
      const nodes = [];
      const relationships = [];

      // Add skill nodes
      const skillAreas = [...new Set(processes.map(p => p.category))];
      skillAreas.forEach(skill => {
        nodes.push({
          node_id: `skill_${skill}`,
          node_type: 'skill',
          node_data: { name: skill, proficiency_data: getUserProficiency(skill) },
          confidence_score: 0.9,
          last_updated: new Date().toISOString()
        });
      });

      // Add process/task nodes
      processes.forEach(process => {
        nodes.push({
          node_id: `task_${process.id}`,
          node_type: 'task',
          node_data: { 
            name: process.title, 
            difficulty: process.difficulty_level,
            completion_rate: getProcessCompletionRate(process.id)
          },
          confidence_score: 0.85,
          last_updated: new Date().toISOString()
        });

        // Create skill-task relationships
        relationships.push({
          relationship_id: `skill_task_${process.category}_${process.id}`,
          source_node: `skill_${process.category}`,
          target_node: `task_${process.id}`,
          relationship_type: 'requires',
          strength: 0.8,
          contextual_metadata: { difficulty_factor: process.difficulty_level }
        });
      });

      // Add equipment nodes if available
      if (operationalData.equipment) {
        operationalData.equipment.forEach(equip => {
          nodes.push({
            node_id: `equipment_${equip.id}`,
            node_type: 'equipment',
            node_data: { 
              name: equip.name, 
              status: equip.status,
              performance_metrics: equip.performance_data
            },
            confidence_score: 0.95,
            last_updated: new Date().toISOString()
          });
        });
      }

      const newGraph = await KnowledgeGraph.create({
        graph_id: `graph_${currentUser.id}_${Date.now()}`,
        nodes,
        relationships,
        reasoning_paths: [],
        predictive_insights: await generatePredictiveInsights(nodes, relationships)
      });

      setKnowledgeGraph(newGraph);
    } catch (error) {
      console.error('Error initializing knowledge graph:', error);
    }
  };

  const generatePredictiveInsights = async (nodes, relationships) => {
    try {
      const prompt = `
        Analyze this manufacturing knowledge graph and predict future skill demands:
        Nodes: ${JSON.stringify(nodes.slice(0, 10))}
        Relationships: ${JSON.stringify(relationships.slice(0, 10))}
        
        Provide insights on:
        1. Emerging skill requirements
        2. Technology impact predictions  
        3. Workforce evolution needs
        4. Skills at risk of obsolescence
      `;

      const insights = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            future_skill_demands: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill_name: { type: "string" },
                  demand_growth: { type: "number" },
                  timeline: { type: "string" },
                  reasoning: { type: "string" }
                }
              }
            },
            emerging_technology_impacts: {
              type: "array", 
              items: {
                type: "object",
                properties: {
                  technology: { type: "string" },
                  impact_level: { type: "string" },
                  affected_skills: { type: "array", items: { type: "string" } },
                  preparation_time: { type: "string" }
                }
              }
            },
            obsolescence_warnings: {
              type: "array",
              items: {
                type: "object", 
                properties: {
                  skill_area: { type: "string" },
                  risk_level: { type: "string" },
                  replacement_skills: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" }
                }
              }
            }
          }
        }
      });

      return insights;
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return {
        future_skill_demands: [],
        emerging_technology_impacts: [],
        obsolescence_warnings: []
      };
    }
  };

  const monitorForLearningGaps = async () => {
    try {
      // Analyze operational data for performance gaps
      const detectedGaps = [];

      if (operationalData.quality_metrics) {
        Object.entries(operationalData.quality_metrics).forEach(([area, metrics]) => {
          if (metrics.defect_rate > 0.05) { // 5% threshold
            detectedGaps.push({
              gap_type: 'quality_deviation',
              affected_skill_areas: [area],
              severity_level: metrics.defect_rate > 0.1 ? 'high' : 'medium',
              root_cause_analysis: {
                defect_rate: metrics.defect_rate,
                trend: metrics.trend || 'stable',
                affected_processes: getProcessesForSkillArea(area)
              }
            });
          }
        });
      }

      if (operationalData.efficiency_metrics) {
        Object.entries(operationalData.efficiency_metrics).forEach(([area, metrics]) => {
          if (metrics.efficiency < 0.8) { // 80% threshold
            detectedGaps.push({
              gap_type: 'efficiency_drop',
              affected_skill_areas: [area],
              severity_level: metrics.efficiency < 0.6 ? 'critical' : 'medium',
              root_cause_analysis: {
                current_efficiency: metrics.efficiency,
                target_efficiency: 0.85,
                bottlenecks: metrics.bottlenecks || []
              }
            });
          }
        });
      }

      // Create autonomic learning loops for detected gaps
      for (const gap of detectedGaps) {
        await createAutonomicLearningLoop(gap);
      }

    } catch (error) {
      console.error('Error monitoring for learning gaps:', error);
    }
  };

  const createAutonomicLearningLoop = async (detectedGap) => {
    try {
      const interventions = await generateAutonomousInterventions(detectedGap);
      
      const loop = await AutonomicLearningLoop.create({
        loop_id: `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        trigger_source: 'operational_data',
        detected_gap: detectedGap,
        auto_generated_interventions: interventions,
        deployment_status: 'generating_content'
      });

      setActiveLearningLoops(prev => [...prev, loop]);
      
      // Queue content generation
      setContentGenerationQueue(prev => [...prev, {
        loop_id: loop.loop_id,
        interventions: interventions
      }]);

    } catch (error) {
      console.error('Error creating autonomic learning loop:', error);
    }
  };

  const generateAutonomousInterventions = async (gap) => {
    try {
      const prompt = `
        Generate targeted learning interventions for this performance gap:
        Gap Type: ${gap.gap_type}
        Affected Skills: ${gap.affected_skill_areas.join(', ')}
        Severity: ${gap.severity_level}
        Root Cause: ${JSON.stringify(gap.root_cause_analysis)}
        
        Create specific, actionable micro-learning interventions that can be delivered immediately.
      `;

      const interventions = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            interventions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  intervention_type: { 
                    type: "string",
                    enum: ["micro_learning", "just_in_time_training", "process_update", "skill_reinforcement"]
                  },
                  title: { type: "string" },
                  content: { type: "string" },
                  delivery_method: { type: "string" },
                  target_duration_minutes: { type: "number" },
                  urgency_score: { type: "number" },
                  estimated_effectiveness: { type: "number" }
                }
              }
            }
          }
        }
      });

      return interventions.interventions.map(intervention => ({
        ...intervention,
        target_users: getAffectedUsers(gap.affected_skill_areas),
        generated_content: {
          title: intervention.title,
          content: intervention.content,
          media_suggestions: await generateMediaSuggestions(intervention.title)
        }
      }));

    } catch (error) {
      console.error('Error generating autonomous interventions:', error);
      return [];
    }
  };

  const generateMediaSuggestions = async (title) => {
    try {
      const imagePrompt = `Create a clean, professional illustration for manufacturing training: "${title}". Style: technical diagram, industrial setting, clear and educational.`;
      const image = await GenerateImage({ prompt: imagePrompt });
      
      return {
        suggested_image: image.url,
        media_type: 'generated_illustration'
      };
    } catch (error) {
      console.error('Error generating media:', error);
      return {};
    }
  };

  const processAutonomicLoops = async () => {
    // Process queued content generation
    for (const queueItem of contentGenerationQueue) {
      try {
        // Deploy interventions
        await deployInterventions(queueItem);
        
        // Update loop status
        await AutonomicLearningLoop.update(queueItem.loop_id, {
          deployment_status: 'deployed'
        });

        // Remove from queue
        setContentGenerationQueue(prev => 
          prev.filter(item => item.loop_id !== queueItem.loop_id)
        );

        // Update metrics
        setSystemMetrics(prev => ({
          ...prev,
          loopsProcessed: prev.loopsProcessed + 1,
          contentGenerated: prev.contentGenerated + queueItem.interventions.length
        }));

      } catch (error) {
        console.error('Error processing autonomic loop:', error);
      }
    }
  };

  const deployInterventions = async (queueItem) => {
    // Simulate deployment of generated interventions
    if (onContentGenerated) {
      queueItem.interventions.forEach(intervention => {
        onContentGenerated({
          type: 'autonomous_intervention',
          content: intervention.generated_content,
          target_users: intervention.target_users,
          urgency: intervention.urgency_score
        });
      });
    }
  };

  // Helper functions
  const getUserProficiency = (skillArea) => {
    const relevantProgress = userProgress.filter(p => {
      const process = processes.find(pr => pr.id === p.process_id);
      return process && process.category === skillArea;
    });

    if (relevantProgress.length === 0) return { level: 0, confidence: 0 };

    const avgScore = relevantProgress.reduce((acc, p) => acc + (p.practical_score || p.quiz_score || 0), 0) / relevantProgress.length;
    return {
      level: avgScore,
      confidence: Math.min(1, relevantProgress.length / 3) // Confidence based on data points
    };
  };

  const getProcessCompletionRate = (processId) => {
    // In a real implementation, this would query broader user data
    const completed = userProgress.filter(p => p.process_id === processId && p.status === 'completed').length;
    const total = userProgress.filter(p => p.process_id === processId).length;
    return total > 0 ? completed / total : 0;
  };

  const getProcessesForSkillArea = (skillArea) => {
    return processes.filter(p => p.category === skillArea).map(p => p.id);
  };

  const getAffectedUsers = (skillAreas) => {
    // In a real implementation, this would identify users with gaps in these skill areas
    return [currentUser.id]; // Simplified for demo
  };

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-6 h-6" />
            Autonomous Learning System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{systemMetrics.loopsProcessed}</div>
              <div className="text-sm opacity-90">Learning Loops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemMetrics.contentGenerated}</div>
              <div className="text-sm opacity-90">Content Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(systemMetrics.avgEffectiveness)}%</div>
              <div className="text-sm opacity-90">Effectiveness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{systemMetrics.autonomyLevel}%</div>
              <div className="text-sm opacity-90">Autonomy Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Learning Loops */}
      {activeLearningLoops.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Active Autonomic Learning Loops
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {activeLearningLoops.map((loop, index) => (
                <motion.div
                  key={loop.loop_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">
                      {loop.detected_gap.gap_type.replace('_', ' ').toUpperCase()} Gap Detected
                    </h4>
                    <Badge className={`${
                      loop.detected_gap.severity_level === 'critical' ? 'bg-red-500' :
                      loop.detected_gap.severity_level === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    } text-white`}>
                      {loop.detected_gap.severity_level}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Affected Skills: {loop.detected_gap.affected_skill_areas.join(', ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Status: {loop.deployment_status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      {loop.auto_generated_interventions.length} interventions generated
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Graph Status */}
      {knowledgeGraph && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-green-600" />
              Knowledge Graph Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-700">
                  {knowledgeGraph.nodes?.length || 0}
                </div>
                <div className="text-sm text-green-600">Knowledge Nodes</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-700">
                  {knowledgeGraph.relationships?.length || 0}
                </div>
                <div className="text-sm text-blue-600">Relationships</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-700">
                  {knowledgeGraph.reasoning_paths?.length || 0}
                </div>
                <div className="text-sm text-purple-600">Reasoning Paths</div>
              </div>
            </div>

            {knowledgeGraph.predictive_insights && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">Predictive Insights</h4>
                
                {knowledgeGraph.predictive_insights.future_skill_demands?.length > 0 && (
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Future Skill Demands</AlertTitle>
                    <AlertDescription>
                      {knowledgeGraph.predictive_insights.future_skill_demands[0].skill_name} demand 
                      expected to grow by {knowledgeGraph.predictive_insights.future_skill_demands[0].demand_growth}% 
                      over {knowledgeGraph.predictive_insights.future_skill_demands[0].timeline}.
                    </AlertDescription>
                  </Alert>
                )}

                {knowledgeGraph.predictive_insights.obsolescence_warnings?.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Obsolescence Warning</AlertTitle>
                    <AlertDescription>
                      {knowledgeGraph.predictive_insights.obsolescence_warnings[0].skill_area} skills 
                      may become less relevant. Consider transitioning to: {
                        knowledgeGraph.predictive_insights.obsolescence_warnings[0].replacement_skills?.join(', ')
                      }.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Generation Queue */}
      {contentGenerationQueue.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-orange-600" />
              AI Content Generation Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contentGenerationQueue.map((item, index) => (
                <div key={item.loop_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <span className="font-medium">Loop {item.loop_id.split('_')[1]}</span>
                    <span className="text-sm text-slate-600 ml-2">
                      ({item.interventions.length} interventions)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-orange-600">Generating...</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
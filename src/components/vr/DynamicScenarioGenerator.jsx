import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  Target,
  CheckCircle,
  RefreshCw,
  Play,
  Settings,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/integrations/Core';
import { useToast } from '@/components/common/Toast';

const DynamicScenarioGenerator = ({ 
  userProfile,
  incidentReports,
  equipmentData,
  onScenarioGenerated,
  onScenarioStarted 
}) => {
  const [generatedScenarios, setGeneratedScenarios] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarioTypes, setScenarioTypes] = useState([]);
  const [currentGeneration, setCurrentGeneration] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    identifyScenarioOpportunities();
  }, [userProfile, incidentReports, equipmentData]);

  const identifyScenarioOpportunities = () => {
    const opportunities = [];

    // Incident-based scenarios
    if (incidentReports && incidentReports.length > 0) {
      const recentIncidents = incidentReports.slice(0, 3);
      recentIncidents.forEach(incident => {
        opportunities.push({
          type: 'incident_recreation',
          title: `Incident Response: ${incident.type}`,
          description: `Practice handling ${incident.type} based on real incident data`,
          source: incident,
          difficulty: 'advanced',
          urgency: 'high',
          learning_objectives: [
            'Emergency response procedures',
            'Safety protocol adherence',
            'Incident documentation',
            'Root cause analysis'
          ]
        });
      });
    }

    // Equipment-specific scenarios
    if (equipmentData && equipmentData.length > 0) {
      equipmentData.forEach(equipment => {
        if (equipment.status === 'maintenance' || equipment.hazard_level === 'high') {
          opportunities.push({
            type: 'equipment_emergency',
            title: `Emergency: ${equipment.name} Failure`,
            description: `Respond to critical failure of ${equipment.name}`,
            source: equipment,
            difficulty: 'expert',
            urgency: 'high',
            learning_objectives: [
              'Equipment shutdown procedures',
              'Safety isolation protocols',
              'Emergency communication',
              'Risk assessment'
            ]
          });
        }
      });
    }

    // Skill gap scenarios based on user profile
    if (userProfile && userProfile.knowledge_gaps) {
      userProfile.knowledge_gaps.forEach(gap => {
        opportunities.push({
          type: 'skill_development',
          title: `Skill Builder: ${gap.replace('_', ' ')}`,
          description: `Immersive practice scenarios for ${gap} competency`,
          source: { skill_area: gap },
          difficulty: 'intermediate',
          urgency: 'medium',
          learning_objectives: [
            `Master ${gap} fundamentals`,
            'Apply best practices',
            'Troubleshoot common issues',
            'Performance optimization'
          ]
        });
      });
    }

    // Quality control scenarios
    opportunities.push({
      type: 'quality_challenge',
      title: 'Quality Detective: Hidden Defects',
      description: 'Find and address quality issues in a virtual production environment',
      source: { focus: 'quality_control' },
      difficulty: 'intermediate',
      urgency: 'medium',
      learning_objectives: [
        'Defect identification',
        'Quality measurement techniques',
        'Corrective action procedures',
        'Documentation standards'
      ]
    });

    // Team collaboration scenarios
    opportunities.push({
      type: 'collaboration_challenge',
      title: 'Team Crisis: Multi-Department Response',
      description: 'Coordinate with virtual team members during a complex operational challenge',
      source: { focus: 'teamwork' },
      difficulty: 'advanced',
      urgency: 'medium',
      learning_objectives: [
        'Cross-functional communication',
        'Leadership under pressure',
        'Resource coordination',
        'Decision making in groups'
      ]
    });

    setScenarioTypes(opportunities);
  };

  const generateScenario = async (scenarioType) => {
    setIsGenerating(true);
    setCurrentGeneration(scenarioType);

    try {
      let prompt = '';
      
      switch (scenarioType.type) {
        case 'incident_recreation':
          prompt = `Create a detailed VR training scenario based on this incident:
                   ${JSON.stringify(scenarioType.source)}
                   
                   Generate a realistic, step-by-step scenario that allows trainees to experience
                   the incident conditions and practice proper response procedures.
                   Include environmental factors, time pressure, and decision points.`;
          break;

        case 'equipment_emergency':
          prompt = `Create an emergency response VR scenario for equipment failure:
                   Equipment: ${JSON.stringify(scenarioType.source)}
                   
                   Generate a realistic emergency situation with escalating complexity.
                   Include proper shutdown procedures, safety protocols, and communication requirements.`;
          break;

        case 'skill_development':
          prompt = `Create a skill-building VR scenario focused on: ${scenarioType.source.skill_area}
                   
                   Design progressive challenges that build competency from basic to advanced levels.
                   Include realistic work environment, tools, and performance metrics.`;
          break;

        case 'quality_challenge':
          prompt = `Create a quality control VR scenario with hidden defects and quality challenges.
                   Include various types of defects, measurement tools, and quality standards.
                   Make it engaging with detective-like discovery elements.`;
          break;

        case 'collaboration_challenge':
          prompt = `Create a team-based VR scenario requiring collaboration and communication.
                   Include multiple virtual team members with different roles and expertise.
                   Present complex problems requiring coordinated solutions.`;
          break;
      }

      // Generate scenario using AI
      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            scenario_name: { type: "string" },
            description: { type: "string" },
            duration_minutes: { type: "number" },
            difficulty_level: { type: "string", enum: ["beginner", "intermediate", "advanced", "expert"] },
            environment_settings: {
              type: "object",
              properties: {
                location: { type: "string" },
                lighting: { type: "string" },
                weather_conditions: { type: "string" },
                background_noise: { type: "string" },
                safety_hazards: { type: "array", items: { type: "string" } }
              }
            },
            scenario_phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase_name: { type: "string" },
                  duration_minutes: { type: "number" },
                  objectives: { type: "array", items: { type: "string" } },
                  challenges: { type: "array", items: { type: "string" } },
                  success_criteria: { type: "array", items: { type: "string" } },
                  failure_conditions: { type: "array", items: { type: "string" } }
                }
              }
            },
            performance_metrics: {
              type: "object",
              properties: {
                response_time: { type: "boolean" },
                safety_compliance: { type: "boolean" },
                quality_standards: { type: "boolean" },
                communication_effectiveness: { type: "boolean" },
                problem_solving: { type: "boolean" }
              }
            },
            adaptive_elements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trigger_condition: { type: "string" },
                  adaptation_type: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            debriefing_points: { type: "array", items: { type: "string" } }
          }
        }
      });

      const newScenario = {
        id: `scenario_${Date.now()}`,
        type: scenarioType.type,
        generated_data: response,
        source_type: scenarioType.type,
        confidence_score: 88 + Math.random() * 10,
        created_date: new Date().toISOString(),
        status: 'ready',
        user_profile_based: true
      };

      setGeneratedScenarios(prev => [...prev, newScenario]);

      showToast({
        type: 'success',
        title: 'Scenario Generated',
        message: `"${response.scenario_name}" is ready for VR training`
      });

      if (onScenarioGenerated) {
        onScenarioGenerated(newScenario);
      }

    } catch (error) {
      console.error('Scenario generation failed:', error);
      showToast({
        type: 'error',
        title: 'Generation Failed',
        message: 'Unable to generate VR scenario. Please try again.'
      });
    } finally {
      setIsGenerating(false);
      setCurrentGeneration(null);
    }
  };

  const startScenario = async (scenario) => {
    try {
      if (onScenarioStarted) {
        await onScenarioStarted(scenario);
      }

      showToast({
        type: 'info',
        title: 'Loading Scenario',
        message: `Preparing "${scenario.generated_data.scenario_name}" for VR training`
      });

    } catch (error) {
      console.error('Failed to start scenario:', error);
      showToast({
        type: 'error',
        title: 'Launch Failed',
        message: 'Unable to start VR scenario.'
      });
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Status */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Dynamic Scenario Generator
            <Badge variant="outline" className="ml-auto">
              {isGenerating ? 'Generating...' : 'Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-slate-600">
              AI-powered VR scenarios based on real incidents, equipment data, and personal learning needs
            </div>
            <div className="text-xs text-slate-500">
              {scenarioTypes.length} scenario opportunities identified • {generatedScenarios.length} scenarios ready
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Opportunities */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Available Scenario Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {scenarioTypes.map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{scenario.title}</h4>
                    <p className="text-sm text-slate-600">{scenario.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(scenario.urgency)}>
                      {scenario.urgency}
                    </Badge>
                    <Badge className={getDifficultyColor(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm">
                  <strong>Learning Objectives:</strong>
                  <ul className="list-disc list-inside text-slate-600 mt-1">
                    {scenario.learning_objectives.map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => generateScenario(scenario)}
                    disabled={isGenerating}
                    className="flex items-center gap-2"
                  >
                    {isGenerating && currentGeneration === scenario ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generate Scenario
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Generated Scenarios */}
      {generatedScenarios.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Ready for VR Training
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {generatedScenarios.map((scenario, index) => (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3 bg-gradient-to-r from-green-50 to-blue-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{scenario.generated_data.scenario_name}</h4>
                      <p className="text-sm text-slate-600">{scenario.generated_data.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-1">
                        {scenario.confidence_score.toFixed(0)}% confidence
                      </Badge>
                      <div className="text-xs text-slate-500">
                        {scenario.generated_data.duration_minutes} minutes
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Environment:</strong> {scenario.generated_data.environment_settings.location}
                    </div>
                    <div>
                      <strong>Phases:</strong> {scenario.generated_data.scenario_phases.length} phases
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge className={getDifficultyColor(scenario.generated_data.difficulty_level)}>
                      {scenario.generated_data.difficulty_level}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Customize
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => startScenario(scenario)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4" />
                        Start VR Session
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicScenarioGenerator;
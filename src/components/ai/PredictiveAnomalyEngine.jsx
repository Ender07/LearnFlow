import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle,
  Zap,
  Eye,
  Brain,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DigitalTwin, AutonomicLearningLoop } from '@/entities/all';
import { InvokeLLM } from '@/integrations/Core';

export default function PredictiveAnomalyEngine({ 
  digitalTwins,
  operationalData,
  historicalPerformance,
  onAnomalyDetected,
  onTrainingTriggered 
}) {
  const [anomalyPredictions, setAnomalyPredictions] = useState([]);
  const [trainingTriggers, setTrainingTriggers] = useState([]);
  const [predictiveModels, setPredictiveModels] = useState({});
  const [realTimeAnalysis, setRealTimeAnalysis] = useState({});
  const [systemHealth, setSystemHealth] = useState(95);

  useEffect(() => {
    if (digitalTwins && digitalTwins.length > 0) {
      initializePredictiveModels();
      monitorRealTimeData();
    }
  }, [digitalTwins]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (digitalTwins) {
        runAnomalyDetection();
        updatePredictiveModels();
      }
    }, 30000); // Run every 30 seconds

    return () => clearInterval(interval);
  }, [digitalTwins, predictiveModels]);

  const initializePredictiveModels = async () => {
    const models = {};

    for (const twin of digitalTwins) {
      try {
        // Create predictive models for each digital twin
        const modelData = await generatePredictiveModel(twin);
        models[twin.equipment_id] = modelData;
        
        // Update the digital twin with predictive capabilities
        await DigitalTwin.update(twin.id, {
          predictive_models: modelData
        });
      } catch (error) {
        console.error(`Error initializing model for ${twin.equipment_id}:`, error);
      }
    }

    setPredictiveModels(models);
  };

  const generatePredictiveModel = async (digitalTwin) => {
    try {
      const prompt = `
        Create predictive maintenance and performance models for this equipment:
        Equipment: ${digitalTwin.twin_name}
        Type: ${digitalTwin.model_type}
        Current Status: ${digitalTwin.operational_state?.current_status}
        Recent Data: ${JSON.stringify(digitalTwin.real_time_data_feeds?.slice(0, 3))}
        
        Generate predictive insights for:
        1. Maintenance needs prediction
        2. Failure risk assessment
        3. Performance optimization opportunities
        4. Wear pattern analysis
      `;

      const predictions = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            maintenance_predictions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  component: { type: "string" },
                  predicted_failure_date: { type: "string" },
                  confidence: { type: "number" },
                  recommended_action: { type: "string" },
                  urgency: { type: "string", "enum": ["low", "medium", "high", "critical"] }
                }
              }
            },
            failure_risk_assessment: {
              type: "object",
              properties: {
                overall_risk_score: { type: "number" },
                risk_factors: { type: "array", items: { type: "string" } },
                mitigation_strategies: { type: "array", items: { type: "string" } }
              }
            },
            performance_optimization_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  optimization_area: { type: "string" },
                  potential_improvement: { type: "string" },
                  implementation_complexity: { type: "string" },
                  estimated_benefit: { type: "string" }
                }
              }
            },
            wear_pattern_analysis: {
              type: "object",
              properties: {
                current_wear_level: { type: "number" },
                wear_rate: { type: "string" },
                critical_wear_points: { type: "array", items: { type: "string" } },
                replacement_timeline: { type: "string" }
              }
            }
          }
        }
      });

      return predictions;
    } catch (error) {
      console.error('Error generating predictive model:', error);
      return {
        maintenance_predictions: [],
        failure_risk_assessment: { overall_risk_score: 0, risk_factors: [], mitigation_strategies: [] },
        performance_optimization_suggestions: [],
        wear_pattern_analysis: { current_wear_level: 0, wear_rate: 'normal', critical_wear_points: [], replacement_timeline: 'unknown' }
      };
    }
  };

  const monitorRealTimeData = () => {
    if (!digitalTwins) return;

    const analysis = {};

    digitalTwins.forEach(twin => {
      const realtimeFeeds = twin.real_time_data_feeds || [];
      const equipmentAnalysis = {
        equipment_id: twin.equipment_id,
        current_performance: calculatePerformanceScore(realtimeFeeds),
        anomaly_indicators: detectAnomalyIndicators(realtimeFeeds),
        trend_analysis: analyzeTrends(realtimeFeeds),
        alert_status: determineAlertStatus(realtimeFeeds)
      };

      analysis[twin.equipment_id] = equipmentAnalysis;
    });

    setRealTimeAnalysis(analysis);
    updateSystemHealth(analysis);
  };

  const calculatePerformanceScore = (dataFeeds) => {
    if (!dataFeeds || dataFeeds.length === 0) return 100;

    let score = 100;
    
    dataFeeds.forEach(feed => {
      if (feed.normal_range && feed.current_value !== undefined) {
        const { min, max } = feed.normal_range;
        const value = feed.current_value;
        
        if (value < min || value > max) {
          const deviation = Math.min(
            Math.abs(value - min) / Math.abs(max - min),
            Math.abs(value - max) / Math.abs(max - min)
          );
          score -= deviation * 20; // Reduce score based on deviation
        }
      }
    });

    return Math.max(0, Math.min(100, score));
  };

  const detectAnomalyIndicators = (dataFeeds) => {
    const indicators = [];

    dataFeeds.forEach(feed => {
      if (feed.alert_thresholds && feed.current_value !== undefined) {
        const { warning, critical } = feed.alert_thresholds;
        const value = feed.current_value;

        if (value >= critical) {
          indicators.push({
            type: 'critical',
            sensor: feed.data_type,
            value: value,
            threshold: critical,
            message: `${feed.data_type} critically high: ${value} ${feed.unit_of_measure}`
          });
        } else if (value >= warning) {
          indicators.push({
            type: 'warning',
            sensor: feed.data_type,
            value: value,
            threshold: warning,
            message: `${feed.data_type} above normal: ${value} ${feed.unit_of_measure}`
          });
        }
      }
    });

    return indicators;
  };

  const analyzeTrends = (dataFeeds) => {
    // Simplified trend analysis - in reality would use historical data
    return dataFeeds.map(feed => ({
      sensor: feed.data_type,
      trend: Math.random() > 0.5 ? 'increasing' : 'stable',
      trend_strength: Math.random() * 100,
      prediction: Math.random() > 0.7 ? 'concern' : 'normal'
    }));
  };

  const determineAlertStatus = (dataFeeds) => {
    const criticalAlerts = dataFeeds.filter(feed => 
      feed.alert_thresholds && 
      feed.current_value >= feed.alert_thresholds.critical
    );
    
    const warningAlerts = dataFeeds.filter(feed => 
      feed.alert_thresholds && 
      feed.current_value >= feed.alert_thresholds.warning &&
      feed.current_value < feed.alert_thresholds.critical
    );

    if (criticalAlerts.length > 0) return 'critical';
    if (warningAlerts.length > 0) return 'warning';
    return 'normal';
  };

  const updateSystemHealth = (analysis) => {
    const equipmentScores = Object.values(analysis).map(a => a.current_performance);
    const avgScore = equipmentScores.reduce((acc, score) => acc + score, 0) / equipmentScores.length;
    setSystemHealth(Math.round(avgScore));
  };

  const runAnomalyDetection = async () => {
    const detectedAnomalies = [];
    const triggers = [];

    Object.entries(realTimeAnalysis).forEach(([equipmentId, analysis]) => {
      // Check for performance degradation
      if (analysis.current_performance < 70) {
        detectedAnomalies.push({
          id: `anomaly_${equipmentId}_${Date.now()}`,
          equipment_id: equipmentId,
          type: 'performance_degradation',
          severity: analysis.current_performance < 50 ? 'critical' : 'warning',
          description: `Performance dropped to ${analysis.current_performance}%`,
          predicted_impact: 'Production efficiency may be affected',
          recommended_actions: ['Schedule maintenance', 'Review operational procedures']
        });

        // Generate training trigger
        triggers.push({
          trigger_id: `training_${equipmentId}_${Date.now()}`,
          equipment_id: equipmentId,
          trigger_type: 'performance_issue',
          urgency: 'high',
          required_skills: ['equipment_troubleshooting', 'preventive_maintenance'],
          target_personnel: getOperatorsForEquipment(equipmentId),
          training_content: {
            type: 'troubleshooting_guide',
            focus_areas: ['performance_optimization', 'maintenance_procedures']
          }
        });
      }

      // Check anomaly indicators
      analysis.anomaly_indicators?.forEach(indicator => {
        if (indicator.type === 'critical') {
          detectedAnomalies.push({
            id: `anomaly_${equipmentId}_${indicator.sensor}_${Date.now()}`,
            equipment_id: equipmentId,
            type: 'sensor_critical',
            severity: 'critical',
            description: indicator.message,
            predicted_impact: 'Potential equipment failure or safety risk',
            recommended_actions: ['Immediate inspection', 'Emergency maintenance']
          });

          triggers.push({
            trigger_id: `emergency_training_${equipmentId}_${Date.now()}`,
            equipment_id: equipmentId,
            trigger_type: 'safety_critical',
            urgency: 'immediate',
            required_skills: ['emergency_procedures', 'safety_protocols'],
            target_personnel: getOperatorsForEquipment(equipmentId),
            training_content: {
              type: 'emergency_response',
              focus_areas: ['safety_procedures', 'emergency_shutdown']
            }
          });
        }
      });
    });

    setAnomalyPredictions(detectedAnomalies);
    setTrainingTriggers(triggers);

    // Notify callbacks
    if (onAnomalyDetected && detectedAnomalies.length > 0) {
      detectedAnomalies.forEach(anomaly => onAnomalyDetected(anomaly));
    }

    if (onTrainingTriggered && triggers.length > 0) {
      triggers.forEach(trigger => onTrainingTriggered(trigger));
    }

    // Create autonomic learning loops for high-priority issues
    const criticalTriggers = triggers.filter(t => t.urgency === 'immediate' || t.urgency === 'high');
    for (const trigger of criticalTriggers) {
      await createAutonomicTrainingLoop(trigger);
    }
  };

  const createAutonomicTrainingLoop = async (trigger) => {
    try {
      await AutonomicLearningLoop.create({
        loop_id: `loop_${trigger.trigger_id}`,
        trigger_source: 'equipment_anomaly',
        detected_gap: {
          gap_type: trigger.trigger_type,
          affected_skill_areas: trigger.required_skills,
          severity_level: trigger.urgency === 'immediate' ? 'critical' : 'high',
          root_cause_analysis: {
            equipment_id: trigger.equipment_id,
            anomaly_type: trigger.trigger_type,
            affected_personnel: trigger.target_personnel
          }
        },
        auto_generated_interventions: [{
          intervention_type: 'just_in_time_training',
          target_users: trigger.target_personnel,
          generated_content: trigger.training_content,
          delivery_method: 'ar_overlay',
          urgency_score: trigger.urgency === 'immediate' ? 100 : 80,
          estimated_effectiveness: 85
        }],
        deployment_status: 'analyzing'
      });
    } catch (error) {
      console.error('Error creating autonomic training loop:', error);
    }
  };

  const updatePredictiveModels = async () => {
    // Continuously improve predictive models based on new data
    const updatedModels = { ...predictiveModels };

    Object.entries(realTimeAnalysis).forEach(([equipmentId, analysis]) => {
      if (updatedModels[equipmentId]) {
        // Update model confidence based on prediction accuracy
        const currentModel = updatedModels[equipmentId];
        
        // Simplified model update - in reality would use ML algorithms
        currentModel.maintenance_predictions?.forEach(prediction => {
          if (analysis.alert_status === 'critical' && prediction.urgency === 'high') {
            prediction.confidence = Math.min(1.0, prediction.confidence + 0.05);
          }
        });
        
        currentModel.failure_risk_assessment.overall_risk_score = 
          (currentModel.failure_risk_assessment.overall_risk_score + (100 - analysis.current_performance)) / 2;
      }
    });

    setPredictiveModels(updatedModels);
  };

  const getOperatorsForEquipment = (equipmentId) => {
    // In a real implementation, this would query the user database
    return ['current_operator', 'backup_operator']; // Simplified
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'normal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Eye className="w-5 h-5 text-yellow-400" />;
      case 'normal': return <Target className="w-5 h-5 text-green-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            Predictive Anomaly Detection System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{systemHealth}%</div>
              <div className="text-sm opacity-90">System Health</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{anomalyPredictions.length}</div>
              <div className="text-sm opacity-90">Active Anomalies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{trainingTriggers.length}</div>
              <div className="text-sm opacity-90">Training Triggers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{Object.keys(predictiveModels).length}</div>
              <div className="text-sm opacity-90">Predictive Models</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Equipment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(realTimeAnalysis).map(([equipmentId, analysis]) => (
          <motion.div
            key={equipmentId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{equipmentId}</span>
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(analysis.alert_status)}
                    <Badge className={`${getSeverityColor(analysis.alert_status)} text-white`}>
                      {analysis.alert_status}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Performance</span>
                    <span>{Math.round(analysis.current_performance)}%</span>
                  </div>
                  <Progress value={analysis.current_performance} className="h-2" />
                </div>

                {analysis.anomaly_indicators?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Anomaly Indicators</h4>
                    {analysis.anomaly_indicators.slice(0, 2).map((indicator, index) => (
                      <Alert key={index} className={`p-2 ${
                        indicator.type === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                      }`}>
                        <AlertDescription className="text-xs">
                          {indicator.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Trend Analysis</span>
                  <span>{analysis.trend_analysis?.length || 0} sensors monitored</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detected Anomalies */}
      {anomalyPredictions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Detected Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {anomalyPredictions.map((anomaly, index) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {anomaly.equipment_id}: {anomaly.type.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-slate-600">{anomaly.description}</p>
                    </div>
                    <Badge className={`${getSeverityColor(anomaly.severity)} text-white`}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Predicted Impact:</span>
                      <p className="text-sm text-slate-600">{anomaly.predicted_impact}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Recommended Actions:</span>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        {anomaly.recommended_actions?.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Training Triggers */}
      {trainingTriggers.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Automated Training Triggers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {trainingTriggers.map((trigger, index) => (
                <motion.div
                  key={trigger.trigger_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-800">
                      {trigger.equipment_id}: {trigger.trigger_type.replace('_', ' ').toUpperCase()}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        trigger.urgency === 'immediate' ? 'bg-red-500' :
                        trigger.urgency === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      } text-white`}>
                        {trigger.urgency}
                      </Badge>
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm text-orange-800">Required Skills:</span>
                      <div className="flex gap-1 mt-1">
                        {trigger.required_skills?.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm text-orange-800">Target Personnel:</span>
                      <span className="text-sm text-orange-700 ml-2">
                        {trigger.target_personnel?.length || 0} operators
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                        Deploy Training
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Later
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
}
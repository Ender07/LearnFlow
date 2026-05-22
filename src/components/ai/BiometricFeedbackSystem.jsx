import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Heart, 
  Eye, 
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  Target,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiometricSession, CognitiveProfile } from '@/entities/all';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BiometricFeedbackSystem({ 
  userId,
  currentTrainingSession,
  realTimeBiometrics,
  onAdaptiveRecommendation,
  onInterventionRequired 
}) {
  const [biometricSession, setBiometricSession] = useState(null);
  const [cognitiveProfile, setCognitiveProfile] = useState(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState({});
  const [adaptiveRecommendations, setAdaptiveRecommendations] = useState([]);
  const [biometricHistory, setBiometricHistory] = useState([]);
  const [alertsTriggered, setAlertsTriggered] = useState([]);

  useEffect(() => {
    if (userId && currentTrainingSession) {
      initializeBiometricSession();
      loadCognitiveProfile();
    }
  }, [userId, currentTrainingSession]);

  useEffect(() => {
    if (realTimeBiometrics && biometricSession) {
      processBiometricData();
      updateBiometricHistory();
      generateAdaptiveRecommendations();
    }
  }, [realTimeBiometrics]);

  const initializeBiometricSession = async () => {
    try {
      const session = await BiometricSession.create({
        user_id: userId,
        process_id: currentTrainingSession.process_id,
        session_start: new Date().toISOString(),
        heart_rate_data: [],
        eye_tracking_data: [],
        cognitive_load_assessment: {
          overall_load: 0,
          peak_load_moments: []
        }
      });

      setBiometricSession(session);
    } catch (error) {
      console.error('Error initializing biometric session:', error);
    }
  };

  const loadCognitiveProfile = async () => {
    try {
      const profiles = await CognitiveProfile.filter({ user_id: userId });
      if (profiles.length > 0) {
        setCognitiveProfile(profiles[0]);
      } else {
        // Create initial cognitive profile
        const newProfile = await createInitialCognitiveProfile();
        setCognitiveProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading cognitive profile:', error);
    }
  };

  const createInitialCognitiveProfile = async () => {
    const initialProfile = {
      user_id: userId,
      cognitive_capacity: {
        working_memory: 7, // Miller's magic number
        processing_speed: 1.0,
        attention_span: 20 // minutes
      },
      learning_patterns: {
        optimal_session_length: 30,
        peak_performance_time: 'morning',
        stress_response: 'medium'
      },
      adaptation_preferences: {
        prefers_step_simplification: false,
        responds_to_encouragement: true,
        prefers_visual_aids: true
      }
    };

    return await CognitiveProfile.create(initialProfile);
  };

  const processBiometricData = async () => {
    if (!realTimeBiometrics || !biometricSession) return;

    const timestamp = new Date().toISOString();
    
    // Process heart rate data
    if (realTimeBiometrics.heart_rate) {
      const heartRateEntry = {
        timestamp,
        bpm: realTimeBiometrics.heart_rate
      };
      
      await BiometricSession.update(biometricSession.id, {
        heart_rate_data: [...(biometricSession.heart_rate_data || []), heartRateEntry]
      });
    }

    // Process eye tracking data
    if (realTimeBiometrics.eye_tracking) {
      const eyeTrackingEntry = {
        timestamp,
        fixation_duration: realTimeBiometrics.eye_tracking.fixation_duration,
        pupil_dilation: realTimeBiometrics.eye_tracking.pupil_dilation
      };
      
      await BiometricSession.update(biometricSession.id, {
        eye_tracking_data: [...(biometricSession.eye_tracking_data || []), eyeTrackingEntry]
      });
    }

    // Analyze cognitive load
    const cognitiveLoad = calculateCognitiveLoad(realTimeBiometrics);
    
    // Update cognitive load assessment
    const updatedAssessment = {
      overall_load: cognitiveLoad,
      peak_load_moments: cognitiveLoad > 80 ? 
        [...(biometricSession.cognitive_load_assessment?.peak_load_moments || []), timestamp] :
        biometricSession.cognitive_load_assessment?.peak_load_moments || []
    };

    await BiometricSession.update(biometricSession.id, {
      cognitive_load_assessment: updatedAssessment
    });

    // Update real-time analysis
    setRealTimeAnalysis({
      current_heart_rate: realTimeBiometrics.heart_rate,
      current_cognitive_load: cognitiveLoad,
      stress_level: calculateStressLevel(realTimeBiometrics),
      fatigue_level: calculateFatigueLevel(realTimeBiometrics),
      attention_level: calculateAttentionLevel(realTimeBiometrics),
      optimal_state: isInOptimalLearningState(realTimeBiometrics, cognitiveProfile)
    });
  };

  const calculateCognitiveLoad = (biometrics) => {
    let loadScore = 0;

    // Heart rate variability indicates mental effort
    if (biometrics.heart_rate && cognitiveProfile) {
      const baselineHR = cognitiveProfile.baseline_heart_rate || 70;
      const hrIncrease = (biometrics.heart_rate - baselineHR) / baselineHR;
      loadScore += Math.min(40, hrIncrease * 100);
    }

    // Pupil dilation indicates cognitive effort
    if (biometrics.eye_tracking?.pupil_dilation) {
      const pupilDilation = biometrics.eye_tracking.pupil_dilation;
      const baselinePupil = 3.5; // mm average
      const dilationIncrease = (pupilDilation - baselinePupil) / baselinePupil;
      loadScore += Math.min(30, dilationIncrease * 100);
    }

    // Fixation patterns indicate processing difficulty
    if (biometrics.eye_tracking?.fixation_duration > 400) {
      loadScore += 20; // Long fixations indicate difficulty
    }

    // Task complexity factor
    if (currentTrainingSession?.difficulty_level === 'expert') {
      loadScore += 15;
    } else if (currentTrainingSession?.difficulty_level === 'advanced') {
      loadScore += 10;
    }

    return Math.min(100, Math.max(0, loadScore));
  };

  const calculateStressLevel = (biometrics) => {
    if (!biometrics.heart_rate || !cognitiveProfile) return 0;
    
    const baselineHR = cognitiveProfile.baseline_heart_rate || 70;
    const stressMultiplier = cognitiveProfile.learning_patterns?.stress_response === 'high' ? 1.5 : 1.0;
    
    const stressLevel = ((biometrics.heart_rate - baselineHR) / baselineHR) * 100 * stressMultiplier;
    return Math.min(100, Math.max(0, stressLevel));
  };

  const calculateFatigueLevel = (biometrics) => {
    if (!biometrics.eye_tracking) return 0;

    let fatigueScore = 0;
    
    // Blink rate increases with fatigue
    if (biometrics.eye_tracking.blink_rate > 20) {
      fatigueScore += 30;
    }
    
    // Saccade velocity decreases with fatigue
    if (biometrics.eye_tracking.saccade_velocity < 400) {
      fatigueScore += 25;
    }

    // Session duration factor
    const sessionDuration = biometricSession ? 
      (new Date() - new Date(biometricSession.session_start)) / (1000 * 60) : 0;
    
    if (sessionDuration > cognitiveProfile?.cognitive_capacity?.attention_span) {
      fatigueScore += 30;
    }

    return Math.min(100, fatigueScore);
  };

  const calculateAttentionLevel = (biometrics) => {
    if (!biometrics.eye_tracking) return 100;

    let attentionScore = 100;
    
    // Fixation stability indicates attention
    const fixationStability = biometrics.eye_tracking.fixation_stability || 0.5;
    attentionScore = fixationStability * 100;

    // Pupil dilation indicates engagement
    if (biometrics.eye_tracking.pupil_dilation < 3.0) {
      attentionScore -= 20; // Low pupil dilation may indicate low engagement
    }

    return Math.min(100, Math.max(0, attentionScore));
  };

  const isInOptimalLearningState = (biometrics, profile) => {
    if (!profile) return false;

    const cognitiveLoad = calculateCognitiveLoad(biometrics);
    const stressLevel = calculateStressLevel(biometrics);
    const fatigueLevel = calculateFatigueLevel(biometrics);
    const attentionLevel = calculateAttentionLevel(biometrics);

    // Optimal state: moderate cognitive load, low stress, low fatigue, high attention
    return (
      cognitiveLoad >= 30 && cognitiveLoad <= 70 &&
      stressLevel < 50 &&
      fatigueLevel < 40 &&
      attentionLevel > 70
    );
  };

  const updateBiometricHistory = () => {
    const timestamp = Date.now();
    const newDataPoint = {
      timestamp,
      heart_rate: realTimeBiometrics.heart_rate || 0,
      cognitive_load: realTimeAnalysis.current_cognitive_load || 0,
      stress_level: realTimeAnalysis.stress_level || 0,
      attention_level: realTimeAnalysis.attention_level || 0
    };

    setBiometricHistory(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only last 50 data points for visualization
      return updated.slice(-50);
    });
  };

  const generateAdaptiveRecommendations = async () => {
    if (!realTimeAnalysis.current_cognitive_load) return;

    const recommendations = [];
    const currentTime = new Date();

    // High cognitive load interventions
    if (realTimeAnalysis.current_cognitive_load > 80) {
      recommendations.push({
        id: `cognitive_load_${currentTime.getTime()}`,
        type: 'cognitive_load_reduction',
        urgency: 'high',
        title: 'Cognitive Load Alert',
        description: 'Your cognitive load is high. Consider taking a short break or simplifying the current task.',
        actions: [
          { label: 'Take 2-minute break', action: 'break' },
          { label: 'Simplify current step', action: 'simplify' },
          { label: 'Switch to visual guide', action: 'visual_mode' }
        ],
        biometric_trigger: 'high_cognitive_load'
      });

      // Trigger alert
      setAlertsTriggered(prev => [...prev, {
        type: 'cognitive_overload',
        timestamp: currentTime.toISOString(),
        severity: 'high'
      }]);
    }

    // Stress level interventions
    if (realTimeAnalysis.stress_level > 70) {
      recommendations.push({
        id: `stress_${currentTime.getTime()}`,
        type: 'stress_reduction',
        urgency: 'medium',
        title: 'Stress Level Alert',
        description: 'Elevated stress detected. Try some breathing exercises or take a brief pause.',
        actions: [
          { label: 'Guided breathing', action: 'breathing_exercise' },
          { label: 'Pause training', action: 'pause' },
          { label: 'Switch to easier content', action: 'adjust_difficulty' }
        ],
        biometric_trigger: 'high_stress'
      });
    }

    // Fatigue interventions
    if (realTimeAnalysis.fatigue_level > 60) {
      recommendations.push({
        id: `fatigue_${currentTime.getTime()}`,
        type: 'fatigue_management',
        urgency: 'medium',
        title: 'Fatigue Detected',
        description: 'You may be getting tired. Consider taking a longer break or scheduling training for later.',
        actions: [
          { label: 'Take 10-minute break', action: 'long_break' },
          { label: 'End session', action: 'end_session' },
          { label: 'Switch to review mode', action: 'review_mode' }
        ],
        biometric_trigger: 'fatigue'
      });
    }

    // Low attention interventions
    if (realTimeAnalysis.attention_level < 50) {
      recommendations.push({
        id: `attention_${currentTime.getTime()}`,
        type: 'attention_enhancement',
        urgency: 'medium',
        title: 'Attention Alert',
        description: 'Your attention level seems low. Try a quick engagement exercise or change your environment.',
        actions: [
          { label: 'Quick focus exercise', action: 'focus_exercise' },
          { label: 'Change content format', action: 'change_format' },
          { label: 'Take a movement break', action: 'movement_break' }
        ],
        biometric_trigger: 'low_attention'
      });
    }

    // Optimal state encouragement
    if (realTimeAnalysis.optimal_state) {
      recommendations.push({
        id: `optimal_${currentTime.getTime()}`,
        type: 'optimal_state',
        urgency: 'low',
        title: 'Perfect Learning State',
        description: 'You\'re in an optimal learning state! This is a great time for challenging content.',
        actions: [
          { label: 'Continue current pace', action: 'continue' },
          { label: 'Try advanced content', action: 'advance' }
        ],
        biometric_trigger: 'optimal_state'
      });
    }

    setAdaptiveRecommendations(recommendations);

    // Notify parent components
    if (onAdaptiveRecommendation && recommendations.length > 0) {
      recommendations.forEach(rec => onAdaptiveRecommendation(rec));
    }

    if (onInterventionRequired && recommendations.some(r => r.urgency === 'high')) {
      onInterventionRequired(recommendations.filter(r => r.urgency === 'high'));
    }
  };

  const handleRecommendationAction = async (recommendationId, action) => {
    const recommendation = adaptiveRecommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;

    // Log the action taken
    console.log(`Action taken: ${action} for recommendation: ${recommendation.type}`);

    // Update cognitive profile based on user preferences
    if (cognitiveProfile) {
      const updatedPreferences = { ...cognitiveProfile.adaptation_preferences };
      
      switch (action) {
        case 'simplify':
          updatedPreferences.prefers_step_simplification = true;
          break;
        case 'visual_mode':
          updatedPreferences.prefers_visual_aids = true;
          break;
        case 'breathing_exercise':
          updatedPreferences.responds_to_encouragement = true;
          break;
      }

      await CognitiveProfile.update(cognitiveProfile.id, {
        adaptation_preferences: updatedPreferences
      });
    }

    // Remove the handled recommendation
    setAdaptiveRecommendations(prev => prev.filter(r => r.id !== recommendationId));
  };

  const getBiometricStatus = (value, thresholds) => {
    if (value >= thresholds.high) return { status: 'high', color: 'text-red-500' };
    if (value >= thresholds.medium) return { status: 'medium', color: 'text-yellow-500' };
    return { status: 'normal', color: 'text-green-500' };
  };

  return (
    <div className="space-y-6">
      {/* Real-time Biometric Dashboard */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-300" />
            Real-time Biometric Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-300" />
              <div className="text-2xl font-bold">{realTimeAnalysis.current_heart_rate || '--'}</div>
              <div className="text-sm opacity-90">Heart Rate (BPM)</div>
            </div>
            
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <Brain className="w-6 h-6 mx-auto mb-2 text-purple-300" />
              <div className="text-2xl font-bold">{Math.round(realTimeAnalysis.current_cognitive_load || 0)}%</div>
              <div className="text-sm opacity-90">Cognitive Load</div>
            </div>
            
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <div className="text-2xl font-bold">{Math.round(realTimeAnalysis.stress_level || 0)}%</div>
              <div className="text-sm opacity-90">Stress Level</div>
            </div>
            
            <div className="text-center p-3 bg-white/10 rounded-lg">
              <Eye className="w-6 h-6 mx-auto mb-2 text-cyan-300" />
              <div className="text-2xl font-bold">{Math.round(realTimeAnalysis.attention_level || 0)}%</div>
              <div className="text-sm opacity-90">Attention</div>
            </div>
          </div>

          {realTimeAnalysis.optimal_state && (
            <Alert className="mt-4 border-green-500 bg-green-500/20">
              <Target className="h-4 w-4 text-green-300" />
              <AlertDescription className="text-green-100">
                <strong>Optimal Learning State Detected!</strong> Your biometrics indicate you're in perfect condition for learning.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Biometric Trends Chart */}
      {biometricHistory.length > 5 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Biometric Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={biometricHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cognitive_load" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Cognitive Load"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stress_level" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Stress Level"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="attention_level" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    name="Attention"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adaptive Recommendations */}
      {adaptiveRecommendations.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              Adaptive Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {adaptiveRecommendations.map((recommendation, index) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    recommendation.urgency === 'high' ? 'border-red-200 bg-red-50' :
                    recommendation.urgency === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{recommendation.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{recommendation.description}</p>
                    </div>
                    <Badge className={`${
                      recommendation.urgency === 'high' ? 'bg-red-500' :
                      recommendation.urgency === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    } text-white`}>
                      {recommendation.urgency}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {recommendation.actions?.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        size="sm"
                        onClick={() => handleRecommendationAction(recommendation.id, action.action)}
                        className="text-xs"
                        variant={actionIndex === 0 ? "default" : "outline"}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-500">
                    Triggered by: {recommendation.biometric_trigger}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Alerts History */}
      {alertsTriggered.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertsTriggered.slice(-5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm">{alert.type.replace('_', ' ').toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    } text-white text-xs`}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
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
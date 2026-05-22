import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Brain,
  Zap,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SmartRecommendationEngine({ 
  userAnalytics, 
  userProgress, 
  processes, 
  currentUser,
  onScheduleRefresher 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [skillDecayPredictions, setSkillDecayPredictions] = useState([]);
  const [proactiveInterventions, setProactiveInterventions] = useState([]);

  useEffect(() => {
    if (userAnalytics && userProgress && processes) {
      generateIntelligentRecommendations();
      predictSkillDecay();
      identifyProactiveInterventions();
    }
  }, [userAnalytics, userProgress, processes]);

  const generateIntelligentRecommendations = () => {
    const recs = [];

    // Analyze learning patterns
    const recentCompletions = userProgress
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.completed_date || b.updated_date) - new Date(a.completed_date || a.updated_date))
      .slice(0, 5);

    // Identify trending skill areas
    const skillCategories = {};
    recentCompletions.forEach(progress => {
      const process = processes.find(p => p.id === progress.process_id);
      if (process) {
        skillCategories[process.category] = (skillCategories[process.category] || 0) + 1;
      }
    });

    const topCategory = Object.entries(skillCategories).sort(([,a], [,b]) => b - a)[0];
    if (topCategory) {
      const [category, count] = topCategory;
      const relatedProcesses = processes.filter(p => 
        p.category === category && 
        !userProgress.some(up => up.process_id === p.id && up.status === 'completed')
      );

      if (relatedProcesses.length > 0) {
        recs.push({
          type: 'skill_progression',
          title: `Continue Your ${category.replace('_', ' ')} Journey`,
          description: `You've completed ${count} ${category.replace('_', ' ')} processes. Keep building expertise!`,
          action: 'View Next Process',
          actionUrl: createPageUrl(`ProcessExecution?id=${relatedProcesses[0].id}`),
          priority: 'high',
          confidence: 92
        });
      }
    }

    // Identify knowledge gaps
    if (userAnalytics.knowledge_gaps && userAnalytics.knowledge_gaps.length > 0) {
      userAnalytics.knowledge_gaps.forEach(gap => {
        const gapProcesses = processes.filter(p => 
          p.category === gap && 
          p.difficulty_level === 'beginner'
        );

        if (gapProcesses.length > 0) {
          recs.push({
            type: 'knowledge_gap',
            title: `Fill Knowledge Gap: ${gap.replace('_', ' ')}`,
            description: `AI has identified this as an area for improvement based on your learning patterns.`,
            action: 'Start Foundation Training',
            actionUrl: createPageUrl(`ProcessExecution?id=${gapProcesses[0].id}`),
            priority: 'medium',
            confidence: 87
          });
        }
      });
    }

    // Performance-based recommendations
    const strugglingAreas = userProgress.filter(p => 
      (p.quiz_score && p.quiz_score < 75) || 
      (p.practical_score && p.practical_score < 75)
    );

    if (strugglingAreas.length > 0) {
      const processIds = strugglingAreas.map(p => p.process_id);
      const strugglingProcesses = processes.filter(p => processIds.includes(p.id));
      
      if (strugglingProcesses.length > 0) {
        recs.push({
          type: 'remediation',
          title: 'Strengthen Weak Areas',
          description: `Revisit ${strugglingProcesses.length} processes where performance could be improved.`,
          action: 'Start Remediation',
          actionUrl: createPageUrl(`ProcessExecution?id=${strugglingProcesses[0].id}`),
          priority: 'high',
          confidence: 95
        });
      }
    }

    setRecommendations(recs);
  };

  const predictSkillDecay = () => {
    const predictions = [];

    // Analyze each completed process for potential skill decay
    const completedProcesses = userProgress.filter(p => p.status === 'completed');
    
    completedProcesses.forEach(progress => {
      const process = processes.find(p => p.id === progress.process_id);
      if (!process) return;

      const completionDate = new Date(progress.completed_date || progress.updated_date);
      const daysSinceCompletion = Math.floor((new Date() - completionDate) / (1000 * 60 * 60 * 24));
      
      // Skill decay algorithm based on forgetting curve
      let decayRate = 0.2; // Base decay rate
      
      // Adjust based on process complexity
      if (process.difficulty_level === 'advanced' || process.difficulty_level === 'expert') {
        decayRate *= 1.5;
      }
      
      // Adjust based on score (lower scores decay faster)
      const score = progress.practical_score || progress.quiz_score || 100;
      if (score < 80) {
        decayRate *= 1.3;
      }

      // Calculate current retention and predicted decay
      const currentRetention = Math.max(20, 100 * Math.exp(-decayRate * daysSinceCompletion / 30));
      const daysToDecay = Math.ceil(Math.log(0.7) / (-decayRate / 30)); // Days until 70% retention
      
      if (currentRetention < 85 || daysToDecay < 60) {
        predictions.push({
          processId: process.id,
          processTitle: process.title,
          category: process.category,
          currentRetention: Math.round(currentRetention),
          predictedDecayDate: new Date(Date.now() + daysToDecay * 24 * 60 * 60 * 1000),
          daysSinceCompletion,
          riskLevel: currentRetention < 70 ? 'high' : currentRetention < 85 ? 'medium' : 'low',
          confidence: 85 + Math.random() * 10
        });
      }
    });

    setSkillDecayPredictions(predictions.sort((a, b) => a.currentRetention - b.currentRetention));
  };

  const identifyProactiveInterventions = () => {
    const interventions = [];

    // Check for learning velocity issues
    if (userAnalytics.learning_velocity && userAnalytics.learning_velocity < 0.5) {
      interventions.push({
        type: 'velocity',
        title: 'Slow Learning Velocity Detected',
        description: 'Your learning pace has decreased. Consider shorter, more frequent sessions.',
        action: 'Optimize Schedule',
        severity: 'medium',
        automated: true
      });
    }

    // Check for cognitive overload patterns
    const recentSessions = userProgress
      .filter(p => p.time_spent && p.time_spent > 60) // Sessions longer than 1 hour
      .slice(-3);

    if (recentSessions.length >= 2) {
      interventions.push({
        type: 'cognitive_load',
        title: 'Potential Cognitive Overload',
        description: 'Recent sessions have been lengthy. Consider breaking training into smaller chunks.',
        action: 'Adjust Session Length',
        severity: 'low',
        automated: true
      });
    }

    // Check for consistency issues
    const lastActivity = Math.max(...userProgress.map(p => 
      new Date(p.updated_date || p.created_date).getTime()
    ));
    const daysSinceLastActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);

    if (daysSinceLastActivity > 7) {
      interventions.push({
        type: 'engagement',
        title: 'Engagement Drop Detected',
        description: `No training activity for ${Math.floor(daysSinceLastActivity)} days. Consistent practice improves retention.`,
        action: 'Resume Training',
        severity: 'high',
        automated: false
      });
    }

    setProactiveInterventions(interventions);
  };

  const handleScheduleRefresher = (prediction) => {
    if (onScheduleRefresher) {
      onScheduleRefresher(prediction);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI-Powered Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {recommendations.slice(0, 3).map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-800">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority} priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{rec.description}</p>
                      <Button size="sm" asChild>
                        <Link to={rec.actionUrl}>
                          {rec.action} <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Skill Decay Predictions */}
      {skillDecayPredictions.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              Skill Decay Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {skillDecayPredictions.slice(0, 4).map((prediction, index) => (
                <motion.div
                  key={prediction.processId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-orange-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{prediction.processTitle}</h4>
                      <p className="text-sm text-slate-600">
                        {prediction.daysSinceCompletion} days since completion
                      </p>
                    </div>
                    <Badge className={getRiskColor(prediction.riskLevel)}>
                      {prediction.riskLevel} risk
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span>Current Retention</span>
                      <span className="font-semibold">{prediction.currentRetention}%</span>
                    </div>
                    <Progress value={prediction.currentRetention} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Predicted decay: {prediction.predictedDecayDate.toLocaleDateString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleScheduleRefresher(prediction)}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Schedule Refresher
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Proactive Interventions */}
      {proactiveInterventions.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Proactive Interventions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {proactiveInterventions.map((intervention, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Alert className={`${
                    intervention.severity === 'high' ? 'border-red-200 bg-red-50' :
                    intervention.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 ${
                      intervention.severity === 'high' ? 'text-red-600' :
                      intervention.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <AlertTitle className="flex items-center justify-between">
                      {intervention.title}
                      {intervention.automated && (
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Auto-detected
                        </Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription>
                      {intervention.description}
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          {intervention.action}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useData } from "@/components/providers/DataProvider";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle, BrainCircuit, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { InvokeLLM } from '@/integrations/Core';
import { useToast } from "@/components/common/Toast";

import SafetyMonitor from '../components/safety/SafetyMonitor';
import ComplianceTracker from '../components/safety/ComplianceTracker';
import PredictiveCompliance from '../components/safety/PredictiveCompliance';

export default function SafetyDashboard() {
  const { processes, userProgress, users, certifications, feedback, isLoading } = useData();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('monitor');
  const [safetyInsights, setSafetyInsights] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const safetyFeedback = useMemo(() => {
    if (!feedback || !Array.isArray(feedback)) return [];
    return feedback.filter(f => f.feedback_type === 'safety_concern');
  }, [feedback]);

  const safetyStats = useMemo(() => {
    if (isLoading || !processes || !userProgress || !users) {
      return { safetyScore: 0, complianceRate: 0, openIncidents: 0, incidentHotspots: [] };
    }

    const safetyProcesses = processes.filter(p => p.category === 'safety' || p.hazard_level === 'high' || p.hazard_level === 'critical');
    const safetyProcessIds = new Set(safetyProcesses.map(p => p.id));
    
    const requiredCompletions = users.length * safetyProcesses.length;
    const actualCompletions = userProgress.filter(p => 
      safetyProcessIds.has(p.process_id) && p.status === 'completed'
    ).length;
    
    const complianceRate = requiredCompletions > 0 
      ? Math.round((actualCompletions / requiredCompletions) * 100)
      : 100;

    const openIncidents = safetyFeedback.filter(f => f.status === 'open' || f.status === 'in_review').length;
    
    const safetyScore = Math.max(0, complianceRate - (openIncidents * 5));

    const incidentHotspotsData = safetyFeedback.reduce((acc, fb) => {
        const process = processes.find(p => p.id === fb.process_id);
        const name = process?.title || 'General';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

    const incidentHotspots = Object.entries(incidentHotspotsData)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value).slice(0, 5);

    return { safetyScore, complianceRate, openIncidents, incidentHotspots };
  }, [isLoading, processes, userProgress, users, safetyFeedback]);

  const generateSafetyInsights = async () => {
    setIsGeneratingInsights(true);
    showToast("Info", "LearnFlow AI is analyzing safety data...", "info");
    try {
      const insights = await InvokeLLM({
        prompt: `Analyze this manufacturing safety data and provide actionable strategic insights:

        Current Safety Metrics:
        - Overall Safety Score: ${safetyStats.safetyScore}%
        - Compliance Rate: ${safetyStats.complianceRate}%
        - Open Safety Incidents: ${safetyStats.openIncidents}
        - Processes with most safety feedback: ${safetyStats.incidentHotspots.map(h => h.name).join(', ')}

        Provide a JSON object with:
        1. "posture_summary": A summary of the current safety posture.
        2. "risk_areas": An array of key risk areas that require immediate attention.
        3. "predictions": An array of predictive insights on potential future safety incidents.
        4. "recommendations": An array of strategic recommendations for proactive safety improvements.`,
        response_json_schema: {
          type: 'object',
          properties: {
            posture_summary: { type: 'string' },
            risk_areas: { type: 'array', items: { type: 'string' } },
            predictions: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      setSafetyInsights(insights);
      showToast("Success", "Safety insights generated successfully!", "success");
    } catch (error) {
      console.error('Error generating safety insights:', error);
      showToast("Error", "Failed to generate AI insights.", "danger");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-800 to-orange-800 bg-clip-text text-transparent mb-2">
            Safety Command Center
          </h1>
          <p className="text-slate-600 text-lg">
            Monitor compliance, analyze risks, and foster a proactive safety culture.
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Overall Safety Score</p>
                  <p className="text-4xl font-bold text-green-600">{safetyStats.safetyScore}%</p>
                </div>
                <Shield className="w-10 h-10 text-green-500" />
              </div>
              <Progress value={safetyStats.safetyScore} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Compliance Rate</p>
                  <p className="text-4xl font-bold text-blue-600">{safetyStats.complianceRate}%</p>
                </div>
                <CheckCircle className="w-10 h-10 text-blue-500" />
              </div>
              <Progress value={safetyStats.complianceRate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Open Safety Incidents</p>
                  <p className="text-4xl font-bold text-red-600">{safetyStats.openIncidents}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Active user-reported concerns</p>
            </CardContent>
          </Card>
        </div>

        {/* LearnFlow Safety Advisor */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-blue-600" />
              LearnFlow Safety Advisor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGeneratingInsights ? (
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing safety data to generate strategic insights...</span>
              </div>
            ) : safetyInsights ? (
              <div className="space-y-4">
                <p className="text-slate-700 font-medium">{safetyInsights.posture_summary}</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-red-700">Key Risk Areas</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-600">
                      {safetyInsights.risk_areas.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-700">Predictions</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-600">
                      {safetyInsights.predictions.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-700">Recommendations</h4>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-600">
                      {safetyInsights.recommendations.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <p className="text-slate-600">Get AI-powered analysis of your current safety posture and proactive recommendations.</p>
                <Button onClick={generateSafetyInsights}>
                  Generate LearnFlow Insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitor">Real-time Monitor</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Tracker</TabsTrigger>
            <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          </TabsList>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <TabsContent value="monitor">
              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                  <SafetyMonitor 
                    processes={processes}
                    userProgress={userProgress}
                    feedback={safetyFeedback}
                  />
                </div>
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <BarChart3 className="w-5 h-5 text-orange-500" />
                        Incident Hotspots by Process
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={safetyStats.incidentHotspots} layout="vertical" margin={{ right: 20, left: 100 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#F97316" name="Incidents" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="compliance">
              <ComplianceTracker 
                processes={processes}
                userProgress={userProgress}
                users={users}
                certifications={certifications}
              />
            </TabsContent>
            <TabsContent value="predictive">
              <PredictiveCompliance
                certifications={certifications}
                userProgress={userProgress}
                users={users}
              />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}

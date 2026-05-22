import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Zap, User, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';

const mockLoops = [
  {
    id: 'loop_1',
    trigger: 'Quality Deviation in Assembly Line 3',
    status: 'deployed',
    severity: 'high',
    intervention: 'Micro-learning on torque wrench calibration deployed to 3 users.',
    effectiveness: 85,
  },
  {
    id: 'loop_2',
    trigger: 'Efficiency Drop in CNC Machine #7',
    status: 'measuring_impact',
    severity: 'medium',
    intervention: 'JIT training module on new G-code optimization pushed.',
    effectiveness: 60,
  },
  {
    id: 'loop_3',
    trigger: 'Safety Sensor Anomaly on Press #2',
    status: 'human_review_required',
    severity: 'critical',
    intervention: 'Generated new safety checklist for supervisor review.',
    effectiveness: 0,
  },
  {
    id: 'loop_4',
    trigger: 'Performance Metric: Increased Scrap Rate',
    status: 'analyzing',
    severity: 'medium',
    intervention: 'Analyzing root cause across 5 related processes.',
    effectiveness: 0,
  }
];

const statusConfig = {
  deployed: { icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'Deployed' },
  measuring_impact: { icon: RefreshCw, color: 'text-purple-500', bgColor: 'bg-purple-50', label: 'Measuring Impact' },
  human_review_required: { icon: User, color: 'text-yellow-500', bgColor: 'bg-yellow-50', label: 'Review Required' },
  analyzing: { icon: GitBranch, color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Analyzing' },
};

export default function AutonomicLearningLoop() {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <RefreshCw className="w-6 h-6 text-teal-500" />
          Active Autonomic Learning Loops
        </CardTitle>
        <p className="text-sm text-slate-500">
          AI-driven cycles that detect operational gaps and deploy targeted training interventions automatically.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockLoops.map((loop, index) => {
            const config = statusConfig[loop.status];
            return (
              <motion.div
                key={loop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${config.bgColor.replace('bg-', 'border-')}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{loop.trigger}</h4>
                    <p className="text-sm text-slate-600 mt-1">{loop.intervention}</p>
                  </div>
                  <Badge variant={loop.severity === 'critical' || loop.severity === 'high' ? 'destructive' : 'secondary'} className="capitalize">{loop.severity}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className={`p-1.5 rounded-full ${config.bgColor}`}>
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className={config.color}>{config.label}</span>
                  </div>
                  {loop.status === 'measuring_impact' && (
                    <div className="w-1/3">
                      <div className="text-xs text-slate-500 mb-1">Effectiveness: {loop.effectiveness}%</div>
                      <Progress value={loop.effectiveness} className="h-1.5" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
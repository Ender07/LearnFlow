
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart3, Download, Filter, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const reportTemplates = {
  user_completion: {
    name: "User Completion Report",
    metrics: ["completion_rate", "average_score", "time_spent"],
    filters: ["department", "job_title", "timeframe"]
  },
  skill_proficiency: {
    name: "Skill Proficiency Matrix",
    metrics: ["skill_level", "competency_gaps", "top_skills"],
    filters: ["user", "team", "skill_category"]
  },
  compliance_audit: {
    name: "Compliance & Certification Audit",
    metrics: ["certification_status", "compliance_rate", "overdue_training"],
    filters: ["certification", "regulatory_code", "department"]
  }
};

export default function ReportBuilder() {
  const [reportConfig, setReportConfig] = useState({
    template: 'user_completion',
    title: 'New Custom Report',
    metrics: [],
    filters: {}
  });
  const [reportData, setReportData] = useState(null);

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleMetricToggle = (metric) => {
    const newMetrics = reportConfig.metrics.includes(metric)
      ? reportConfig.metrics.filter(m => m !== metric)
      : [...reportConfig.metrics, metric];
    handleConfigChange('metrics', newMetrics);
  };

  const generateReport = () => {
    // In a real app, this would query the backend with reportConfig
    // For now, we generate mock data based on the config
    const mockData = [
      { name: 'Assembly', completion_rate: 85, average_score: 92 },
      { name: 'Maintenance', completion_rate: 72, average_score: 88 },
      { name: 'Quality Control', completion_rate: 95, average_score: 96 },
      { name: 'Safety', completion_rate: 98, average_score: 99 },
      { name: 'Onboarding', completion_rate: 100, average_score: 91 },
    ];
    setReportData(mockData);
  };
  
  const currentTemplate = reportTemplates[reportConfig.template];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Custom Report Builder
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Generate and export tailored reports from your training data.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-4">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  Report Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Report Title</label>
                  <Input 
                    value={reportConfig.title} 
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Report Template</label>
                  <Select value={reportConfig.template} onValueChange={(val) => handleConfigChange('template', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(reportTemplates).map(([key, val]) => (
                        <SelectItem key={key} value={key}>{val.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Metrics to Include</h4>
                  <div className="space-y-2">
                    {currentTemplate.metrics.map(metric => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox 
                          id={metric} 
                          checked={reportConfig.metrics.includes(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                        />
                        <label htmlFor={metric} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize">
                          {metric.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                   <h4 className="text-sm font-medium text-slate-700 mb-2">Filters</h4>
                   <div className="space-y-3">
                     {currentTemplate.filters.map(filter => (
                       <Input key={filter} placeholder={`Filter by ${filter.replace('_', ' ')}...`} />
                     ))}
                   </div>
                </div>

                <Button onClick={generateReport} className="w-full bg-blue-600 hover:bg-blue-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-500" />
                  Report Preview: {reportConfig.title}
                </CardTitle>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {reportData ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      {reportConfig.metrics.map((metric) => (
                        <Bar key={metric} dataKey={metric} fill="#3B82F6" />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-16 text-slate-500">
                    <p>Configure your report and click "Generate Report" to see a preview.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

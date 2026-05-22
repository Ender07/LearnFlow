import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Calendar as CalendarIcon, FileText, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportGenerator({ analytics }) {
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    format: 'pdf',
    frequency: 'manual',
    includeCharts: true,
    includeTrends: true,
    includeComparisons: true,
    includeRecommendations: true,
    recipients: '',
    scheduledDate: null
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would call an API to generate the report
    const reportData = {
      ...reportConfig,
      generatedDate: new Date().toISOString(),
      data: analytics
    };
    
    // Simulate download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Report Name</label>
            <Input
              placeholder="e.g., Monthly Training Analytics"
              value={reportConfig.name}
              onChange={(e) => setReportConfig({...reportConfig, name: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              placeholder="Brief description of this report..."
              value={reportConfig.description}
              onChange={(e) => setReportConfig({...reportConfig, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={reportConfig.format} onValueChange={(value) => setReportConfig({...reportConfig, format: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Frequency</label>
              <Select value={reportConfig.frequency} onValueChange={(value) => setReportConfig({...reportConfig, frequency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Report Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="charts"
              checked={reportConfig.includeCharts}
              onCheckedChange={(checked) => setReportConfig({...reportConfig, includeCharts: checked})}
            />
            <label htmlFor="charts" className="text-sm font-medium">Include Charts & Visualizations</label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="trends"
              checked={reportConfig.includeTrends}
              onCheckedChange={(checked) => setReportConfig({...reportConfig, includeTrends: checked})}
            />
            <label htmlFor="trends" className="text-sm font-medium">Include Trend Analysis</label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="comparisons"
              checked={reportConfig.includeComparisons}
              onCheckedChange={(checked) => setReportConfig({...reportConfig, includeComparisons: checked})}
            />
            <label htmlFor="comparisons" className="text-sm font-medium">Include Benchmark Comparisons</label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recommendations"
              checked={reportConfig.includeRecommendations}
              onCheckedChange={(checked) => setReportConfig({...reportConfig, includeRecommendations: checked})}
            />
            <label htmlFor="recommendations" className="text-sm font-medium">Include AI Recommendations</label>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling & Distribution */}
      {reportConfig.frequency !== 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Schedule & Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Recipients</label>
              <Input
                placeholder="email1@company.com, email2@company.com"
                value={reportConfig.recipients}
                onChange={(e) => setReportConfig({...reportConfig, recipients: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Next Report Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportConfig.scheduledDate ? format(reportConfig.scheduledDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={reportConfig.scheduledDate}
                    onSelect={(date) => setReportConfig({...reportConfig, scheduledDate: date})}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          Save Template
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating || !reportConfig.name}>
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
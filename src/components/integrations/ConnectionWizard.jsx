import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Server, Key, Settings, Share2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const steps = [
  { id: 1, title: 'Select System', icon: Server },
  { id: 2, title: 'Authentication', icon: Key },
  { id: 3, title: 'Configuration', icon: Settings },
  { id: 4, title: 'Automations', icon: Share2 },
];

export default function ConnectionWizard({ onSave, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [integrationData, setIntegrationData] = useState({
    integration_name: '',
    system_type: '',
    api_endpoint: '',
    authentication_method: 'api_key',
    api_key: '',
    data_sync_frequency: 'daily',
    sync_direction: 'bidirectional',
    automation_rules: [],
  });

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleChange = (field, value) => {
    setIntegrationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Basic validation could be added here
    onSave(integrationData);
  };
  
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
            {steps.map(step => (
                <div key={step.id} className="text-center flex-1">
                    <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep >= step.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                        <step.icon className="w-5 h-5" />
                    </div>
                    <p className={`text-xs mt-2 ${currentStep >= step.id ? 'font-semibold text-blue-600' : 'text-slate-500'}`}>{step.title}</p>
                </div>
            ))}
        </div>
        <Progress value={progress} className="h-1"/>
      </div>
      
      <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">System Information</h2>
            <div className="space-y-2">
              <Label htmlFor="integration_name">Integration Name</Label>
              <Input id="integration_name" placeholder="e.g., Factory Floor MES" value={integrationData.integration_name} onChange={e => handleChange('integration_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="system_type">System Type</Label>
              <Select onValueChange={value => handleChange('system_type', value)} value={integrationData.system_type}>
                <SelectTrigger id="system_type"><SelectValue placeholder="Select a system type..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes">MES (Manufacturing Execution System)</SelectItem>
                  <SelectItem value="erp">ERP (Enterprise Resource Planning)</SelectItem>
                  <SelectItem value="qms">QMS (Quality Management System)</SelectItem>
                  <SelectItem value="cmms">CMMS (Computerized Maintenance Management System)</SelectItem>
                  <SelectItem value="plm">PLM (Product Lifecycle Management)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Authentication Details</h2>
            <div className="space-y-2">
              <Label htmlFor="api_endpoint">API Endpoint</Label>
              <Input id="api_endpoint" placeholder="https://api.system.com/v1" value={integrationData.api_endpoint} onChange={e => handleChange('api_endpoint', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Authentication Method</Label>
              <p className="text-sm text-slate-500">API Key is currently the only supported method.</p>
              <Input id="api_key" placeholder="Enter API Key" value={integrationData.api_key} onChange={e => handleChange('api_key', e.target.value)} />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Sync Configuration</h2>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="data_sync_frequency">Data Sync Frequency</Label>
                  <Select onValueChange={value => handleChange('data_sync_frequency', value)} value={integrationData.data_sync_frequency}>
                    <SelectTrigger id="data_sync_frequency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_time">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sync_direction">Sync Direction</Label>
                  <Select onValueChange={value => handleChange('sync_direction', value)} value={integrationData.sync_direction}>
                    <SelectTrigger id="sync_direction"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bidirectional">Bidirectional</SelectItem>
                      <SelectItem value="inbound">Inbound (To LearnFlow)</SelectItem>
                      <SelectItem value="outbound">Outbound (From LearnFlow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Setup Automations (Optional)</h2>
            <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-slate-600">Automation rule configuration coming soon.</p>
                <p className="text-xs text-slate-500">You can add automations later from the integration management screen.</p>
            </div>
          </div>
        )}
      </motion.div>
      
      <div className="mt-8 flex justify-between">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        ) : (
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        )}

        {currentStep < steps.length ? (
          <Button onClick={handleNext}>
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Save Integration
          </Button>
        )}
      </div>
    </div>
  );
}
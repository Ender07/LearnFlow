import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';
import { useToast } from "@/components/common/Toast";

import MediaManager from './MediaManager';

export default function StepEditor({ step, onUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();

  if (!step) return null;

  const handleInputChange = (e) => {
    onUpdate(step.step_id, { ...step, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (name, value) => {
    onUpdate(step.step_id, { ...step, [name]: value.split(',').map(item => item.trim()).filter(Boolean) });
  };
  
  const handleSelectChange = (name, value) => {
    onUpdate(step.step_id, { ...step, [name]: value });
  };

  const generateStepContent = async () => {
    if (!step.title) {
      showToast("Warning", "Please provide a title for the step first.", "warning");
      return;
    }
    setIsGenerating(true);
    try {
      const prompt = `For a manufacturing process step titled "${step.title}", generate a detailed description, a list of potential safety warnings, a list of quality criteria, and a list of required tools.`;
      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            safety_warnings: { type: "array", items: { type: "string" } },
            quality_criteria: { type: "array", items: { type: "string" } },
            tools_required: { type: "array", items: { type: "string" } }
          }
        }
      });

      onUpdate(step.step_id, {
        ...step,
        description: response.description || step.description,
        safety_warnings: response.safety_warnings || step.safety_warnings,
        quality_criteria: response.quality_criteria || step.quality_criteria,
        tools_required: response.tools_required || step.tools_required,
      });

      showToast("Success", "LearnFlow AI has populated the step details.", "success");
    } catch (error) {
      console.error("AI step generation failed:", error);
      showToast("Error", "AI failed to generate step content.", "danger");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Edit Step</CardTitle>
        <CardDescription>Configure the details for this step.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="step-title">Step Title</label>
          <Input id="step-title" name="title" value={step.title} onChange={handleInputChange} />
        </div>
        
        <Button onClick={generateStepContent} disabled={isGenerating || !step.title} variant="outline" className="w-full">
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
          Generate Details with LearnFlow AI
        </Button>
        
        <div className="space-y-2">
          <label htmlFor="step-description">Description</label>
          <Textarea id="step-description" name="description" value={step.description} onChange={handleInputChange} rows={5} />
        </div>
        
        <div className="space-y-2">
          <label>Instruction Type</label>
          <Select value={step.instruction_type} onValueChange={(v) => handleSelectChange('instruction_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="quality_check">Quality Check</SelectItem>
              <SelectItem value="safety_critical">Safety Critical</SelectItem>
              <SelectItem value="decision_point">Decision Point</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="tools_required">Tools Required (comma-separated)</label>
          <Input id="tools_required" value={step.tools_required?.join(', ') || ''} onChange={(e) => handleArrayChange('tools_required', e.target.value)} />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="safety_warnings">Safety Warnings (comma-separated)</label>
          <Textarea id="safety_warnings" value={step.safety_warnings?.join(', ') || ''} onChange={(e) => handleArrayChange('safety_warnings', e.target.value)} />
        </div>

        {step.instruction_type === 'quality_check' && (
          <div className="space-y-2">
            <label htmlFor="quality_criteria">Quality Criteria (comma-separated)</label>
            <Textarea id="quality_criteria" value={step.quality_criteria?.join(', ') || ''} onChange={(e) => handleArrayChange('quality_criteria', e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <label>Media (Image/Video URLs)</label>
          <MediaManager
            mediaUrls={step.media_urls || []}
            onUpdate={(urls) => onUpdate(step.step_id, { ...step, media_urls: urls })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
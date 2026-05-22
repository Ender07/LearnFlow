import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Upload, Wand2, FileText, Check, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/integrations/Core';
import { useToast } from '@/components/common/Toast';
import { createPageUrl } from '@/utils';

const steps = ["Source", "Configure", "Generate", "Refine & Export"];

export default function LearnFlowContentStudio() {
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceType, setSourceType] = useState('topic');
  const [sourceInput, setSourceInput] = useState('');
  const [generationType, setGenerationType] = useState('full_process');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!sourceInput) {
      setError("Please provide a source topic or URL.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const prompt = `Based on the following ${sourceType}: "${sourceInput}", generate content for a manufacturing training process. The generation type is "${generationType}". Please provide a detailed, structured response. For a "full_process", structure the output to match a process entity with steps, descriptions, safety warnings, etc. For a "quiz", create multiple-choice questions with answers. For "safety_protocols", list all relevant safety warnings. For "troubleshooting_guide", create a step-by-step guide to fix common issues.`;
      
      // A more generic schema is needed since output varies
      const response = await InvokeLLM({ prompt });
      
      setGeneratedContent(response);
      setCurrentStep(3); // Move to refine step
    } catch (e) {
      setError(e.message || "An error occurred while generating content.");
      showToast({ type: 'error', title: 'Generation Failed', message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToBuilder = () => {
    localStorage.setItem('aiGeneratedProcess', JSON.stringify({
      description: generatedContent, // Pass the text to be parsed in the builder
    }));
    navigate(createPageUrl('CreateProcess'));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Source
        return (
          <div className="space-y-4">
            <CardDescription>How do you want to provide source material for the training content?</CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => setSourceType('topic')} className={`cursor-pointer ${sourceType === 'topic' ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}>
                <CardHeader><FileText className="w-6 h-6 mb-2 text-blue-500" /> Topic / Description</CardHeader>
              </Card>
              <Card onClick={() => setSourceType('document')} className={`cursor-pointer ${sourceType === 'document' ? 'border-green-500 ring-2 ring-green-500' : ''}`}>
                <CardHeader><Upload className="w-6 h-6 mb-2 text-green-500" /> Upload Document</CardHeader>
              </Card>
            </div>
            {sourceType === 'topic' && (
              <Textarea 
                placeholder="e.g., 'A safety process for operating the T-1500 industrial lathe, including pre-operation checks and emergency shutdown.'"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                rows={5}
              />
            )}
            {sourceType === 'document' && (
              <Input type="file" disabled />
            )}
          </div>
        );
      case 1: // Configure
        return (
          <div className="space-y-4">
            <CardDescription>What type of content do you need the AI to generate?</CardDescription>
            <Select value={generationType} onValueChange={setGenerationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select content type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_process">Full Training Process</SelectItem>
                <SelectItem value="quiz">Quiz Questions & Answers</SelectItem>
                <SelectItem value="safety_protocols">Safety Protocols</SelectItem>
                <SelectItem value="troubleshooting_guide">Troubleshooting Guide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case 2: // Generate
        return (
          <div className="text-center">
            <CardDescription className="mb-6">Ready to generate content based on your configuration. This may take a moment.</CardDescription>
            <Button onClick={handleGenerate} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        );
      case 3: // Refine & Export
        return (
          <div className="space-y-4">
            <CardDescription>Review the generated content. You can refine it with another AI prompt or send it to the Process Builder.</CardDescription>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
            <div className="flex gap-4">
               <Button onClick={handleSendToBuilder} className="w-full bg-green-600 hover:bg-green-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                Send to Process Builder
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent">
              LearnFlow AI Content Studio
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Your AI co-pilot for creating high-quality manufacturing training content.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep >= index ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {currentStep > index ? <Check /> : index + 1}
                </div>
                <p className={`mt-2 text-sm ${currentStep >= index ? 'font-semibold text-blue-700' : 'text-slate-500'}`}>{step}</p>
              </div>
              {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${currentStep > index ? 'bg-blue-600' : 'bg-slate-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-2xl">
              <CardHeader>
                <CardTitle>Step {currentStep + 1}: {steps[currentStep]}</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {renderStepContent()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))} disabled={currentStep >= steps.length - 1 || (currentStep === 2 && !generatedContent)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
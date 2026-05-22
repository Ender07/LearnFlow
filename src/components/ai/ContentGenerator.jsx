
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Upload, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { motion, AnimatePresence } from 'framer-motion';

const generationSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "A clear, concise title for the process." },
    description: { type: "string", description: "A brief overview of the process." },
    difficulty_level: { type: "string", enum: ["beginner", "intermediate", "advanced", "expert"], description: "The skill level required." },
    estimated_duration: { type: "number", description: "Estimated time in minutes to complete." },
    steps: {
      type: "array",
      description: "A list of sequential steps to perform the process.",
      items: {
        type: "object",
        properties: {
          step_id: { type: "string", description: "A unique identifier for the step, e.g., 'step_1'." },
          title: { type: "string", description: "A short title for the step." },
          description: { type: "string", description: "Detailed instructions for the step." },
          safety_warnings: { type: "array", items: { type: "string" }, description: "Specific safety warnings for this step." },
          tools_required: { type: "array", items: { type: "string" }, description: "Tools needed for this step." }
        },
        required: ["step_id", "title", "description"]
      }
    },
    safety_requirements: { type: "array", items: { type: "string" }, description: "Overall safety gear or protocols." },
    equipment_needed: { type: "array", items: { type: "string" }, description: "List of all equipment or machinery." },
    quality_standards: { type: "array", items: { type: "string" }, description: "Key quality checks or standards." },
    tags: { type: "array", items: { type: "string" }, description: "Relevant keywords for searching." }
  },
  required: ["title", "description", "steps", "safety_requirements", "equipment_needed"]
};

export default function ContentGenerator({ onContentGenerated }) {
  const [topic, setTopic] = useState('');
  const [sourceFile, setSourceFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSourceFile(file);
    setIsLoading(true);
    setError(null);
    try {
      const { file_url } = await UploadFile({ file });
      setUploadedFileUrl(file_url);
    } catch (e) {
      setError("Failed to upload file. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const constructPrompt = () => {
    let prompt = `You are an expert instructional designer for a manufacturing company. Your task is to create a detailed, step-by-step training process based on the provided topic.`;

    if (sourceFile) {
      prompt += ` You must analyze the content of the attached document (${sourceFile.name}) to generate the process.`;
    }

    prompt += ` The process topic is: "${topic}".

Generate a complete training process that is clear, safe, and efficient. Follow the provided JSON schema precisely. For step_id, use a consistent format like 'step_1', 'step_2', etc. Ensure all safety warnings are prominent and clear.`;
    
    return prompt;
  };

  const handleGenerate = async () => {
    if (!topic) {
      setError("Please provide a topic for the process.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = constructPrompt();
      const llmParams = {
        prompt: prompt,
        response_json_schema: generationSchema,
      };

      if (uploadedFileUrl) {
        llmParams.file_urls = [uploadedFileUrl];
      }

      const generatedContent = await InvokeLLM(llmParams);
      onContentGenerated(generatedContent);

    } catch (e) {
      setError("Failed to generate content. LearnFlow may be busy. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-500" />
          LearnFlow Content Studio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Describe the process you want to create, or upload a document (e.g., a technical manual PDF). LearnFlow will generate a draft for you to review and edit.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Process Topic</label>
          <Textarea
            placeholder="e.g., 'Emergency Shutdown Procedure for the CNC Mill X5' or 'Calibrating the Spectrometer'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Source Document (Optional)</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg p-3 hover:bg-slate-50">
                <Upload className="w-5 h-5 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {sourceFile ? 'File selected:' : 'Upload PDF, TXT, or DOCX'}
                </span>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.docx" />
            </label>
            {sourceFile && (
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <FileText className="w-5 h-5" />
                <span>{sourceFile.name}</span>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleGenerate}
          disabled={isLoading || !topic}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          {isLoading ? (
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5" />
              {uploadedFileUrl ? 'Analyzing Document...' : 'Generating Process...'}
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Process Draft
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

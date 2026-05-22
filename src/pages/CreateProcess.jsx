
import React, { useState, useEffect } from 'react';
import { Process } from '@/entities/all';
import { useToast } from '@/components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ProcessBuilder from '../components/authoring/ProcessBuilder';

export default function CreateProcess() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const aiContent = localStorage.getItem('aiGeneratedProcess');
    if (aiContent) {
      try {
        const parsedContent = JSON.parse(aiContent);
        setInitialData(parsedContent);
        showToast({
          type: 'info',
          title: 'AI Content Loaded',
          message: 'Content from the AI Studio has been pre-filled.',
        });
      } catch (e) {
        console.error("Failed to parse AI content:", e);
        showToast({
          type: 'error',
          title: 'Failed to load AI Content',
          message: 'There was an issue loading the content from the AI Studio.',
        });
      } finally {
        localStorage.removeItem('aiGeneratedProcess');
      }
    }
  }, []);

  const handleCreateProcess = async (processData) => {
    setIsSubmitting(true);
    try {
      const newProcess = await Process.create(processData);
      showToast({
        type: 'success',
        title: 'Process Created!',
        message: `Successfully created "${newProcess.title}".`,
      });
      navigate(createPageUrl(`ProcessExecution?id=${newProcess.id}`));
    } catch (error) {
      console.error('Error creating process:', error);
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: error.message || 'An unexpected error occurred.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-green-800 bg-clip-text text-transparent">
                Create New Process
              </h1>
            </div>
            <Button asChild variant="outline">
              <Link to={createPageUrl('LearnFlowContentStudio')}>
                <BrainCircuit className="w-4 h-4 mr-2" />
                Use AI Content Studio
              </Link>
            </Button>
          </div>
          <p className="text-slate-600 text-lg">
            Build a new training process from scratch using the step-by-step process builder.
          </p>
        </div>

        <ProcessBuilder 
          onSave={handleCreateProcess} 
          isSubmitting={isSubmitting} 
          initialData={initialData}
        />
      </div>
    </div>
  );
}

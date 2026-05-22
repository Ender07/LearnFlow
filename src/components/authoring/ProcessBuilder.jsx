
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, FileText, Save, History } from 'lucide-react'; // Added Save and History icons
import { Input } from '@/components/ui/input'; // New import
import { Textarea } from '@/components/ui/textarea'; // New import
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'; // New imports
import {
  Select, // New import
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  AlertDialog, // New imports
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import VersionControl from './VersionControl'; // New import

// Define the structure for a new step, used when adding a step
const NEW_STEP_PLACEHOLDER = {
  step_id: `step-${Date.now()}`, // Unique ID for the step
  title: 'New Untitled Step',
  description: '',
  content: {}, // Placeholder for actual step content (e.g., text, images, videos)
  sequence_number: 0,
};

const initialProcessState = {
  title: '',
  description: '',
  category: 'assembly', // Default category
  difficulty_level: 'beginner', // Default difficulty
  estimated_duration: 30, // Default duration in minutes
  content_type: 'interactive', // Default content type
  steps: [], // Array to hold step objects
  is_published: false,
  version: '1.0',
  hazard_level: 'low', // Default hazard level
};

export default function ProcessBuilder({ onSave, isSubmitting, initialData }) {
  const [process, setProcess] = useState(initialProcessState);
  const [activeTab, setActiveTab] = useState('metadata');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeStepId, setActiveStepId] = useState(null); // Internal state for active step

  // Effect to load initial data when provided
  useEffect(() => {
    if (initialData) {
      setProcess(prev => ({
        ...initialProcessState, // Start with defaults
        ...prev, // Keep any existing user edits if initialData is partial update
        ...initialData, // Apply initial data, overwriting defaults and previous edits
        // Ensure steps array is initialized even if initialData.steps is null/undefined
        steps: initialData.steps || [],
      }));

      // Set the first step as active if steps exist
      if (initialData.steps && initialData.steps.length > 0) {
        setActiveStepId(initialData.steps[0].step_id);
      }
    }
  }, [initialData]);

  const validate = () => {
    let newErrors = {};
    if (!process.title.trim()) {
      newErrors.title = 'Process title is required.';
    }
    if (!process.description.trim()) {
      newErrors.description = 'Process description is required.';
    }
    // Add more validation rules for other fields as needed
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(process); // Call the onSave prop with the current process state
    } else {
      console.error('Validation failed. Cannot save.');
    }
  };

  // Handler for updating a specific step's properties
  const handleUpdateStep = (stepId, updatedFields) => {
    setProcess(prevProcess => ({
      ...prevProcess,
      steps: prevProcess.steps.map(step =>
        step.step_id === stepId ? { ...step, ...updatedFields } : step
      ),
    }));
  };

  // Handler for adding a new step
  const handleAddStep = () => {
    setProcess(prevProcess => {
      const newStep = {
        ...NEW_STEP_PLACEHOLDER,
        step_id: `step-${Date.now()}`, // Ensure unique ID for new step
        sequence_number: prevProcess.steps.length,
      };
      const updatedSteps = [...prevProcess.steps, newStep];
      return {
        ...prevProcess,
        steps: updatedSteps,
      };
    });
    // After adding, make the new step active
    setActiveStepId(`step-${Date.now()}`); // This will be the ID of the just-added step
  };

  // Handler for removing a step by its ID
  const handleRemoveStep = (stepIdToRemove) => {
    setProcess(prevProcess => {
      const updatedSteps = prevProcess.steps.filter(step => step.step_id !== stepIdToRemove);
      return {
        ...prevProcess,
        steps: updatedSteps,
      };
    });
    // If the active step was removed, clear activeStepId
    if (activeStepId === stepIdToRemove) {
      setActiveStepId(null);
    }
  };

  // Handler for reordering steps (called by onDragEnd from DragDropContext)
  const handleReorderSteps = (result) => {
    if (!result.destination) {
      return; // Dropped outside of a droppable area
    }

    const newSteps = Array.from(process.steps);
    const [reorderedItem] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, reorderedItem);

    setProcess(prevProcess => ({
      ...prevProcess,
      steps: newSteps,
    }));
  };

  return (
    <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b">
        <div className="flex-1">
          <CardTitle className="text-2xl font-bold mb-2">
            {process.title || "Untitled Process"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {process.description || "Add a description for your process."}
          </CardDescription>
        </div>
        <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center"
          >
            <History className="w-4 h-4 mr-2" />
            Version Control
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? 'Saving...' : 'Save Process'}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-grow">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-2 bg-slate-100 rounded-lg">
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="steps">Process Steps</TabsTrigger>
          {/* Add more tabs here if needed for other sections */}
        </TabsList>

        <CardContent className="flex-grow p-4 overflow-auto">
          <TabsContent value="metadata">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Process Title</label>
                <Input
                  id="title"
                  value={process.title}
                  onChange={(e) => setProcess({ ...process, title: e.target.value })}
                  placeholder="e.g., How to Assemble a Widget"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
                <Textarea
                  id="description"
                  value={process.description}
                  onChange={(e) => setProcess({ ...process, description: e.target.value })}
                  rows={4}
                  placeholder="Provide a detailed description of this process."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
                <Select
                  value={process.category}
                  onValueChange={(value) => setProcess({ ...process, category: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assembly">Assembly</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                    <SelectItem value="safety">Safety Procedure</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="difficulty_level" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Difficulty Level</label>
                <Select
                  value={process.difficulty_level}
                  onValueChange={(value) => setProcess({ ...process, difficulty_level: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="estimated_duration" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Estimated Duration (minutes)</label>
                <Input
                  id="estimated_duration"
                  type="number"
                  value={process.estimated_duration}
                  onChange={(e) => setProcess({ ...process, estimated_duration: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content_type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Content Type</label>
                <Select
                  value={process.content_type}
                  onValueChange={(value) => setProcess({ ...process, content_type: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="video">Video-based</SelectItem>
                    <SelectItem value="document">Document-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="hazard_level" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Hazard Level</label>
                <Select
                  value={process.hazard_level}
                  onValueChange={(value) => setProcess({ ...process, hazard_level: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select hazard level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add more metadata fields as needed */}
            </div>
          </TabsContent>

          <TabsContent value="steps" className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Process Steps</h2>
              <Button size="sm" onClick={handleAddStep}>
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
            {process.steps.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg flex-grow flex flex-col justify-center items-center">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-700">No steps yet</h3>
                <p className="text-slate-500 text-sm mb-4">Add your first step to begin building your process.</p>
                <Button onClick={handleAddStep}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Step
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {process.steps.map((step, index) => (
                  <Draggable key={step.step_id} draggableId={step.step_id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          p-3 rounded-lg border flex items-center gap-3 transition-all
                          ${snapshot.isDragging ? 'shadow-lg bg-slate-100' : 'bg-white'}
                          ${activeStepId === step.step_id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'}
                        `}
                      >
                        <div {...provided.dragHandleProps} className="cursor-grab p-1 -ml-1">
                          <GripVertical className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => setActiveStepId(step.step_id)}>
                          <p className="font-semibold text-slate-800">
                            <span className="text-slate-500 font-normal">Step {index + 1}:</span>{' '}
                            {step.title || 'Untitled Step'}
                          </p>
                          {step.description && <p className="text-slate-500 text-sm truncate">{step.description}</p>}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-slate-500 hover:bg-red-50 hover:text-red-600"
                              onClick={(e) => e.stopPropagation()} // Prevent selecting step when clicking delete trigger
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the step "
                                {step.title || 'Untitled Step'}" and all its associated content.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveStep(step.step_id)} className="bg-red-600 text-white hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}
          </TabsContent>
        </CardContent>

        {showVersionHistory && (
          <AlertDialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
            <AlertDialogContent className="min-w-[80vw] max-w-[90vw] h-[80vh] flex flex-col">
              <AlertDialogHeader>
                <AlertDialogTitle>Version Control History</AlertDialogTitle>
                <AlertDialogDescription>
                  View and manage different versions of your process.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex-grow overflow-hidden">
                <VersionControl processId={initialData?.id} onRestore={(version) => {
                  setProcess(version);
                  setShowVersionHistory(false);
                }} />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Tabs>

      <CardFooter className="flex justify-between p-4 border-t">
        <Button
          variant="outline"
          onClick={() => console.log('Discard changes clicked')} // Placeholder for discard logic
        >
          Discard Changes
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSubmitting ? 'Saving...' : 'Save Process'}
        </Button>
      </CardFooter>
    </Card>
  );
}

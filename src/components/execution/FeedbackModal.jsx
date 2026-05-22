import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { UploadFile } from '@/integrations/Core';

export default function FeedbackModal({ isOpen, onClose, onSubmit, processId, stepId, processTitle, stepTitle }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    process_id: processId,
    step_id: stepId || '',
    feedback_type: '',
    priority: 'medium',
    title: '',
    description: '',
    media_urls: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        media_urls: [...prev.media_urls, ...newUrls]
      }));
      
      showToast('Success', `${files.length} file(s) uploaded successfully`, 'success');
    } catch (error) {
      console.error('File upload failed:', error);
      showToast('Error', 'Failed to upload files', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.feedback_type || !formData.title || !formData.description) {
      showToast('Error', 'Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        process_id: processId,
        step_id: stepId || '',
        feedback_type: '',
        priority: 'medium',
        title: '',
        description: '',
        media_urls: []
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      showToast('Error', 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'clarity_issue', label: 'Clarity Issue', description: 'Instructions are unclear or confusing' },
    { value: 'safety_concern', label: 'Safety Concern', description: 'Missing or incorrect safety information' },
    { value: 'missing_information', label: 'Missing Information', description: 'Important details are missing' },
    { value: 'outdated_content', label: 'Outdated Content', description: 'Information is no longer accurate' },
    { value: 'suggestion', label: 'Suggestion', description: 'Ideas for improvement' },
    { value: 'error_report', label: 'Error Report', description: 'Technical or content errors' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Provide Feedback
          </DialogTitle>
          <div className="text-sm text-slate-600">
            <strong>Process:</strong> {processTitle}
            {stepTitle && (
              <>
                <br />
                <strong>Step:</strong> {stepTitle}
              </>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Type of Feedback <span className="text-red-500">*</span>
            </label>
            <Select value={formData.feedback_type} onValueChange={(value) => handleSelectChange('feedback_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type..." />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-slate-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Priority Level</label>
            <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General improvement</SelectItem>
                <SelectItem value="medium">Medium - Important but not urgent</SelectItem>
                <SelectItem value="high">High - Needs attention soon</SelectItem>
                <SelectItem value="critical">Critical - Safety or major issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Brief Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Summarize your feedback in a few words..."
              maxLength={100}
            />
            <div className="text-xs text-slate-500 text-right">
              {formData.title.length}/100 characters
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your feedback..."
              className="min-h-[120px]"
              maxLength={1000}
            />
            <div className="text-xs text-slate-500 text-right">
              {formData.description.length}/1000 characters
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Supporting Media (Optional)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
              <Button type="button" variant="outline" asChild disabled={isUploading}>
                <label className="cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload Images or Videos'}
                </label>
              </Button>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-slate-500 mt-2">
                Upload screenshots, photos, or videos to help explain your feedback
              </p>
            </div>

            {/* Display uploaded media */}
            {formData.media_urls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.media_urls.map((url, index) => (
                    <div key={index} className="relative">
                      <Badge variant="secondary" className="pr-6">
                        File {index + 1}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || isUploading || !formData.feedback_type || !formData.title || !formData.description}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
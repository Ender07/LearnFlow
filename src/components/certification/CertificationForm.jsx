import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Certification } from '@/entities/all';
import { useToast } from '@/components/common/Toast';

export default function CertificationForm({ onClose, learningPaths = [], processes = [] }) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issuing_authority: 'Internal',
    validity_period_months: '',
    badge_icon: 'Award',
    required_paths: [],
    required_processes: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, itemId, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], itemId]
        : prev[name].filter(id => id !== itemId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      showToast("Warning", "Please fill in all required fields.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const certificationData = {
        ...formData,
        validity_period_months: formData.validity_period_months ? parseInt(formData.validity_period_months) : null
      };

      await Certification.create(certificationData);
      showToast("Success", "Certification created successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error creating certification:", error);
      showToast("Error", "Failed to create certification.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Create New Certification</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., CNC Machine Operation Level 1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="issuing_authority" className="text-sm font-medium">
                    Issuing Authority
                  </label>
                  <Input
                    id="issuing_authority"
                    name="issuing_authority"
                    value={formData.issuing_authority}
                    onChange={handleInputChange}
                    placeholder="e.g., Internal, NIMS, OSHA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description *
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this certification represents..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="validity_period_months" className="text-sm font-medium">
                  Validity Period (months)
                </label>
                <Input
                  id="validity_period_months"
                  name="validity_period_months"
                  type="number"
                  value={formData.validity_period_months}
                  onChange={handleInputChange}
                  placeholder="Leave empty for permanent certification"
                />
              </div>

              {learningPaths.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Learning Paths</label>
                  <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {learningPaths.map(path => (
                      <div key={path.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`path-${path.id}`}
                          checked={formData.required_paths.includes(path.id)}
                          onCheckedChange={(checked) => handleArrayChange('required_paths', path.id, checked)}
                        />
                        <label htmlFor={`path-${path.id}`} className="text-sm">{path.title}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {processes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required Individual Processes</label>
                  <div className="max-h-32 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {processes.slice(0, 10).map(process => (
                      <div key={process.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`process-${process.id}`}
                          checked={formData.required_processes.includes(process.id)}
                          onCheckedChange={(checked) => handleArrayChange('required_processes', process.id, checked)}
                        />
                        <label htmlFor={`process-${process.id}`} className="text-sm">{process.title}</label>
                      </div>
                    ))}
                    {processes.length > 10 && (
                      <p className="text-xs text-slate-500">Showing first 10 processes...</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Certification
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
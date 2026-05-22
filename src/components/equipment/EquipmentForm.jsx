import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/common/Toast';
import { Loader2, Upload } from 'lucide-react';
import { UploadFile } from '@/integrations/Core';

const initialState = {
  name: '',
  model: '',
  manufacturer: '',
  category: 'machinery',
  location: '',
  serial_number: '',
  status: 'operational',
  image_url: '',
};

export default function EquipmentForm({ isOpen, onClose, equipment, onSave }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (equipment) {
      setFormData(equipment);
    } else {
      setFormData(initialState);
    }
  }, [equipment, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: response.file_url }));
      showToast('Success', 'Image uploaded successfully.', 'success');
    } catch (error) {
      console.error('Image upload failed:', error);
      showToast('Error', 'Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (equipment?.id) {
        await onSave(equipment.id, formData);
        showToast('Success', 'Equipment updated successfully!', 'success');
      } else {
        await onSave(formData);
        showToast('Success', 'Equipment added successfully!', 'success');
      }
      onClose();
    } catch (error) {
      console.error('Failed to save equipment:', error);
      showToast('Error', 'Failed to save equipment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{equipment ? 'Edit Equipment' : 'Add New Equipment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="name">Name</label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <label htmlFor="model">Model</label>
              <Input id="model" name="model" value={formData.model} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label htmlFor="manufacturer">Manufacturer</label>
              <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <label htmlFor="serial_number">Serial Number</label>
              <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label>Category</label>
              <Select name="category" value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="machinery">Machinery</SelectItem>
                  <SelectItem value="hand_tools">Hand Tools</SelectItem>
                  <SelectItem value="safety_equipment">Safety Equipment</SelectItem>
                  <SelectItem value="measuring_instruments">Measuring Instruments</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-1">
              <label>Status</label>
              <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
              <label htmlFor="location">Location</label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>
          <div className="space-y-1">
            <label>Image</label>
            <div className="flex items-center gap-4">
              {formData.image_url && <img src={formData.image_url} alt="Equipment" className="w-20 h-20 rounded-lg object-cover" />}
              <Button asChild variant="outline">
                <label htmlFor="image-upload" className="cursor-pointer">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </label>
              </Button>
              <Input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Equipment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
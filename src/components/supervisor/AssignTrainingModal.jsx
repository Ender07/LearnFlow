import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, BookOpen, Route, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignTrainingModal({ 
  isOpen, 
  onClose, 
  selectedMember, 
  processes, 
  learningPaths, 
  onAssign 
}) {
  const [assignmentType, setAssignmentType] = useState('process');
  const [selectedItems, setSelectedItems] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');

  if (!selectedMember) return null;

  const handleAssign = () => {
    if (selectedItems.length === 0) return;

    const assignments = selectedItems.map(itemId => ({
      userId: selectedMember.id,
      type: assignmentType,
      itemId,
      dueDate,
      notes,
      priority,
      assignedBy: 'current_supervisor'
    }));

    onAssign(assignments);
    
    // Reset form
    setSelectedItems([]);
    setDueDate(null);
    setNotes('');
    setPriority('medium');
    onClose();
  };

  const availableItems = assignmentType === 'process' ? processes : learningPaths;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Assign Training to {selectedMember.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignment Type</label>
            <Select value={assignmentType} onValueChange={setAssignmentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="process">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Individual Process
                  </div>
                </SelectItem>
                <SelectItem value="learning_path">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4" />
                    Learning Path
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Item Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select {assignmentType === 'process' ? 'Processes' : 'Learning Paths'}
            </label>
            <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
              {availableItems?.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItems.includes(item.id) 
                      ? 'bg-blue-100 border-blue-200' 
                      : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    setSelectedItems(prev => 
                      prev.includes(item.id)
                        ? prev.filter(id => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                >
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-slate-500">
                      {item.category || item.target_role} • {item.estimated_duration || item.estimated_total_duration || 'N/A'} min
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.difficulty_level && (
                      <Badge variant="outline" className="text-xs">
                        {item.difficulty_level}
                      </Badge>
                    )}
                    {item.grants_certification_id && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
              
              {(!availableItems || availableItems.length === 0) && (
                <div className="text-center text-slate-500 py-8">
                  No {assignmentType === 'process' ? 'processes' : 'learning paths'} available
                </div>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Select due date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
                </SelectItem>
                <SelectItem value="medium">
                  <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
                </SelectItem>
                <SelectItem value="high">
                  <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assignment Notes</label>
            <Textarea
              placeholder="Add any specific instructions or context for this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={selectedItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Assign Training ({selectedItems.length} selected)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/common/Toast';

export default function ContributionForm({ isOpen, onClose, onSubmit, processes }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [processId, setProcessId] = useState('');
  const [contributionType, setContributionType] = useState('tip');
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!title || !content || !processId) {
      showToast({ type: 'error', title: 'Missing Fields', message: 'Please fill out all required fields.' });
      return;
    }
    try {
      await onSubmit({ title, content, process_id: processId, contribution_type: contributionType });
      showToast({ type: 'success', title: 'Contribution Shared', message: 'Thank you for sharing your knowledge!' });
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setProcessId('');
      setContributionType('tip');
    } catch (error) {
      showToast({ type: 'error', title: 'Submission Failed', message: error.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Knowledge</DialogTitle>
          <DialogDescription>
            Contribute a tip, best practice, or troubleshooting advice to help your team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Title of your contribution" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Describe your tip or insight in detail..." value={content} onChange={e => setContent(e.target.value)} rows={5} />
          <Select onValueChange={setProcessId}>
            <SelectTrigger><SelectValue placeholder="Related Process" /></SelectTrigger>
            <SelectContent>
              {processes.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={contributionType} onValueChange={setContributionType}>
            <SelectTrigger><SelectValue placeholder="Contribution Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tip">Tip</SelectItem>
              <SelectItem value="best_practice">Best Practice</SelectItem>
              <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
              <SelectItem value="safety_note">Safety Note</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Share Contribution</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
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

export default function DiscussionForm({ isOpen, onClose, onSubmit, processes }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [processId, setProcessId] = useState('');
  const [discussionType, setDiscussionType] = useState('question');
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!title || !content || !processId) {
      showToast({ type: 'error', title: 'Missing Fields', message: 'Please fill out all required fields.' });
      return;
    }
    try {
      await onSubmit({ title, content, process_id: processId, discussion_type: discussionType });
      showToast({ type: 'success', title: 'Discussion Started', message: 'Your question has been posted.' });
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setProcessId('');
      setDiscussionType('question');
    } catch (error) {
      showToast({ type: 'error', title: 'Submission Failed', message: error.message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
          <DialogDescription>
            Ask a question or start a conversation about a process.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Discussion Title / Question" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Provide more details about your question or topic..." value={content} onChange={e => setContent(e.target.value)} rows={5} />
          <Select onValueChange={setProcessId}>
            <SelectTrigger><SelectValue placeholder="Related Process" /></SelectTrigger>
            <SelectContent>
              {processes.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={discussionType} onValueChange={setDiscussionType}>
            <SelectTrigger><SelectValue placeholder="Discussion Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
              <SelectItem value="improvement_idea">Improvement Idea</SelectItem>
              <SelectItem value="safety_concern">Safety Concern</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Start Discussion</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
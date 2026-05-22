import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileImage,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/common/Toast';
import { useData } from '@/components/providers/DataProvider';

export default function FeedbackDetailsModal({ feedback, isOpen, onClose, processes, users }) {
  const { showToast } = useToast();
  const { updateFeedback } = useData();
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState(feedback?.resolution_notes || '');
  const [newStatus, setNewStatus] = useState(feedback?.status || 'open');

  if (!feedback) return null;

  const process = processes?.find(p => p.id === feedback.process_id);
  const user = users?.find(u => u.id === feedback.created_by);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_review': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const updateData = {
        status: newStatus,
        resolution_notes: resolutionNotes,
        resolved_date: newStatus === 'resolved' ? new Date().toISOString() : undefined
      };
      
      await updateFeedback(feedback.id, updateData);
      showToast('Success', 'Feedback updated successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to update feedback:', error);
      showToast('Error', 'Failed to update feedback', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Feedback Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">{feedback.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{user?.full_name || 'Unknown User'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(feedback.created_date), 'PPP')}</span>
                    </div>
                    <span>•</span>
                    <span><strong>Process:</strong> {process?.title || 'Unknown Process'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(feedback.status)}
                  <Badge className={getPriorityColor(feedback.priority)}>
                    {feedback.priority} priority
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {feedback.feedback_type?.replace('_', ' ')}
                </Badge>
                {feedback.step_id && (
                  <Badge variant="outline">
                    Step-specific feedback
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {feedback.description}
              </p>
            </CardContent>
          </Card>

          {/* Media Attachments */}
          {feedback.media_urls?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Attachments ({feedback.media_urls.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {feedback.media_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onClick={() => window.open(url, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg cursor-pointer" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Management */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Update Status</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Status
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="resolution_notes" className="text-sm font-medium text-slate-700 mb-2 block">
                    Resolution Notes
                  </label>
                  <Textarea
                    id="resolution_notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Add notes about how this feedback was addressed..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Feedback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Resolution Notes */}
          {feedback.resolution_notes && feedback.status !== 'open' && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Previous Resolution Notes</h3>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg">
                  {feedback.resolution_notes}
                </p>
                {feedback.resolved_date && (
                  <p className="text-sm text-slate-500 mt-2">
                    Resolved on {format(new Date(feedback.resolved_date), 'PPP')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
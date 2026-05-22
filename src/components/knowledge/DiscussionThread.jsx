import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Discussion, DiscussionReply } from '@/entities/all';

export default function DiscussionThread({ discussionId, onBack }) {
  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDiscussion();
  }, [discussionId]);

  const loadDiscussion = async () => {
    try {
      const discussionData = await Discussion.get(discussionId);
      const repliesData = await DiscussionReply.filter({ discussion_id: discussionId });
      
      setDiscussion(discussionData);
      setReplies(repliesData.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
    } catch (error) {
      console.error('Error loading discussion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!newReply.trim()) return;
    
    setIsSubmitting(true);
    try {
      const reply = await DiscussionReply.create({
        discussion_id: discussionId,
        content: newReply.trim(),
        contributor_expertise: 'intermediate' // Would be determined from user profile
      });
      
      setReplies(prev => [...prev, reply]);
      setNewReply('');
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteHelpful = async (replyId) => {
    try {
      const reply = replies.find(r => r.id === replyId);
      await DiscussionReply.update(replyId, {
        helpful_votes: (reply.helpful_votes || 0) + 1
      });
      
      setReplies(prev => prev.map(r => 
        r.id === replyId 
          ? { ...r, helpful_votes: (r.helpful_votes || 0) + 1 }
          : r
      ));
    } catch (error) {
      console.error('Error voting helpful:', error);
    }
  };

  const handleMarkAsSolution = async (replyId) => {
    try {
      // Unmark previous solution
      await Promise.all(
        replies
          .filter(r => r.is_solution)
          .map(r => DiscussionReply.update(r.id, { is_solution: false }))
      );
      
      // Mark new solution
      await DiscussionReply.update(replyId, { is_solution: true });
      
      // Mark discussion as resolved
      await Discussion.update(discussionId, { is_resolved: true });
      
      setReplies(prev => prev.map(r => ({
        ...r,
        is_solution: r.id === replyId
      })));
      
      setDiscussion(prev => ({ ...prev, is_resolved: true }));
    } catch (error) {
      console.error('Error marking solution:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600">Discussion not found.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Discussions
        </Button>
      </div>
    );
  }

  const getExpertiseColor = (level) => {
    switch (level) {
      case 'master': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-green-100 text-green-800';
      case 'novice': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge className={discussion.is_resolved ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-800'}>
              {discussion.is_resolved ? 'Resolved' : 'Open'}
            </Badge>
            {discussion.is_urgent && (
              <Badge className="bg-red-500 text-white">
                Urgent
              </Badge>
            )}
          </div>
        </div>

        {/* Main Discussion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-start gap-3">
              <MessageSquare className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h1 className="text-xl font-bold">{discussion.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-xs">
                        {discussion.created_by?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{discussion.created_by?.split('@')[0] || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(discussion.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 whitespace-pre-wrap">{discussion.content}</p>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Responses ({replies.length})
          </h2>
          
          <AnimatePresence>
            {replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={reply.is_solution ? 'border-green-300 bg-green-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {reply.created_by?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {reply.created_by?.split('@')[0] || 'Anonymous'}
                          </span>
                          <Badge className={getExpertiseColor(reply.contributor_expertise)}>
                            {reply.contributor_expertise}
                          </Badge>
                          {reply.is_solution && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Solution
                            </Badge>
                          )}
                          <span className="text-xs text-slate-500">
                            {new Date(reply.created_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-slate-700 mb-3 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVoteHelpful(reply.id)}
                            className="flex items-center gap-1"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{reply.helpful_votes || 0}</span>
                          </Button>
                          
                          {!discussion.is_resolved && !reply.is_solution && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsSolution(reply.id)}
                              className="flex items-center gap-1 text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark as Solution
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Reply Form */}
        {!discussion.is_resolved && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your knowledge or ask for clarification..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="min-h-24"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReply}
                    disabled={!newReply.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post Response
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
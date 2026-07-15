import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Plus, ArrowLeft, Search, CheckCircle2, Clock, AlertCircle, Lightbulb, HelpCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_CONFIG = {
  question: { label: 'Question', icon: HelpCircle, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  troubleshooting: { label: 'Troubleshooting', icon: AlertCircle, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  improvement_idea: { label: 'Improvement Idea', icon: Lightbulb, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  safety_concern: { label: 'Safety Concern', icon: AlertCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  general: { label: 'General', icon: MessageSquare, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

function ThreadCard({ discussion, users, onClick }) {
  const author = users.find(u => u.id === discussion.created_by_id);
  const type = TYPE_CONFIG[discussion.discussion_type] || TYPE_CONFIG.general;
  const TypeIcon = type.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className="bg-[#131e35] border border-slate-700/50 hover:border-blue-500/40 cursor-pointer transition-all duration-200 hover:bg-[#162040]"
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${type.color}`}>
                  <TypeIcon className="w-3 h-3" />
                  {type.label}
                </span>
                {discussion.is_urgent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Urgent</span>
                )}
                {discussion.is_resolved && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-white text-base mb-1 truncate">{discussion.title}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">{discussion.content}</p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 text-right">
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{discussion.participant_count || 0} replies</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[10px] bg-blue-600 text-white">
                {author?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-slate-400 text-xs">{author?.full_name || 'Unknown'}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ThreadDetail({ discussion, users, currentUser, onBack, onReplyAdded }) {
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const author = users.find(u => u.id === discussion.created_by_id);
  const type = TYPE_CONFIG[discussion.discussion_type] || TYPE_CONFIG.general;

  useEffect(() => {
    base44.entities.DiscussionReply.filter({ discussion_id: discussion.id }, '-created_date', 100)
      .then(setReplies)
      .catch(() => setReplies([]));
  }, [discussion.id]);

  const postReply = async () => {
    if (!replyContent.trim()) return;
    setIsPosting(true);
    try {
      const reply = await base44.entities.DiscussionReply.create({
        discussion_id: discussion.id,
        content: replyContent.trim(),
      });
      setReplies(prev => [reply, ...prev]);
      setReplyContent('');
      // update reply count
      await base44.entities.Discussion.update(discussion.id, {
        participant_count: (discussion.participant_count || 0) + 1,
        last_activity: new Date().toISOString(),
      });
      onReplyAdded();
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discussions
      </Button>

      {/* Original post */}
      <Card className="bg-[#131e35] border border-slate-700/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${type.color}`}>
                  {type.label}
                </span>
                {discussion.is_resolved && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>
              <CardTitle className="text-white text-xl">{discussion.title}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-[10px] bg-blue-600 text-white">
                {author?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{author?.full_name || 'Unknown'}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true })}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{discussion.content}</p>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wide">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h3>
        {replies.map(reply => {
          const replyAuthor = users.find(u => u.id === reply.created_by_id);
          return (
            <motion.div key={reply.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className={`border ${reply.is_solution ? 'border-green-500/40 bg-green-500/5' : 'border-slate-700/50 bg-[#0f1729]'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[10px] bg-indigo-600 text-white">
                        {replyAuthor?.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-slate-300 text-sm font-medium">{replyAuthor?.full_name || 'Unknown'}</span>
                    <span className="text-slate-500 text-xs">{formatDistanceToNow(new Date(reply.created_date), { addSuffix: true })}</span>
                    {reply.is_solution && (
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solution
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Reply box */}
      <Card className="bg-[#131e35] border border-slate-700/50">
        <CardContent className="p-4 space-y-3">
          <h4 className="text-white font-medium text-sm">Post a Reply</h4>
          <Textarea
            placeholder="Share your thoughts or answer..."
            className="bg-[#0f1729] border-slate-600 text-slate-200 placeholder:text-slate-500 resize-none"
            rows={3}
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={!replyContent.trim() || isPosting}
              onClick={postReply}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isPosting ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Community() {
  const { processes, currentUser, isLoading } = useData();
  const [users, setUsers] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', process_id: '', discussion_type: 'question' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    base44.entities.Discussion.list('-created_date', 100).then(setDiscussions).catch(() => setDiscussions([]));
    base44.entities.User.list().then(setUsers).catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(() => discussions.filter(d => {
    const matchesSearch = d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || d.discussion_type === filterType;
    return matchesSearch && matchesType;
  }), [discussions, searchTerm, filterType]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setIsSubmitting(true);
    try {
      const d = await base44.entities.Discussion.create({
        ...form,
        process_id: form.process_id || (processes[0]?.id || ''),
        participant_count: 0,
        is_resolved: false,
        last_activity: new Date().toISOString(),
      });
      setDiscussions(prev => [d, ...prev]);
      setShowNewDialog(false);
      setForm({ title: '', content: '', process_id: '', discussion_type: 'question' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-800 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (selectedDiscussion) {
    return (
      <div className="min-h-screen bg-[#0f1729] p-6">
        <div className="max-w-3xl mx-auto">
          <ThreadDetail
            discussion={selectedDiscussion}
            users={users}
            currentUser={currentUser}
            onBack={() => setSelectedDiscussion(null)}
            onReplyAdded={() => {
              base44.entities.Discussion.list('-created_date', 100).then(setDiscussions);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1729] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Community Discussions</h1>
            <p className="text-slate-400 text-sm">Ask questions, share ideas, and learn together</p>
          </div>
          <Button className="ml-auto bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewDialog(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Discussion
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search discussions..."
              className="pl-9 bg-[#131e35] border-slate-700 text-slate-200 placeholder:text-slate-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 bg-[#131e35] border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="question">Questions</SelectItem>
              <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
              <SelectItem value="improvement_idea">Improvement Ideas</SelectItem>
              <SelectItem value="safety_concern">Safety Concerns</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Thread list */}
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No discussions yet</p>
                <p className="text-sm mt-1">Be the first to start a conversation</p>
              </div>
            ) : (
              filtered.map(d => (
                <ThreadCard key={d.id} discussion={d} users={users} onClick={() => setSelectedDiscussion(d)} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New discussion dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="bg-[#131e35] border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Start a Discussion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Title / Question"
              className="bg-[#0f1729] border-slate-600 text-slate-200 placeholder:text-slate-500"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <Textarea
              placeholder="Provide more detail..."
              className="bg-[#0f1729] border-slate-600 text-slate-200 placeholder:text-slate-500 resize-none"
              rows={4}
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
            <Select value={form.discussion_type} onValueChange={v => setForm(f => ({ ...f, discussion_type: v }))}>
              <SelectTrigger className="bg-[#0f1729] border-slate-600 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                <SelectItem value="improvement_idea">Improvement Idea</SelectItem>
                <SelectItem value="safety_concern">Safety Concern</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            {processes.length > 0 && (
              <Select value={form.process_id} onValueChange={v => setForm(f => ({ ...f, process_id: v }))}>
                <SelectTrigger className="bg-[#0f1729] border-slate-600 text-slate-200">
                  <SelectValue placeholder="Related Process (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {processes.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button
              disabled={!form.title.trim() || !form.content.trim() || isSubmitting}
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
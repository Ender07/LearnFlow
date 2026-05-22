import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function FeedbackTable({ feedbackData, onRowClick, processes, users }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const getProcessTitle = (processId) => {
    const process = processes?.find(p => p.id === processId);
    return process?.title || 'Unknown Process';
  };

  const getUserName = (userId) => {
    const user = users?.find(u => u.id === userId);
    return user?.full_name || 'Unknown User';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'safety_concern': return 'bg-red-100 text-red-800';
      case 'error_report': return 'bg-orange-100 text-orange-800';
      case 'clarity_issue': return 'bg-blue-100 text-blue-800';
      case 'missing_information': return 'bg-purple-100 text-purple-800';
      case 'outdated_content': return 'bg-yellow-100 text-yellow-800';
      case 'suggestion': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const filteredFeedback = useMemo(() => {
    return feedbackData.filter(item => {
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getProcessTitle(item.process_id).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || item.feedback_type === filterType;
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      
      return matchesSearch && matchesType && matchesPriority;
    });
  }, [feedbackData, searchTerm, filterType, filterPriority]);

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Feedback Items ({filteredFeedback.length})</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="clarity_issue">Clarity Issue</SelectItem>
              <SelectItem value="safety_concern">Safety Concern</SelectItem>
              <SelectItem value="missing_information">Missing Info</SelectItem>
              <SelectItem value="outdated_content">Outdated Content</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="error_report">Error Report</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Feedback Found</h3>
            <p className="text-slate-500">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'No feedback has been submitted yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((feedback, index) => (
              <motion.div
                key={feedback.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(feedback)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{feedback.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {feedback.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span><strong>Process:</strong> {getProcessTitle(feedback.process_id)}</span>
                  <span>•</span>
                  <span><strong>By:</strong> {getUserName(feedback.created_by)}</span>
                  <span>•</span>
                  <span>{format(new Date(feedback.created_date), 'MMM d, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-2 mt-3">
                  <Badge className={getPriorityColor(feedback.priority)}>
                    {feedback.priority} priority
                  </Badge>
                  <Badge className={getTypeColor(feedback.feedback_type)}>
                    {feedback.feedback_type?.replace('_', ' ')}
                  </Badge>
                  {feedback.media_urls?.length > 0 && (
                    <Badge variant="outline">
                      {feedback.media_urls.length} attachment{feedback.media_urls.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
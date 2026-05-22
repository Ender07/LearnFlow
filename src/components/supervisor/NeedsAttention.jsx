import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react';

export default function NeedsAttention({ reviews = [], feedback = [] }) {
  const pendingReviews = reviews.filter(r => r.review_status === 'pending');
  const openFeedback = feedback.filter(f => f.status === 'open');

  const attentionItems = [
    ...pendingReviews.map(item => ({ type: 'review', ...item })),
    ...openFeedback.map(item => ({ type: 'feedback', ...item }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Needs Attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attentionItems.length === 0 ? (
          <p className="text-slate-500 text-center py-8">All clear! No items need your attention.</p>
        ) : (
          <ul className="space-y-4">
            {attentionItems.slice(0, 5).map(item => (
              <li key={`${item.type}-${item.id}`} className="p-3 bg-red-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.type === 'review' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.type === 'review' ? `Pending Review for ${item.trainee_id}` : `New Feedback: ${item.title}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.type === 'review' ? `Process: ${item.process_id}` : `Category: ${item.feedback_type}`}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  View <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
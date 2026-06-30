import React, { useState, useEffect } from 'react';
import { KnowledgeContribution } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, User, CheckCircle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import KnowledgeGraphPanel from '@/components/knowledge/KnowledgeGraphPanel';

export default function ContextualKnowledge({ processId, stepId }) {
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledge = async () => {
      setIsLoading(true);
      try {
        const filter = { process_id: processId };
        if (stepId) {
          filter.step_id = stepId;
        }
        const data = await KnowledgeContribution.filter(filter, '-validation_score', 5);
        setContributions(data);
      } catch (error) {
        console.error("Failed to fetch contextual knowledge:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (processId) {
      fetchKnowledge();
    }
  }, [processId, stepId]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 h-full flex flex-col items-center justify-center">
        <Lightbulb className="w-12 h-12 text-slate-300 mb-4" />
        <h4 className="font-semibold text-slate-700">No Knowledge Yet</h4>
        <p className="text-sm">Be the first to share a tip for this step!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <KnowledgeGraphPanel processId={processId} stepId={stepId} />
      {contributions.map(item => (
        <Card key={item.id} className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-bold">{item.title}</CardTitle>
              <Badge variant="secondary">{item.contribution_type.replace('_', ' ')}</Badge>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <User className="w-3 h-3" />
              <span>by {item.created_by.split('@')[0]}</span>
              {item.is_verified && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 mb-4">{item.content}</p>
            <div className="flex items-center justify-end gap-2 text-slate-500">
              <button className="flex items-center gap-1 hover:text-green-600">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{item.validation_score || 0}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
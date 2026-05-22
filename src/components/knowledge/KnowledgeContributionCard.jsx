import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useData } from '@/components/providers/DataProvider';

export default function KnowledgeContributionCard({ contribution }) {
  const { updateKnowledgeContribution } = useData();

  const handleVote = async (voteType) => {
    const currentScore = contribution.validation_score || 0;
    const newScore = voteType === 'up' ? currentScore + 1 : currentScore - 1;
    await updateKnowledgeContribution(contribution.id, { validation_score: newScore });
  };
  
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle>{contribution.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-500 pt-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback>{contribution.created_by.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{contribution.created_by.split('@')[0]} shared</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(contribution.created_date), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 line-clamp-3">{contribution.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="secondary">{contribution.contribution_type.replace('_', ' ')}</Badge>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleVote('up')}>
            <ThumbsUp className="w-4 h-4 mr-2" />
            Helpful
          </Button>
          <span className="font-bold text-slate-600">{contribution.validation_score || 0}</span>
          <Button variant="ghost" size="sm" onClick={() => handleVote('down')}>
            <ThumbsDown className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DiscussionCard({ discussion }) {
  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      <CardHeader>
        <CardTitle>{discussion.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-slate-500 pt-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback>{discussion.created_by.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span>{discussion.created_by.split('@')[0]} asked</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(discussion.created_date), { addSuffix: true })}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 line-clamp-2">{discussion.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="outline">{discussion.discussion_type.replace('_', ' ')}</Badge>
          <Badge variant={discussion.is_resolved ? "default" : "destructive"}>
            {discussion.is_resolved ? 'Resolved' : 'Unresolved'}
          </Badge>
        </div>
        <Button size="sm" variant="ghost">
          View Discussion <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCheck, Search } from 'lucide-react';

export default function ExpertFinder({ users, contributions }) {
  const [searchTerm, setSearchTerm] = useState('');

  const experts = (users || [])
    .map(user => {
      const userContributions = (contributions || []).filter(c => c.created_by === user.email);
      const contributionCount = userContributions.length;
      const validationScore = userContributions.reduce((acc, c) => acc + (c.validation_score || 0), 0);
      const expertiseScore = contributionCount * 5 + validationScore * 2;
      return { ...user, expertiseScore };
    })
    .filter(user => user.expertiseScore > 0)
    .sort((a, b) => b.expertiseScore - a.expertiseScore);

  const filteredExperts = experts.filter(expert =>
    expert.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <UserCheck className="w-5 h-5 text-blue-500" />
          Find an Expert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name or skill..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-3 max-h-60 overflow-auto">
          {filteredExperts.slice(0, 5).map(expert => (
            <div key={expert.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg">
              <Avatar>
                <AvatarImage src={expert.avatar_url} />
                <AvatarFallback>{expert.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-slate-900">{expert.full_name}</p>
                <p className="text-xs text-slate-500">{expert.job_title}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
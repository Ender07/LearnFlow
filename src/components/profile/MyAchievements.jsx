import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function MyAchievements({ user, certifications, badges, userProgress }) {
  const earnedCertifications = useMemo(() => {
    // A user earns a certification if they complete a process that grants one.
    const completedCertifiedProcesses = userProgress
      .filter(p => p.status === 'completed')
      .map(p => p.process_id);
      
    // This is a simplified logic. A full implementation would check learning paths.
    // For now, we find which certifications are linked to these completed processes.
    return certifications.filter(cert => 
      cert.required_processes?.some(rp => completedCertifiedProcesses.includes(rp))
    );
  }, [userProgress, certifications]);

  const earnedBadges = useMemo(() => {
    return badges.filter(badge => user.earned_badges?.includes(badge.id));
  }, [badges, user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award /> Certifications</CardTitle>
          <CardDescription>Official credentials earned by completing learning paths and critical processes.</CardDescription>
        </CardHeader>
        <CardContent>
          {earnedCertifications.length > 0 ? (
            <div className="space-y-4">
              {earnedCertifications.map(cert => (
                <div key={cert.id} className="p-4 border rounded-lg flex items-center gap-4 bg-slate-50">
                  <div className="p-3 bg-yellow-400 rounded-md">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{cert.title}</h4>
                    <p className="text-sm text-slate-600">{cert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No certifications earned yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star /> Badges</CardTitle>
          <CardDescription>Special achievements for milestones, collaboration, and expertise.</CardDescription>
        </CardHeader>
        <CardContent>
          {earnedBadges.length > 0 ? (
            <TooltipProvider>
              <div className="flex flex-wrap gap-4">
                {earnedBadges.map(badge => (
                  <Tooltip key={badge.id}>
                    <TooltipTrigger>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                          <Star className="w-10 h-10 text-indigo-500" />
                        </div>
                        <span className="text-xs font-medium text-slate-700">{badge.title}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{badge.title}</p>
                      <p>{badge.description}</p>
                      <p className="text-xs text-muted-foreground">+{badge.points} points</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          ) : (
            <p className="text-slate-500 text-center py-8">No badges earned yet. Keep learning!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, UserX, Bell, AlertTriangle } from "lucide-react";
import { format, addMonths, differenceInDays } from "date-fns";

export default function PredictiveCompliance({ certifications, userProgress, users }) {

  const expiringSoon = useMemo(() => {
    const expiringCerts = [];
    const now = new Date();

    userProgress.forEach(progress => {
      if (progress.status !== 'completed' || !progress.completed_date) return;

      const cert = certifications.find(c => c.required_processes?.includes(progress.process_id) || c.required_paths?.includes(progress.process_id));
      if (!cert || !cert.validity_period_months) return;

      const expiryDate = addMonths(new Date(progress.completed_date), cert.validity_period_months);
      const daysUntilExpiry = differenceInDays(expiryDate, now);
      
      if (daysUntilExpiry <= 90 && daysUntilExpiry >= 0) {
        const user = users.find(u => u.email === progress.created_by);
        expiringCerts.push({
          id: `${progress.id}-${cert.id}`,
          user: user,
          certTitle: cert.title,
          expiryDate: format(expiryDate, "MMM d, yyyy"),
          daysUntilExpiry: daysUntilExpiry,
          urgency: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low'
        });
      }
    });

    return expiringCerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [certifications, userProgress, users]);

  const atRiskUsers = useMemo(() => {
    // A more complex model could predict risk based on learning velocity, etc.
    // For now, we'll identify users with multiple upcoming expiries.
    const userRisk = expiringSoon.reduce((acc, item) => {
      if (!item.user) return acc;
      acc[item.user.id] = (acc[item.user.id] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(userRisk)
      .filter(([_, count]) => count > 1)
      .map(([userId, count]) => ({
        user: users.find(u => u.id === userId),
        expiringCount: count
      }))
      .sort((a,b) => b.expiringCount - a.expiringCount);

  }, [expiringSoon, users]);
  
  const getUrgencyColor = (urgency) => {
    if (urgency === 'high') return 'border-red-500 bg-red-50';
    if (urgency === 'medium') return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-500" />
            Upcoming Certification Expiries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {expiringSoon.length > 0 ? expiringSoon.map(item => (
              <div key={item.id} className={`p-3 rounded-lg border-l-4 ${getUrgencyColor(item.urgency)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                       <AvatarImage src={item.user?.avatar_url} />
                       <AvatarFallback>{item.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{item.user?.full_name}</p>
                      <p className="text-xs text-slate-600">{item.certTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{item.expiryDate}</p>
                    <Badge variant={item.urgency === 'high' ? 'destructive' : 'secondary'}>
                      {item.daysUntilExpiry} days left
                    </Badge>
                  </div>
                </div>
              </div>
            )) : <p className="text-slate-500 text-center py-8">No certifications expiring soon.</p>}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-500" />
            Users at Risk of Non-Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {atRiskUsers.length > 0 ? atRiskUsers.map(item => (
              <div key={item.user.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                     <AvatarImage src={item.user.avatar_url} />
                     <AvatarFallback>{item.user.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-800">{item.user.full_name}</p>
                    <p className="text-sm text-slate-600">{item.user.job_title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {item.expiringCount} expiring certs
                  </Badge>
                  <Button size="sm" variant="ghost" className="mt-1 h-7">
                    <Bell className="w-3 h-3 mr-1" />
                    Notify
                  </Button>
                </div>
              </div>
            )) : <p className="text-slate-500 text-center py-8">No users currently identified as high-risk.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
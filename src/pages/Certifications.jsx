import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Search, Shield, Clock, CheckCircle2, Lock, ChevronRight, Download } from 'lucide-react';

export default function Certifications() {
  const { certifications, userProgress, isLoading } = useData();
  const [search, setSearch] = useState('');

  const completedProcessIds = useMemo(() =>
    new Set(userProgress.filter(p => p.status === 'completed').map(p => p.process_id)),
    [userProgress]
  );

  const certsWithStatus = useMemo(() => {
    return certifications.filter(c => c.title?.toLowerCase().includes(search.toLowerCase())).map(cert => {
      const requiredProcs = cert.required_processes || [];
      const earned = requiredProcs.length === 0 || requiredProcs.every(id => completedProcessIds.has(id));
      const progress = requiredProcs.length > 0
        ? Math.round((requiredProcs.filter(id => completedProcessIds.has(id)).length / requiredProcs.length) * 100)
        : 0;
      return { ...cert, earned, progress };
    });
  }, [certifications, completedProcessIds, search]);

  const earned = certsWithStatus.filter(c => c.earned);
  const notYet = certsWithStatus.filter(c => !c.earned);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-4">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 bg-slate-700 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              Certifications
            </h1>
            <p className="text-slate-400 mt-1 text-sm">{earned.length} earned · {notYet.length} available to earn</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search certifications..."
              className="pl-10 w-72 bg-[#1a2540] border-slate-600 text-white placeholder:text-slate-500" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{earned.length}</div>
              <div className="text-xs text-slate-400 mt-1">Earned</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{notYet.length}</div>
              <div className="text-xs text-slate-400 mt-1">Available</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-slate-400">{certifications.length}</div>
              <div className="text-xs text-slate-400 mt-1">Total</div>
            </CardContent>
          </Card>
        </div>

        {earned.length > 0 && (
          <div>
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Earned Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earned.map(cert => <CertCard key={cert.id} cert={cert} earned={true} />)}
            </div>
          </div>
        )}

        {notYet.length > 0 && (
          <div>
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" /> Available to Earn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notYet.map(cert => <CertCard key={cert.id} cert={cert} earned={false} />)}
            </div>
          </div>
        )}

        {certsWithStatus.length === 0 && (
          <div className="text-center py-16">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-lg mb-1">No certifications found</h3>
            <p className="text-slate-400 text-sm">{search ? 'Try a different search term' : 'Certifications will appear here once created'}</p>
            <Link to={createPageUrl('LearningPaths')}>
              <Button className="mt-4 bg-amber-600 hover:bg-amber-700 text-white">Browse Learning Paths</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function CertCard({ cert, earned }) {
  return (
    <Card className={`border ${earned ? 'bg-gradient-to-br from-amber-600/10 to-orange-600/10 border-amber-500/30' : 'bg-[#1a2540] border-slate-700/50'}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${earned ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-slate-700'}`}>
            <Award className={`w-7 h-7 ${earned ? 'text-white' : 'text-slate-500'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-white font-bold text-sm">{cert.title}</h3>
              {earned && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            </div>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">{cert.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs">
                <Shield className="w-2.5 h-2.5 mr-1" />{cert.issuing_authority || 'Internal'}
              </Badge>
              {cert.validity_period_months && (
                <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs">
                  <Clock className="w-2.5 h-2.5 mr-1" />{cert.validity_period_months}mo validity
                </Badge>
              )}
            </div>
            {earned ? (
              <Button size="sm" variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 text-xs">
                <Download className="w-3 h-3 mr-1" /> Download Certificate
              </Button>
            ) : cert.progress > 0 ? (
              <div>
                <div className="h-1 bg-slate-700 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cert.progress}%` }} />
                </div>
                <span className="text-xs text-slate-400">{cert.progress}% complete</span>
              </div>
            ) : (
              <Link to={createPageUrl('LearningPaths')}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Start Earning <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
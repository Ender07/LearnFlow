import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Grid, List, BookOpen, Clock, AlertTriangle,
  CheckCircle2, Play, ChevronRight, Shield, Layers, Zap, Eye, Filter
} from 'lucide-react';

const HAZARD_COLORS = {
  low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  high: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  critical: 'text-red-500 bg-red-500/10 border-red-500/30',
};

const DIFFICULTY_COLORS = {
  beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  intermediate: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  advanced: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  expert: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
};

const CONTENT_ICONS = {
  ar_guided: '🥽', vr_simulation: '🎮', interactive: '🖥️',
  video: '🎬', document: '📄', quiz: '❓', checklist: '✅', mixed_reality: '🌐',
};

export default function ProcessLibrary() {
  const { processes, userProgress, isLoading } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [contentType, setContentType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => ['all', ...new Set(processes.map(p => p.category).filter(Boolean))], [processes]);

  const filtered = useMemo(() => {
    let list = processes.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchCat = category === 'all' || p.category === category;
      const matchDiff = difficulty === 'all' || p.difficulty_level === difficulty;
      const matchType = contentType === 'all' || p.content_type === contentType;
      return matchSearch && matchCat && matchDiff && matchType;
    });
    if (sortBy === 'duration') list = [...list].sort((a, b) => (a.estimated_duration || 0) - (b.estimated_duration || 0));
    else if (sortBy === 'title') list = [...list].sort((a, b) => a.title?.localeCompare(b.title));
    return list;
  }, [processes, search, category, difficulty, contentType, sortBy]);

  const getProgress = (processId) => userProgress.find(p => p.process_id === processId);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64 bg-slate-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 bg-slate-700 rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              Process Library
            </h1>
            <p className="text-slate-400 mt-1 text-sm">{processes.length} processes available</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}
              className={`border-slate-600 text-slate-300 hover:text-white ${showFilters ? 'border-blue-500 text-blue-400' : ''}`}>
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
            <div className="flex bg-[#1a2540] border border-slate-700 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search processes..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-[#1a2540] border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 bg-[#1a2540] border-slate-600 text-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2540] border-slate-600 text-white">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="title">A–Z</SelectItem>
              <SelectItem value="duration">By Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showFilters && (
          <Card className="bg-[#1a2540] border border-slate-700">
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Category', value: category, setValue: setCategory, options: categories },
                { label: 'Difficulty', value: difficulty, setValue: setDifficulty, options: ['all', 'beginner', 'intermediate', 'advanced', 'expert'] },
                { label: 'Content Type', value: contentType, setValue: setContentType, options: ['all', 'interactive', 'ar_guided', 'vr_simulation', 'video', 'document', 'quiz', 'checklist'] },
              ].map(f => (
                <div key={f.label} className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">{f.label}</label>
                  <Select value={f.value} onValueChange={f.setValue}>
                    <SelectTrigger className="bg-[#0f1729] border-slate-600 text-slate-300 text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2540] border-slate-600 text-white">
                      {f.options.map(o => (
                        <SelectItem key={o} value={o} className="capitalize">{o === 'all' ? 'All' : o.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 flex-wrap">
          {['all', 'ar_guided', 'vr_simulation', 'interactive', 'checklist'].map(type => (
            <button key={type} onClick={() => setContentType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                contentType === type ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#1a2540] text-slate-400 border-slate-600 hover:border-blue-500 hover:text-blue-400'
              }`}>
              {CONTENT_ICONS[type] || '📋'} {type === 'all' ? 'All Types' : type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="text-slate-400 text-sm">{filtered.length} processes found</div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No processes found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filtered.map(process => {
              const prog = getProgress(process.id);
              const isCompleted = prog?.status === 'completed';
              const isInProgress = prog?.status === 'in_progress';
              if (viewMode === 'list') {
                return (
                  <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                    <Card className="bg-[#1a2540] border border-slate-700/50 hover:border-blue-500/50 transition-all group cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="text-2xl flex-shrink-0">{CONTENT_ICONS[process.content_type] || '📋'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors truncate">{process.title}</h3>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs border ${HAZARD_COLORS[process.hazard_level] || HAZARD_COLORS.low}`}>{process.hazard_level || 'low'}</Badge>
                            <span className="text-slate-500 text-xs">{process.estimated_duration || 30}m · {process.steps?.length || 0} steps</span>
                          </div>
                        </div>
                        <Button size="sm" className={`flex-shrink-0 text-xs ${isCompleted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : isInProgress ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white'}`}>
                          {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}<ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              }
              return (
                <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                  <Card className="bg-[#1a2540] border border-slate-700/50 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg group cursor-pointer h-full">
                    {process.hazard_level === 'critical' && (
                      <div className="bg-rose-500/20 border-b border-rose-500/30 px-4 py-2 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span className="text-rose-400 text-xs font-semibold">CRITICAL HAZARD</span>
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{CONTENT_ICONS[process.content_type] || '📋'}</div>
                        <div className="flex items-center gap-1">
                          {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {isInProgress && <Play className="w-4 h-4 text-blue-400" />}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">{process.title}</h3>
                      <p className="text-slate-400 text-xs mb-4 line-clamp-2">{process.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <Badge className={`text-xs border ${HAZARD_COLORS[process.hazard_level] || HAZARD_COLORS.low}`}>{process.hazard_level || 'low'}</Badge>
                        <Badge className={`text-xs border ${DIFFICULTY_COLORS[process.difficulty_level] || DIFFICULTY_COLORS.beginner}`}>{process.difficulty_level || 'beginner'}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {process.estimated_duration || 30}m</span>
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {process.steps?.length || 0} steps</span>
                        {process.requires_supervisor && <span className="flex items-center gap-1 text-amber-400"><Shield className="w-3 h-3" /> Supervised</span>}
                      </div>
                      {isInProgress && (
                        <div className="mb-3">
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${prog?.completion_percentage || 0}%` }} />
                          </div>
                          <div className="text-xs text-slate-400 mt-1">{prog?.completion_percentage || 0}% complete</div>
                        </div>
                      )}
                      <Button size="sm" className={`w-full text-xs ${isCompleted ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : isInProgress ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white'}`}>
                        {isCompleted ? <><Eye className="w-3 h-3 mr-1" />Review</> : isInProgress ? <><Play className="w-3 h-3 mr-1" />Continue</> : <><Zap className="w-3 h-3 mr-1" />Start</>}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
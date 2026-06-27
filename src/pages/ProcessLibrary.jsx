import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/components/providers/DataProvider';
import { createPageUrl } from '@/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Search, Grid, List, BookOpen, Clock, AlertTriangle,
  CheckCircle2, Play, ChevronRight, Shield, Layers, Zap, Eye, Filter, X
} from 'lucide-react';

const HAZARD_STYLE = {
  low:      { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.25)'  },
  medium:   { color: '#facc15', bg: 'rgba(250,204,21,0.1)',   border: 'rgba(250,204,21,0.25)'  },
  high:     { color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)' },
  critical: { color: '#ff4444', bg: 'rgba(255,68,68,0.12)',   border: 'rgba(255,68,68,0.35)'   },
};
const DIFF_STYLE = {
  beginner:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)' },
  intermediate: { color: '#00D4FF', bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.22)' },
  advanced:     { color: '#facc15', bg: 'rgba(250,204,21,0.1)',  border: 'rgba(250,204,21,0.25)' },
  expert:       { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
};
const CONTENT_ICONS = {
  ar_guided: '🥽', vr_simulation: '🎮', interactive: '🖥️',
  video: '🎬', document: '📄', quiz: '❓', checklist: '✅', mixed_reality: '🌐',
};

function StatusBadge({ style: s, label }) {
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}`, boxShadow: `0 0 6px ${s.color}22` }}>
      {label}
    </span>
  );
}

export default function ProcessLibrary() {
  const { processes, userProgress, isLoading } = useData();
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy]         = useState('newest');
  const [viewMode, setViewMode]     = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => ['all', ...new Set(processes.map(p => p.category).filter(Boolean))], [processes]);

  const filtered = useMemo(() => {
    let list = processes.filter(p => {
      const q = search.toLowerCase();
      return (!q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
        && (category === 'all' || p.category === category)
        && (difficulty === 'all' || p.difficulty_level === difficulty);
    });
    if (sortBy === 'duration') list = [...list].sort((a, b) => (a.estimated_duration || 0) - (b.estimated_duration || 0));
    else if (sortBy === 'title') list = [...list].sort((a, b) => a.title?.localeCompare(b.title));
    return list;
  }, [processes, search, category, difficulty, sortBy]);

  const getProgress = (id) => userProgress.find(p => p.process_id === id);

  if (isLoading) return (
    <div className="min-h-screen p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.22)' }}>
                <BookOpen className="w-5 h-5" style={{ color: '#00D4FF' }} />
              </div>
              Process Library
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{processes.length} processes available</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={showFilters
                ? { background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="flex p-1 rounded-xl gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[{ mode: 'grid', icon: Grid }, { mode: 'list', icon: List }].map(({ mode, icon: Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="p-2 rounded-lg transition-all"
                  style={viewMode === mode
                    ? { background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }
                    : { color: 'rgba(255,255,255,0.35)' }}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input placeholder="Search processes…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.7)' }}>
            <option value="newest">Newest First</option>
            <option value="title">A–Z</option>
            <option value="duration">By Duration</option>
          </select>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="p-5 rounded-2xl grid grid-cols-2 md:grid-cols-3 gap-4"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
            {[
              { label: 'Category',   value: category,   setValue: setCategory,   options: categories },
              { label: 'Difficulty', value: difficulty, setValue: setDifficulty, options: ['all', 'beginner', 'intermediate', 'advanced', 'expert'] },
            ].map(f => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.label}</label>
                <select value={f.value} onChange={e => f.setValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                  {f.options.map(o => <option key={o} value={o}>{o === 'all' ? 'All' : o.replace('_', ' ')}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{filtered.length} processes found</div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-14 h-14 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.12)' }} />
            <h3 className="text-xl font-semibold text-white mb-2">No processes found</h3>
            <p style={{ color: 'rgba(255,255,255,0.35)' }}>Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filtered.map(process => {
              const prog = getProgress(process.id);
              const isCompleted  = prog?.status === 'completed';
              const isInProgress = prog?.status === 'in_progress';
              const hazardS = HAZARD_STYLE[process.hazard_level] || HAZARD_STYLE.low;
              return (
                <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                  <div className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-150 group cursor-pointer"
                       style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                       onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; }}
                       onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                    <div className="text-2xl flex-shrink-0">{CONTENT_ICONS[process.content_type] || '📋'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors truncate">{process.title}</h3>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge style={hazardS} label={process.hazard_level || 'low'} />
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {process.estimated_duration || 30}m · {process.steps?.length || 0} steps
                        </span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                            style={isCompleted
                              ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }
                              : isInProgress
                              ? { background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }
                              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}>
                      {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}<ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(process => {
              const prog = getProgress(process.id);
              const isCompleted  = prog?.status === 'completed';
              const isInProgress = prog?.status === 'in_progress';
              const hazardS = HAZARD_STYLE[process.hazard_level] || HAZARD_STYLE.low;
              const diffS   = DIFF_STYLE[process.difficulty_level] || DIFF_STYLE.beginner;
              return (
                <Link key={process.id} to={createPageUrl(`ProcessExecution?id=${process.id}`)}>
                  <div className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group h-full flex flex-col"
                       style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}
                       onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.22)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,212,255,0.07)'; }}
                       onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    {process.hazard_level === 'critical' && (
                      <div className="px-4 py-2 flex items-center gap-2"
                           style={{ background: 'rgba(255,68,68,0.12)', borderBottom: '1px solid rgba(255,68,68,0.2)' }}>
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 text-xs font-bold tracking-wide">CRITICAL HAZARD</span>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{CONTENT_ICONS[process.content_type] || '📋'}</div>
                        <div className="flex items-center gap-1">
                          {isCompleted  && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {isInProgress && <Play className="w-4 h-4" style={{ color: '#00D4FF' }} />}
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">{process.title}</h3>
                      <p className="text-xs mb-4 line-clamp-2 flex-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{process.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <StatusBadge style={hazardS} label={process.hazard_level || 'low'} />
                        <StatusBadge style={diffS}   label={process.difficulty_level || 'beginner'} />
                      </div>
                      <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {process.estimated_duration || 30}m</span>
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {process.steps?.length || 0} steps</span>
                        {process.requires_supervisor && (
                          <span className="flex items-center gap-1" style={{ color: '#facc15' }}><Shield className="w-3 h-3" /> Supervised</span>
                        )}
                      </div>
                      {isInProgress && (
                        <div className="mb-3">
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div className="h-full rounded-full" style={{ width: `${prog?.completion_percentage || 0}%`, background: 'linear-gradient(90deg, #00D4FF, #7C3AED)', boxShadow: '0 0 8px rgba(0,212,255,0.5)' }} />
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{prog?.completion_percentage || 0}%</div>
                        </div>
                      )}
                      <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
                              style={isCompleted
                                ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981' }
                                : isInProgress
                                ? { background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: '#00D4FF' }
                                : { background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.1))', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                        {isCompleted ? <><Eye className="w-3 h-3" />Review</>
                          : isInProgress ? <><Play className="w-3 h-3" />Continue</>
                          : <><Zap className="w-3 h-3" />Start</>}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
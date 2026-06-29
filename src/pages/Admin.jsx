import React, { useState } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, BookOpen, Route, Award, Hammer, Users, Search, Trash2, Edit3, XCircle, CheckCircle2 } from 'lucide-react';

export default function Admin() {
  const { currentUser, processes, learningPaths, certifications, equipment, users, isLoading, refetchData } = useData();
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0f1729] flex items-center justify-center p-6">
        <Card className="bg-[#1a2540] border border-rose-500/30 max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Admin Only</h3>
            <p className="text-slate-400">This area requires administrator privileges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const togglePublished = async (process) => {
    setToggling(process.id);
    try {
      await base44.entities.Process.update(process.id, { is_published: !process.is_published });
      await refetchData();
    } catch (e) { console.error(e); }
    finally { setToggling(null); }
  };

  const q = search.toLowerCase();
  const filteredProcs = processes.filter(p => !q || p.title?.toLowerCase().includes(q));
  const filteredPaths = learningPaths.filter(p => !q || p.title?.toLowerCase().includes(q));
  const filteredCerts = certifications.filter(c => !q || c.title?.toLowerCase().includes(q));
  const filteredEquip = equipment.filter(e => !q || e.name?.toLowerCase().includes(q));
  const filteredUsers = users.filter(u => !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f1729] p-6 space-y-4">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 bg-slate-700 rounded-xl" />)}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              Content Management
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Manage all platform content</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search across all content..."
            className="pl-10 bg-[#1a2540] border-slate-600 text-white placeholder:text-slate-500" />
        </div>

        <Tabs defaultValue="processes">
          <TabsList className="bg-[#1a2540] border border-slate-700 flex-wrap h-auto gap-1 p-1">
            {[
              { value: 'processes', icon: BookOpen, label: 'Processes', count: processes.length },
              { value: 'paths', icon: Route, label: 'Learning Paths', count: learningPaths.length },
              { value: 'certifications', icon: Award, label: 'Certifications', count: certifications.length },
              { value: 'equipment', icon: Hammer, label: 'Equipment', count: equipment.length },
              { value: 'users', icon: Users, label: 'Users', count: users.length },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm">
                <tab.icon className="w-3.5 h-3.5 mr-1" />{tab.label}
                <span className="ml-1.5 bg-slate-700 text-slate-300 text-xs rounded-full px-1.5 py-0.5">{tab.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Processes Tab */}
          <TabsContent value="processes" className="mt-4">
            <AdminTable
              items={filteredProcs}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'category', label: 'Category', render: v => <span className="capitalize text-slate-300 text-xs">{v?.replace('_', ' ')}</span> },
                { key: 'difficulty_level', label: 'Difficulty', render: v => <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs capitalize">{v}</Badge> },
                { key: 'is_published', label: 'Published', render: (v, item) => (
                  <Switch checked={!!v} disabled={toggling === item.id}
                    onCheckedChange={() => togglePublished(item)}
                    className="data-[state=checked]:bg-emerald-500" />
                )},
              ]}
              emptyText="No processes found"
            />
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="mt-4">
            <AdminTable
              items={filteredPaths}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'target_role', label: 'Role', render: v => <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs capitalize">{v?.replace('_', ' ')}</Badge> },
                { key: 'process_sequence', label: 'Processes', render: v => <span className="text-slate-300 text-xs">{v?.length || 0} processes</span> },
                { key: 'estimated_total_duration', label: 'Duration', render: v => <span className="text-slate-300 text-xs">{v || 'N/A'} min</span> },
              ]}
              emptyText="No learning paths found"
            />
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="mt-4">
            <AdminTable
              items={filteredCerts}
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'issuing_authority', label: 'Issuer', render: v => <span className="text-slate-300 text-xs">{v || 'Internal'}</span> },
                { key: 'validity_period_months', label: 'Validity', render: v => <span className="text-slate-300 text-xs">{v ? `${v} months` : 'Perpetual'}</span> },
              ]}
              emptyText="No certifications found"
            />
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="mt-4">
            <AdminTable
              items={filteredEquip}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Category', render: v => <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs capitalize">{v?.replace('_', ' ')}</Badge> },
                { key: 'location', label: 'Location', render: v => <span className="text-slate-300 text-xs">{v || '—'}</span> },
                { key: 'status', label: 'Status', render: v => {
                  const colors = { operational: 'text-emerald-400', maintenance: 'text-amber-400', repair: 'text-orange-400', out_of_service: 'text-rose-400' };
                  return <span className={`text-xs font-medium capitalize ${colors[v] || 'text-slate-400'}`}>{v?.replace('_', ' ')}</span>;
                }},
              ]}
              emptyText="No equipment found"
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <AdminTable
              items={filteredUsers}
              columns={[
                { key: 'full_name', label: 'Name' },
                { key: 'email', label: 'Email', render: v => <span className="text-slate-400 text-xs">{v}</span> },
                { key: 'role', label: 'Role', render: v => <Badge className={`text-xs ${v === 'admin' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}`}>{v}</Badge> },
                { key: 'gamification_points', label: 'XP', render: v => <span className="text-amber-400 font-medium text-xs">{v || 0}</span> },
              ]}
              emptyText="No users found"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminTable({ items, columns, emptyText }) {
  if (items.length === 0) return (
    <div className="text-center py-12">
      <p className="text-slate-400">{emptyText}</p>
    </div>
  );
  return (
    <Card className="bg-[#1a2540] border border-slate-700/50">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {columns.map(col => (
                  <th key={col.key} className="text-left p-4 text-xs text-slate-400 font-medium">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id || i} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="p-4">
                      {col.render
                        ? col.render(item[col.key], item)
                        : <span className="text-white text-sm">{item[col.key] || '—'}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
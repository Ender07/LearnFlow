import React, { useState, useMemo } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { Plus, Search, MessageSquare, Lightbulb, Network, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

import KnowledgeContributionCard from '../components/knowledge/KnowledgeContributionCard';
import DiscussionCard from '../components/knowledge/DiscussionCard';
import ExpertiseLeaderboard from '../components/knowledge/ExpertiseLeaderboard';
import ContributionForm from '../components/knowledge/ContributionForm';
import DiscussionForm from '../components/knowledge/DiscussionForm';
import ExpertFinder from '../components/knowledge/ExpertFinder';
import KnowledgeNetworkMap from '@/components/knowledge/KnowledgeNetworkMap';
import RelatedInsightsEngine from '@/components/knowledge/RelatedInsightsEngine';

export default function KnowledgeHub() {
  const { 
    contributions, 
    discussions,
    users, 
    processes,
    addKnowledgeContribution,
    addDiscussion,
    isLoading 
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showDiscussionForm, setShowDiscussionForm] = useState(false);

  const filteredContributions = useMemo(() => {
    return (contributions || []).filter(c =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contributions, searchTerm]);

  const filteredDiscussions = useMemo(() => {
    return (discussions || []).filter(d =>
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [discussions, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-green-800 bg-clip-text text-transparent">
              Knowledge Hub
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Share insights, ask questions, and learn from the collective experience of your team.
          </p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search contributions and discussions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setShowContributionForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Share Knowledge
            </Button>
            <Button variant="outline" onClick={() => setShowDiscussionForm(true)}>
              <MessageSquare className="w-4 h-4 mr-2" /> Start Discussion
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="network">
             <TabsList>
               <TabsTrigger value="network"><Network className="w-3.5 h-3.5 mr-1.5" />Network Map</TabsTrigger>
               <TabsTrigger value="contributions">Knowledge Base</TabsTrigger>
               <TabsTrigger value="discussions">Discussions</TabsTrigger>
             </TabsList>
             <TabsContent value="network" className="mt-6 space-y-6">
               <KnowledgeNetworkMap />
               <RelatedInsightsEngine processId={null} processTitle="All Processes" />
             </TabsContent>
              <TabsContent value="contributions" className="mt-6 space-y-6">
                {filteredContributions.map(c => <KnowledgeContributionCard key={c.id} contribution={c} />)}
              </TabsContent>
              <TabsContent value="discussions" className="mt-6 space-y-6">
                {filteredDiscussions.map(d => <DiscussionCard key={d.id} discussion={d} />)}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <ExpertFinder users={users} contributions={contributions} />
            <ExpertiseLeaderboard users={users} contributions={contributions} discussions={discussions} />
          </div>
        </div>
      </div>

      {/* Modals for Forms */}
      <ContributionForm 
        isOpen={showContributionForm}
        onClose={() => setShowContributionForm(false)}
        onSubmit={addKnowledgeContribution}
        processes={processes}
      />
      <DiscussionForm 
        isOpen={showDiscussionForm}
        onClose={() => setShowDiscussionForm(false)}
        onSubmit={addDiscussion}
        processes={processes}
      />
    </div>
  );
}
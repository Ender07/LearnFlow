import React, { useState } from 'react';
import { useData } from "@/components/providers/DataProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { UserCheck, AlertTriangle, BarChart3, Users, Clock } from "lucide-react";
import NeedsAttention from '../components/supervisor/NeedsAttention';
import TeamSkillMatrix from '../components/supervisor/TeamSkillMatrix';
import TeamManagementView from '../components/supervisor/TeamManagementView';
import LiveMonitoringView from '../components/supervisor/LiveMonitoringView';

export default function SupervisorDashboard() {
  const { 
    currentUser, 
    allUserProgress, 
    processes, 
    users, 
    reviews, 
    feedback,
    isLoading 
  } = useData();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton className="h-24 w-full mb-8" />
        <Skeleton className="h-12 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Ensure supervisor is viewing the dashboard
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'supervisor') {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-slate-600">You do not have permission to view the Supervisor Dashboard.</p>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState("attention");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-teal-800 bg-clip-text text-transparent">
              Supervisor Hub
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl">
            Monitor team progress, review performance, and manage training assignments.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attention"><AlertTriangle className="w-4 h-4 mr-2" />Needs Attention</TabsTrigger>
            <TabsTrigger value="team_skills"><BarChart3 className="w-4 h-4 mr-2" />Team Skill Matrix</TabsTrigger>
            <TabsTrigger value="team_management"><Users className="w-4 h-4 mr-2" />Team Management</TabsTrigger>
            <TabsTrigger value="live_monitoring"><Clock className="w-4 h-4 mr-2" />Live Monitoring</TabsTrigger>
          </TabsList>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <TabsContent value="attention">
              <NeedsAttention 
                reviews={reviews || []}
                feedback={feedback || []}
                processes={processes || []}
                users={users || []}
              />
            </TabsContent>
            <TabsContent value="team_skills">
              <TeamSkillMatrix 
                users={users || []}
                processes={processes || []}
                userProgress={allUserProgress || []}
                supervisorId={currentUser?.id}
              />
            </TabsContent>
            <TabsContent value="team_management">
              <TeamManagementView 
                 users={users || []}
                 processes={processes || []}
                 userProgress={allUserProgress || []}
                 supervisorId={currentUser?.id}
              />
            </TabsContent>
            <TabsContent value="live_monitoring">
              <LiveMonitoringView 
                userProgress={allUserProgress || []}
                processes={processes || []}
                users={users || []}
              />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}
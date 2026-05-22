import React, { useState } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Activity, Award, Target, Settings } from "lucide-react";

import ProfileHeader from "../components/profile/ProfileHeader";
import MyAchievements from "../components/profile/MyAchievements";
import MySkills from "../components/profile/MySkills";
import ActivityFeed from "../components/profile/ActivityFeed";
import AccountSettings from "../components/profile/AccountSettings";

export default function Profile() {
  const { 
    currentUser, 
    userProgress,
    processes,
    certifications,
    badges,
    isLoading 
  } = useData();
  const [activeTab, setActiveTab] = useState("achievements");

  if (isLoading || !currentUser) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton className="h-48 w-full mb-8" />
        <Skeleton className="h-12 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <ProfileHeader user={currentUser} progress={userProgress} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="achievements"><Award className="w-4 h-4 mr-2" />Achievements</TabsTrigger>
            <TabsTrigger value="skills"><Target className="w-4 h-4 mr-2" />Skills Snapshot</TabsTrigger>
            <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Activity Log</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-2" />Settings</TabsTrigger>
          </TabsList>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6"
          >
            <TabsContent value="achievements">
              <MyAchievements 
                userProgress={userProgress} 
                certifications={certifications} 
                badges={badges} 
                user={currentUser}
              />
            </TabsContent>
            <TabsContent value="skills">
              <MySkills userProgress={userProgress} processes={processes} />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityFeed userProgress={userProgress} processes={processes} />
            </TabsContent>
            <TabsContent value="settings">
              <AccountSettings user={currentUser} />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}
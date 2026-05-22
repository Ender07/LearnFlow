import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutonomicLearningLoop from '@/components/ai/AutonomicLearningLoop';
import KnowledgeGraph from '@/components/ai/KnowledgeGraph';
import AIEmbeddedMentor from '@/components/ai/AIEmbeddedMentor';

export default function AutonomicSystem() {
  const [activeTab, setActiveTab] = useState("loops");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-gray-900 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-gray-700 bg-clip-text text-transparent">
              Autonomic AI Systems
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl">
            Monitoring and managing the core AI engines that drive LearnFlow's intelligent, self-optimizing capabilities.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="loops">Autonomic Loops</TabsTrigger>
            <TabsTrigger value="graph">Knowledge Graph</TabsTrigger>
            <TabsTrigger value="mentor">AI Mentor</TabsTrigger>
          </TabsList>
          
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <TabsContent value="loops">
              <AutonomicLearningLoop />
            </TabsContent>
            <TabsContent value="graph">
              <KnowledgeGraph />
            </TabsContent>
            <TabsContent value="mentor">
              <AIEmbeddedMentor />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  );
}
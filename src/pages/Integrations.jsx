import React, { useState, useEffect } from "react";
import { SystemIntegration } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import IntegrationCard from "../components/integrations/IntegrationCard";
import ConnectionWizard from "../components/integrations/ConnectionWizard";

export default function Integrations() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await SystemIntegration.list();
      setIntegrations(data);
    } catch (error) {
      console.error("Error loading integrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIntegration = async (integrationData) => {
    try {
      await SystemIntegration.create(integrationData);
      setIsWizardOpen(false);
      loadIntegrations();
    } catch (error) {
      console.error("Failed to save integration:", error);
      // Here you might want to show an error message to the user in the wizard
    }
  };
  
  const SkeletonCard = () => (
    <div className="animate-pulse">
      <Card className="h-[280px] bg-white/50 rounded-xl flex flex-col justify-between p-6">
        <div className="space-y-3">
          <div className="h-5 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
        <div className="space-y-2">
            <div className="h-8 bg-slate-200 rounded"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
        </div>
        <div className="flex justify-end items-center">
          <div className="h-10 bg-slate-200 rounded-lg w-24"></div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Enterprise Integrations
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Connect LearnFlow to your existing systems for seamless data flow and automation
            </p>
          </div>
          <Button 
            onClick={() => setIsWizardOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Integration
          </Button>
        </motion.div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              integrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <IntegrationCard integration={integration} />
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {!isLoading && integrations.length === 0 && (
             <Card className="md:col-span-2 lg:col-span-3 border-dashed border-2 text-center py-16">
                <CardContent>
                    <Share2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No integrations configured</h3>
                    <p className="text-slate-500 mb-6">Connect LearnFlow to other systems to unlock powerful automations.</p>
                    <Button onClick={() => setIsWizardOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Integration
                    </Button>
                </CardContent>
             </Card>
          )}
        </div>
      </div>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-4xl p-0">
          <ConnectionWizard
            onSave={handleSaveIntegration}
            onClose={() => setIsWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
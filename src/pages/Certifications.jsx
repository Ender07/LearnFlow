import React, { useState, useMemo } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Search, 
  Shield, 
  Calendar,
  CheckCircle,
  Clock,
  Target,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import MyCertificationCard from "../components/certification/MyCertificationCard";
import AvailableCertificationCard from "../components/certification/AvailableCertificationCard";
import CertificationForm from "../components/certification/CertificationForm";

export default function Certifications() {
  const { 
    certifications, 
    userProgress, 
    learningPaths,
    processes,
    currentUser,
    users,
    isLoading 
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("my_certifications");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Calculate user's certification progress
  const myCertifications = useMemo(() => {
    if (!certifications || !userProgress || !learningPaths || !processes) return [];

    return certifications.map(cert => {
      // Check if earned through learning paths
      let isEarnedViaPath = false;
      let progressPercentage = 0;
      let completedRequirements = 0;
      let totalRequirements = 0;

      if (cert.required_paths?.length > 0) {
        cert.required_paths.forEach(pathId => {
          const path = learningPaths.find(p => p.id === pathId);
          if (path?.process_sequence) {
            const pathProcesses = path.process_sequence.length;
            const completedInPath = path.process_sequence.filter(processId =>
              userProgress.some(up => up.process_id === processId && up.status === 'completed')
            ).length;
            
            totalRequirements += pathProcesses;
            completedRequirements += completedInPath;
            
            if (completedInPath === pathProcesses && pathProcesses > 0) {
              isEarnedViaPath = true;
            }
          }
        });
      }

      // Check if earned through individual processes
      let isEarnedViaProcesses = false;
      if (cert.required_processes?.length > 0) {
        const completedProcesses = cert.required_processes.filter(processId =>
          userProgress.some(up => up.process_id === processId && up.status === 'completed')
        ).length;
        
        totalRequirements += cert.required_processes.length;
        completedRequirements += completedProcesses;
        
        if (completedProcesses === cert.required_processes.length) {
          isEarnedViaProcesses = true;
        }
      }

      progressPercentage = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
      const isEarned = isEarnedViaPath || isEarnedViaProcesses;
      
      // Calculate expiry status
      let expiryStatus = 'active';
      let daysUntilExpiry = null;
      
      if (isEarned && cert.validity_period_months) {
        // For demo purposes, assume earned 6 months ago
        const earnedDate = new Date();
        earnedDate.setMonth(earnedDate.getMonth() - 6);
        const expiryDate = new Date(earnedDate);
        expiryDate.setMonth(expiryDate.getMonth() + cert.validity_period_months);
        
        daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 0) {
          expiryStatus = 'expired';
        } else if (daysUntilExpiry <= 30) {
          expiryStatus = 'expiring_soon';
        }
      }

      return {
        ...cert,
        isEarned,
        progressPercentage,
        completedRequirements,
        totalRequirements,
        expiryStatus,
        daysUntilExpiry,
        earnedDate: isEarned ? new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) : null
      };
    });
  }, [certifications, userProgress, learningPaths, processes]);

  // Filter certifications
  const filteredCertifications = useMemo(() => {
    if (!myCertifications) return [];
    
    let filtered = myCertifications;
    
    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuing_authority?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tab-specific filtering
    switch (activeTab) {
      case 'earned':
        return filtered.filter(cert => cert.isEarned);
      case 'in_progress':
        return filtered.filter(cert => !cert.isEarned && cert.progressPercentage > 0);
      case 'available':
        return filtered.filter(cert => !cert.isEarned && cert.progressPercentage === 0);
      case 'expiring':
        return filtered.filter(cert => cert.isEarned && cert.expiryStatus === 'expiring_soon');
      default:
        return filtered;
    }
  }, [myCertifications, searchTerm, activeTab]);

  // Calculate statistics
  const stats = useMemo(() => {
    const earned = myCertifications.filter(c => c.isEarned).length;
    const inProgress = myCertifications.filter(c => !c.isEarned && c.progressPercentage > 0).length;
    const expiringSoon = myCertifications.filter(c => c.expiryStatus === 'expiring_soon').length;
    const total = myCertifications.length;

    return { earned, inProgress, expiringSoon, total };
  }, [myCertifications]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-yellow-800 to-orange-800 bg-clip-text text-transparent">
                Certifications
              </h1>
            </div>
            <p className="text-slate-600 text-lg max-w-2xl">
              Track your professional credentials and skill certifications. Build expertise that matters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link to={createPageUrl('BlockchainCredentials')}>
                <Shield className="w-4 h-4 mr-2" />
                Blockchain Credentials
              </Link>
            </Button>
            {isAdmin && (
              <Button onClick={() => setShowCreateForm(true)} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Certification
              </Button>
            )}
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.earned}</div>
              <div className="text-sm text-slate-600 mt-1">Earned</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
              <div className="text-sm text-slate-600 mt-1">In Progress</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.expiringSoon}</div>
              <div className="text-sm text-slate-600 mt-1">Expiring Soon</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-slate-600 mt-1">Available</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search certifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-slate-200 focus:border-yellow-400 transition-colors"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="my_certifications" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="earned" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Earned
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              In Progress
            </TabsTrigger>
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Available
            </TabsTrigger>
            <TabsTrigger value="expiring" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiring
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {filteredCertifications.length === 0 ? (
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Award className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No certifications found</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : activeTab === 'earned'
                        ? "You haven't earned any certifications yet. Start a learning path to work toward your first certification!"
                        : "No certifications match the current filter."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredCertifications.map((certification, index) => (
                      certification.isEarned ? (
                        <MyCertificationCard
                          key={certification.id}
                          certification={certification}
                          index={index}
                        />
                      ) : (
                        <AvailableCertificationCard
                          key={certification.id}
                          certification={certification}
                          index={index}
                          learningPaths={learningPaths}
                          processes={processes}
                        />
                      )
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Create Certification Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <CertificationForm
              onClose={() => setShowCreateForm(false)}
              learningPaths={learningPaths}
              processes={processes}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Route, 
  Search, 
  Filter, 
  Star,
  Award,
  Clock,
  CheckCircle,
  Play,
  BookOpen,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LearningPaths() {
  const { 
    learningPaths, 
    processes,
    userProgress, 
    currentUser,
    certifications,
    users,
    isLoading 
  } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Helper function to calculate path difficulty, moved up to ensure proper initialization
  const getPathDifficulty = (pathProcesses) => {
    if (!pathProcesses || pathProcesses.length === 0) return 'beginner';
    
    const difficultyScores = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const avgScore = pathProcesses.reduce((acc, process) => 
      acc + (difficultyScores[process?.difficulty_level] || 1), 0
    ) / pathProcesses.length;
    
    if (avgScore <= 1.5) return 'beginner';
    if (avgScore <= 2.5) return 'intermediate';
    if (avgScore <= 3.5) return 'advanced';
    return 'expert';
  };

  // Calculate path progress for each learning path
  const pathsWithProgress = useMemo(() => {
    if (!learningPaths || !processes || !userProgress) return [];
    
    return learningPaths.map(path => {
      const pathProcesses = path.process_sequence?.map(processId => 
        processes.find(p => p.id === processId)
      ).filter(Boolean) || [];
      
      const completedProcesses = pathProcesses.filter(process =>
        userProgress.some(up => up.process_id === process.id && up.status === 'completed')
      );
      
      const inProgressProcesses = pathProcesses.filter(process =>
        userProgress.some(up => up.process_id === process.id && up.status === 'in_progress')
      );
      
      const totalProcesses = pathProcesses.length;
      const completedCount = completedProcesses.length;
      const inProgressCount = inProgressProcesses.length;
      
      const progressPercentage = totalProcesses > 0 ? (completedCount / totalProcesses) * 100 : 0;
      const isStarted = completedCount > 0 || inProgressCount > 0;
      const isCompleted = completedCount === totalProcesses && totalProcesses > 0;
      
      // Calculate estimated time remaining
      const remainingProcesses = pathProcesses.slice(completedCount + inProgressCount);
      const estimatedTimeRemaining = remainingProcesses.reduce((acc, process) => 
        acc + (process?.estimated_duration || 30), 0
      );
      
      // Find next recommended process
      const nextProcess = pathProcesses.find(process =>
        !userProgress.some(up => up.process_id === process.id && 
          (up.status === 'completed' || up.status === 'in_progress'))
      );
      
      return {
        ...path,
        pathProcesses,
        completedCount,
        inProgressCount,
        totalProcesses,
        progressPercentage,
        isStarted,
        isCompleted,
        estimatedTimeRemaining,
        nextProcess,
        // Calculate difficulty based on processes
        calculatedDifficulty: getPathDifficulty(pathProcesses),
        // Get associated certification
        certification: certifications?.find(cert => cert.id === path.grants_certification_id)
      };
    });
  }, [learningPaths, processes, userProgress, certifications]);

  // Filter and sort paths
  const filteredPaths = useMemo(() => {
    let filtered = pathsWithProgress.filter(path => {
      const matchesSearch = path.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           path.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || path.target_role === selectedRole;
      const matchesDifficulty = selectedDifficulty === "all" || path.calculatedDifficulty === selectedDifficulty;
      
      // Tab-specific filtering
      if (activeTab === "my_paths") {
        return matchesSearch && matchesRole && matchesDifficulty && path.isStarted;
      }
      if (activeTab === "completed") {
        return matchesSearch && matchesRole && matchesDifficulty && path.isCompleted;
      }
      if (activeTab === "recommended") {
        // Simple recommendation logic - paths for user's role or beginner paths not started
        const userRole = currentUser?.job_title?.toLowerCase();
        const isRecommended = path.target_role?.toLowerCase().includes(userRole) || 
                             (path.calculatedDifficulty === 'beginner' && !path.isStarted);
        return matchesSearch && matchesRole && matchesDifficulty && isRecommended;
      }
      
      return matchesSearch && matchesRole && matchesDifficulty;
    });
    
    // Sort by progress (in progress first, then by completion percentage)
    return filtered.sort((a, b) => {
      if (a.isStarted && !b.isStarted) return -1;
      if (!a.isStarted && b.isStarted) return 1;
      if (a.isStarted && b.isStarted) {
        return b.progressPercentage - a.progressPercentage;
      }
      return a.title.localeCompare(b.title);
    });
  }, [pathsWithProgress, searchTerm, selectedRole, selectedDifficulty, activeTab, currentUser]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pathsWithProgress.length;
    const inProgress = pathsWithProgress.filter(p => p.isStarted && !p.isCompleted).length;
    const completed = pathsWithProgress.filter(p => p.isCompleted).length;
    const withCertification = pathsWithProgress.filter(p => p.certification).length;
    
    return { total, inProgress, completed, withCertification };
  }, [pathsWithProgress]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'new_hire': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'specialist': return 'bg-indigo-100 text-indigo-800';
      case 'executive': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64 bg-slate-700" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-80 bg-slate-700" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1729] p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Route className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Learning Paths
              </h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Structured career progression journeys designed to build expertise and advance your skills.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-indigo-50 border-indigo-200" : ""}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">{stats.total}</div>
              <div className="text-sm text-slate-400 mt-1">Available Paths</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
              <div className="text-sm text-slate-400 mt-1">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-sm text-slate-400 mt-1">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1a2540] border border-slate-700/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{stats.withCertification}</div>
              <div className="text-sm text-slate-400 mt-1">With Certification</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search learning paths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base bg-[#1a2540] border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-500"
            />
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="bg-[#1a2540] border border-slate-700">
                   <CardContent className="p-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Target Role</label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Roles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="new_hire">New Hire</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="specialist">Specialist</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Difficulty Level</label>
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a2540] border border-slate-700">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Route className="w-4 h-4" />
              All Paths
            </TabsTrigger>
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Recommended
            </TabsTrigger>
            <TabsTrigger value="my_paths" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              My Paths
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {filteredPaths.length === 0 ? (
                <Card className="bg-[#1a2540] border border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No learning paths found</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      {searchTerm || selectedRole !== "all" || selectedDifficulty !== "all"
                        ? "Try adjusting your search criteria or filters."
                        : "No learning paths are available at the moment."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredPaths.map((path, index) => (
                      <LearningPathCard
                        key={path.id}
                        path={path}
                        index={index}
                        getDifficultyColor={getDifficultyColor}
                        getRoleColor={getRoleColor}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LearningPathCard({ path, index, getDifficultyColor, getRoleColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-[#1a2540] border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden h-full">
        <div className={`h-2 ${path.isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                                path.isStarted ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 
                                'bg-gradient-to-r from-indigo-500 to-purple-500'}`} />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-3">
            <CardTitle className="text-lg leading-tight text-white group-hover:text-purple-400 transition-colors flex-1">
              {path.title}
            </CardTitle>
            {path.certification && (
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                <Award className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getRoleColor(path.target_role)}>
              {path.target_role?.replace('_', ' ')}
            </Badge>
            <Badge className={getDifficultyColor(path.calculatedDifficulty)}>
              {path.calculatedDifficulty}
            </Badge>
            {path.isCompleted && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          
          <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
            {path.description}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Progress</span>
                <span>{path.completedCount}/{path.totalProcesses} processes</span>
              </div>
              <Progress value={path.progressPercentage} className="h-2" />
              <div className="text-xs text-slate-500 mt-1">
                {Math.round(path.progressPercentage)}% complete
              </div>
            </div>

            {/* Path Statistics */}
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {path.estimated_total_duration || path.estimatedTimeRemaining || 'N/A'} min
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {path.totalProcesses} processes
              </div>
            </div>

            {/* Next Process Info */}
            {path.nextProcess && !path.isCompleted && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-xs font-medium text-blue-400 mb-1">Next:</div>
                <div className="text-sm text-blue-300">{path.nextProcess.title}</div>
              </div>
            )}

            {/* Action Button */}
            <Button asChild className={`w-full ${
              path.isCompleted 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : path.isStarted
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
            } text-white`}>
              <Link to={createPageUrl(`LearningPathDetails?id=${path.id}`)}>
                {path.isCompleted ? (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    View Certificate
                  </>
                ) : path.isStarted ? (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Continue Path
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Start Journey
                  </>
                )}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
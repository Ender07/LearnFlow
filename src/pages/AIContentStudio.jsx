
import React, { useState, useEffect } from "react";
import { ContentGeneration } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BrainCircuit, 
  Upload, 
  FileText, 
  Video, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  Zap,
  Download,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ContentGenerator from "../components/ai/ContentGenerator";

export default function LearnFlowContentStudio() {
  const [generations, setGenerations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      const data = await ContentGeneration.list("-created_date");
      setGenerations(data);
    } catch (error) {
      console.error("Error loading generations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentGenerated = (newGeneration) => {
    setGenerations(prev => [newGeneration, ...prev]);
  };

  const getSourceTypeInfo = (type) => {
    const types = {
      cad_file: { label: "CAD File", icon: Settings, color: "bg-blue-100 text-blue-800" },
      manual_pdf: { label: "PDF Manual", icon: FileText, color: "bg-green-100 text-green-800" },
      video_analysis: { label: "Video Analysis", icon: Video, color: "bg-purple-100 text-purple-800" },
      expert_knowledge: { label: "Expert Knowledge", icon: BrainCircuit, color: "bg-orange-100 text-orange-800" },
      equipment_data: { label: "Equipment Data", icon: Settings, color: "bg-indigo-100 text-indigo-800" }
    };
    return types[type] || { label: type, icon: FileText, color: "bg-gray-100 text-gray-800" };
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      approved: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { label: "Rejected", color: "bg-red-100 text-red-800", icon: AlertTriangle },
      modified: { label: "Modified", color: "bg-blue-100 text-blue-800", icon: Settings }
    };
    return statuses[status] || statuses.pending;
  };

  const stats = {
    total: generations.length,
    pending: generations.filter(g => g.human_review_status === 'pending').length,
    approved: generations.filter(g => g.human_review_status === 'approved').length,
    avgConfidence: generations.length > 0 
      ? Math.round(generations.reduce((acc, g) => acc + (g.confidence_score || 0), 0) / generations.length)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
              Smart Content Studio
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Transform existing documentation, videos, and expert knowledge into structured training content using LearnFlow's advanced intelligence.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Generations</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <BrainCircuit className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Avg. Confidence</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.avgConfidence}%</p>
                </div>
                <Zap className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "generate" ? "default" : "outline"}
            onClick={() => setActiveTab("generate")}
            className={activeTab === "generate" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : ""}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Generate Content
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            className={activeTab === "history" ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generation History
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ContentGenerator onContentGenerated={handleContentGenerated} />
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading generation history...</p>
                </div>
              ) : generations.length === 0 ? (
                <Card className="text-center py-12">
                  <BrainCircuit className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Content Generated Yet</h3>
                  <p className="text-slate-500">Start generating content to see your history here.</p>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {generations.map((generation, index) => {
                    const sourceInfo = getSourceTypeInfo(generation.source_type);
                    const statusInfo = getStatusInfo(generation.human_review_status);
                    
                    return (
                      <motion.div
                        key={generation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <sourceInfo.icon className="w-6 h-6 text-purple-600" />
                                <div>
                                  <CardTitle className="text-lg">
                                    {generation.content_type?.replace('_', ' ') || 'Generated Content'}
                                  </CardTitle>
                                  <p className="text-sm text-slate-600">
                                    From {sourceInfo.label} • {new Date(generation.created_date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`border ${statusInfo.color}`}>
                                  <statusInfo.icon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                                <Badge className={`border ${sourceInfo.color}`}>
                                  {sourceInfo.label}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Confidence Score */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>LearnFlow Confidence</span>
                                <span className="font-semibold">{generation.confidence_score}%</span>
                              </div>
                              <Progress value={generation.confidence_score} className="h-2" />
                            </div>

                            {/* Content Preview */}
                            {generation.generated_content && (
                              <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-slate-800 mb-2">Generated Content Preview</h4>
                                <div className="text-sm text-slate-600 space-y-1">
                                  {generation.generated_content.title && (
                                    <p><strong>Title:</strong> {generation.generated_content.title}</p>
                                  )}
                                  {generation.generated_content.steps && (
                                    <p><strong>Steps:</strong> {generation.generated_content.steps.length} steps generated</p>
                                  )}
                                  {generation.generated_content.safety_requirements && (
                                    <p><strong>Safety:</strong> {generation.generated_content.safety_requirements.length} requirements identified</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                              {generation.human_review_status === 'approved' && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Create Process
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

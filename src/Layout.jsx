import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BookOpen,
  LayoutDashboard,
  Route,
  BarChart3,
  Plus,
  Workflow,
  MonitorPlay,
  Glasses,
  Brain,
  Lightbulb,
  GitFork,
  Atom,
  Key,
  Users,
  MessageSquare,
  Award,
  Hammer,
  Plug,
  Shield,
  User,
  FileText,
  Swords,
  Code
} from "lucide-react";
import { DataProvider } from "@/components/providers/DataProvider";
import { GamificationProvider } from "@/components/gamification/GamificationEngine";
import EnhancedErrorBoundary from "@/components/common/EnhancedErrorBoundary";
import { ToastProvider } from "@/components/common/Toast";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroupContent
} from "@/components/layout/Sidebar";


import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navGroups = [
  {
    label: "Core Training",
    items: [
      { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, description: "Your starting point" },
      { title: "Process Library", url: createPageUrl("ProcessLibrary"), icon: BookOpen, description: "Browse all guides" },
      { title: "Learning Paths", url: createPageUrl("LearningPaths"), icon: Route, description: "Structured courses" },
      { title: "Process Execution", url: createPageUrl("ProcessExecution"), icon: Workflow, description: "Execute processes" },
      { title: "Learning Path Details", url: createPageUrl("LearningPathDetails"), icon: GitFork, description: "View path details" }
    ]
  },
  {
    label: "Advanced Tech",
    items: [
      { title: "AR Guidance", url: createPageUrl("ARGuidance"), icon: MonitorPlay, description: "Augmented Reality" },
      { title: "VR Simulation", url: createPageUrl("VRSimulation"), icon: Glasses, description: "Virtual Reality" },
      { title: "AI Content Studio", url: createPageUrl("AIContentStudio"), icon: Brain, description: "AI content creation" },
      { title: "LearnFlow Studio", url: createPageUrl("LearnFlowContentStudio"), icon: Lightbulb, description: "Manage content" },
      { title: "Adaptive Paths", url: createPageUrl("AdaptiveLearningPaths"), icon: Atom, description: "Personalized learning" },
      { title: "Autonomic System", url: createPageUrl("AutonomicSystem"), icon: Atom, description: "Autonomous management" },
      { title: "Blockchain Credentials", url: createPageUrl("BlockchainCredentials"), icon: Key, description: "Digital credentials" }
    ]
  },
  {
    label: "Management",
    items: [
      { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3, description: "Progress insights" },
      { title: "Create Process", url: createPageUrl("CreateProcess"), icon: Plus, description: "New instruction" },
      { title: "Supervisor Dashboard", url: createPageUrl("SupervisorDashboard"), icon: Users, description: "Oversee operations" },
      { title: "Feedback Management", url: createPageUrl("FeedbackManagement"), icon: MessageSquare, description: "Handle feedback" },
      { title: "Certifications", url: createPageUrl("Certifications"), icon: Award, description: "Manage certifications" },
      { title: "Equipment Management", url: createPageUrl("EquipmentManagement"), icon: Hammer, description: "Track equipment" },
      { title: "Integrations", url: createPageUrl("Integrations"), icon: Plug, description: "External connections" },
      { title: "Knowledge Hub", url: createPageUrl("KnowledgeHub"), icon: Lightbulb, description: "Knowledge articles" },
      { title: "Awards", url: createPageUrl("Awards"), icon: Award, description: "View achievements" },
      { title: "Safety Dashboard", url: createPageUrl("SafetyDashboard"), icon: Shield, description: "Monitor safety" },
      { title: "Profile", url: createPageUrl("Profile"), icon: User, description: "Your profile" },
      { title: "Report Builder", url: createPageUrl("ReportBuilder"), icon: FileText, description: "Custom reports" },
      { title: "Team Challenges", url: createPageUrl("TeamChallenges"), icon: Swords, description: "Team challenges" },
      { title: "API Manager", url: createPageUrl("APIManager"), icon: Code, description: "Manage APIs" }
    ]
  }
];

function AppLayout({ children, currentPageName }) {
  const location = useLocation();
  
  // Simplified state for debugging
  const [unreadCount, setUnreadCount] = useState(0);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  // Mock user data for now
  const displayUser = {
    full_name: "Manufacturing Trainee",
    job_title: "Advanced Training Active",
    gamification_points: 1250,
    gamification_level: 5,
    avatar_url: null
  };

  const pointsToNextLevel = (displayUser?.gamification_level ? (displayUser.gamification_level + 1) : 1) * 1000;
  const levelProgress = displayUser ? ((displayUser.gamification_points % 1000) / 10) : 0;

  return (
    <EnhancedErrorBoundary fallbackMessage="The LearnFlow dashboard encountered an error. Please try refreshing the page.">
      <SidebarProvider>
        <ToastProvider>
          <GamificationProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
            <Sidebar className="border-r border-white/20 backdrop-blur-xl bg-white/90" data-sidebar>
              <SidebarHeader className="border-b border-white/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      LearnFlow
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Manufacturing Training</p>
                  </div>
                </div>
              </SidebarHeader>
              
              <SidebarContent className="p-3">
                <nav aria-label="Main Navigation">
                  {navGroups.map((group) => (
                    <SidebarGroup key={group.label} className="mb-4">
                      <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                        {group.label}
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu className="space-y-1">
                          {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton 
                                asChild 
                                className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm ${
                                  location.pathname === item.url 
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                                    : 'text-slate-700 hover:text-slate-900'
                                }`}
                              >
                                <Link 
                                  to={item.url} 
                                  className="flex items-center gap-3 p-3 w-full min-h-[44px]" 
                                >
                                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${
                                    location.pathname === item.url ? 'text-white' : 'text-slate-500'
                                  }`} />
                                  <span className="font-semibold text-sm">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  ))}
                </nav>
              </SidebarContent>

              <SidebarFooter className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{displayUser.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{displayUser.full_name}</h3>
                    <p className="text-xs text-slate-500 truncate">{displayUser.job_title || 'Operator'}</p>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>

            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 md:hidden">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    LearnFlow
                  </h1>
                </div>
              </header>

              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
          </GamificationProvider>
        </ToastProvider>
      </SidebarProvider>
    </EnhancedErrorBoundary>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <DataProvider>
      <AppLayout currentPageName={currentPageName}>
        {children}
      </AppLayout>
    </DataProvider>
  )
}
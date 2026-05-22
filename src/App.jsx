import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Dashboard from './pages/Dashboard';
import ProcessLibrary from './pages/ProcessLibrary';
import LearningPaths from './pages/LearningPaths';
import ARGuidance from './pages/ARGuidance';
import VRSimulation from './pages/VRSimulation';
import Analytics from './pages/Analytics';
import CreateProcess from './pages/CreateProcess';
import Integrations from './pages/Integrations';
import EquipmentManagement from './pages/EquipmentManagement';
import SupervisorDashboard from './pages/SupervisorDashboard';
import FeedbackManagement from './pages/FeedbackManagement';
import Certifications from './pages/Certifications';
import LearningPathDetails from './pages/LearningPathDetails';
import ProcessExecution from './pages/ProcessExecution';
import AIContentStudio from './pages/AIContentStudio';
import KnowledgeHub from './pages/KnowledgeHub';
import Awards from './pages/Awards';
import SafetyDashboard from './pages/SafetyDashboard';
import Profile from './pages/Profile';
import ReportBuilder from './pages/ReportBuilder';
import TeamChallenges from './pages/TeamChallenges';
import APIManager from './pages/APIManager';
import BlockchainCredentials from './pages/BlockchainCredentials';
import LearnFlowContentStudio from './pages/LearnFlowContentStudio';
import AdaptiveLearningPaths from './pages/AdaptiveLearningPaths';
import AutonomicSystem from './pages/AutonomicSystem';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/ProcessLibrary" element={<ProcessLibrary />} />
      <Route path="/LearningPaths" element={<LearningPaths />} />
      <Route path="/ARGuidance" element={<ARGuidance />} />
      <Route path="/VRSimulation" element={<VRSimulation />} />
      <Route path="/Analytics" element={<Analytics />} />
      <Route path="/CreateProcess" element={<CreateProcess />} />
      <Route path="/Integrations" element={<Integrations />} />
      <Route path="/EquipmentManagement" element={<EquipmentManagement />} />
      <Route path="/SupervisorDashboard" element={<SupervisorDashboard />} />
      <Route path="/FeedbackManagement" element={<FeedbackManagement />} />
      <Route path="/Certifications" element={<Certifications />} />
      <Route path="/LearningPathDetails" element={<LearningPathDetails />} />
      <Route path="/ProcessExecution" element={<ProcessExecution />} />
      <Route path="/AIContentStudio" element={<AIContentStudio />} />
      <Route path="/KnowledgeHub" element={<KnowledgeHub />} />
      <Route path="/Awards" element={<Awards />} />
      <Route path="/SafetyDashboard" element={<SafetyDashboard />} />
      <Route path="/Profile" element={<Profile />} />
      <Route path="/ReportBuilder" element={<ReportBuilder />} />
      <Route path="/TeamChallenges" element={<TeamChallenges />} />
      <Route path="/APIManager" element={<APIManager />} />
      <Route path="/BlockchainCredentials" element={<BlockchainCredentials />} />
      <Route path="/LearnFlowContentStudio" element={<LearnFlowContentStudio />} />
      <Route path="/AdaptiveLearningPaths" element={<AdaptiveLearningPaths />} />
      <Route path="/AutonomicSystem" element={<AutonomicSystem />} />
      {/* Add your page Route elements here */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App

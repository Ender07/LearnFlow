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
import Certifications from './pages/Certifications';
import LearningPathDetails from './pages/LearningPathDetails';
import ProcessExecution from './pages/ProcessExecution';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import MyLearning from './pages/MyLearning';
import EquipmentLibrary from './pages/EquipmentLibrary';
import SupervisorDashboard from './pages/SupervisorDashboard';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import ComplianceCenter from './pages/ComplianceCenter';

// Legacy pages
import ARGuidance from './pages/ARGuidance';
import VRSimulation from './pages/VRSimulation';
import CreateProcess from './pages/CreateProcess';
import Integrations from './pages/Integrations';
import EquipmentManagement from './pages/EquipmentManagement';
import FeedbackManagement from './pages/FeedbackManagement';
import AIContentStudio from './pages/AIContentStudio';
import KnowledgeHub from './pages/KnowledgeHub';
import Awards from './pages/Awards';
import SafetyDashboard from './pages/SafetyDashboard';
import ReportBuilder from './pages/ReportBuilder';
import TeamChallenges from './pages/TeamChallenges';
import APIManager from './pages/APIManager';
import BlockchainCredentials from './pages/BlockchainCredentials';
import LearnFlowContentStudio from './pages/LearnFlowContentStudio';
import AdaptiveLearningPaths from './pages/AdaptiveLearningPaths';
import AutonomicSystem from './pages/AutonomicSystem';
import Community from './pages/Community';
import Layout from './Layout';
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
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/ProcessLibrary" element={<ProcessLibrary />} />
        <Route path="/MyLearning" element={<MyLearning />} />
        <Route path="/LearningPaths" element={<LearningPaths />} />
        <Route path="/LearningPathDetails" element={<LearningPathDetails />} />
        <Route path="/ProcessExecution" element={<ProcessExecution />} />
        <Route path="/Certifications" element={<Certifications />} />
        <Route path="/EquipmentLibrary" element={<EquipmentLibrary />} />
        <Route path="/SupervisorDashboard" element={<SupervisorDashboard />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/ComplianceCenter" element={<ComplianceCenter />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Notifications" element={<Notifications />} />
        <Route path="/Profile" element={<Profile />} />
        {/* Legacy routes */}
        <Route path="/ARGuidance" element={<ARGuidance />} />
        <Route path="/VRSimulation" element={<VRSimulation />} />
        <Route path="/CreateProcess" element={<CreateProcess />} />
        <Route path="/Integrations" element={<Integrations />} />
        <Route path="/EquipmentManagement" element={<EquipmentManagement />} />
        <Route path="/FeedbackManagement" element={<FeedbackManagement />} />
        <Route path="/AIContentStudio" element={<AIContentStudio />} />
        <Route path="/KnowledgeHub" element={<KnowledgeHub />} />
        <Route path="/Awards" element={<Awards />} />
        <Route path="/SafetyDashboard" element={<SafetyDashboard />} />
        <Route path="/ReportBuilder" element={<ReportBuilder />} />
        <Route path="/TeamChallenges" element={<TeamChallenges />} />
        <Route path="/APIManager" element={<APIManager />} />
        <Route path="/BlockchainCredentials" element={<BlockchainCredentials />} />
        <Route path="/LearnFlowContentStudio" element={<LearnFlowContentStudio />} />
        <Route path="/AdaptiveLearningPaths" element={<AdaptiveLearningPaths />} />
        <Route path="/AutonomicSystem" element={<AutonomicSystem />} />
        <Route path="/Community" element={<Community />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Layout>
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
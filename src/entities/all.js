import { base44 } from '@/api/base44Client';

const makeProxy = (name) => ({
  list: (...args) => base44.db[name].list(...args),
  filter: (...args) => base44.db[name].filter(...args),
  create: (...args) => base44.db[name].create(...args),
  update: (...args) => base44.db[name].update(...args),
  delete: (...args) => base44.db[name].delete(...args),
  get: (...args) => base44.db[name].get(...args),
});

export const AIEmbeddedMentor = makeProxy('AIEmbeddedMentor');
export const APIKey = makeProxy('APIKey');
export const ARSession = makeProxy('ARSession');
export const AuditLog = makeProxy('AuditLog');
export const AutonomicLearningLoop = makeProxy('AutonomicLearningLoop');
export const Badge = makeProxy('Badge');
export const BiometricSession = makeProxy('BiometricSession');
export const BlockchainCredential = makeProxy('BlockchainCredential');
export const Certification = makeProxy('Certification');
export const CognitiveProfile = makeProxy('CognitiveProfile');
export const CollaborativeSession = makeProxy('CollaborativeSession');
export const CollaborativeVRSession = makeProxy('CollaborativeVRSession');
export const ComplianceReport = makeProxy('ComplianceReport');
export const ContentGeneration = makeProxy('ContentGeneration');
export const DigitalTwin = makeProxy('DigitalTwin');
export const Discussion = makeProxy('Discussion');
export const DiscussionReply = makeProxy('DiscussionReply');
export const DynamicLearningPath = makeProxy('DynamicLearningPath');
export const Equipment = makeProxy('Equipment');
export const ExpertiseProfile = makeProxy('ExpertiseProfile');
export const FeedbackRequest = makeProxy('FeedbackRequest');
export const GamificationLedger = makeProxy('GamificationLedger');
export const HardwareIntegration = makeProxy('HardwareIntegration');
export const KnowledgeContribution = makeProxy('KnowledgeContribution');
export const KnowledgeGraph = makeProxy('KnowledgeGraph');
export const LearningAnalytics = makeProxy('LearningAnalytics');
export const LearningPath = makeProxy('LearningPath');
export const MobileSession = makeProxy('MobileSession');
export const Notification = makeProxy('Notification');
export const OnboardingProgress = makeProxy('OnboardingProgress');
export const Process = makeProxy('Process');
export const QualityStandard = makeProxy('QualityStandard');
export const SecurityEvent = makeProxy('SecurityEvent');
export const SkillLedger = makeProxy('SkillLedger');
export const SupervisorReview = makeProxy('SupervisorReview');
export const SystemIntegration = makeProxy('SystemIntegration');
export const User = makeProxy('User');
export const UserProgress = makeProxy('UserProgress');
export const UserTheme = makeProxy('UserTheme');

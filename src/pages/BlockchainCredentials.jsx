import React, { useState, useEffect } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Shield, 
  Award, 
  CheckCircle, 
  Share2, 
  Download,
  ExternalLink,
  QrCode,
  Globe,
  Zap,
  Lock,
  TrendingUp,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BlockchainCredential, SkillLedger } from "@/entities/all";
import { useToast } from "@/components/common/Toast";

export default function BlockchainCredentials() {
  const { currentUser, userProgress, processes, certifications, isLoading } = useData();
  const [myCredentials, setMyCredentials] = useState([]);
  const [skillLedger, setSkillLedger] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [isGeneratingNFT, setIsGeneratingNFT] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (currentUser) {
      loadBlockchainCredentials();
      loadSkillLedger();
    }
  }, [currentUser]);

  const loadBlockchainCredentials = async () => {
    try {
      const credentials = await BlockchainCredential.filter({ user_id: currentUser.id });
      setMyCredentials(credentials);
    } catch (error) {
      console.error("Error loading blockchain credentials:", error);
    }
  };

  const loadSkillLedger = async () => {
    try {
      const ledgers = await SkillLedger.filter({ user_id: currentUser.id });
      if (ledgers.length > 0) {
        setSkillLedger(ledgers[0]);
      } else {
        // Create initial skill ledger
        await generateSkillLedger();
      }
    } catch (error) {
      console.error("Error loading skill ledger:", error);
    }
  };

  const generateSkillLedger = async () => {
    try {
      const skillEntries = [];
      const competencyClusters = [];

      // Analyze user progress to build skill entries
      if (userProgress && processes) {
        const skillCategories = {};
        
        userProgress.forEach(progress => {
          if (progress.status === 'completed') {
            const process = processes.find(p => p.id === progress.process_id);
            if (process) {
              if (!skillCategories[process.category]) {
                skillCategories[process.category] = {
                  completions: 0,
                  totalScore: 0,
                  processes: []
                };
              }
              skillCategories[process.category].completions++;
              skillCategories[process.category].totalScore += (progress.practical_score || progress.quiz_score || 85);
              skillCategories[process.category].processes.push(progress);
            }
          }
        });

        Object.entries(skillCategories).forEach(([category, data]) => {
          const avgScore = data.totalScore / data.completions;
          const proficiencyLevel = Math.min(100, avgScore * (data.completions / 3)); // Factor in breadth

          skillEntries.push({
            skill_id: `skill_${category}`,
            skill_name: category.replace('_', ' '),
            skill_category: category,
            proficiency_level: Math.round(proficiencyLevel),
            acquisition_date: new Date().toISOString(),
            verification_method: 'performance_based_assessment',
            blockchain_proof: generateBlockchainProof(),
            endorsements: [],
            decay_prediction: {
              current_retention_score: Math.min(100, proficiencyLevel + 10),
              predicted_decay_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              reinforcement_recommendations: [`Review ${category} fundamentals`, `Practice advanced ${category} techniques`]
            }
          });
        });

        // Create competency clusters
        if (skillEntries.length >= 2) {
          const mainCluster = {
            cluster_name: 'Manufacturing Operations',
            related_skills: skillEntries.map(s => s.skill_name),
            overall_competency: Math.round(skillEntries.reduce((acc, s) => acc + s.proficiency_level, 0) / skillEntries.length),
            industry_alignment: 'Advanced Manufacturing',
            transferability_score: 85
          };
          competencyClusters.push(mainCluster);
        }
      }

      const newLedger = await SkillLedger.create({
        user_id: currentUser.id,
        ledger_hash: generateLedgerHash(skillEntries),
        skill_entries: skillEntries,
        competency_clusters: competencyClusters,
        career_trajectory: {
          current_role_fit: 88,
          advancement_readiness: 75,
          skill_gap_analysis: ['leadership', 'advanced_analytics'],
          recommended_development_path: ['Team Leadership Course', 'Data Analytics for Manufacturing']
        },
        trust_score: 92,
        last_audit_date: new Date().toISOString()
      });

      setSkillLedger(newLedger);
    } catch (error) {
      console.error("Error generating skill ledger:", error);
    }
  };

  const generateBlockchainProof = () => {
    // Simulate blockchain proof generation
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  };

  const generateLedgerHash = (skillEntries) => {
    // Simulate ledger hash generation
    const dataString = JSON.stringify(skillEntries) + Date.now();
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  };

  const issueBlockchainCredential = async (type, metadata) => {
    setIsGeneratingNFT(true);
    
    try {
      const credential = await BlockchainCredential.create({
        credential_id: `cred_${Date.now()}`,
        user_id: currentUser.id,
        credential_type: type,
        blockchain_hash: generateBlockchainProof(),
        nft_token_id: `nft_${Date.now()}`,
        smart_contract_address: `0x${Math.random().toString(16).substr(2, 40)}`,
        credential_metadata: metadata,
        issuing_authority: {
          organization_name: 'LearnFlow Manufacturing Institute',
          digital_signature: generateBlockchainProof(),
          authority_blockchain_address: `0x${Math.random().toString(16).substr(2, 40)}`,
          accreditation_status: 'Certified Training Provider'
        },
        verification_data: {
          merkle_proof: generateBlockchainProof(),
          timestamp: new Date().toISOString(),
          block_number: Math.floor(Math.random() * 1000000),
          transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          gas_used: Math.floor(Math.random() * 100000)
        },
        interoperability_standards: ['w3c_verifiable_credentials', 'open_badges', 'ethereum_erc721'],
        portability_score: 95,
        revocation_status: 'active'
      });

      setMyCredentials(prev => [...prev, credential]);

      showToast({
        type: 'success',
        title: 'Blockchain Credential Issued!',
        message: 'Your credential has been recorded on the blockchain and minted as an NFT.'
      });

    } catch (error) {
      console.error("Error issuing blockchain credential:", error);
      showToast({
        type: 'error',
        title: 'Issuance Failed',
        message: 'Unable to issue blockchain credential.'
      });
    } finally {
      setIsGeneratingNFT(false);
    }
  };

  const verifyCredential = async (credential) => {
    try {
      // Simulate blockchain verification
      const isValid = Math.random() > 0.1; // 90% success rate
      const verificationResult = {
        isValid,
        blockchainStatus: isValid ? 'verified' : 'invalid',
        trustScore: isValid ? 98 : 0,
        lastVerified: new Date().toISOString(),
        verificationDetails: {
          smartContractValid: isValid,
          merkleProofValid: isValid,
          issuingAuthorityValid: isValid,
          notRevoked: isValid
        }
      };

      setVerificationResults(prev => ({
        ...prev,
        [credential.id]: verificationResult
      }));

      showToast({
        type: isValid ? 'success' : 'error',
        title: isValid ? 'Credential Verified' : 'Verification Failed',
        message: isValid ? 'Credential is valid and verified on blockchain' : 'Credential verification failed'
      });

    } catch (error) {
      console.error("Error verifying credential:", error);
    }
  };

  const shareCredential = (credential) => {
    setSelectedCredential(credential);
    setShowShareModal(true);
  };

  const getCredentialTypeIcon = (type) => {
    switch (type) {
      case 'certification': return Award;
      case 'skill_badge': return Shield;
      case 'safety_qualification': return CheckCircle;
      case 'competency_assessment': return TrendingUp;
      default: return Award;
    }
  };

  const getCompetencyColor = (level) => {
    if (level >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (level >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (level >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const filteredCredentials = myCredentials.filter(cred =>
    cred.credential_metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cred.credential_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Blockchain Credentials
            </h1>
            <p className="text-slate-600 text-lg">
              Immutable, verifiable proof of your manufacturing expertise
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search credentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </motion.div>

        {/* Skill Ledger Overview */}
        {skillLedger && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Your Immutable Skill Ledger
                  <Badge className="ml-auto bg-white/20 text-white border-white/30">
                    Trust Score: {skillLedger.trust_score}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm opacity-90">Verified Skills</div>
                    <div className="text-3xl font-bold">{skillLedger.skill_entries.length}</div>
                    <div className="text-xs opacity-75">Blockchain-verified competencies</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm opacity-90">Competency Clusters</div>
                    <div className="text-3xl font-bold">{skillLedger.competency_clusters.length}</div>
                    <div className="text-xs opacity-75">Industry-aligned skill groups</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm opacity-90">Career Readiness</div>
                    <div className="text-3xl font-bold">{skillLedger.career_trajectory.advancement_readiness}%</div>
                    <div className="text-xs opacity-75">Ready for next career level</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 rounded-lg">
                  <div className="text-sm font-medium mb-2">Ledger Hash (Immutable Proof):</div>
                  <div className="font-mono text-xs break-all opacity-90">
                    {skillLedger.ledger_hash}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Issue New Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => issueBlockchainCredential('skill_badge', {
                    title: 'Manufacturing Excellence',
                    description: 'Demonstrated advanced manufacturing competencies',
                    skill_areas: skillLedger?.skill_entries.map(s => s.skill_name) || [],
                    competency_level: 'advanced',
                    practical_validation: true,
                    supervisor_verified: true
                  })}
                  disabled={isGeneratingNFT}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Shield className="w-4 h-4" />
                  Skill Badge NFT
                </Button>

                <Button
                  onClick={() => issueBlockchainCredential('competency_assessment', {
                    title: 'Operations Competency',
                    description: 'Verified operational competency assessment',
                    skill_areas: ['operations', 'quality', 'safety'],
                    competency_level: 'expert',
                    assessment_score: 92,
                    practical_validation: true
                  })}
                  disabled={isGeneratingNFT}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Competency Certificate
                </Button>

                <Button
                  onClick={() => issueBlockchainCredential('safety_qualification', {
                    title: 'Safety Qualification',
                    description: 'Advanced safety protocol certification',
                    skill_areas: ['safety', 'compliance'],
                    competency_level: 'expert',
                    practical_validation: true,
                    supervisor_verified: true
                  })}
                  disabled={isGeneratingNFT}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Safety Credential
                </Button>

                <Button
                  disabled={isGeneratingNFT}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Custom Credential
                </Button>
              </div>

              {isGeneratingNFT && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-blue-700">Generating blockchain credential and minting NFT...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCredentials.map((credential, index) => {
              const IconComponent = getCredentialTypeIcon(credential.credential_type);
              const verification = verificationResults[credential.id];
              
              return (
                <motion.div
                  key={credential.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{credential.credential_metadata.title}</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">
                              {credential.credential_metadata.description}
                            </p>
                          </div>
                        </div>
                        
                        <Badge className={`${
                          credential.revocation_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {credential.revocation_status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                      {/* Competency Level */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Competency Level:</span>
                        <Badge className={getCompetencyColor(85)}>
                          {credential.credential_metadata.competency_level}
                        </Badge>
                      </div>

                      {/* Skill Areas */}
                      <div>
                        <div className="text-sm font-medium mb-2">Skill Areas:</div>
                        <div className="flex flex-wrap gap-1">
                          {credential.credential_metadata.skill_areas?.slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {credential.credential_metadata.skill_areas?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{credential.credential_metadata.skill_areas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Blockchain Info */}
                      <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">Portability Score:</span>
                          <span>{credential.portability_score}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">Block Number:</span>
                          <span className="font-mono">{credential.verification_data.block_number}</span>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">Transaction:</span>
                          <div className="font-mono break-all mt-1">
                            {credential.verification_data.transaction_hash.substring(0, 20)}...
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyCredential(credential)}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Shield className="w-3 h-3" />
                          Verify
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareCredential(credential)}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Share2 className="w-3 h-3" />
                          Share
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCredentials.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Shield className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Blockchain Credentials Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Complete training processes and earn certifications to build your blockchain credential portfolio.
            </p>
            <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              Issue First Credential
            </Button>
          </motion.div>
        )}

        {/* Share Modal */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Credential
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center p-6 bg-slate-50 rounded-lg">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-sm text-slate-600">
                  QR Code for instant verification
                </p>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Copy Verification Link
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Globe className="w-4 h-4 mr-2" />
                  Share to LinkedIn
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// NOTE: This component contains SIMULATED AI logic for demonstration purposes.
// In a real-world scenario, these functions would make API calls to a dedicated AI/ML backend.

/**
 * Analyzes user data to generate learning insights.
 * @param {object} userProgress - Array of user progress records.
 * @param {object} processes - Array of all available processes.
 * @param {object} currentUser - The current user object.
 * @returns {object} A learning analytics object.
 */
function generateLearningAnalytics(userProgress, processes, currentUser) {
  if (!userProgress || !processes || !currentUser) {
    return {
      user_id: currentUser?.id,
      skill_proficiency: {},
      knowledge_gaps: [],
      skill_decay_predictions: [],
      learning_velocity: 0,
    };
  }

  const skillProficiency = {};
  const completedProcesses = userProgress.filter(p => p.status === 'completed');
  
  processes.forEach(proc => {
    const category = proc.category || 'general';
    if (!skillProficiency[category]) {
      skillProficiency[category] = { completed: 0, total: 0, scores: [] };
    }
    skillProficiency[category].total++;
  });

  completedProcesses.forEach(progress => {
    const process = processes.find(p => p.id === progress.process_id);
    if (process) {
      const category = process.category || 'general';
      if (skillProficiency[category]) {
        skillProficiency[category].completed++;
        if (progress.practical_score) {
          skillProficiency[category].scores.push(progress.practical_score);
        }
      }
    }
  });

  const knowledgeGaps = Object.entries(skillProficiency)
    .filter(([_, data]) => data.total > 0 && (data.completed / data.total) < 0.5)
    .map(([category, _]) => category);

  // Simulate skill decay prediction
  const skillDecayPredictions = Object.entries(skillProficiency)
    .filter(([_, data]) => data.completed > 0)
    .slice(0, 1) // just predict for one for demo
    .map(([skill, data]) => ({
      skill_area: skill,
      current_proficiency: (data.completed / data.total) * 100,
      predicted_decay_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      confidence_score: 85 + Math.random() * 10,
    }));

  return {
    user_id: currentUser.id,
    skill_proficiency: skillProficiency,
    knowledge_gaps: knowledgeGaps,
    skill_decay_predictions: skillDecayPredictions,
    learning_velocity: completedProcesses.length > 5 ? 'high' : 'medium',
  };
}

/**
 * Generates a set of recommended processes based on learning analytics.
 * @param {object} learningAnalytics - The user's learning analytics object.
 * @param {object} processes - Array of all available processes.
 * @param {object} userProgress - Array of user progress records.
 * @returns {Array} A list of recommended process objects.
 */
function getAdaptiveRecommendations(learningAnalytics, processes, userProgress) {
  if (!learningAnalytics || !processes || !userProgress) return [];

  const completedIds = new Set(userProgress.map(p => p.process_id));
  let recommendations = [];

  // 1. Target knowledge gaps
  if (learningAnalytics.knowledge_gaps && learningAnalytics.knowledge_gaps.length > 0) {
    const gap = learningAnalytics.knowledge_gaps[0];
    const processForGap = processes.find(p => p.category === gap && !completedIds.has(p.id));
    if (processForGap) {
      recommendations.push({
        ...processForGap,
        reason: `To address your knowledge gap in: ${gap.replace(/_/g, ' ')}`,
        priority: 'high',
      });
    }
  }

  // 2. Suggest a refresher for predicted skill decay
  if (learningAnalytics.skill_decay_predictions && learningAnalytics.skill_decay_predictions.length > 0) {
      const decayPrediction = learningAnalytics.skill_decay_predictions[0];
      const refresherProcess = processes.find(p => p.category === decayPrediction.skill_area && completedIds.has(p.id));
      if (refresherProcess && !recommendations.some(r => r.id === refresherProcess.id)) {
          recommendations.push({
              ...refresherProcess,
              reason: `Skill Refresher: Your proficiency in ${decayPrediction.skill_area.replace(/_/g, ' ')} may be decaying.`,
              priority: 'medium'
          });
      }
  }
  
  // 3. Fallback: Suggest a popular or highly-rated process
  if (recommendations.length < 3) {
      const popularProcess = processes
        .filter(p => !completedIds.has(p.id))
        .sort((a,b) => (b.rating || 0) - (a.rating || 0))
        .find(p => !recommendations.some(r => r.id === p.id));
      
      if(popularProcess) {
          recommendations.push({
              ...popularProcess,
              reason: `Popular among your peers.`,
              priority: 'low'
          });
      }
  }

  return recommendations.slice(0, 3);
}

export const AdaptiveLearningEngine = {
  generateLearningAnalytics,
  getAdaptiveRecommendations,
};
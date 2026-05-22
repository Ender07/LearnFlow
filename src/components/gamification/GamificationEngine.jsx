
import React, { createContext, useContext, useCallback } from 'react';
import { GamificationLedger, User, Badge } from '@/entities/all';
import { useToast } from '@/components/common/Toast';
import { useData } from '@/components/providers/DataProvider';

const GamificationContext = createContext(null);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { currentUser, refetchData } = useData();
  const { showToast } = useToast();

  const calculateLevel = (totalPoints) => {
    // Level system: 1000 points per level, exponentially increasing
    return Math.floor(totalPoints / 1000) + 1;
  };

  const getPointsForNextLevel = (currentPoints) => {
    const currentLevel = calculateLevel(currentPoints);
    return currentLevel * 1000;
  };

  const awardPoints = useCallback(async (points, reason, details, relatedEntityId = null) => {
    if (!currentUser || !currentUser.id) return;

    try {
      // Record the points in the ledger
      const ledgerEntry = await GamificationLedger.create({
        user_id: currentUser.id,
        points,
        reason,
        details,
        related_entity_id: relatedEntityId
      });

      // Update user's total points
      const newTotalPoints = (currentUser.gamification_points || 0) + points;
      const newLevel = calculateLevel(newTotalPoints);
      const oldLevel = calculateLevel(currentUser.gamification_points || 0);

      if (currentUser.id !== 'demo_user') {
        await User.updateMyUserData({
          gamification_points: newTotalPoints,
          gamification_level: newLevel
        });
      } else {
        console.log("Demo user points awarded locally.");
      }
      
      // Show achievement notification
      showToast({
        type: 'success',
        title: `+${points} XP Earned!`,
        message: details
      });

      // Check for level up
      if (newLevel > oldLevel) {
        showToast({
          type: 'success',
          title: `Level Up! 🎉`,
          message: `You've reached Level ${newLevel}!`,
          duration: 6000
        });
      }

      // Check for badge eligibility
      await checkBadgeEligibility(newTotalPoints, reason);

      // Refresh data to update UI
      if (currentUser.id !== 'demo_user') {
        await refetchData();
      }

      return ledgerEntry;
    } catch (error) {
      console.error('Error awarding points:', error);
      showToast({
        type: 'error',
        title: 'Achievement Error',
        message: 'Failed to record your achievement. Please try again.'
      });
    }
  }, [currentUser, showToast, refetchData]);

  const checkBadgeEligibility = async (totalPoints, reason) => {
    if (!currentUser || !currentUser.id || currentUser.id === 'demo_user') return;

    const availableBadges = await Badge.list();
    const userBadges = currentUser.earned_badges || [];

    for (const badge of availableBadges) {
      // Skip if user already has this badge
      if (userBadges.includes(badge.id)) continue;

      let shouldAward = false;

      // Badge eligibility logic based on different criteria
      switch (badge.category) {
        case 'completion':
          // Award completion badges based on total completed processes
          if (reason === 'Process Completion' && totalPoints >= badge.points) {
            shouldAward = true;
          }
          break;

        case 'collaboration':
          // Award collaboration badges for knowledge contributions
          if (reason === 'Knowledge Contribution' || reason === 'Discussion Reply') {
            shouldAward = true;
          }
          break;

        case 'expertise':
          // Award expertise badges based on total points
          if (totalPoints >= badge.points * 2) {
            shouldAward = true;
          }
          break;

        case 'milestone':
          // Award milestone badges for specific point thresholds
          if (totalPoints >= badge.points) {
            shouldAward = true;
          }
          break;

        case 'safety':
          // Award safety badges for safety-related completions
          if (reason === 'Safety Training Completion') {
            shouldAward = true;
          }
          break;

        case 'quality':
          // Award quality badges for high quiz scores
          if (reason === 'High Quality Performance') {
            shouldAward = true;
          }
          break;
      }

      if (shouldAward) {
        await awardBadge(badge);
      }
    }
  };

  const awardBadge = async (badge) => {
    try {
      const currentBadges = currentUser.earned_badges || [];
      const newBadges = [...currentBadges, badge.id];

      await User.updateMyUserData({
        earned_badges: newBadges
      });

      // Award the badge's point value as well
      await awardPoints(badge.points, 'Badge Earned', `Earned ${badge.title} badge!`);
      
      showToast({
        type: 'success',
        title: '🏆 Badge Unlocked!',
        message: `You've earned the "${badge.title}" badge!`,
        duration: 8000
      });
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  const pointAwards = {
    processCompletion: (processTitle, score) => awardPoints(50, 'Process Completion', `Completed: ${processTitle} with score ${score}%`),
    firstProcess: () => awardPoints(100, 'Milestone', 'Completed your first process!'),
    perfectScore: (processTitle) => awardPoints(75, 'Achievement', `Perfect score on: ${processTitle}`),
    safetyTraining: (processTitle) => awardPoints(100, 'Safety Compliance', `Completed safety training: ${processTitle}`),
    knowledgeContribution: () => awardPoints(30, 'Knowledge Contribution', 'Shared a new piece of knowledge'),
    verifiedContribution: () => awardPoints(100, 'Expertise', 'Your contribution was verified by an expert!'),
    discussionReply: () => awardPoints(5, 'Collaboration', 'Participated in a discussion'),
    helpfulResponse: () => awardPoints(15, 'Collaboration', 'Your reply was marked as helpful'),
    provideSolution: () => awardPoints(50, 'Expertise', 'You provided a solution to a discussion!')
  };

  const value = {
    awardPoints,
    pointAwards,
    calculateLevel,
    getPointsForNextLevel
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

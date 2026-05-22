import React, { createContext, useContext } from 'react';

// Create a new, simplified DataContext
const DataContext = createContext();

// The hook to use the context remains the same
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// A drastically simplified DataProvider for debugging
export const DataProvider = ({ children }) => {
  
  // Provide a simple, static "mock" value so components don't crash
  // trying to access properties of 'null' or 'undefined'.
  const mockValue = {
    currentUser: { full_name: 'Debug User', job_title: 'Operator', gamification_points: 0, gamification_level: 1 },
    processes: [],
    userProgress: [],
    allUserProgress: [],
    learningPaths: [],
    notifications: [],
    contributions: [],
    equipment: [],
    certifications: [],
    badges: [],
    discussions: [],
    users: [],
    reviews: [],
    feedback: [],
    learningAnalytics: null,
    isLoading: false, // Set to false so the app doesn't show a loading state
    error: null,
    refetchData: () => console.log("Debug: Refetch triggered"),
    
    // Add dummy functions for other methods to prevent crashes
    addEquipment: async () => {},
    updateEquipment: async () => {},
    addKnowledgeContribution: async () => {},
    updateKnowledgeContribution: async () => {},
    addDiscussion: async () => {},
    addFeedback: async () => {},
    updateFeedback: async () => {},
  };

  // The provider just renders its children, wrapped with the mock context value.
  // This removes all data fetching, useEffects, and complex state logic.
  return (
    <DataContext.Provider value={mockValue}>
      {children}
    </DataContext.Provider>
  );
};
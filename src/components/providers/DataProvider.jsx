import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      const [procs, paths, certs, equip, notifs, bdgs, prog, fbk] = await Promise.all([
        base44.entities.Process.list('-created_date', 100).catch(() => []),
        base44.entities.LearningPath.list('-created_date', 50).catch(() => []),
        base44.entities.Certification.list('-created_date', 50).catch(() => []),
        base44.entities.Equipment.list('-created_date', 50).catch(() => []),
        base44.entities.Notification.list('-created_date', 50).catch(() => []),
        base44.entities.Badge.list('-created_date', 50).catch(() => []),
        base44.entities.UserProgress.list('-updated_date', 200).catch(() => []),
        base44.entities.FeedbackRequest.list('-created_date', 200).catch(() => []),
      ]);

      setProcesses(procs);
      setLearningPaths(paths);
      setCertifications(certs);
      setEquipment(equip);
      setNotifications(notifs);
      setBadges(bdgs);
      setUserProgress(prog);
      setFeedback(fbk);

      if (user?.role === 'admin') {
        const [usrs, revs] = await Promise.all([
          base44.entities.User.list().catch(() => []),
          base44.entities.SupervisorReview.list('-created_date', 100).catch(() => []),
        ]);
        setUsers(usrs);
        setReviews(revs);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DataContext.Provider value={{
      currentUser, processes, userProgress, learningPaths, certifications,
      equipment, notifications, badges, users, reviews, feedback, isLoading, error,
      unreadCount,
      refetchData: fetchData,
      setNotifications,
    }}>
      {children}
    </DataContext.Provider>
  );
};
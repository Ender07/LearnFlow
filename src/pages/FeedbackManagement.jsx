import React, { useState, useMemo } from "react";
import { useData } from "@/components/providers/DataProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

import FeedbackOverview from "../components/feedback/FeedbackOverview";
import FeedbackTable from "../components/feedback/FeedbackTable";
import FeedbackDetailsModal from "../components/feedback/FeedbackDetailsModal";

export default function FeedbackManagement() {
  const { 
    feedback: allFeedback,
    processes,
    users,
    currentUser,
    isLoading 
  } = useData();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  // Memoize filtered feedback lists for performance
  const openFeedback = useMemo(() => allFeedback.filter(f => f.status === 'open'), [allFeedback]);
  const inReviewFeedback = useMemo(() => allFeedback.filter(f => f.status === 'in_review'), [allFeedback]);
  const resolvedFeedback = useMemo(() => allFeedback.filter(f => f.status === 'resolved'), [allFeedback]);

  const handleViewDetails = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
  };
  
  const handleCloseModal = () => {
    setSelectedFeedback(null);
  };

  if (isLoading && !allFeedback.length) {
    return (
      <div className="p-6">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <Skeleton className="h-48 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Feedback Management
            </h1>
          </div>
          <p className="text-slate-600 text-lg max-w-2xl">
            Review, prioritize, and act on user feedback to continuously improve training content.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="open">Open ({openFeedback.length})</TabsTrigger>
            <TabsTrigger value="in_review">In Review ({inReviewFeedback.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedFeedback.length})</TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <TabsContent value="overview">
              <FeedbackOverview feedback={allFeedback} processes={processes} />
            </TabsContent>
            <TabsContent value="open">
              <FeedbackTable feedbackData={openFeedback} onRowClick={handleViewDetails} processes={processes} users={users} />
            </TabsContent>
            <TabsContent value="in_review">
              <FeedbackTable feedbackData={inReviewFeedback} onRowClick={handleViewDetails} processes={processes} users={users} />
            </TabsContent>
            <TabsContent value="resolved">
              <FeedbackTable feedbackData={resolvedFeedback} onRowClick={handleViewDetails} processes={processes} users={users} />
            </TabsContent>
          </motion.div>
        </Tabs>

        {selectedFeedback && (
          <FeedbackDetailsModal 
            feedback={selectedFeedback}
            isOpen={!!selectedFeedback}
            onClose={handleCloseModal}
            isAdmin={isAdmin}
            processes={processes}
            users={users}
          />
        )}
      </div>
    </div>
  );
}
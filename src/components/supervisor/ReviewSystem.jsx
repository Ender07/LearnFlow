import React, { useState, useEffect } from 'react';
import { SupervisorReview } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ReviewForm from './ReviewForm';

export default function ReviewSystem({ teamMembers, processes, supervisor }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [teamMembers]);

  const loadReviews = async () => {
    if (!supervisor?.id) return;
    setIsLoading(true);
    try {
      // Fetch reviews where supervisor is assigned and status is pending
      const reviewData = await SupervisorReview.filter({
        supervisor_id: supervisor.id,
        review_status: 'pending',
      });
      setReviews(reviewData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Demo fallback
      if(supervisor?.id) {
          setReviews([
              { id: 'demo1', trainee_id: teamMembers[0]?.id, process_id: processes[0]?.id, review_type: 'completion_approval', review_status: 'pending' }
          ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReview = (review) => {
    setSelectedReview(review);
    setIsReviewModalOpen(true);
  };
  
  const handleReviewSubmitted = () => {
    setIsReviewModalOpen(false);
    setSelectedReview(null);
    loadReviews(); // Refresh list after submission
  };

  if (isLoading) {
    return <Card className="animate-pulse bg-slate-200 h-64"></Card>;
  }

  return (
    <>
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Pending Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Check className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-semibold">All Caught Up!</h3>
              <p>There are no pending reviews in your queue.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review, index) => {
                const trainee = teamMembers.find(tm => tm.id === review.trainee_id);
                const process = processes.find(p => p.id === review.process_id);
                return (
                  <motion.li
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-50 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={trainee?.profile_picture_url} />
                        <AvatarFallback>{trainee?.full_name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{trainee?.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-slate-600">
                          Requires <span className="font-medium text-blue-600">{review.review_type.replace(/_/g, ' ')}</span> for "{process?.title || 'Unknown Process'}"
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleOpenReview(review)}>
                      <FileCheck className="w-4 h-4 mr-2" />
                      Start Review
                    </Button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
      
      {selectedReview && (
        <ReviewForm
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          review={selectedReview}
          trainee={teamMembers.find(tm => tm.id === selectedReview.trainee_id)}
          process={processes.find(p => p.id === selectedReview.process_id)}
          supervisor={supervisor}
          onSubmit={handleReviewSubmitted}
        />
      )}
    </>
  );
}
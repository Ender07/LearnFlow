import React, { useState } from 'react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UserProgress, SupervisorReview } from '@/entities/all';
import { ThumbsUp, ThumbsDown, Star, Loader2 } from 'lucide-react';

export default function ReviewForm({ userProgress, process, trainee, supervisor, onClose }) {
  const [competencyRating, setCompetencyRating] = useState(0);
  const [observations, setObservations] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(''); // 'approved' or 'rejected'

  const handleSubmitReview = async () => {
    if (!reviewStatus) {
      alert("Please either approve or reject the completion.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Create the SupervisorReview record
      await SupervisorReview.create({
        user_progress_id: userProgress.id,
        process_id: process.id,
        trainee_id: trainee.id,
        supervisor_id: supervisor.id,
        review_type: 'completion_approval',
        review_status: reviewStatus,
        competency_rating: competencyRating,
        observations: observations,
        recommendations: recommendations,
      });

      // 2. Update the UserProgress record
      await UserProgress.update(userProgress.id, {
        supervisor_approval: reviewStatus === 'approved',
        supervisor_notes: `Rating: ${competencyRating}/5. Observations: ${observations}`,
      });
      
      onClose(true); // Close modal and refresh list
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Review Training Completion</DialogTitle>
        <DialogDescription>
          Evaluate the performance of <span className="font-semibold">{trainee.full_name}</span> for the process: <span className="font-semibold">{process.title}</span>.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        {/* Performance Summary */}
        <Card className="bg-slate-50">
          <CardHeader><CardTitle>Performance Summary</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-500">Status</p>
              <Badge variant={userProgress.status === 'completed' ? 'success' : 'secondary'}>
                {userProgress.status}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Quiz Score</p>
              <p className="font-bold text-lg">{userProgress.quiz_score || 'N/A'}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Time Spent</p>
              <p className="font-bold text-lg">{userProgress.time_spent || 0} min</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Errors Made</p>
              <p className="font-bold text-lg">{userProgress.errors_made?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Review Input */}
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-slate-700">Competency Rating</label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`cursor-pointer transition-colors ${
                    star <= competencyRating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                  }`}
                  onClick={() => setCompetencyRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-700">Observations</label>
            <Textarea
              placeholder="What did you observe during the practical assessment?"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700">Recommendations</label>
            <Textarea
              placeholder="What are the next steps or areas for improvement?"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 pt-4 border-t">
          <Button 
            size="lg" 
            variant={reviewStatus === 'rejected' ? 'destructive' : 'outline'}
            onClick={() => setReviewStatus('rejected')}
            className="w-1/2"
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Requires Remediation
          </Button>
          <Button 
            size="lg" 
            variant={reviewStatus === 'approved' ? 'success' : 'outline'}
            onClick={() => setReviewStatus('approved')}
            className="w-1/2"
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Approve Completion
          </Button>
        </div>
        
        {reviewStatus && (
           <Alert variant={reviewStatus === 'approved' ? 'success' : 'destructive'}>
             <AlertTitle>Review Decision: {reviewStatus === 'approved' ? 'Approved' : 'Requires Remediation'}</AlertTitle>
             <AlertDescription>
               Click 'Submit Review' to finalize this decision. The trainee will be notified.
             </AlertDescription>
           </Alert>
        )}
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={() => onClose(false)} disabled={isSubmitting}>Cancel</Button>
        <Button onClick={handleSubmitReview} disabled={!reviewStatus || isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </DialogFooter>
    </>
  );
}
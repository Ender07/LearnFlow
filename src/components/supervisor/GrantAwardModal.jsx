import React, { useState } from 'react';
import { GamificationLedger, User } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/common/Toast";

export default function GrantAwardModal({ teamMembers, onClose, onGrant }) {
  const [selectedUser, setSelectedUser] = useState("");
  const [points, setPoints] = useState(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || points <= 0 || !reason) {
      showToast("Warning", "Please fill all fields.", "warning");
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Create ledger entry
      await GamificationLedger.create({
        user_id: selectedUser,
        points: Number(points),
        reason: "Manual Award",
        details: reason
      });

      // Update user's total points
      const user = await User.get(selectedUser);
      await User.update(selectedUser, {
        gamification_points: (user.gamification_points || 0) + Number(points)
      });
      
      onGrant();
      onClose();
    } catch (error) {
      console.error("Failed to grant award:", error);
      showToast("Error", "Failed to grant award.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Award</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label>Select Team Member</Label>
            <Select onValueChange={setSelectedUser}>
              <SelectTrigger><SelectValue placeholder="Select a team member" /></SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>{member.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="points">Points to Award</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="reason">Reason for Award</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Exceptional safety protocol adherence"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Grant Award
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
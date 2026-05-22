import React, { useState, useEffect } from 'react';
import { User } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/common/Toast';
import { Save } from 'lucide-react';

export default function NotificationSettings({ user, onUpdate }) {
  const [preferences, setPreferences] = useState(user.notification_preferences || {
    new_assignments: true,
    knowledge_updates: true,
    discussion_mentions: true,
    gamification_awards: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setPreferences(user.notification_preferences || {
      new_assignments: true,
      knowledge_updates: true,
      discussion_mentions: true,
      gamification_awards: true,
    });
  }, [user]);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await User.updateMyUserData({ notification_preferences: preferences });
      showToast({ type: 'success', title: 'Preferences saved!' });
      onUpdate();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      showToast({ type: 'error', title: 'Save Failed', message: 'Could not save your preferences.' });
    } finally {
      setIsSaving(false);
    }
  };

  const settingsOptions = [
    { id: 'new_assignments', label: 'New Training Assignments', description: 'Get notified when a supervisor assigns a new process to you.' },
    { id: 'knowledge_updates', label: 'Knowledge Hub Updates', description: 'Receive notifications about new contributions and verified best practices.' },
    { id: 'discussion_mentions', label: 'Discussion Mentions', description: 'Get an alert when someone @mentions you in a discussion.' },
    { id: 'gamification_awards', label: 'Points & Badge Awards', description: 'See notifications when you earn points or unlock a new badge.' },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Email Notifications</h3>
      <div className="space-y-4">
        {settingsOptions.map((option) => (
          <div key={option.id} className="flex items-start space-x-3">
            <Checkbox
              id={option.id}
              checked={preferences[option.id]}
              onCheckedChange={(checked) => handlePreferenceChange(option.id, checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor={option.id} className="font-medium">
                {option.label}
              </label>
              <p className="text-sm text-slate-500">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </div>
    </form>
  );
}
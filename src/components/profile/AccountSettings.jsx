import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, User, Bell, Loader2 } from 'lucide-react';
import { useToast } from '@/components/common/Toast';
import { User as UserEntity } from '@/entities/all';
import { UploadFile } from '@/integrations/Core';

export default function AccountSettings({ user }) {
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    job_title: user?.job_title || '',
    department: user?.department || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    notification_preferences: {
      new_assignments: user?.notification_preferences?.new_assignments ?? true,
      knowledge_updates: user?.notification_preferences?.knowledge_updates ?? true,
      discussion_mentions: user?.notification_preferences?.discussion_mentions ?? true,
      gamification_awards: user?.notification_preferences?.gamification_awards ?? true,
    }
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNotificationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value
      }
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
      showToast('Success', 'Avatar uploaded successfully', 'success');
    } catch (error) {
      console.error('Avatar upload failed:', error);
      showToast('Error', 'Failed to upload avatar', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await UserEntity.updateMyUserData(formData);
      showToast('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Error', 'Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback className="text-xl">
                {formData.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" asChild disabled={isUploading}>
                <label className="cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {isUploading ? 'Uploading...' : 'Change Avatar'}
                </label>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <p className="text-xs text-slate-500 mt-1">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <Input
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="Enter your job title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Input
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter your department"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: 'new_assignments',
              label: 'New Training Assignments',
              description: 'Get notified when you receive new training assignments'
            },
            {
              key: 'knowledge_updates',
              label: 'Knowledge Base Updates',
              description: 'Receive updates about new content and contributions'
            },
            {
              key: 'discussion_mentions',
              label: 'Discussion Mentions',
              description: 'Get notified when someone mentions you in discussions'
            },
            {
              key: 'gamification_awards',
              label: 'Awards & Achievements',
              description: 'Celebrate your achievements with instant notifications'
            }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="space-y-1">
                <div className="font-medium">{label}</div>
                <div className="text-sm text-slate-600">{description}</div>
              </div>
              <Switch
                checked={formData.notification_preferences[key]}
                onCheckedChange={(checked) => handleNotificationChange(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isUpdating || isUploading}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
        >
          {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const NotificationSettings = () => {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Notification Settings</h2>
        <p className="text-gray-300">Choose what notifications you want to receive</p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Character Updates</Label>
                <p className="text-sm text-gray-400">Get notified when your characters receive updates</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">New Features</Label>
                <p className="text-sm text-gray-400">Be the first to know about new platform features</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Account Security</Label>
                <p className="text-sm text-gray-400">Important security updates and alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Push Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Chat Messages</Label>
                <p className="text-sm text-gray-400">Get notified of new chat messages</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">System Alerts</Label>
                <p className="text-sm text-gray-400">Important system notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const AccountSettings = () => {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
        <p className="text-gray-300">Manage your account information and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="Enter your first name"
                className="mt-1 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Enter your last name"
                className="mt-1 bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          </div>
          <div className="mt-4">
            <Label htmlFor="email" className="text-gray-300">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="Enter your email"
              className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Password */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            Change Password
          </Button>
        </div>

        <Separator className="bg-gray-700" />

        {/* Save Changes */}
        <div className="flex justify-end">
          <Button className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

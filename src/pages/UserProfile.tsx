
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileContent } from '@/components/profile/ProfileContent';

const UserProfile = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="min-h-screen">
            <ProfileHeader />
            <ProfileContent />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserProfile;

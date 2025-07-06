
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
        {/* Add left margin to account for fixed sidebar width (w-64 = 16rem = 256px) */}
        <div className="flex-1 flex flex-col min-w-0 ml-64">
          <main className="flex-1 overflow-auto">
            <div className="min-h-screen">
              <ProfileHeader />
              <ProfileContent />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserProfile;

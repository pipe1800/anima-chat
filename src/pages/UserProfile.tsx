
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileSettingsView } from '@/components/profile/ProfileSettingsView';

const UserProfile = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        {/* Add left margin to account for fixed sidebar width (w-64 = 16rem = 256px) */}
        <div className="flex-1 flex flex-col min-w-0 ml-64">
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<ProfileView />} />
              <Route path="/settings" element={<ProfileSettingsView />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserProfile;

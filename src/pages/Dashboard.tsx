
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

const Dashboard = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        <main className="flex-1">
          <DashboardContent />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;


import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DiscoverContent } from '@/components/discover/DiscoverContent';

const Discover = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        <main className="flex-1 ml-64 overflow-auto">
          <DiscoverContent />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Discover;

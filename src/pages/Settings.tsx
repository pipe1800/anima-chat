
import React, { useState } from 'react';
import { SettingsNavigation } from '@/components/settings/SettingsNavigation';
import { SettingsContent } from '@/components/settings/SettingsContent';

const Settings = () => {
  const [activeCategory, setActiveCategory] = useState('account');

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="px-6 py-8 border-b border-gray-700/30">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300">Manage your account preferences and configuration</p>
        </div>

        {/* Two-column layout */}
        <div className="flex min-h-[calc(100vh-180px)]">
          {/* Left sidebar - Fixed navigation */}
          <div className="w-64 flex-shrink-0">
            <SettingsNavigation 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Right content area */}
          <div className="flex-1 min-w-0">
            <SettingsContent activeCategory={activeCategory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

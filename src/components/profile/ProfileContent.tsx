
import React from 'react';
import { ProfileStats } from './ProfileStats';
import { ProfileTabs } from './ProfileTabs';

export const ProfileContent = () => {
  return (
    <div className="px-8 pb-8">
      {/* Stats Section */}
      <ProfileStats />
      
      {/* Tabbed Content */}
      <div className="mt-8">
        <ProfileTabs />
      </div>
    </div>
  );
};

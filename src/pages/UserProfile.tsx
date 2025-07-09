
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileSettingsView } from '@/components/profile/ProfileSettingsView';

const UserProfile = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<ProfileView />} />
        <Route path="/settings" element={<ProfileSettingsView />} />
      </Routes>
    </DashboardLayout>
  );
};

export default UserProfile;

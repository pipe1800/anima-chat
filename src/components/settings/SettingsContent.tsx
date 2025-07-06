
import React from 'react';
import { AccountSettings } from './categories/AccountSettings';
import { NotificationSettings } from './categories/NotificationSettings';
import { PrivacySettings } from './categories/PrivacySettings';
import { BillingSettings } from './categories/BillingSettings';
import { AppearanceSettings } from './categories/AppearanceSettings';
import { SupportSettings } from './categories/SupportSettings';

interface SettingsContentProps {
  activeCategory: string;
}

export const SettingsContent = ({ activeCategory }: SettingsContentProps) => {
  const renderContent = () => {
    switch (activeCategory) {
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'support':
        return <SupportSettings />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
};

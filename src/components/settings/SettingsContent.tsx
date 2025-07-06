
import React from 'react';
import { AccountSettings } from './categories/AccountSettings';
import { NotificationSettings } from './categories/NotificationSettings';
import { BillingSettings } from './categories/BillingSettings';

interface SettingsContentProps {
  activeCategory: string;
}

export const SettingsContent = ({ activeCategory }: SettingsContentProps) => {
  const renderContent = () => {
    switch (activeCategory) {
      case 'profile':
        return <AccountSettings />;
      case 'account':
        return <AccountSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'notifications':
        return <NotificationSettings />;
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

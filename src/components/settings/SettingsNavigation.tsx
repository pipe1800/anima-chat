
import React from 'react';
import { User, Bell, Shield, CreditCard, Palette, HelpCircle } from 'lucide-react';

interface SettingsNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const SettingsNavigation = ({ activeCategory, onCategoryChange }: SettingsNavigationProps) => {
  const categories = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <nav className="p-6">
      <div className="space-y-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                ${isActive 
                  ? 'bg-[#FF7A00] text-white font-medium' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }
              `}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

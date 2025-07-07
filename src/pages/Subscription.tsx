
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { SubscriptionHero } from '@/components/subscription/SubscriptionHero';
import { SubscriptionPricing } from '@/components/subscription/SubscriptionPricing';
import { FeatureComparisonTable } from '@/components/subscription/FeatureComparisonTable';
import { SubscriptionTestimonials } from '@/components/subscription/SubscriptionTestimonials';
import { TrustBadges } from '@/components/subscription/TrustBadges';
import { SubscriptionFAQ } from '@/components/subscription/SubscriptionFAQ';

const Subscription = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        <main className="flex-1 overflow-auto ml-64">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <SubscriptionHero />
            
            {/* Pricing Cards */}
            <SubscriptionPricing />
            
            {/* Feature Comparison Table */}
            <FeatureComparisonTable />
            
            {/* Testimonials Section */}
            <SubscriptionTestimonials />
            
            {/* Trust Badges */}
            <TrustBadges />
            
            {/* FAQ Section */}
            <SubscriptionFAQ />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Subscription;

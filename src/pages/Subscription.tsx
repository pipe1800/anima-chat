
import React from 'react';
import { SubscriptionHero } from '@/components/subscription/SubscriptionHero';
import { SubscriptionPricing } from '@/components/subscription/SubscriptionPricing';
import { FeatureComparisonTable } from '@/components/subscription/FeatureComparisonTable';
import { SubscriptionTestimonials } from '@/components/subscription/SubscriptionTestimonials';
import { TrustBadges } from '@/components/subscription/TrustBadges';
import { SubscriptionFAQ } from '@/components/subscription/SubscriptionFAQ';

const Subscription = () => {
  return (
    <div className="min-h-screen bg-[#121212]">
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
    </div>
  );
};

export default Subscription;

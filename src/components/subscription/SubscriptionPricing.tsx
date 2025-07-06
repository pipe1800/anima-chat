
import React from 'react';
import PricingTiers from '@/components/PricingTiers';

export const SubscriptionPricing = () => {
  return (
    <section className="py-8">
      {/* Remove the default padding and background from PricingTiers since we're controlling it here */}
      <div className="[&>section]:py-0 [&>section]:bg-transparent">
        <PricingTiers />
      </div>
    </section>
  );
};

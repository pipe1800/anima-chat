
import React from 'react';

export const SubscriptionHero = () => {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Unlock Your
          <span className="text-[#FF7A00] block">AI Character Universe</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
          Choose the perfect plan to bring your wildest AI fantasies to life. 
          No limits, no censorship, just pure creative freedom.
        </p>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#FF7A00] rounded-full"></div>
            <span>14-day money-back guarantee</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#FF7A00] rounded-full"></div>
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-[#FF7A00] rounded-full"></div>
            <span>Secure payments</span>
          </div>
        </div>
      </div>
    </section>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export const FeatureComparisonTable = () => {
  const features = [
    {
      category: "Core Features",
      items: [
        { name: "Messages", guest: "75 per day", trueFan: "Unlimited", whale: "Unlimited" },
        { name: "AI Models", guest: "Standard", trueFan: "Premium", whale: "Premium + Experimental" },
        { name: "Custom Characters", guest: "1", trueFan: "50", whale: "50" },
        { name: "Context Memory", guest: "2k", trueFan: "8k", whale: "16k+" },
      ]
    },
    {
      category: "Experience",
      items: [
        { name: "Priority Queue", guest: false, trueFan: true, whale: true },
        { name: "Longer AI Responses", guest: false, trueFan: true, whale: true },
        { name: "Image Generation", guest: false, trueFan: false, whale: true },
        { name: "Text-to-Speech", guest: false, trueFan: false, whale: true },
      ]
    }
  ];

  const renderFeatureValue = (value: string | boolean, plan: string, featureName?: string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-[#FF7A00] mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-500 mx-auto" />
      );
    }
    
    // Special handling for Messages row - show checkmark for unlimited
    if (featureName === 'Messages' && value === 'Unlimited') {
      return (
        <div className="flex items-center justify-center space-x-2">
          <Check className="h-5 w-5 text-[#FF7A00]" />
          <span className="text-sm font-medium text-white">Unlimited</span>
        </div>
      );
    }
    
    return (
      <span className={`text-sm font-medium ${
        plan === 'guest' ? 'text-gray-400' : 'text-white'
      }`}>
        {value}
      </span>
    );
  };

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Compare All Features
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            See exactly what you get with each plan. No hidden features, no surprises.
          </p>
        </div>

        {/* Comparison Table */}
        <Card className="bg-[#1a1a2e] border-gray-700/50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#1a1a2e] to-[#1a1a2e]/80 border-b border-gray-700/50">
            <div className="grid grid-cols-4 gap-4 items-center">
              <div></div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">The Guest Pass</h3>
                <p className="text-sm text-gray-400">Free</p>
              </div>
              <div className="text-center relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FF7A00] text-white text-xs px-2 py-1 rounded-full font-bold">
                    Popular
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">True Fan</h3>
                <p className="text-sm text-gray-400">$14.95/month</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">The Whale</h3>
                <p className="text-sm text-gray-400">$24.95/month</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {features.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {/* Category Header */}
                <div className="bg-[#FF7A00]/10 border-b border-gray-700/30 px-6 py-3">
                  <h4 className="text-sm font-bold text-[#FF7A00] uppercase tracking-wide">
                    {category.category}
                  </h4>
                </div>
                
                {/* Category Features */}
                {category.items.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex}
                    className="grid grid-cols-4 gap-4 items-center px-6 py-4 border-b border-gray-700/30 hover:bg-[#1a1a2e]/50 transition-colors"
                  >
                    <div className="font-medium text-white">
                      {feature.name}
                    </div>
                    <div className="text-center">
                      {renderFeatureValue(feature.guest, 'guest', feature.name)}
                    </div>
                    <div className="text-center">
                      {renderFeatureValue(feature.trueFan, 'trueFan', feature.name)}
                    </div>
                    <div className="text-center">
                      {renderFeatureValue(feature.whale, 'whale', feature.name)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

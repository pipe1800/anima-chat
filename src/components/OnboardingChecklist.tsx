
import React from 'react';
import { Check } from 'lucide-react';

interface OnboardingChecklistProps {
  currentStep: number;
  isVisible: boolean;
}

const OnboardingChecklist = ({ currentStep, isVisible }: OnboardingChecklistProps) => {
  const steps = [
    'Step 1: Choose Your Vibe',
    'Step 2: Personalize Your Profile', 
    'Step 3: Start Your First Conversation'
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 right-6 z-50 bg-[#1a1a2e]/90 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 min-w-[280px] shadow-2xl">
      <h3 className="text-[#FF7A00] font-bold text-lg mb-3">Your First Quest</h3>
      
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div
              key={index}
              className={`flex items-center space-x-3 transition-all duration-300 ${
                isCurrent ? 'text-[#FF7A00] font-semibold' : 
                isCompleted ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-400 border-green-400' 
                  : isCurrent 
                    ? 'border-[#FF7A00] bg-[#FF7A00]/20' 
                    : 'border-gray-500'
              }`}>
                {isCompleted && <Check className="w-3 h-3 text-white" />}
                {isCurrent && !isCompleted && (
                  <div className="w-2 h-2 bg-[#FF7A00] rounded-full animate-pulse" />
                )}
              </div>
              
              <span className="text-sm">{step}</span>
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-[#FF7A00] to-[#FF7A00]/70 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default OnboardingChecklist;

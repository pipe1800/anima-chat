
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import VibeSelection from '@/components/onboarding/VibeSelection';
import ProfileSetup from '@/components/onboarding/ProfileSetup';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate('/auth');
        } else {
          setUser(session.user);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleVibeSelection = (vibes: string[]) => {
    setSelectedVibes(vibes);
    setCurrentStep(1);
  };

  const handleProfileComplete = () => {
    setCurrentStep(2);
    // Navigate to main app after completing onboarding
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleSkipProfile = () => {
    setCurrentStep(2);
    // Navigate to main app after skipping profile
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] relative">
      {/* Onboarding Checklist */}
      <OnboardingChecklist
        currentStep={currentStep}
        isVisible={true}
      />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {currentStep === 0 && (
          <VibeSelection 
            onNext={handleVibeSelection}
            selectedVibes={selectedVibes}
            setSelectedVibes={setSelectedVibes}
          />
        )}
        
        {currentStep === 1 && (
          <ProfileSetup
            onComplete={handleProfileComplete}
            onSkip={handleSkipProfile}
          />
        )}

        {currentStep === 2 && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Your Journey!
            </h1>
            <p className="text-gray-400 text-lg">
              Redirecting you to start your first conversation...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;

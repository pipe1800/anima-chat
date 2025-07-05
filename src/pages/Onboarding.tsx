
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import VibeSelection from '@/components/onboarding/VibeSelection';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import WelcomeModal from '@/components/WelcomeModal';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Onboarding session check:', session?.user?.email);
      if (session?.user) {
        setUser(session.user);
        // Show welcome modal only once per session
        if (!hasShownWelcome) {
          setShowWelcome(true);
          setHasShownWelcome(true);
        }
      } else {
        // No user, redirect to auth
        navigate('/auth');
      }
      setLoading(false);
    });

    // Then set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Onboarding auth change:', event, session?.user?.email);
        if (session?.user) {
          setUser(session.user);
        } else if (!loading && event !== 'INITIAL_SESSION') {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, loading, hasShownWelcome]);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
  };

  const handleBeginQuest = () => {
    console.log('Begin Quest clicked - closing modal and starting onboarding');
    setShowWelcome(false);
    // Start the onboarding flow immediately
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Redirecting to authentication...</div>
      </div>
    );
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-[#121212] relative">
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeClose}
        username={username}
        onBeginQuest={handleBeginQuest}
      />

      {/* Onboarding Checklist */}
      <OnboardingChecklist
        currentStep={currentStep}
        isVisible={!showWelcome}
      />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {!showWelcome && currentStep === 0 && (
          <VibeSelection 
            onNext={handleVibeSelection}
            selectedVibes={selectedVibes}
            setSelectedVibes={setSelectedVibes}
          />
        )}
        
        {!showWelcome && currentStep === 1 && (
          <ProfileSetup
            onComplete={handleProfileComplete}
            onSkip={handleSkipProfile}
          />
        )}

        {!showWelcome && currentStep === 2 && (
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

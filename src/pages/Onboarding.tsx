import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import VibeSelection from '@/components/onboarding/VibeSelection';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import WelcomeModal from '@/components/WelcomeModal';
import CharacterSelection from '@/components/onboarding/CharacterSelection';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Onboarding session check:', session?.user?.email);
      if (session?.user) {
        setUser(session.user);
        
        // Check if user has completed onboarding
        const isCompleted = session.user.user_metadata?.onboarding_completed;
        console.log('Onboarding completed status:', isCompleted);
        
        if (isCompleted) {
          // User already completed onboarding, redirect to dashboard
          setOnboardingCompleted(true);
          navigate('/dashboard');
        } else {
          // New user, go directly to first onboarding step
          setCurrentStep(0);
        }
      } else {
        // No user, redirect to auth
        navigate('/auth');
      }
      setLoading(false);
    });

    // Then set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Onboarding auth change:', event, session?.user?.email);
        if (session?.user) {
          setUser(session.user);
          
          // Check onboarding status for new sessions
          const isCompleted = session.user.user_metadata?.onboarding_completed;
          if (isCompleted && !onboardingCompleted) {
            navigate('/dashboard');
          }
        } else if (!loading && event !== 'INITIAL_SESSION') {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, loading, onboardingCompleted]);

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
  };

  const handleSkipProfile = () => {
    setCurrentStep(2);
  };

  const handleCharacterSelect = async (character: any) => {
    console.log('Selected character:', character);
    
    // Navigate to chat with selected character - DON'T mark onboarding as completed here
    // Let the chat component handle completion when first message is sent
    navigate('/chat', { state: { selectedCharacter: character } });
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

  // If onboarding is completed, redirect to dashboard
  if (onboardingCompleted) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Redirecting to dashboard...</div>
      </div>
    );
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-[#121212] relative">

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
          <CharacterSelection
            selectedVibes={selectedVibes}
            onCharacterSelect={handleCharacterSelect}
          />
        )}
      </div>
    </div>
  );
};

export default Onboarding;

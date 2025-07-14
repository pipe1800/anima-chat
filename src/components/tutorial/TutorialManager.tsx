import React, { useState, useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { TutorialWelcomeModal } from './TutorialWelcomeModal';
import { TutorialOverlay } from './TutorialOverlay';
import { useAuth } from '@/contexts/AuthContext';

interface TutorialManagerProps {
  shouldStart: boolean;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({ shouldStart }) => {
  const { user } = useAuth();
  const { isActive, startTutorial, skipTutorial } = useTutorial();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (shouldStart && user) {
      // Check if tutorial should be shown
      const chatTutorialCompleted = user.user_metadata?.chat_tutorial_completed;
      const onboardingCompleted = user.user_metadata?.onboarding_completed;
      
      if (onboardingCompleted && !chatTutorialCompleted) {
        setShowWelcomeModal(true);
      }
    }
  }, [shouldStart, user]);

  const handleStartTutorial = () => {
    setShowWelcomeModal(false);
    startTutorial();
  };

  const handleSkipTutorial = () => {
    setShowWelcomeModal(false);
    skipTutorial();
  };

  return (
    <>
      <TutorialWelcomeModal
        isOpen={showWelcomeModal}
        onStart={handleStartTutorial}
        onSkip={handleSkipTutorial}
      />
      
      {isActive && <TutorialOverlay />}
    </>
  );
};
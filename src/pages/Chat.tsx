
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { SidebarProvider } from '@/components/ui/sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import { ChatLayout } from '@/components/chat/ChatLayout';
import OnboardingChecklist from '@/components/OnboardingChecklist';

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedCharacter = location.state?.selectedCharacter;
  const existingChatId = location.state?.existingChatId;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        
        // Check if onboarding is completed
        const isCompleted = session.user.user_metadata?.onboarding_completed;
        console.log('Chat: Onboarding completed status:', isCompleted);
        
        setOnboardingCompleted(!!isCompleted);
        
        // Only show onboarding if it's NOT completed
        if (!isCompleted) {
          setShowOnboarding(true);
        }
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Update onboarding status from the latest session
          const isCompleted = session.user.user_metadata?.onboarding_completed;
          setOnboardingCompleted(!!isCompleted);
          
          // Hide onboarding if completed
          if (isCompleted) {
            setShowOnboarding(false);
          }
        } else if (!loading) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, loading]);

  const handleFirstMessage = async () => {
    if (isFirstMessage && !onboardingCompleted) {
      setIsFirstMessage(false);
      
      // Mark onboarding as completed in user metadata
      if (user) {
        try {
          const { error } = await supabase.auth.updateUser({
            data: { 
              onboarding_completed: true
            }
          });
          
          if (error) {
            console.error('Error updating user metadata:', error);
          } else {
            console.log('Onboarding marked as completed in handleFirstMessage');
            setOnboardingCompleted(true);
            
            // Hide onboarding after completion animation
            setTimeout(() => {
              setShowOnboarding(false);
            }, 3000);
          }
        } catch (error) {
          console.error('Error completing onboarding:', error);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || !selectedCharacter) {
    navigate('/onboarding');
    return null;
  }

  // Map avatar_url to avatar for compatibility
  const character = {
    ...selectedCharacter,
    avatar: selectedCharacter.avatar_url || selectedCharacter.avatar,
    fallback: selectedCharacter.name?.split(' ').map((n: string) => n[0]).join('') || 'C'
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Onboarding Checklist - shows completion animation */}
        {showOnboarding && !onboardingCompleted && (
          <OnboardingChecklist
            currentStep={isFirstMessage ? 2 : 3}
            isVisible={true}
            isCompleting={!isFirstMessage}
          />
        )}

        {/* Main Chat Layout */}
        <ChatLayout character={character} currentChatId={existingChatId}>
          <ChatInterface
            character={character}
            onFirstMessage={handleFirstMessage}
            existingChatId={existingChatId}
          />
        </ChatLayout>
      </div>
    </SidebarProvider>
  );
};

export default Chat;

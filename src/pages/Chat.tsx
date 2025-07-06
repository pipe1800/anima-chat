
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import ChatInterface from '@/components/chat/ChatInterface';
import { ChatLayout } from '@/components/chat/ChatLayout';
import OnboardingChecklist from '@/components/OnboardingChecklist';

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedCharacter = location.state?.selectedCharacter;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/auth');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else if (!loading) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, loading]);

  const handleFirstMessage = () => {
    if (isFirstMessage) {
      setIsFirstMessage(false);
      setTimeout(() => {
        setShowOnboarding(false);
      }, 2000);
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

  return (
    <>
      {/* Onboarding Checklist - shows completion animation */}
      {showOnboarding && (
        <OnboardingChecklist
          currentStep={isFirstMessage ? 2 : 3}
          isVisible={true}
          isCompleting={!isFirstMessage}
        />
      )}

      {/* Main Chat Layout */}
      <ChatLayout character={selectedCharacter}>
        <ChatInterface
          character={selectedCharacter}
          onFirstMessage={handleFirstMessage}
        />
      </ChatLayout>
    </>
  );
};

export default Chat;

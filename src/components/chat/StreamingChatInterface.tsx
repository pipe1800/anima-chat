import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';
import ChatMessages from './ChatMessages';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Character {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  fallback: string;
}

interface StreamingChatInterfaceProps {
  character: Character;
  onFirstMessage: () => void;
  existingChatId?: string;
}

const StreamingChatInterface = ({
  character,
  onFirstMessage,
  existingChatId
}: StreamingChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(existingChatId || null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [creditsBalance, setCreditsBalance] = useState(0);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch credits balance
  useEffect(() => {
    if (!user) return;
    
    const fetchCredits = async () => {
      const { data } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setCreditsBalance(data.balance);
      }
    };
    
    fetchCredits();
  }, [user]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !currentChatId || isStreamingResponse) return;

    if (creditsBalance < 1) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    const messageContent = inputValue;
    setInputValue('');
    setIsStreamingResponse(true);
    setStreamingMessage('');

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Save user message first
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          content: messageContent,
          author_id: user.id,
          is_ai_message: false,
          created_at: new Date().toISOString()
        });

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
        throw new Error('Failed to save user message');
      }

      // Start streaming response
      const session = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('chat-stream', {
        body: {
          chatId: currentChatId,
          message: messageContent,
          characterId: character.id,
        },
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        }
      });

      if (response.error) {
        throw new Error('Failed to start streaming response');
      }

      // Handle streaming response
      const streamResponse = await fetch(`https://rclpyipeytqbamiwcuih.supabase.co/functions/v1/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          chatId: currentChatId,
          message: messageContent,
          characterId: character.id,
        }),
        signal: abortControllerRef.current.signal
      });

      if (!streamResponse.ok) {
        throw new Error('Failed to start streaming response');
      }

      const reader = streamResponse.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  setStreamingMessage(fullResponse);
                }
              } catch (e) {
                console.warn('Failed to parse streaming chunk:', e);
              }
            }
          }
        }
      }

      // Save the complete AI response
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          content: fullResponse,
          author_id: user.id,
          is_ai_message: true,
          created_at: new Date().toISOString()
        });

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError);
      }

      // Update credits balance
      setCreditsBalance(prev => Math.max(0, prev - 1));

      onFirstMessage();
      toast({
        title: "Message sent successfully",
        description: "Response received and saved.",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsStreamingResponse(false);
      setStreamingMessage('');
      abortControllerRef.current = null;
    }
  };

  const handleCloseInsufficientCreditsModal = () => {
    setShowInsufficientCreditsModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={handleCloseInsufficientCreditsModal}
        currentBalance={creditsBalance}
        onUpgrade={() => console.log('Navigate to upgrade')}
      />

      <ChatMessages 
        chatId={currentChatId} 
        character={character}
        trackedContext={{
          moodTracking: 'No context',
          clothingInventory: 'No context',
          locationTracking: 'No context',
          timeAndWeather: 'No context',
          relationshipStatus: 'No context',
          characterPosition: 'No context'
        }}
      />
      
      {/* Streaming message display */}
      {isStreamingResponse && streamingMessage && (
        <div className="px-6 pb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-semibold text-sm">
                {character.name?.[0] || 'AI'}
              </span>
            </div>
            <div className="flex-1">
              <div className="bg-secondary/30 rounded-lg p-3 prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-wrap">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streaming indicator */}
      {isStreamingResponse && (
        <div className="px-6 pb-2">
          <div className="flex items-center space-x-2 text-primary">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm">{character.name} is responding...</span>
          </div>
        </div>
      )}

      <div className="bg-background/95 backdrop-blur-sm border-t border-border p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={`Message ${character.name}...`}
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            disabled={creditsBalance < 1 || isStreamingResponse}
          />
          <Button
            type="submit"
            className="px-6 py-3 rounded-xl transition-all hover:scale-105"
            disabled={!inputValue.trim() || creditsBalance < 1 || isStreamingResponse}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        
        <div className="mt-2 text-center">
          <p className="text-muted-foreground text-xs">
            {creditsBalance.toLocaleString()} credits remaining
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreamingChatInterface;
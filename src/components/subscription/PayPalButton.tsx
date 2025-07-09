import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  planId: string;
  planName: string;
}

// Extend Window interface to include PayPal SDK
declare global {
  interface Window {
    paypal?: {
      Buttons: (config: any) => {
        render: (element: string | HTMLElement) => Promise<void>;
      };
    };
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ planId, planName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const isRenderingRef = useRef(false);
  const isRenderedRef = useRef(false);

  useEffect(() => {
    if (!user || !containerRef.current || isRenderingRef.current || isRenderedRef.current) return;

    const container = containerRef.current;
    
    // Clear any existing content and prevent duplicate renders
    container.innerHTML = '';
    isRenderingRef.current = true;
    
    const renderButton = () => {
      if (!window.paypal || !container || isRenderedRef.current) return;
      
      try {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              'plan_id': planId
            });
          },
          onApprove: async function(data: any, actions: any) {
            try {
              const { error } = await supabase.functions.invoke('save-paypal-subscription', {
                body: { 
                  subscriptionId: data.subscriptionID, 
                  planId: planId 
                }
              });
              
              if (error) {
                toast({ 
                  title: "Subscription Failed", 
                  description: error.message, 
                  variant: "destructive" 
                });
              } else {
                toast({ 
                  title: "Subscription Successful!", 
                  description: `Your account has been upgraded to ${planName}.` 
                });
                window.location.reload();
              }
            } catch (error: any) {
              toast({ 
                title: "Subscription Failed", 
                description: error.message || "An error occurred during subscription.", 
                variant: "destructive" 
              });
            }
          },
          onError: (err: any) => {
            console.error('PayPal button error:', err);
            toast({ 
              title: "PayPal Error", 
              description: "An error occurred. Please try again.", 
              variant: "destructive" 
            });
          }
        }).render(container).then(() => {
          isRenderedRef.current = true;
          isRenderingRef.current = false;
        }).catch((error: any) => {
          console.error('Error rendering PayPal button:', error);
          isRenderingRef.current = false;
        });
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
        isRenderingRef.current = false;
      }
    };

    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      renderButton();
    } else {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (!existingScript) {
        const sdkScript = document.createElement('script');
        sdkScript.src = 'https://www.paypal.com/sdk/js?client-id=AWale7howzdXmRvzPeTAgtC9fbKwPrXnURz85Rk6omnBs7xJevAF75B45WAKF287bYZHQV_a8r6EYtwJ&vault=true&intent=subscription';
        sdkScript.async = true;
        sdkScript.onload = renderButton;
        sdkScript.onerror = () => {
          console.error('Failed to load PayPal SDK');
          isRenderingRef.current = false;
        };
        document.head.appendChild(sdkScript);
      } else {
        // Script exists, wait for it to load
        existingScript.addEventListener('load', renderButton);
      }
    }

    return () => {
      // Cleanup on unmount
      if (container) {
        container.innerHTML = '';
      }
      isRenderingRef.current = false;
      isRenderedRef.current = false;
    };
  }, [user, planId, planName, toast]);

  if (!user) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="w-full"
    />
  );
};

export default PayPalButton;
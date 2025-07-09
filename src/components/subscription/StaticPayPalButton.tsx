import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaticPayPalButtonProps {
  paypalPlanId: string;
}

const StaticPayPalButton: React.FC<StaticPayPalButtonProps> = ({ paypalPlanId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptsLoadedRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const containerId = `paypal-button-container-${paypalPlanId}`;
    
    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      // SDK already loaded, render button directly
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
              'plan_id': paypalPlanId
            });
          },
          onApprove: async function(data: any, actions: any) {
            try {
              const { error } = await supabase.functions.invoke('save-paypal-subscription', {
                body: { 
                  subscriptionID: data.subscriptionID, 
                  planId: paypalPlanId 
                }
              });
              
              if (error) {
                window.dispatchEvent(new CustomEvent('paypal-error', { 
                  detail: error.message 
                }));
              } else {
                window.dispatchEvent(new CustomEvent('paypal-success'));
              }
            } catch (error: any) {
              window.dispatchEvent(new CustomEvent('paypal-error', { 
                detail: error.message 
              }));
            }
          }
        }).render(`#${containerId}`);
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
      }
    } else if (!scriptsLoadedRef.current) {
      // Load SDK first time only
      const sdkScript = document.createElement('script');
      sdkScript.src = 'https://www.paypal.com/sdk/js?client-id=AWale7howzdXmRvzPeTAgtC9fbKwPrXnURz85Rk6omnBs7xJevAF75B45WAKF287bYZHQV_a8r6EYtwJ&vault=true&intent=subscription';
      sdkScript.async = true;
      
      sdkScript.onload = () => {
        scriptsLoadedRef.current = true;
        // Re-trigger the effect to render buttons for all instances
        window.dispatchEvent(new CustomEvent('paypal-sdk-loaded'));
      };
      
      document.head.appendChild(sdkScript);
    }

    // Event listeners for PayPal responses
    const handleSuccess = () => {
      toast({ 
        title: "Subscription Successful!", 
        description: "Your account has been upgraded." 
      });
      window.location.reload();
    };

    const handleError = (event: any) => {
      toast({ 
        title: "Subscription Failed", 
        description: event.detail || "An error occurred during subscription.", 
        variant: "destructive" 
      });
    };

    const handleSdkLoaded = () => {
      // Re-run this effect when SDK loads
      if (window.paypal) {
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
                'plan_id': paypalPlanId
              });
            },
            onApprove: async function(data: any, actions: any) {
              try {
                const { error } = await supabase.functions.invoke('save-paypal-subscription', {
                  body: { 
                    subscriptionID: data.subscriptionID, 
                    planId: paypalPlanId 
                  }
                });
                
                if (error) {
                  window.dispatchEvent(new CustomEvent('paypal-error', { 
                    detail: error.message 
                  }));
                } else {
                  window.dispatchEvent(new CustomEvent('paypal-success'));
                }
              } catch (error: any) {
                window.dispatchEvent(new CustomEvent('paypal-error', { 
                  detail: error.message 
                }));
              }
            }
          }).render(`#${containerId}`);
        } catch (error) {
          console.error('Error rendering PayPal button:', error);
        }
      }
    };

    window.addEventListener('paypal-success', handleSuccess);
    window.addEventListener('paypal-error', handleError);
    window.addEventListener('paypal-sdk-loaded', handleSdkLoaded);

    return () => {
      window.removeEventListener('paypal-success', handleSuccess);
      window.removeEventListener('paypal-error', handleError);
      window.removeEventListener('paypal-sdk-loaded', handleSdkLoaded);
    };
  }, [user, paypalPlanId, toast]);

  if (!user) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      id={`paypal-button-container-${paypalPlanId}`}
      className="w-full"
    />
  );
};

export default StaticPayPalButton;
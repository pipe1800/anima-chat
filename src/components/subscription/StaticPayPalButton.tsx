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
    if (!user || scriptsLoadedRef.current) return;

    const containerId = `paypal-button-container-${paypalPlanId}`;
    
    // First Script (SDK)
    const sdkScript = document.createElement('script');
    sdkScript.src = 'https://www.paypal.com/sdk/js?client-id=AWale7howzdXmRvzPeTAgtC9fbKwPrXnURz85Rk6omnBs7xJevAF75B45WAKF287bYZHQV_a8r6EYtwJ&vault=true&intent=subscription';
    sdkScript.async = true;
    
    sdkScript.onload = () => {
      // Second Script (Button Configuration)
      const buttonScript = document.createElement('script');
      buttonScript.innerHTML = `
        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              'plan_id': '${paypalPlanId}'
            });
          },
          onApprove: async function(data, actions) {
            try {
              const { error } = await supabase.functions.invoke('save-paypal-subscription', {
                body: { 
                  subscriptionID: data.subscriptionID, 
                  planId: '${paypalPlanId}' 
                }
              });
              
              if (error) {
                window.dispatchEvent(new CustomEvent('paypal-error', { 
                  detail: error.message 
                }));
              } else {
                window.dispatchEvent(new CustomEvent('paypal-success'));
              }
            } catch (error) {
              window.dispatchEvent(new CustomEvent('paypal-error', { 
                detail: error.message 
              }));
            }
          }
        }).render('#${containerId}');
      `;
      
      document.body.appendChild(buttonScript);
    };
    
    document.head.appendChild(sdkScript);
    scriptsLoadedRef.current = true;

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

    window.addEventListener('paypal-success', handleSuccess);
    window.addEventListener('paypal-error', handleError);

    return () => {
      window.removeEventListener('paypal-success', handleSuccess);
      window.removeEventListener('paypal-error', handleError);
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
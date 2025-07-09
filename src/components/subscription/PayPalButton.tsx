import React, { useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  paypalPlanId: string;
  planId: string;
  planName: string;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ paypalPlanId, planId, planName }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Clear any existing PayPal SDK scripts that might be in production mode
  useEffect(() => {
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    existingScripts.forEach(script => {
      if (script.getAttribute('src')?.includes('paypal.com/sdk') && !script.getAttribute('src')?.includes('env=sandbox')) {
        console.log('Removing existing PayPal SDK script in production mode');
        script.remove();
      }
    });
    
    // Clear any existing PayPal global objects
    if ((window as any).paypal) {
      console.log('Clearing existing PayPal global object');
      delete (window as any).paypal;
    }
  }, []);

  if (!user) {
    return null;
  }

  const initialOptions = {
    clientId: "AWale7howzdXmRvzPeTAgtC9fbKwPrXnURz85Rk6omnBs7xJevAF75B45WAKF287bYZHQV_a8r6EYtwJ",
    currency: "USD",
    intent: "subscription" as const,
    vault: true,
    environment: "sandbox" as const,
  };

  console.log("PayPal Button initialized with:", { paypalPlanId, planId, planName });
  console.log("PayPal SDK environment:", initialOptions.environment);

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{
          shape: "rect",
          color: "gold",
          layout: "vertical",
          label: "subscribe"
        }}
        createSubscription={(data, actions) => {
          console.log("Creating subscription with PayPal plan ID:", paypalPlanId);
          console.log("Plan name:", planName);
          console.log("PayPal environment check:", (window as any).paypal?.env || 'unknown');
          return actions.subscription.create({
            plan_id: paypalPlanId
          });
        }}
        onApprove={async (data, actions) => {
          try {
            console.log("PayPal subscription approved:", data);
            const { error } = await supabase.functions.invoke('save-paypal-subscription', {
              body: { 
                subscriptionId: data.subscriptionID, 
                planId: planId 
              }
            });
            
            if (error) {
              console.error("Save subscription error:", error);
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
            console.error("Subscription approval error:", error);
            toast({ 
              title: "Subscription Failed", 
              description: error.message || "An error occurred during subscription.", 
              variant: "destructive" 
            });
          }
        }}
        onError={(err) => {
          console.error('PayPal button error:', err);
          console.error('PayPal plan ID used:', paypalPlanId);
          console.error('PayPal environment:', (window as any).paypal?.env || 'unknown');
          toast({ 
            title: "PayPal Error", 
            description: "The subscription plan configuration is incorrect. Please contact support.", 
            variant: "destructive" 
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
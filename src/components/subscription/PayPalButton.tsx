import React from 'react';
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

  if (!user) {
    return null;
  }

  const initialOptions = {
    clientId: "AWale7howzdXmRvzPeTAgtC9fbKwPrXnURz85Rk6omnBs7xJevAF75B45WAKF287bYZHQV_a8r6EYtwJ",
    currency: "USD",
    intent: "subscription" as const,
    vault: true,
    environment: "sandbox" as const, // Use sandbox environment for testing
  };

  console.log("PayPal Button initialized with:", { paypalPlanId, planId, planName });

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
          toast({ 
            title: "PayPal Error", 
            description: "The subscription plan doesn't exist. Please contact support.", 
            variant: "destructive" 
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalSubscribeButtonProps {
  planId: string;
  planName: string;
  onSuccess?: () => void;
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

const PayPalSubscribeButton: React.FC<PayPalSubscribeButtonProps> = ({ planId, planName, onSuccess }) => {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    console.log("Attempting to use PayPal Client ID:", clientId);

    if (!clientId) {
      console.error("VITE_PAYPAL_CLIENT_ID is not defined. Make sure it is set in your environment variables.");
      return;
    }

    const addPayPalScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=subscription&components=buttons`;
      script.async = true;

      script.onload = () => {
        console.log("PayPal SDK script has loaded successfully.");
        setIsSdkReady(true);
      };
      script.onerror = () => {
        console.error("Failed to load the PayPal SDK script.");
      };
      document.body.appendChild(script);
    };

    if (window.paypal) {
      setIsSdkReady(true);
    } else {
      addPayPalScript();
    }
  }, []);

  useEffect(() => {
    if (isSdkReady && paypalRef.current && user) {
      try {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: (data: any, actions: any) => {
            // This needs to map your internal planId to the plan_id from your PayPal dashboard
            let paypalPlanId = '';
            // IMPORTANT: Replace these with your REAL PayPal Plan IDs
            if (planName === 'True Fan') {
              paypalPlanId = 'P-YOUR-TRUE-FAN-PLAN-ID'; 
            } else if (planName === 'The Whale') {
              paypalPlanId = 'P-YOUR-THE-WHALE-PLAN-ID';
            }

            if (!paypalPlanId) {
              console.error("Could not find a PayPal Plan ID for the selected plan:", planName);
              toast({ title: "Configuration Error", description: "Could not find a matching PayPal plan.", variant: "destructive" });
              return;
            }
            
            return actions.subscription.create({
              plan_id: paypalPlanId
            });
          },
          onApprove: async (data: any) => {
            setIsLoading(true);
            toast({ title: "Processing Subscription...", description: "Please wait while we confirm your subscription." });

            const { subscriptionID } = data;
            const { data: responseData, error } = await supabase.functions.invoke('save-paypal-subscription', {
              body: { subscriptionID, planId },
            });

            if (error) {
              toast({ title: "Subscription Failed", description: error.message, variant: "destructive" });
            } else {
              toast({ title: "Subscription Successful!", description: "Your account has been upgraded." });
              if (onSuccess) onSuccess();
            }
            setIsLoading(false);
          },
          onError: (err: any) => {
            console.error("PayPal button error:", err);
            toast({ title: "PayPal Error", description: "An error occurred with the PayPal button.", variant: "destructive" });
          }
        }).render(paypalRef.current);
      } catch (error) {
        console.error("Failed to render PayPal buttons:", error);
      }
    }
  }, [isSdkReady, user, planId, planName, onSuccess, toast]);

  if (!user) {
    return null; // Or a login button
  }

  if (isLoading || !isSdkReady) {
    return <div>Loading PayPal...</div>;
  }

  return <div ref={paypalRef}></div>;
};

export default PayPalSubscribeButton;
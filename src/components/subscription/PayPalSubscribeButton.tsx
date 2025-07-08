import React, { useEffect, useRef, useState } from 'react';
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

const PayPalSubscribeButton: React.FC<PayPalSubscribeButtonProps> = ({
  planId,
  planName,
  onSuccess
}) => {
  console.log("PayPal Client ID:", import.meta.env.VITE_PAYPAL_CLIENT_ID);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);

  // Map database plan IDs to PayPal Plan IDs
  // TODO: Replace these placeholder IDs with actual PayPal Plan IDs from your PayPal Developer Dashboard
  const getPayPalPlanId = (databasePlanId: string): string => {
    switch (databasePlanId) {
      case 'true-fan-plan-id': // Replace with your actual database plan ID
        return 'P-PAYPAL-TRUE-FAN-PLAN-ID'; // Replace with actual PayPal Plan ID
      case 'whale-plan-id': // Replace with your actual database plan ID
        return 'P-PAYPAL-WHALE-PLAN-ID'; // Replace with actual PayPal Plan ID
      default:
        throw new Error(`Unknown plan ID: ${databasePlanId}`);
    }
  };

  useEffect(() => {
    const addPayPalScript = () => {
      console.log("Attempting to load PayPal SDK script...");
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=USD&intent=subscription&components=buttons`;
      script.async = true;

      script.onload = () => {
        console.log("PayPal SDK script LOADED successfully.");
        setIsSdkReady(true);
      };

      script.onerror = () => {
        console.error("ERROR: Failed to load the PayPal SDK script.");
      };

      document.body.appendChild(script);
    };

    if (!window.paypal) {
      console.log("PayPal SDK not found on window object, loading script...");
      addPayPalScript();
    } else {
      console.log("PayPal SDK already found on window object.");
      setIsSdkReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isSdkReady || !window.paypal || !user || !paypalRef.current) {
      console.log("Conditions not met for PayPal button rendering:", {
        isSdkReady,
        hasPaypal: !!window.paypal,
        hasUser: !!user,
        hasRef: !!paypalRef.current
      });
      return;
    }

    console.log("All conditions met, rendering PayPal button...");

    // Clear any existing PayPal buttons
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }

    const paypalButtons = window.paypal.Buttons({
      style: {
        shape: 'rect',
        color: 'blue',
        layout: 'vertical',
        label: 'subscribe'
      },

      createSubscription: async function(data: any, actions: any) {
        try {
          console.log("Creating PayPal subscription...");
          const paypalPlanId = getPayPalPlanId(planId);
          
          return actions.subscription.create({
            plan_id: paypalPlanId,
            subscriber: {
              name: {
                given_name: user.user_metadata?.first_name || '',
                surname: user.user_metadata?.last_name || ''
              },
              email_address: user.email
            }
          });
        } catch (error) {
          console.error('Error creating subscription:', error);
          toast({
            title: "Error",
            description: "Failed to create subscription. Please try again.",
            variant: "destructive"
          });
          throw error;
        }
      },

      onApprove: async function(data: any, actions: any) {
        console.log("PayPal subscription approved:", data);
        setIsLoading(true);
        
        try {
          // Get subscription details from PayPal
          const subscriptionDetails = await actions.subscription.get();
          console.log("PayPal subscription details:", subscriptionDetails);
          
          // Call our backend function to save the subscription
          const { error } = await supabase.functions.invoke('save-paypal-subscription', {
            body: {
              subscriptionId: data.subscriptionID,
              planId: planId,
              paypalSubscriptionDetails: subscriptionDetails
            }
          });

          if (error) {
            throw error;
          }

          console.log("Subscription saved successfully");
          toast({
            title: "Success!",
            description: `Successfully subscribed to ${planName}`,
          });

          // Call success callback if provided
          if (onSuccess) {
            onSuccess();
          }

        } catch (error) {
          console.error('Error saving subscription:', error);
          toast({
            title: "Error",
            description: "Subscription created but failed to save. Please contact support.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      },

      onError: function(err: any) {
        console.error('PayPal error:', err);
        toast({
          title: "Error",
          description: "An error occurred with PayPal. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      },

      onCancel: function(data: any) {
        console.log('PayPal subscription cancelled:', data);
        toast({
          title: "Cancelled",
          description: "Subscription was cancelled.",
        });
        setIsLoading(false);
      }
    });

    // Render the PayPal button
    paypalButtons.render(paypalRef.current).catch((error: any) => {
      console.error('Failed to render PayPal button:', error);
      toast({
        title: "Error",
        description: "Failed to load PayPal button. Please refresh the page.",
        variant: "destructive"
      });
    });

  }, [isSdkReady, planId, planName, user, onSuccess, toast]);

  if (!user) {
    return (
      <div className="text-center text-gray-400">
        Please log in to subscribe
      </div>
    );
  }

  if (!isSdkReady) {
    return (
      <div className="text-center text-gray-400">
        Loading PayPal...
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={paypalRef} className="min-h-[45px]" />
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default PayPalSubscribeButton;
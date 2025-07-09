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
  const [sdkState, setSdkState] = useState({ loading: true, ready: false });
  const [isLoading, setIsLoading] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientIdAndLoadSdk = async () => {
      try {
        const { data: setting, error: fetchError } = await supabase
          .from('public_app_settings')
          .select('setting_value')
          .eq('setting_key', 'PAYPAL_CLIENT_ID')
          .single();

        if (fetchError || !setting?.setting_value) {
          console.error("Failed to fetch PayPal Client ID from database:", fetchError);
          setSdkState({ loading: false, ready: false });
          return;
        }
        
        const clientId = setting.setting_value;

        if (window.paypal) {
          setSdkState({ loading: false, ready: true });
          return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=subscription&components=buttons&vault=true`;
        script.async = true;
        script.onload = () => {
          setSdkState({ loading: false, ready: true });
        };
        script.onerror = () => {
          console.error("Failed to load the PayPal SDK script.");
          setSdkState({ loading: false, ready: false });
        };
        document.body.appendChild(script);

      } catch (error) {
        console.error("An error occurred during SDK setup:", error);
        setSdkState({ loading: false, ready: false });
      }
    };
    
    fetchClientIdAndLoadSdk();
  }, []);

  useEffect(() => {
    if (sdkState.ready && paypalRef.current && user) {
      const container = paypalRef.current;
      
      // Prevent duplicate renders - check if buttons already exist
      if (container.children.length > 0) {
        return;
      }
      
      try {
        // Clear the container before rendering new buttons
        container.innerHTML = '';
        
        window.paypal!.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: (data: any, actions: any) => {
            let paypalPlanId = '';

            // --- Use the REAL PayPal Plan IDs Here ---
            if (planName === 'True Fan') {
              // Replace this with the real ID for your "True Fan" plan
              paypalPlanId = 'P-6VC11234RX254105DNBW33UQ'; 
            } else if (planName === 'The Whale') {
              // This is the real ID for "The Whale" plan
              paypalPlanId = 'P-3K907001WR094711RNBW2YCY';
            }
            // -----------------------------------------

            if (!paypalPlanId || paypalPlanId.includes('P-YOUR-')) {
              console.error("PayPal Plan ID is not configured for:", planName);
              toast({ title: "Configuration Error", description: "This plan is not yet available for purchase.", variant: "destructive" });
              return Promise.reject(new Error("PayPal Plan ID not configured."));
            }
            
            return actions.subscription.create({
              plan_id: paypalPlanId
            });
          },
          onApprove: async (data: any) => {
            setIsLoading(true);
            toast({ title: "Processing Subscription...", description: "Please wait while we confirm your subscription." });

            const { subscriptionID } = data;
            const { error } = await supabase.functions.invoke('save-paypal-subscription', {
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
        }).render(container);
      } catch (error) {
        console.error("Failed to render PayPal buttons:", error);
      }
    }
  }, [sdkState.ready, user, planId, planName]);

  if (!user) {
    return null;
  }

  if (sdkState.loading) {
    return <div>Loading PayPal...</div>;
  }
  
  if (!sdkState.ready) {
      return <div>Could not load PayPal. Please try again later.</div>
  }

  return <div ref={paypalRef} className={isLoading ? 'opacity-50' : ''}></div>;
};

export default PayPalSubscribeButton;
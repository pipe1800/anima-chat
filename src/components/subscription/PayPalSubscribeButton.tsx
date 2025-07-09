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
        close: () => void;
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

  // Effect for loading the PayPal SDK
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
        script.onload = () => setSdkState({ loading: false, ready: true });
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

  // Effect for rendering the PayPal buttons
  useEffect(() => {
    // This variable will hold the button instance
    let paypalButtonsInstance: any;

    if (sdkState.ready && paypalRef.current && user) {
      try {
        paypalButtonsInstance = window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: (data, actions) => {
            let paypalPlanId = '';
            if (planName === 'True Fan') {
              paypalPlanId = 'P-6VC11234RX254105DNBW33UQ'; 
            } else if (planName === 'The Whale') {
              paypalPlanId = 'P-3K907001WR094711RNBW2YCY';
            }

            if (!paypalPlanId) {
              toast({ title: "Configuration Error", variant: "destructive" });
              return Promise.reject(new Error("PayPal Plan ID not configured."));
            }
            
            return actions.subscription.create({ plan_id: paypalPlanId });
          },
          onApprove: async (data) => {
            setIsLoading(true);
            toast({ title: "Processing Subscription..." });
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
          onError: (err) => {
            console.error("PayPal button error:", err);
            toast({ title: "PayPal Error", variant: "destructive" });
          }
        });

        // Render the buttons
        paypalButtonsInstance.render(paypalRef.current);

      } catch (error) {
        console.error("Failed to render PayPal buttons:", error);
      }
    }

    // *** THIS IS THE CLEANUP FUNCTION ***
    return () => {
      if (paypalButtonsInstance) {
        // This will remove the buttons from the DOM when the component unmounts
        paypalButtonsInstance.close();
      }
    };
  }, [sdkState.ready, user, planId, planName]);

  if (sdkState.loading) return <div>Loading PayPal...</div>;
  if (!sdkState.ready) return <div>Could not load PayPal.</div>;
  if (!user) return null;

  return <div ref={paypalRef} className={isLoading ? 'opacity-50 pointer-events-none' : ''}></div>;
};

export default PayPalSubscribeButton;
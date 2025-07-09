import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalSubscribeButtonProps {
  planId: string;
  planName: string;
  onSuccess?: () => void;
}

const PayPalSubscribeButton: React.FC<PayPalSubscribeButtonProps> = ({ planId, planName, onSuccess }) => {
  const [sdkReady, setSdkReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Effect to load the PayPal SDK
  useEffect(() => {
    const fetchClientIdAndLoadSdk = async () => {
      if (window.paypal) {
        setSdkReady(true);
        return;
      }
      try {
        const { data: setting } = await supabase
          .from('public_app_settings')
          .select('setting_value')
          .eq('setting_key', 'PAYPAL_CLIENT_ID')
          .single();
        
        const clientId = setting?.setting_value;
        if (!clientId) {
          console.error("PayPal Client ID not found in database.");
          return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=subscription&components=buttons&vault=true`;
        script.async = true;
        script.onload = () => setSdkReady(true);
        script.onerror = () => console.error("Failed to load the PayPal SDK script.");
        document.body.appendChild(script);
      } catch (error) {
        console.error("Error loading PayPal SDK:", error);
      }
    };

    fetchClientIdAndLoadSdk();
  }, []);

  // Effect to render the PayPal buttons once the SDK is ready
  useEffect(() => {
    if (sdkReady && paypalRef.current && user) {
      // Ensure the container is empty before rendering
      if (paypalRef.current.innerHTML) {
          paypalRef.current.innerHTML = '';
      }

      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: (data, actions) => {
          let paypalPlanId = '';
          // --- Use the REAL PayPal Plan IDs Here ---
          if (planName === 'True Fan') {
            paypalPlanId = 'P-6VC11234RX254105DNBW33UQ';
          } else if (planName === 'The Whale') {
            paypalPlanId = 'P-3K907001WR094711RNBW2YCY';
          }
          // -----------------------------------------

          if (!paypalPlanId) {
            toast({ title: "Configuration Error", description: "This plan is not yet available.", variant: "destructive" });
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
          toast({ title: "PayPal Error", description: "An error occurred. Please try again.", variant: "destructive" });
        }
      }).render(paypalRef.current);
    }
  }, [sdkReady, user, planId, planName]);

  if (!sdkReady) {
    return <div>Loading PayPal...</div>;
  }

  return <div ref={paypalRef} className={isLoading ? 'opacity-50 pointer-events-none' : ''}></div>;
};

export default PayPalSubscribeButton;
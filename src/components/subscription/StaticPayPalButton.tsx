import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface StaticPayPalButtonProps {
  paypalPlanId: string;
}

const StaticPayPalButton: React.FC<StaticPayPalButtonProps> = ({ paypalPlanId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = async () => {
      if (window.paypal) {
        setSdkReady(true);
        return;
      }

      try {
        // Get PayPal client ID from database
        const { data: setting, error } = await supabase
          .from('public_app_settings')
          .select('setting_value')
          .eq('setting_key', 'PAYPAL_CLIENT_ID')
          .single();

        if (error || !setting?.setting_value) {
          console.error('Failed to fetch PayPal Client ID:', error);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${setting.setting_value}&vault=true&intent=subscription&currency=USD&components=buttons`;
        script.async = true;
        script.onload = () => setSdkReady(true);
        script.onerror = () => console.error('Failed to load PayPal SDK');
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading PayPal SDK:', error);
      }
    };

    loadPayPalSDK();
  }, []);

  // Render PayPal buttons
  useEffect(() => {
    let paypalButtonsInstance: any;

    if (sdkReady && containerRef.current && user && paypalPlanId) {
      try {
        // Clear container before rendering
        containerRef.current.innerHTML = '';

        paypalButtonsInstance = window.paypal!.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: (data: any, actions: any) => {
            return actions.subscription.create({
              plan_id: paypalPlanId
            });
          },
          onApprove: async (data: any) => {
            setIsLoading(true);
            try {
              const { error } = await supabase.functions.invoke('save-paypal-subscription', {
                body: { 
                  subscriptionID: data.subscriptionID, 
                  planId: paypalPlanId 
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
                  description: "Your account has been upgraded." 
                });
                window.location.reload();
              }
            } catch (error: any) {
              toast({ 
                title: "Subscription Failed", 
                description: error.message || "An error occurred during subscription.", 
                variant: "destructive" 
              });
            } finally {
              setIsLoading(false);
            }
          },
          onError: (err: any) => {
            console.error('PayPal button error:', err);
            toast({ 
              title: "PayPal Error", 
              description: "An error occurred with PayPal.", 
              variant: "destructive" 
            });
            setIsLoading(false);
          }
        });

        paypalButtonsInstance.render(containerRef.current);
      } catch (error) {
        console.error('Error rendering PayPal button:', error);
      }
    }

    // Cleanup function
    return () => {
      if (paypalButtonsInstance) {
        paypalButtonsInstance.close();
      }
    };
  }, [sdkReady, user, paypalPlanId, toast]);

  if (!user) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
    />
  );
};

export default StaticPayPalButton;
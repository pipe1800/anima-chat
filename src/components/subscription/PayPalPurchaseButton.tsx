import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PayPalPurchaseButtonProps {
  creditPackId: string;
  onSuccess?: () => void;
}


const PayPalPurchaseButton: React.FC<PayPalPurchaseButtonProps> = ({ creditPackId, onSuccess }) => {
  const [sdkState, setSdkState] = useState({ loading: true, ready: false });
  const [isLoading, setIsLoading] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = async () => {
      if ((window as any).paypal) {
        setSdkState({ loading: false, ready: true });
        return;
      }

      try {
        // Get PayPal client ID from public settings
        const { data: settings, error } = await supabase
          .from('public_app_settings')
          .select('setting_value')
          .eq('setting_key', 'PAYPAL_CLIENT_ID')
          .single();

        if (error || !settings) {
          console.error('Failed to fetch PayPal client ID:', error);
          toast({
            title: "Configuration Error",
            description: "PayPal is not properly configured.",
            variant: "destructive",
          });
          return;
        }

        const clientId = settings.setting_value;
        if (!clientId) {
          console.error('PayPal client ID not found');
          return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
        script.async = true;
        script.onload = () => {
          setSdkState({ loading: false, ready: true });
        };
        script.onerror = () => {
          console.error('Failed to load PayPal SDK');
          setSdkState({ loading: false, ready: false });
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading PayPal SDK:', error);
        setSdkState({ loading: false, ready: false });
      }
    };

    loadPayPalSDK();
  }, []);

  // Render PayPal buttons when SDK is ready
  useEffect(() => {
    if (sdkState.ready && (window as any).paypal && paypalRef.current && user) {
      try {
        // Clear the container before rendering new buttons
        paypalRef.current.innerHTML = '';
        
        (window as any).paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'buynow'
          },
          createOrder: async (data: any, actions: any) => {
            try {
              setIsLoading(true);
              
              // Call our edge function to create the PayPal order
              const { data: orderData, error } = await supabase.functions.invoke(
                'create-paypal-order',
                {
                  body: { creditPackId }
                }
              );

              if (error) {
                console.error('Error creating PayPal order:', error);
                toast({
                  title: "Payment Error",
                  description: "Failed to initiate payment. Please try again.",
                  variant: "destructive",
                });
                throw new Error('Failed to create order');
              }

              return orderData.orderID;
            } catch (error) {
              console.error('CreateOrder error:', error);
              setIsLoading(false);
              throw error;
            }
          },
          onApprove: async (data: any, actions: any) => {
            try {
              setIsLoading(true);
              
              // Call our edge function to capture the payment
              const { data: captureData, error } = await supabase.functions.invoke(
                'capture-paypal-order',
                {
                  body: { 
                    orderID: data.orderID,
                    creditPackId: creditPackId
                  }
                }
              );

              if (error) {
                console.error('Error capturing PayPal order:', error);
                toast({
                  title: "Payment Error",
                  description: "Payment approval failed. Please contact support.",
                  variant: "destructive",
                });
                return;
              }

              toast({
                title: "Purchase Successful!",
                description: "Your credits have been added to your account.",
                variant: "default",
              });

              if (onSuccess) {
                onSuccess();
              }
            } catch (error) {
              console.error('OnApprove error:', error);
              toast({
                title: "Payment Error",
                description: "Payment processing failed. Please contact support.",
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
            }
          },
          onError: (err: any) => {
            console.error("PayPal button error:", err);
            toast({ 
              title: "PayPal Error", 
              description: "An error occurred with the PayPal button.", 
              variant: "destructive" 
            });
            setIsLoading(false);
          },
          onCancel: (data: any) => {
            console.log("PayPal payment cancelled:", data);
            toast({
              title: "Payment Cancelled",
              description: "Your payment was cancelled.",
              variant: "default",
            });
            setIsLoading(false);
          }
        }).render(paypalRef.current);
      } catch (error) {
        console.error("Failed to render PayPal buttons:", error);
        toast({
          title: "Button Error",
          description: "Failed to load payment button.",
          variant: "destructive",
        });
      }
    }
  }, [sdkState.ready, user, creditPackId, onSuccess]);

  if (sdkState.loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sdkState.ready) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Failed to load PayPal. Please refresh the page.
      </div>
    );
  }

  return <div ref={paypalRef} className={isLoading ? 'opacity-50' : ''}></div>;
};

export default PayPalPurchaseButton;
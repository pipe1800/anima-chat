import React, { useEffect, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PayPalButtonProps {
  paypalPlanId: string;
  planId: string;
  planName: string;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ paypalPlanId, planId, planName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sdkError, setSdkError] = useState<string | null>(null);

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

  // IMPORTANT: This is a production client ID being used in sandbox mode
  // You need to replace this with your SANDBOX client ID from PayPal Developer Dashboard
  const clientId = "AWale7howzdXmRvzPeTAgtC9fbKwPrXnURz85Rk6omnBs7xJevAF75B45WAKF287bYZHQV_a8r6EYtwJ";

  const initialOptions = {
    clientId: clientId,
    currency: "USD",
    intent: "subscription" as const,
    vault: true,
    environment: "sandbox" as const,
  };

  console.log("PayPal Button initialized with:", { paypalPlanId, planId, planName });
  console.log("PayPal SDK environment:", initialOptions.environment);
  console.log("PayPal Client ID:", clientId);

  // If we detect an SDK error, show instructions
  if (sdkError) {
    return (
      <Alert className="border-red-500 bg-red-50">
        <AlertDescription className="text-red-700">
          <strong>PayPal Configuration Error:</strong> {sdkError}
          <br /><br />
          <strong>To fix this:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Go to <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PayPal Developer Dashboard</a></li>
            <li>Navigate to "My Apps & Credentials"</li>
            <li>Under the <strong>Sandbox</strong> section, find your app</li>
            <li>Copy the <strong>Client ID</strong> from the sandbox app</li>
            <li>Replace the production client ID in the code</li>
          </ol>
          <Button 
            onClick={() => setSdkError(null)} 
            className="mt-3 bg-red-600 hover:bg-red-700"
            size="sm"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

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
          
          // Check if this is a 400 error which typically indicates wrong client ID for environment
          const errorMessage = err?.message || String(err);
          if (typeof errorMessage === 'string' && (errorMessage.includes('400') || errorMessage.includes('Bad Request') || errorMessage.includes('failed to load'))) {
            setSdkError("Failed to load PayPal SDK. You're using a production client ID in sandbox mode. Please use your sandbox client ID instead.");
          } else {
            setSdkError("PayPal button error occurred. Check console for details.");
          }
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
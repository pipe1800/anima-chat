import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const UpgradeVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const query = useQuery();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const finalize = async () => {
      // The subscription_id is now in the URL from PayPal's redirect
      const paypalSubscriptionId = query.get('subscription_id');

      if (!paypalSubscriptionId) {
        setErrorMessage("No subscription ID found in URL. Cannot verify upgrade.");
        setStatus('error');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-upgrade-completion', {
          body: { subscription_id: paypalSubscriptionId },
        });

        if (error) throw new Error(error.message);

        if (data?.success) {
          setStatus('success');
          toast({
            title: "Upgrade Complete!",
            description: "Your plan has been successfully upgraded to The Whale.",
          });
        } else {
          throw new Error(data?.error || "An unknown error occurred during verification.");
        }

      } catch (e) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setErrorMessage(message);
        setStatus('error');
        toast({
          title: "Upgrade Failed",
          description: message,
          variant: "destructive",
        });
      }
    };

    finalize();
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#FF7A00]" />
            <p className="mt-4 text-white">Finalizing your upgrade...</p>
            <p className="text-gray-400">Please do not close this window.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <p className="mt-4 text-white text-xl font-bold">Upgrade Successful!</p>
            <p className="text-gray-300">Your plan has been upgraded to The Whale. You can now enjoy your new benefits.</p>
            <Button
              onClick={() => navigate('/settings?tab=billing')}
              className="mt-6 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
            >
              Back to Billing
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-12 h-12 mx-auto text-red-500" />
            <p className="mt-4 text-white text-xl font-bold">Upgrade Failed</p>
            <p className="text-gray-300 bg-gray-800/50 p-2 rounded-md my-2">{errorMessage}</p>
            <Button
              onClick={() => navigate('/settings?tab=billing')}
              className="mt-6"
              variant="outline"
            >
              Back to Billing
            </Button>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-12">
        <Card className="bg-[#1a1a2e] border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-center text-white">Upgrade Verification</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UpgradeVerification;
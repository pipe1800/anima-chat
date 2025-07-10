import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const UpgradeVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your upgrade payment...');

  useEffect(() => {
    const verifyUpgrade = async () => {
      const token = searchParams.get('token');
      const subscriptionId = searchParams.get('subscription_id');
      const targetPlanId = searchParams.get('target_plan_id');
      const payerId = searchParams.get('PayerID');
      
      console.log('Upgrade verification parameters:', {
        token,
        subscription_id: subscriptionId,
        target_plan_id: targetPlanId,
        PayerID: payerId,
        all_params: Object.fromEntries(searchParams.entries())
      });

      if (!token || !subscriptionId || !targetPlanId) {
        setStatus('error');
        setMessage('Missing verification parameters. Please try the upgrade again.');
        return;
      }

      try {
        console.log('Calling verify-upgrade-payment function with:', {
          orderId: token,
          subscriptionId,
          targetPlanId
        });

        const response = await fetch(`https://rclpyipeytqbamiwcuih.supabase.co/functions/v1/verify-upgrade-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            orderId: token,
            subscriptionId,
            targetPlanId
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP Error:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Function response:', data);

        if (data.error) {
          console.error('Function returned error:', data.error);
          throw new Error(data.error);
        }

        if (data?.success) {
          setStatus('success');
          setMessage(`Upgrade successful! You've been upgraded to ${data.newPlan} and received ${data.creditsAdded.toLocaleString()} additional credits.`);
          
          // Redirect to settings after 3 seconds
          setTimeout(() => {
            navigate('/settings?tab=billing');
          }, 3000);
        } else {
          throw new Error('Upgrade verification failed');
        }
      } catch (error) {
        console.error('Upgrade verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to verify upgrade payment');
      }
    };

    verifyUpgrade();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0B1426] flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-[#FF7A00] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Processing Upgrade</h2>
            <p className="text-gray-300">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade Complete!</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <p className="text-sm text-gray-400">Redirecting you to billing settings...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade Failed</h2>
            <p className="text-gray-300 mb-4">{message}</p>
            <button
              onClick={() => navigate('/settings?tab=billing')}
              className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Billing Settings
            </button>
          </>
        )}
      </div>
    </div>
  );
};
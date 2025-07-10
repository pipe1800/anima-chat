import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Loader2, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getActivePlans, getUserActiveSubscription } from '@/lib/supabase-queries';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  monthly_credits_allowance: number;
  features: any;
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  status: string;
  current_period_end: string;
  paypal_subscription_id: string;
  plan: Plan;
}

export const BillingSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const fetchSubscriptionData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user's active subscription
      const subRes = await getUserActiveSubscription(user.id);
      if (subRes.error) {
        console.error('Error fetching subscription:', subRes.error);
      } else {
        setUserSubscription(subRes.data);
      }

      // Fetch available plans
      const plansRes = await getActivePlans();
      if (plansRes.error) {
        console.error('Error fetching plans:', plansRes.error);
      } else {
        setAvailablePlans(plansRes.data || []);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  const handleUpgrade = async () => {
    setIsChangingPlan(true); // We can reuse this state for loading indication
    try {
      const { data, error } = await supabase.functions.invoke('create-upgrade-order');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.approvalUrl) {
        // Redirect the user to PayPal to approve the one-time payment
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("Could not get PayPal approval URL.");
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Error",
        description: "Failed to start the upgrade process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPlan(false);
    }
  };


  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription');

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled successfully.",
        });
        // Refresh the subscription data
        await fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      toast({
        title: "Error", 
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const renderPaymentMethod = () => {
    return (
      <div className="flex items-center">
        <div className="w-6 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center">
          <span className="text-white text-xs font-bold">PP</span>
        </div>
        <div>
          <p className="text-white">PayPal</p>
          <p className="text-gray-400 text-sm">Connected account</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF7A00]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Billing Settings</h2>
        <p className="text-gray-300">Manage your subscription and payment information</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
          
          {userSubscription ? (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {userSubscription.plan.name === 'The Whale' ? (
                    <Crown className="w-6 h-6 text-[#FF7A00]" />
                  ) : (
                    <Zap className="w-6 h-6 text-[#FF7A00]" />
                  )}
                  <div>
                    <h4 className="text-white font-medium">{userSubscription.plan.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {userSubscription.plan.monthly_credits_allowance.toLocaleString()} credits/month
                    </p>
                  </div>
                </div>
                <Badge className={`${userSubscription.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                  {userSubscription.status === 'active' ? 'Active' : userSubscription.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  Next billing date: {formatDate(userSubscription.current_period_end)}
                </span>
                <span className="text-white font-semibold">
                  ${userSubscription.plan.price_monthly}/month
                </span>
              </div>

              {/* Show upgrade button only if the current plan is 'True Fan' */}
              {userSubscription.plan.name === 'True Fan' && (
                <>
                  <Separator className="bg-gray-700 my-4" />
                  <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-orange-200">Upgrade to The Whale</h5>
                      <p className="text-sm text-orange-300">Get 17,000 more credits instantly for a one-time payment of $10.00.</p>
                    </div>
                    <Button
                      onClick={handleUpgrade}
                      disabled={isChangingPlan}
                      className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
                    >
                      {isChangingPlan ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Upgrade Now'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-medium">Guest Pass (Free)</h4>
                  <p className="text-gray-400 text-sm">Limited features</p>
                </div>
                <Badge className="bg-gray-600 text-white">Free</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">No active subscription</span>
                <span className="text-white font-semibold">$0/month</span>
              </div>
            </div>
          )}

          {userSubscription && userSubscription.status === 'active' && (
            <div className="mt-4 flex gap-3">
              {/* Upgrade Plan Button for True Fan users */}
              {userSubscription.plan.name === 'True Fan' && (
                <Button 
                  onClick={handleUpgrade}
                  disabled={isChangingPlan}
                  className="bg-[#FF7A00] hover:bg-[#FF7A00]/80 text-white"
                >
                  {isChangingPlan ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade to The Whale'
                  )}
                </Button>
              )}
              
              {/* Cancel Subscription Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#1a1a2e] border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Are you sure you want to cancel your subscription? You'll continue to have access to your plan features 
                      until {formatDate(userSubscription.current_period_end)}, but your subscription will not renew.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-600 text-white hover:bg-gray-800">
                      Keep Subscription
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelSubscription}
                      disabled={isCancelling}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        'Yes, Cancel Subscription'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <Separator className="bg-gray-700" />

        {/* Payment Method */}
        {userSubscription && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
            <div className="bg-gray-800/50 rounded-lg p-4">
              {renderPaymentMethod()}
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Payment method is managed through PayPal. To update your payment method, 
              please visit your PayPal account settings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

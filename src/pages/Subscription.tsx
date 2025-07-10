import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  getActivePlans, 
  getActiveModels, 
  getActiveCreditPacks,
  getUserActiveSubscription 
} from '@/lib/supabase-queries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  monthly_credits_allowance: number;
  features: any;
  is_active: boolean;
}

interface Model {
  id: string;
  tier_name: string;
  credit_multiplier: number;
  is_nsfw_compatible: boolean;
  description: string;
  min_plan: {
    name: string;
    price_monthly: number;
  } | null;
}

interface CreditPack {
  id: string;
  name: string;
  price: number;
  credits_granted: number;
  description: string;
}

interface UserSubscription {
  id: string;
  status: string;
  plan: Plan;
  paypal_subscription_id: string | null;
}

const Subscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, modelsRes, creditPacksRes] = await Promise.all([
          getActivePlans(),
          getActiveModels(),
          getActiveCreditPacks()
        ]);

        if (plansRes.error) throw plansRes.error;
        if (modelsRes.error) throw modelsRes.error;
        if (creditPacksRes.error) throw creditPacksRes.error;


        setPlans(plansRes.data || []);
        setModels(modelsRes.data || []);
        setCreditPacks(creditPacksRes.data || []);

        // Fetch user subscription if authenticated
        if (user) {
          const subRes = await getUserActiveSubscription(user.id);
          if (subRes.error) {
            console.error('Error fetching subscription:', subRes.error);
          } else {
            setUserSubscription(subRes.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const openPaymentPopup = (url: string, paymentType: 'paypal' | 'card' = 'paypal') => {
    setPaymentPopupOpen(true);
    
    // Add payment type parameter to help PayPal show appropriate interface
    const modifiedUrl = paymentType === 'card' ? `${url}&commit=true&intent=capture` : url;
    
    const popup = window.open(
      modifiedUrl,
      'paypal-payment',
      'width=500,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,directories=no,status=no'
    );

    // Check if popup is closed to hide overlay
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        setPaymentPopupOpen(false);
        clearInterval(checkClosed);
        // Refresh page to check for payment success
        window.location.reload();
      }
    }, 1000);

    return popup;
  };

  const handleSubscribe = async (planName: string, paymentType: 'paypal' | 'card' = 'paypal') => {
    try {
      const plan = plans.find(p => p.name === planName);
      if (!plan) {
        toast({
          title: "Error",
          description: "Plan not found",
          variant: "destructive"
        });
        return;
      }

      // Check if this is an upgrade (user has active subscription and target plan is more expensive)
      const isUpgrade = userSubscription && 
                       userSubscription.plan && 
                       plan.price_monthly > (userSubscription.plan.price_monthly || 0);

      console.log('Subscription attempt:', {
        currentPlan: userSubscription?.plan?.name,
        targetPlan: planName,
        isUpgrade,
        hasSubscription: !!userSubscription,
        paymentType
      });

      if (isUpgrade) {
        // Use upgrade flow for price difference
        const { data, error } = await supabase.functions.invoke('upgrade-subscription', {
          body: { targetPlanId: plan.id }
        });

        if (error) {
          console.error('PayPal upgrade error:', error);
          toast({
            title: "Error",
            description: "Failed to create upgrade payment",
            variant: "destructive"
          });
          return;
        }

        // Open PayPal payment URL for the difference
        if (data?.approvalUrl) {
          openPaymentPopup(data.approvalUrl, paymentType);
          toast({
            title: "Upgrade Payment",
            description: `Pay $${data.priceDifference} to upgrade and receive ${data.creditDifference.toLocaleString()} additional credits immediately.`,
          });
        }
      } else {
        // Use regular subscription flow for new subscriptions or downgrades
        const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
          body: { planId: plan.id }
        });

        if (error) {
          console.error('PayPal subscription error:', error);
          toast({
            title: "Error",
            description: "Failed to create subscription",
            variant: "destructive"
          });
          return;
        }

        // Open PayPal approval URL in popup
        if (data?.approvalUrl) {
          openPaymentPopup(data.approvalUrl, paymentType);
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF7A00]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Payment Popup Overlay */}
      {paymentPopupOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#1a1a2e] border border-gray-700 rounded-lg p-6 max-w-md mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-[#FF7A00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-[#FF7A00]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Payment Window Opened
              </h3>
              <p className="text-gray-400 text-sm">
                A secure PayPal payment window has opened. Please complete your payment in that window to continue.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              If you don't see the payment window, check if it was blocked by your browser's popup blocker.
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Unlock Your AI's True Potential
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose a plan to get a massive pool of credits, access to superior AI models, and powerful features.
          </p>
        </div>

        {/* Subscription Tier Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.length === 0 ? (
            <div className="col-span-3 text-center text-white">
              <p>No subscription plans available at the moment.</p>
            </div>
          ) : (
            plans.map((plan) => {
              const isPopular = plan.name === 'True Fan';
              const isPremium = plan.name === 'The Whale';
              const isFree = plan.price_monthly === 0;
              // If user has no subscription and this is Guest Pass, or if their subscription matches this plan
              const isCurrentPlan = (!userSubscription && isFree) || userSubscription?.plan?.name === plan.name;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`bg-[#1a1a2e] border-gray-700/50 relative overflow-hidden h-full flex flex-col ${
                    isPopular ? 'ring-2 ring-[#FF7A00]' : ''
                  } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                >
                  {isPopular && !isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-[#FF7A00] text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Popular
                      </div>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Current Plan
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      {isPremium ? <Crown className="w-6 h-6 text-[#FF7A00]" /> : <Zap className="w-6 h-6 text-[#FF7A00]" />}
                      {plan.name}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-[#FF7A00]">
                        {isFree ? 'Free' : `$${plan.price_monthly}`}
                        {!isFree && <span className="text-lg text-gray-400 font-normal">/month</span>}
                      </div>
                      <div className="text-lg text-gray-300">
                        {plan.monthly_credits_allowance.toLocaleString()} Credits
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    {/* Features List */}
                    <div className="flex-1">
                      {plan.features?.features && Array.isArray(plan.features.features) && (
                        <div className="space-y-2">
                          {plan.features.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#FF7A00] rounded-full flex-shrink-0"></div>
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      {isCurrentPlan ? (
                        // Current plan - show disabled button
                        <Button 
                          className="w-full py-3 bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600"
                          disabled={true}
                        >
                          Current Plan
                        </Button>
                      ) : userSubscription ? (
                        // User has active subscription, show upgrade/change plan buttons with payment options
                        <div className="space-y-3">
                          {plan.price_monthly > (userSubscription.plan.price_monthly || 0) ? (
                            // Upgrade case - guest checkout available for one-time payment
                            <>
                              <div className="text-sm text-gray-400 text-center mb-2">
                                Upgrade with:
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                <Button 
                                  onClick={() => handleSubscribe(plan.name, 'paypal')}
                                  className="w-full py-2 bg-[#0070ba] hover:bg-[#005ea6] text-white text-sm"
                                >
                                  Pay with PayPal
                                </Button>
                                <Button 
                                  onClick={() => handleSubscribe(plan.name, 'card')}
                                  className="w-full py-2 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white text-sm"
                                >
                                  Pay with Credit/Debit Card
                                </Button>
                              </div>
                              <div className="text-xs text-gray-500 text-center mt-2">
                                Credit/debit payment available for upgrades
                              </div>
                            </>
                          ) : (
                            // Downgrade case - only PayPal subscription available
                            <>
                              <div className="text-sm text-gray-400 text-center mb-2">
                                Change plan (requires PayPal account):
                              </div>
                              <Button 
                                onClick={() => handleSubscribe(plan.name, 'paypal')}
                                className="w-full py-2 bg-[#0070ba] hover:bg-[#005ea6] text-white text-sm"
                              >
                                Change via PayPal
                              </Button>
                              <div className="text-xs text-gray-500 text-center mt-2">
                                Subscription changes require PayPal account
                              </div>
                            </>
                          )}
                        </div>
                      ) : isFree ? (
                        // Free plan for unsubscribed users - show current plan
                        <Button 
                          className="w-full py-3 bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600"
                          disabled={true}
                        >
                          Current Plan
                        </Button>
                      ) : (
                        // User has no active subscription, show subscribe buttons (requires PayPal for recurring)
                        <div className="space-y-3">
                          <div className="text-sm text-gray-400 text-center mb-2">
                            Subscribe (requires PayPal account):
                          </div>
                          <Button 
                            onClick={() => handleSubscribe(plan.name, 'paypal')}
                            className="w-full py-2 bg-[#0070ba] hover:bg-[#005ea6] text-white text-sm"
                          >
                            Subscribe via PayPal
                          </Button>
                          <div className="text-xs text-gray-500 text-center mt-2">
                            Recurring subscriptions require PayPal account
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
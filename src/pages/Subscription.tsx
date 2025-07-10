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
  const [isUpgrading, setIsUpgrading] = useState(false);

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

  const handleSubscriptionAction = async (targetPlan: Plan) => {
    try {
      setIsUpgrading(true);

      let response;
      
      // Check if user has an active subscription and if it's the specific upgrade case
      if (userSubscription && userSubscription.plan.name === 'True Fan' && targetPlan.name === 'The Whale') {
        // True Fan upgrading to The Whale - use initiate-upgrade like in BillingSettings
        response = await supabase.functions.invoke('initiate-upgrade');
      } else if (!userSubscription) {
        // Guest user - create new subscription
        response = await supabase.functions.invoke('create-paypal-subscription', {
          body: { planId: targetPlan.id }
        });
      } else {
        // Invalid action
        toast({
          title: "Error",
          description: "Invalid subscription action",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = response;

      if (error) {
        console.error('Subscription action error:', error);
        toast({
          title: "Error",
          description: "Failed to process subscription action",
          variant: "destructive"
        });
        return;
      }

      // Redirect to PayPal approval URL
      if (data?.approvalUrl || (data?.success && data?.approvalUrl)) {
        window.location.href = data.approvalUrl;
      }
    } catch (error) {
      console.error('Subscription action error:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription action",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
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
            (() => {
              const currentPlan = userSubscription?.plan?.name;
              let plansToShow = [];

              if (!userSubscription) {
                // Guest Pass - show Guest plan and all paid plans
                plansToShow = plans;
              } else if (currentPlan === 'True Fan') {
                // True Fan - show current plan and The Whale upgrade option
                plansToShow = plans.filter(plan => plan.name === 'True Fan' || plan.name === 'The Whale');
              } else if (currentPlan === 'The Whale') {
                // The Whale - show only current plan
                plansToShow = plans.filter(plan => plan.name === 'The Whale');
              }

              return plansToShow.map((plan) => {
                const isPopular = plan.name === 'True Fan';
                const isPremium = plan.name === 'The Whale';
                const isFree = plan.price_monthly === 0;
                const isCurrentPlan = (!userSubscription && isFree) || userSubscription?.plan?.name === plan.name;
                const canUpgrade = currentPlan === 'True Fan' && plan.name === 'The Whale';
                
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
                        ) : canUpgrade ? (
                          // User can upgrade to this plan (True Fan → The Whale)
                          <Button 
                            onClick={() => handleSubscriptionAction(plan)}
                            className="w-full py-3 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
                            disabled={isUpgrading}
                          >
                            {isUpgrading ? 'Processing...' : 'Upgrade Plan'}
                          </Button>
                        ) : !userSubscription && !isFree ? (
                          // User has no subscription, show subscribe button for paid plans
                          <Button 
                            onClick={() => handleSubscriptionAction(plan)}
                            className="w-full py-3 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
                            disabled={isUpgrading}
                          >
                            {isUpgrading ? 'Processing...' : 'Subscribe'}
                          </Button>
                        ) : (
                          // Fallback disabled button for free plan or invalid states
                          <Button 
                            className="w-full py-3 bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600"
                            disabled={true}
                          >
                            {isFree ? 'Current Plan' : 'Subscribe'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
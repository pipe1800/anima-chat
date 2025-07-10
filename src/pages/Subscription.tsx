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

  const handleSubscribe = async (planName: string) => {
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

      // Use regular subscription flow
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

      // Open PayPal approval URL in new tab
      if (data?.approvalUrl) {
        window.open(data.approvalUrl, '_blank');
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
                        // User has active subscription, show subscribe button
                        <Button 
                          onClick={() => handleSubscribe(plan.name)}
                          className="w-full py-3 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
                        >
                          Subscribe
                        </Button>
                      ) : isFree ? (
                        // Free plan for unsubscribed users - show current plan
                        <Button 
                          className="w-full py-3 bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600"
                          disabled={true}
                        >
                          Current Plan
                        </Button>
                      ) : (
                        // User has no active subscription, show subscribe button for paid plans
                        <Button 
                          onClick={() => handleSubscribe(plan.name)}
                          className="w-full py-3 bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
                        >
                          Subscribe
                        </Button>
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
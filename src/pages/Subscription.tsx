import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getActivePlans, 
  getActiveModels, 
  getActiveCreditPacks,
  getUserActiveSubscription 
} from '@/lib/supabase-queries';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Zap, Star, Check, Info, Calculator } from 'lucide-react';
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

  const handleSubscribe = (planName: string) => {
    toast({
      title: "Coming Soon",
      description: `${planName} subscription will be available soon!`,
    });
  };

  const handlePurchaseCreditPack = (packName: string) => {
    toast({
      title: "Coming Soon",
      description: `${packName} purchase will be available soon!`,
    });
  };

  const calculateMessages = (credits: number, multiplier: number = 1) => {
    // Assuming ~12 credits per message with Fast & Fun model
    return Math.floor(credits / (12 * multiplier));
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-[#121212]">
          <AppSidebar />
          <main className="flex-1 overflow-auto ml-64">
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF7A00]"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#121212]">
        <AppSidebar />
        <main className="flex-1 overflow-auto ml-64">
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

            {/* Subscription Tiers */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`bg-[#1a1a2e] border-gray-700/50 relative overflow-hidden ${
                    plan.name === 'Pro' ? 'ring-2 ring-[#FF7A00]' : ''
                  }`}
                >
                  {plan.name === 'Pro' && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#FF7A00] text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      {plan.name === 'Premium' ? <Zap className="w-6 h-6 text-[#FF7A00]" /> : <Star className="w-6 h-6 text-[#FF7A00]" />}
                      {plan.name}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-[#FF7A00]">
                        ${plan.price_monthly}
                        <span className="text-lg text-gray-400 font-normal">/month</span>
                      </div>
                      <div className="text-lg text-gray-300">
                        {plan.monthly_credits_allowance.toLocaleString()} Credits/month
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {plan.features?.features?.map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={() => handleSubscribe(plan.name)}
                      className={`w-full ${
                        plan.name === 'Pro' 
                          ? 'bg-[#FF7A00] hover:bg-[#FF7A00]/90' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      } text-white py-3`}
                      disabled={userSubscription?.plan?.name === plan.name}
                    >
                      {userSubscription?.plan?.name === plan.name ? 'Current Plan' : `Subscribe to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Message Estimator Table */}
            <Card className="bg-[#1a1a2e] border-gray-700/50 mb-16">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#FF7A00]" />
                  How Many Messages Do I Get?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 text-white font-semibold">Plan</th>
                        <th className="text-left py-3 text-white font-semibold">Monthly Credits</th>
                        <th className="text-left py-3 text-white font-semibold">Estimated Messages*</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((plan) => (
                        <tr key={plan.id} className="border-b border-gray-800/50">
                          <td className="py-4 text-white font-medium">{plan.name}</td>
                          <td className="py-4 text-gray-300">{plan.monthly_credits_allowance.toLocaleString()} credits</td>
                          <td className="py-4 text-[#FF7A00] font-semibold">
                            Up to {calculateMessages(plan.monthly_credits_allowance).toLocaleString()} messages/month
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    *Estimates based on standard model usage. Your total may vary based on model choice and add-ons.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Model Comparison Table */}
            <Card className="bg-[#1a1a2e] border-gray-700/50 mb-16">
              <CardHeader>
                <CardTitle className="text-white">AI Model Tiers</CardTitle>
                <p className="text-gray-400">Different models consume different amounts of credits</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 text-white font-semibold">Model Tier</th>
                        <th className="text-left py-3 text-white font-semibold">Description</th>
                        <th className="text-left py-3 text-white font-semibold">Credit Multiplier</th>
                        <th className="text-left py-3 text-white font-semibold">Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((model) => (
                        <tr key={model.id} className="border-b border-gray-800/50">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{model.tier_name}</span>
                              {model.is_nsfw_compatible && (
                                <Badge variant="outline" className="text-xs border-red-500 text-red-400">
                                  18+
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-gray-300 max-w-xs">{model.description}</td>
                          <td className="py-4">
                            <span className="text-[#FF7A00] font-semibold">{model.credit_multiplier}x</span>
                          </td>
                          <td className="py-4">
                            <span className="text-gray-300">
                              {model.min_plan ? `${model.min_plan.name}+` : 'All Plans'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Credit Packs Section - Only show if user has subscription */}
            {userSubscription && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Need More Credits?</h2>
                  <p className="text-gray-400">Top up your account with additional credit packs</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {creditPacks.map((pack) => (
                    <Card key={pack.id} className="bg-[#1a1a2e] border-gray-700/50">
                      <CardHeader>
                        <CardTitle className="text-white">{pack.name}</CardTitle>
                        <div className="text-2xl font-bold text-[#FF7A00]">
                          ${pack.price}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-lg text-gray-300">
                            {pack.credits_granted.toLocaleString()} Credits
                          </div>
                          <p className="text-gray-400 text-sm">{pack.description}</p>
                        </div>
                        
                        <Button 
                          onClick={() => handlePurchaseCreditPack(pack.name)}
                          className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white"
                        >
                          Purchase {pack.name}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Subscription;
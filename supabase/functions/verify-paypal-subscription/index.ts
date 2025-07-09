import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { subscriptionId, token: paypalToken } = await req.json();
    logStep("Received parameters", { subscriptionId, paypalToken });
    
    if (!subscriptionId && !paypalToken) {
      throw new Error("Either subscription ID or PayPal token is required");
    }

    // Get PayPal access token
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    const paypalBaseUrl = "https://api-m.sandbox.paypal.com"; // Sandbox URL
    
    // Get access token
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const tokenData = await tokenResponse.json();
    logStep("PayPal access token obtained");

    // If we have a subscription ID, verify it directly
    // If we only have a token, we need to find the subscription
    let subscription;
    
    if (subscriptionId) {
      // Get subscription details from PayPal using subscription ID
      const subscriptionResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.text();
        logStep("PayPal subscription fetch failed", { error: errorData });
        throw new Error(`Failed to get PayPal subscription: ${errorData}`);
      }

      subscription = await subscriptionResponse.json();
    } else if (paypalToken) {
      // If we only have a token, we need to search for recent subscriptions for this user
      // This is a fallback method when subscription_id is not provided in the return URL
      logStep("Attempting to find subscription by user email since no subscription ID provided");
      
      // Search for subscriptions by user email (last 10 subscriptions)
      const searchResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions?start_time=${new Date(Date.now() - 60*60*1000).toISOString()}&page_size=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json'
        }
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        // Find the most recent active subscription for this user
        subscription = searchData.subscriptions?.find((sub: any) => 
          sub.subscriber?.email_address?.toLowerCase() === user.email?.toLowerCase() && 
          sub.status === 'ACTIVE'
        );
        
        if (!subscription) {
          throw new Error("Could not find an active subscription for your email address");
        }
      } else {
        throw new Error("Failed to search for subscription");
      }
    }
    
    logStep("PayPal subscription verified", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      planId: subscription.plan_id,
      subscriberEmail: subscription.subscriber?.email_address,
      fullSubscriptionObject: subscription // Temporary: log full object to debug
    });

    // Find the plan in our database using the PayPal plan ID
    // PayPal returns plan_id in the subscription object
    const paypalPlanId = subscription.plan_id;
    logStep("Looking up plan by PayPal plan ID", { paypalPlanId });
    
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('paypal_subscription_id', paypalPlanId)
      .maybeSingle();

    if (planError) {
      logStep("Database error when looking up plan", { error: planError });
      throw new Error(`Database error when looking up plan: ${planError.message}`);
    }

    if (!plan) {
      logStep("Plan not found", { paypalPlanId, availablePlans: { guestPass: 'Guest Pass', trueFan: 'P-6FV20741XD451732ENBXH6WY', theWhale: 'P-70K46447GU478721BNBXH5PA' }});
      throw new Error(`Plan not found for PayPal plan ID: ${paypalPlanId}. Please contact support.`);
    }

    logStep("Plan found in database", { planName: plan.name, planId: plan.id });

    // Calculate current period end
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // SAFEGUARD: Deactivate any existing active subscriptions to prevent multiple active subscriptions
    logStep("Checking for existing active subscriptions");
    const { data: existingActiveSubscriptions, error: fetchError } = await supabaseClient
      .from('subscriptions')
      .select('id, paypal_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (fetchError) {
      logStep("Error fetching existing subscriptions", { error: fetchError });
      throw new Error(`Failed to check existing subscriptions: ${fetchError.message}`);
    }

    if (existingActiveSubscriptions && existingActiveSubscriptions.length > 0) {
      logStep("Found existing active subscriptions, deactivating them", { count: existingActiveSubscriptions.length });
      
      // Deactivate all existing active subscriptions
      const { error: deactivateError } = await supabaseClient
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (deactivateError) {
        logStep("Error deactivating existing subscriptions", { error: deactivateError });
        throw new Error(`Failed to deactivate existing subscriptions: ${deactivateError.message}`);
      }
      
      logStep("Successfully deactivated existing active subscriptions");
    }

    // Create new subscription (always insert after deactivating existing ones)
    const { error: insertError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: subscription.status === 'ACTIVE' ? 'active' : subscription.status.toLowerCase(),
        paypal_subscription_id: subscription.id,
        current_period_end: currentPeriodEnd.toISOString()
      });

    if (insertError) {
      throw new Error(`Failed to create subscription: ${insertError.message}`);
    }
    logStep("New subscription created successfully");

    return new Response(JSON.stringify({ 
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: plan
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
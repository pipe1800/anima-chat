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

    const { subscriptionId } = await req.json();
    if (!subscriptionId) throw new Error("Subscription ID is required");

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

    // Get subscription details from PayPal
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

    const subscription = await subscriptionResponse.json();
    logStep("PayPal subscription fetched", { 
      subscriptionId: subscription.id, 
      status: subscription.status,
      planId: subscription.plan_id 
    });

    // Find the plan in our database using the PayPal plan ID
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('paypal_subscription_id', subscription.plan_id)
      .single();

    if (planError || !plan) {
      throw new Error(`Plan not found for PayPal plan ID: ${subscription.plan_id}`);
    }

    logStep("Plan found in database", { planName: plan.name, planId: plan.id });

    // Calculate current period end
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Save or update subscription in our database
    const { data: existingSubscription } = await supabaseClient
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          plan_id: plan.id,
          status: subscription.status === 'ACTIVE' ? 'active' : subscription.status.toLowerCase(),
          paypal_subscription_id: subscription.id,
          current_period_end: currentPeriodEnd.toISOString()
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }
      logStep("Subscription updated");
    } else {
      // Create new subscription
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
      logStep("Subscription created");
    }

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
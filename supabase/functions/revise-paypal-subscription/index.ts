import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[REVISE-PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify required environment variables
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    logStep("Environment variables verified");

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body = await req.json();
    const { subscriptionId, newPlanId } = body;

    if (!subscriptionId || !newPlanId) {
      throw new Error("Missing required fields: subscriptionId and newPlanId");
    }

    logStep("Request data received", { subscriptionId, newPlanId });

    // Get PayPal access token
    const tokenResponse = await fetch("https://api.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get PayPal access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    logStep("PayPal access token obtained");

    // Get current user subscription to find current plan
    const { data: currentSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        paypal_subscription_id,
        plan:plans (
          id,
          name,
          monthly_credits_allowance
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subError || !currentSubscription) {
      throw new Error("No active subscription found for user");
    }

    logStep("Current subscription found", { 
      currentPlanId: currentSubscription.plan_id,
      currentPlanName: currentSubscription.plan?.name 
    });

    // Get new plan details
    const { data: newPlan, error: newPlanError } = await supabase
      .from('plans')
      .select('id, name, monthly_credits_allowance')
      .eq('id', newPlanId)
      .maybeSingle();

    if (newPlanError || !newPlan) {
      throw new Error(`New plan not found: ${newPlanId}`);
    }

    logStep("New plan details retrieved", { 
      newPlanName: newPlan.name, 
      newCredits: newPlan.monthly_credits_allowance 
    });

    // Map our plan IDs to PayPal plan IDs
    const planIdMapping: { [key: string]: string } = {
      // You'll need to update these with your actual plan IDs from the database
      'true-fan-plan-id': 'P-6VC11234RX254105DNBW33UQ',
      'the-whale-plan-id': 'P-3K907001WR094711RNBW2YCY'
    };

    // Find the PayPal plan ID for the new plan
    let paypalPlanId = '';
    if (newPlan.name === 'True Fan') {
      paypalPlanId = 'P-6FV20741XD451732ENBXH6WY';
    } else if (newPlan.name === 'The Whale') {
      paypalPlanId = 'P-70K46447GU478721BNBXH5PA';
    } else {
      throw new Error(`No PayPal plan ID mapping found for plan: ${newPlan.name}`);
    }

    logStep("PayPal plan ID mapped", { paypalPlanId });

    // Call PayPal's revise subscription API
    const reviseResponse = await fetch(
      `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/revise`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          plan_id: paypalPlanId,
          plan_change_effective_time: "IMMEDIATE"
        }),
      }
    );

    if (!reviseResponse.ok) {
      const errorText = await reviseResponse.text();
      throw new Error(`Failed to revise PayPal subscription: ${reviseResponse.status} - ${errorText}`);
    }

    logStep("PayPal subscription revised successfully");

    // Update our database - change the plan_id
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_id: newPlanId,
      })
      .eq('id', currentSubscription.id);

    if (updateError) {
      throw new Error(`Failed to update subscription in database: ${updateError.message}`);
    }

    logStep("Subscription updated in database");

    // Calculate credit difference and update user's balance
    const currentCredits = currentSubscription.plan?.monthly_credits_allowance || 0;
    const newCredits = newPlan.monthly_credits_allowance;
    const creditDifference = newCredits - currentCredits;

    logStep("Credit calculation", { 
      currentCredits, 
      newCredits, 
      creditDifference 
    });

    if (creditDifference !== 0) {
      // Get current user credit balance
      const { data: userCredits, error: creditsError } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creditsError) {
        throw new Error(`Failed to fetch user credits: ${creditsError.message}`);
      }

      const newBalance = (userCredits?.balance || 0) + creditDifference;

      // Update credit balance
      const { error: updateCreditsError } = await supabase
        .from('credits')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateCreditsError) {
        throw new Error(`Failed to update credits: ${updateCreditsError.message}`);
      }

      logStep("Credits updated", { 
        previousBalance: userCredits?.balance || 0,
        creditDifference,
        newBalance 
      });
    }

    // Return success response
    const responseData = {
      success: true,
      message: "Subscription revised successfully",
      subscription: {
        id: subscriptionId,
        old_plan: currentSubscription.plan?.name,
        new_plan: newPlan.name,
        credit_difference: creditDifference
      }
    };

    logStep("Function completed successfully", responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
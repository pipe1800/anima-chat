import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

// Credit amounts
const CREDIT_AMOUNTS = {
  'True Fan': 15000,
  'The Whale': 32000
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-UPGRADE-PAYMENT] ${step}${detailsStr}`);
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
    
    logStep("User authenticated", { userId: user.id });

    const { orderId, subscriptionId, targetPlanId } = await req.json();
    if (!orderId || !subscriptionId || !targetPlanId) {
      throw new Error("Missing required parameters");
    }

    // Get PayPal access token
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    const paypalBaseUrl = "https://api-m.sandbox.paypal.com";
    
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

    // Capture the PayPal order
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!captureResponse.ok) {
      const errorData = await captureResponse.text();
      logStep("PayPal capture failed", { error: errorData });
      throw new Error(`Failed to capture PayPal payment: ${errorData}`);
    }

    const captureData = await captureResponse.json();
    
    if (captureData.status !== 'COMPLETED') {
      throw new Error("Payment capture not completed");
    }

    logStep("PayPal payment captured successfully", { orderId, status: captureData.status });

    // Get current subscription and target plan
    const { data: currentSub, error: subError } = await supabaseClient
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (subError || !currentSub) {
      throw new Error("Subscription not found");
    }

    const { data: targetPlan, error: targetPlanError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', targetPlanId)
      .single();

    if (targetPlanError || !targetPlan) {
      throw new Error("Target plan not found");
    }

    const currentPlanName = currentSub.plan.name;
    const targetPlanName = targetPlan.name;

    // Calculate credit difference
    const currentCredits = CREDIT_AMOUNTS[currentPlanName as keyof typeof CREDIT_AMOUNTS];
    const targetCredits = CREDIT_AMOUNTS[targetPlanName as keyof typeof CREDIT_AMOUNTS];
    const creditDifference = targetCredits - currentCredits;

    logStep("Credit difference calculated", { 
      currentCredits, 
      targetCredits, 
      difference: creditDifference 
    });

    // Add credits to user's account
    logStep("Adding credits to user account", { creditDifference });
    
    // First get current balance
    const { data: currentCredits, error: getCurrentError } = await supabaseClient
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    if (getCurrentError) {
      logStep("Failed to get current credits", { error: getCurrentError });
      throw new Error(`Failed to get current credits: ${getCurrentError.message}`);
    }
    
    const newBalance = currentCredits.balance + creditDifference;
    logStep("Calculated new balance", { currentBalance: currentCredits.balance, newBalance });
    
    const { error: creditError } = await supabaseClient
      .from('credits')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    if (creditError) {
      logStep("Credit update failed", { error: creditError });
      throw new Error(`Failed to update credits: ${creditError.message}`);
    }
    
    logStep("Credits updated successfully", { newBalance });

    // Update the subscription plan
    const { error: subscriptionUpdateError } = await supabaseClient
      .from('subscriptions')
      .update({ plan_id: targetPlanId })
      .eq('id', subscriptionId);

    if (subscriptionUpdateError) {
      throw new Error(`Failed to update subscription: ${subscriptionUpdateError.message}`);
    }

    // Revise PayPal subscription for next billing cycle
    if (currentSub.paypal_subscription_id && targetPlan.paypal_subscription_id) {
      logStep("Attempting to revise PayPal subscription", { 
        currentSubscriptionId: currentSub.paypal_subscription_id,
        targetPlanId: targetPlan.paypal_subscription_id 
      });

      // First, get the current subscription details from PayPal
      const getSubResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${currentSub.paypal_subscription_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/json'
        }
      });

      if (getSubResponse.ok) {
        const currentSubDetails = await getSubResponse.json();
        logStep("Current PayPal subscription details", { 
          status: currentSubDetails.status,
          plan_id: currentSubDetails.plan_id 
        });
      }

      // Try the revision API
      const revisionData = {
        plan_id: targetPlan.paypal_subscription_id,
        effective_time: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
        revision_type: "REPLACE"
      };

      logStep("Sending revision request", { revisionData });

      const reviseResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${currentSub.paypal_subscription_id}/revise`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(revisionData)
      });

      logStep("PayPal revision response", { 
        status: reviseResponse.status,
        statusText: reviseResponse.statusText 
      });

      if (!reviseResponse.ok) {
        const errorData = await reviseResponse.text();
        logStep("PayPal subscription revision failed", { 
          error: errorData,
          revisionData,
          status: reviseResponse.status 
        });
        
        // Try alternative approach: suspend current and activate new
        logStep("Attempting alternative approach: suspend and reactivate");
        
        try {
          // Suspend current subscription
          const suspendResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${currentSub.paypal_subscription_id}/suspend`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: "Plan upgrade" })
          });

          if (suspendResponse.ok) {
            logStep("Successfully suspended current subscription");
            
            // Note: In a real scenario, you'd need to create a new subscription
            // For now, just log that manual intervention is needed
            logStep("MANUAL INTERVENTION NEEDED: Create new subscription with plan", { 
              targetPlanId: targetPlan.paypal_subscription_id 
            });
          } else {
            const suspendError = await suspendResponse.text();
            logStep("Failed to suspend subscription", { error: suspendError });
          }
        } catch (altError) {
          logStep("Alternative approach failed", { error: altError });
        }
      } else {
        const revisionResult = await reviseResponse.json();
        logStep("PayPal subscription revised successfully", { result: revisionResult });
      }
    } else {
      logStep("PayPal subscription revision skipped", { 
        hasCurrentSubscriptionId: !!currentSub.paypal_subscription_id,
        hasTargetPlanId: !!targetPlan.paypal_subscription_id 
      });
    }

    logStep("Upgrade completed successfully", { 
      subscriptionId, 
      newPlan: targetPlanName,
      creditsAdded: creditDifference 
    });

    return new Response(JSON.stringify({ 
      success: true,
      newPlan: targetPlanName,
      creditsAdded: creditDifference
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
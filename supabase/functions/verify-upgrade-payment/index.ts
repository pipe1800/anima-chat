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
    
    logStep("PayPal credentials check", { 
      hasClientId: !!clientId, 
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0
    });
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    // If PayPal credentials exist, continue with full PayPal integration...
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
    const currentCredits = CREDIT_AMOUNTS[currentPlanName as keyof typeof CREDIT_AMOUNTS] || 0;
    const targetCredits = CREDIT_AMOUNTS[targetPlanName as keyof typeof CREDIT_AMOUNTS] || 0;
    const creditDifference = targetCredits - currentCredits;

    logStep("Credit difference calculated", { 
      currentCredits, 
      targetCredits, 
      difference: creditDifference 
    });

    // Add credits to user's account
    if (creditDifference > 0) {
      const { data: currentCreditsData, error: getCurrentError } = await supabaseClient
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      
      if (getCurrentError) {
        logStep("Failed to get current credits", { error: getCurrentError });
        throw new Error(`Failed to get current credits: ${getCurrentError.message}`);
      }
      
      const newBalance = currentCreditsData.balance + creditDifference;
      logStep("Calculated new balance", { currentBalance: currentCreditsData.balance, newBalance });
      
      const { error: creditError } = await supabaseClient
        .from('credits')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (creditError) {
        logStep("Credit update failed", { error: creditError });
        throw new Error(`Failed to update credits: ${creditError.message}`);
      }
      
      logStep("Credits updated successfully", { newBalance });
    }

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

      const revisionData = {
        plan_id: targetPlan.paypal_subscription_id
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

      if (reviseResponse.ok) {
        const revisionResult = await reviseResponse.json();
        logStep("PayPal subscription revision initiated", { result: revisionResult });
        
        // Look for approval link in HATEOAS links
        const approvalLink = revisionResult.links?.find((link: any) => link.rel === 'approve');
        if (approvalLink) {
          logStep("PayPal approval link found", { approvalUrl: approvalLink.href });
          
          // Store the approval URL in the response so the frontend can redirect the user
          return new Response(JSON.stringify({ 
            success: true,
            newPlan: targetPlanName,
            creditsAdded: creditDifference,
            paypalApprovalRequired: true,
            paypalApprovalUrl: approvalLink.href,
            message: "Upgrade successful! Please approve the PayPal subscription change to complete the process."
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          logStep("No approval link found in PayPal response");
        }
      } else {
        const errorData = await reviseResponse.text();
        logStep("PayPal subscription revision failed", { 
          error: errorData,
          revisionData,
          status: reviseResponse.status 
        });
        
        // Don't fail the entire upgrade if PayPal revision fails
        logStep("Continuing with upgrade despite PayPal revision failure");
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FINALIZE-UPGRADE] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) throw new Error("PayPal Order ID is required.");
    logStep("Function started", { orderId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("User not authenticated.");
    }
    logStep("User authenticated", { userId: user.id });

    // 1. Get PayPal API access token
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalBaseUrl = "https://api-m.sandbox.paypal.com";

    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    if (!tokenResponse.ok) throw new Error("Failed to get PayPal access token.");
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    logStep("PayPal token obtained");

    // 2. Capture the payment for the one-time order
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    });

    if (!captureResponse.ok) {
        const errorText = await captureResponse.text();
        logStep("Payment capture failed", { error: errorText });
        throw new Error("Failed to capture upgrade payment.");
    }
    logStep("Payment captured successfully");

    // --- Payment successful, now update everything ---

    // 3. Get current subscription and target plan details
    const { data: currentSub, error: subError } = await supabaseClient.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single();
    const { data: whalePlan, error: planError } = await supabaseClient.from('plans').select('*').eq('name', 'The Whale').single();

    if (subError || planError || !currentSub || !whalePlan) {
        logStep("DB query failed", { subError: subError?.message, planError: planError?.message });
        throw new Error("Could not find current subscription or target plan details.");
    }
    logStep("Fetched subscription and plan details from DB");

    // 4. Update the subscription in your database to 'The Whale'
    await supabaseClient.from('subscriptions').update({ plan_id: whalePlan.id }).eq('id', currentSub.id);
    logStep("Updated user's plan in DB");

    // 5. Add the credit difference
    const creditDifference = 17000; // The Whale (32000) - True Fan (15000)
    const { data: credits } = await supabaseClient.from('credits').select('balance').eq('user_id', user.id).single();
    await supabaseClient.from('credits').update({ balance: (credits?.balance || 0) + creditDifference }).eq('user_id', user.id);
    logStep("Added credits to user's account");

    // 6. Revise the recurring subscription on PayPal
    if (currentSub.paypal_subscription_id && whalePlan.paypal_subscription_id) {
        const reviseResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${currentSub.paypal_subscription_id}/revise`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan_id: whalePlan.paypal_subscription_id })
        });

        if (!reviseResponse.ok) {
            // CRITICAL: Log this error for manual admin review.
            // The user has paid and is upgraded in our system, so we must honor it.
            const errorText = await reviseResponse.text();
            logStep("URGENT: PAYPAL REVISE FAILED", { subId: currentSub.paypal_subscription_id, error: errorText });
        } else {
            logStep("Successfully revised PayPal recurring subscription.");
        }
    } else {
        logStep("WARNING: Missing PayPal ID(s), could not revise subscription on PayPal's side.");
    }

    return new Response(JSON.stringify({ success: true, message: "Upgrade successful!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    logStep("FATAL ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
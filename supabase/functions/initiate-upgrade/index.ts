// supabase/functions/initiate-upgrade/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("User not authenticated.");

    // 1. Get the user's current subscription and the target plan from DB
    const { data: currentSub } = await supabaseClient.from('subscriptions').select('*, plans(*)').eq('user_id', user.id).eq('status', 'active').single();
    const { data: whalePlan } = await supabaseClient.from('plans').select('*').eq('name', 'The Whale').single();

    if (currentSub?.plans?.name !== 'True Fan' || !whalePlan) {
      throw new Error("User is not eligible for this upgrade or target plan not found.");
    }
    if (!currentSub.paypal_subscription_id || !whalePlan.paypal_subscription_id) {
        throw new Error("Missing PayPal ID for current subscription or target plan.");
    }

    // 2. Get PayPal API access token
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalBaseUrl = "https://api-m.sandbox.paypal.com";
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 3. Call PayPal's 'revise' endpoint. This is the key step.
    const siteUrl = Deno.env.get("SITE_URL");
    const returnUrl = new URL('/upgrade-verification', siteUrl);
    const cancelUrl = new URL('/settings?tab=billing', siteUrl);

    const reviseResponse = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${currentSub.paypal_subscription_id}/revise`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            plan_id: whalePlan.paypal_subscription_id,
            application_context: {
                return_url: returnUrl.href,
                cancel_url: cancelUrl.href
            }
        })
    });

    if (!reviseResponse.ok) {
        const errorText = await reviseResponse.text();
        throw new Error(`PayPal revision failed: ${errorText}`);
    }

    const reviseData = await reviseResponse.json();
    const approvalLink = reviseData.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalLink) {
      throw new Error("Could not get PayPal approval link for plan change.");
    }

    // 4. Return the approval link to the frontend
    return new Response(JSON.stringify({ approvalUrl: approvalLink }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
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
    const { subscriptionId } = body;

    if (!subscriptionId) {
      throw new Error("Missing required field: subscriptionId");
    }

    logStep("Request data received", { subscriptionId });

    // Verify that the user owns this subscription
    const { data: userSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, paypal_subscription_id, status')
      .eq('user_id', user.id)
      .eq('paypal_subscription_id', subscriptionId)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      throw new Error(`Error verifying subscription ownership: ${subError.message}`);
    }

    if (!userSubscription) {
      throw new Error("No active subscription found for this user with the provided subscription ID");
    }

    logStep("Subscription ownership verified", { 
      subscriptionDbId: userSubscription.id,
      status: userSubscription.status 
    });

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

    // Call PayPal's cancel subscription API
    const cancelResponse = await fetch(
      `https://api.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          reason: "Cancelled by user"
        }),
      }
    );

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text();
      throw new Error(`Failed to cancel PayPal subscription: ${cancelResponse.status} - ${errorText}`);
    }

    logStep("PayPal subscription cancelled successfully");

    // Return success response
    // Note: The database update will be handled by the PayPal webhook
    // when it receives the BILLING.SUBSCRIPTION.CANCELLED event
    const responseData = {
      success: true,
      message: "Subscription cancelled successfully",
      subscription: {
        id: subscriptionId,
        status: "cancellation_initiated"
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
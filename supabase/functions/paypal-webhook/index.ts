import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paypal-cert-url, paypal-auth-algo, paypal-transmission-id, paypal-cert-id, paypal-transmission-sig, paypal-transmission-time',
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method, url: req.url });

    // Verify required environment variables
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalWebhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!paypalClientId || !paypalClientSecret || !paypalWebhookId) {
      throw new Error("PayPal credentials not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    logStep("Environment variables verified");

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get webhook headers for signature verification
    const certUrl = req.headers.get("paypal-cert-url");
    const authAlgo = req.headers.get("paypal-auth-algo");
    const transmissionId = req.headers.get("paypal-transmission-id");
    const certId = req.headers.get("paypal-cert-id");
    const transmissionSig = req.headers.get("paypal-transmission-sig");
    const transmissionTime = req.headers.get("paypal-transmission-time");

    if (!certUrl || !authAlgo || !transmissionId || !certId || !transmissionSig || !transmissionTime) {
      throw new Error("Missing required PayPal webhook headers");
    }

    logStep("PayPal headers extracted", { 
      certId, 
      transmissionId, 
      authAlgo,
      transmissionTime 
    });

    // Get the raw request body
    const rawBody = await req.text();
    const webhookEvent = JSON.parse(rawBody);

    logStep("Webhook event parsed", { 
      eventType: webhookEvent.event_type,
      resourceType: webhookEvent.resource_type 
    });

    // Get PayPal access token for webhook verification
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

    // Verify webhook signature
    const verificationPayload = {
      auth_algo: authAlgo,
      cert_id: certId,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: paypalWebhookId,
      webhook_event: webhookEvent
    };

    const verificationResponse = await fetch("https://api.paypal.com/v1/notifications/verify-webhook-signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verificationPayload),
    });

    if (!verificationResponse.ok) {
      throw new Error(`Webhook verification failed: ${verificationResponse.status}`);
    }

    const verificationResult = await verificationResponse.json();
    if (verificationResult.verification_status !== "SUCCESS") {
      throw new Error(`Webhook signature verification failed: ${verificationResult.verification_status}`);
    }

    logStep("Webhook signature verified successfully");

    // Handle different event types
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.RENEWED":
      case "PAYMENT.SALE.COMPLETED":
        await handleSubscriptionRenewal(supabase, resource, eventType);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancellation(supabase, resource);
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspension(supabase, resource);
        break;

      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivation(supabase, resource);
        break;

      default:
        logStep("Unhandled event type", { eventType });
        break;
    }

    logStep("Webhook processed successfully");

    // Always return 200 OK to PayPal
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    // Still return 200 to PayPal to prevent retries for non-recoverable errors
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});

async function handleSubscriptionRenewal(supabase: any, resource: any, eventType: string) {
  logStep("Handling subscription renewal", { eventType, resourceId: resource.id });

  let subscriptionId: string;
  
  // Get subscription ID from different resource types
  if (eventType === "PAYMENT.SALE.COMPLETED") {
    subscriptionId = resource.billing_agreement_id;
  } else {
    subscriptionId = resource.id;
  }

  if (!subscriptionId) {
    throw new Error("Could not extract subscription ID from resource");
  }

  // Find the subscription in our database
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select(`
      id,
      user_id,
      plan:plans(
        id,
        name,
        monthly_credits_allowance
      )
    `)
    .eq('paypal_subscription_id', subscriptionId)
    .eq('status', 'active')
    .single();

  if (subError) {
    throw new Error(`Failed to find subscription: ${subError.message}`);
  }

  if (!subscription) {
    logStep("Subscription not found in database", { subscriptionId });
    return;
  }

  logStep("Subscription found", { 
    userId: subscription.user_id,
    planName: subscription.plan.name,
    creditsToAdd: subscription.plan.monthly_credits_allowance 
  });

  // Update user's credit balance
  const { data: currentCredits, error: creditsError } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', subscription.user_id)
    .single();

  if (creditsError) {
    throw new Error(`Failed to fetch current credits: ${creditsError.message}`);
  }

  const newBalance = (currentCredits?.balance || 0) + subscription.plan.monthly_credits_allowance;

  const { error: updateCreditsError } = await supabase
    .from('credits')
    .update({ balance: newBalance })
    .eq('user_id', subscription.user_id);

  if (updateCreditsError) {
    throw new Error(`Failed to update credits: ${updateCreditsError.message}`);
  }

  // Update subscription period end
  const { error: updateSubError } = await supabase
    .from('subscriptions')
    .update({
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', subscription.id);

  if (updateSubError) {
    logStep("Warning: Failed to update subscription period", { error: updateSubError.message });
  }

  logStep("Subscription renewal processed", { 
    userId: subscription.user_id,
    creditsAdded: subscription.plan.monthly_credits_allowance,
    newBalance 
  });
}

async function handleSubscriptionCancellation(supabase: any, resource: any) {
  logStep("Handling subscription cancellation", { subscriptionId: resource.id });

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('paypal_subscription_id', resource.id)
    .single();

  if (subError) {
    throw new Error(`Failed to find subscription for cancellation: ${subError.message}`);
  }

  if (!subscription) {
    logStep("Subscription not found for cancellation", { subscriptionId: resource.id });
    return;
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('id', subscription.id);

  if (updateError) {
    throw new Error(`Failed to update subscription status to canceled: ${updateError.message}`);
  }

  logStep("Subscription canceled", { userId: subscription.user_id });
}

async function handleSubscriptionSuspension(supabase: any, resource: any) {
  logStep("Handling subscription suspension", { subscriptionId: resource.id });

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('paypal_subscription_id', resource.id)
    .single();

  if (subError) {
    throw new Error(`Failed to find subscription for suspension: ${subError.message}`);
  }

  if (!subscription) {
    logStep("Subscription not found for suspension", { subscriptionId: resource.id });
    return;
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('id', subscription.id);

  if (updateError) {
    throw new Error(`Failed to update subscription status to past_due: ${updateError.message}`);
  }

  logStep("Subscription suspended", { userId: subscription.user_id });
}

async function handleSubscriptionActivation(supabase: any, resource: any) {
  logStep("Handling subscription activation", { subscriptionId: resource.id });

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('paypal_subscription_id', resource.id)
    .single();

  if (subError) {
    throw new Error(`Failed to find subscription for activation: ${subError.message}`);
  }

  if (!subscription) {
    logStep("Subscription not found for activation", { subscriptionId: resource.id });
    return;
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ 
      status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .eq('id', subscription.id);

  if (updateError) {
    throw new Error(`Failed to update subscription status to active: ${updateError.message}`);
  }

  logStep("Subscription activated", { userId: subscription.user_id });
}
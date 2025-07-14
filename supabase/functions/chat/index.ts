import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Internal constants
const modelTiers = {
  'Guest Pass': ['google/gemma-7b-it'],
  'True Fan': ['google/gemma-7b-it', 'mythomax/mythomax-l2-13b'],
  'Whale': ['google/gemma-7b-it', 'mythomax/mythomax-l2-13b', 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo']
};

const modelCreditCost = {
  'google/gemma-7b-it': 10,
  'mythomax/mythomax-l2-13b': 4,
  'nousresearch/nous-hermes-2-mixtral-8x7b-dpo': 7
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user and get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { model, messages, stream = true } = await req.json();

    console.log(`Processing chat request for user: ${user.id}, model: ${model}`);

    // Get user's subscription and plan
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans!inner(name, monthly_credits_allowance)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Default to Guest Pass if no active subscription
    const userPlan = subscription?.plans?.name || 'Guest Pass';
    console.log(`User plan: ${userPlan}`);

    // Check if user is allowed to use this model
    const allowedModels = modelTiers[userPlan] || modelTiers['Guest Pass'];
    if (!allowedModels.includes(model)) {
      return new Response(JSON.stringify({ 
        error: `Model ${model} not available for ${userPlan} plan. Available models: ${allowedModels.join(', ')}` 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get credit cost for this model
    const creditCost = modelCreditCost[model];
    if (!creditCost) {
      return new Response(JSON.stringify({ error: 'Unknown model' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check user's credit balance
    const { data: credits, error: creditsError } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (creditsError || !credits) {
      return new Response(JSON.stringify({ error: 'Failed to check credit balance' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (credits.balance < creditCost) {
      return new Response(JSON.stringify({ 
        error: `Insufficient credits. Required: ${creditCost}, Available: ${credits.balance}` 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`User has ${credits.balance} credits, model costs ${creditCost}`);

    // Make request to OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
        'X-Title': 'AnimaChat'
      },
      body: JSON.stringify({
        model,
        messages,
        stream
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorText);
      return new Response(JSON.stringify({ error: 'OpenRouter API error', details: errorText }), {
        status: openRouterResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Deduct credits after successful API call
    const { error: deductError } = await supabase
      .from('credits')
      .update({ balance: credits.balance - creditCost })
      .eq('user_id', user.id);

    if (deductError) {
      console.error('Failed to deduct credits:', deductError);
      // Note: We don't return an error here as the API call was successful
      // The credits deduction failure should be logged for manual review
    } else {
      console.log(`Successfully deducted ${creditCost} credits from user ${user.id}`);
    }

    // Stream the response back to the client
    if (stream) {
      return new Response(openRouterResponse.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    } else {
      const data = await openRouterResponse.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
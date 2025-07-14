import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

// Define standard CORS headers
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using user's Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Fetch the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Determine the user's plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plans(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const userPlan = subscription?.plans?.name || 'Guest Pass';
    console.log(`User plan: ${userPlan}`);

    // Parse the incoming request body
    const { model, messages, chat_id } = await req.json();

    if (!model || !messages || !chat_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields: model, messages, chat_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user has access to the requested model
    const allowedModels = modelTiers[userPlan] || modelTiers['Guest Pass'];
    if (!allowedModels.includes(model)) {
      return new Response(JSON.stringify({ 
        error: `Model ${model} not available for ${userPlan} plan. Available models: ${allowedModels.join(', ')}` 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase admin client for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Credit check (pre-request)
    const { data: credits, error: creditsError } = await supabaseAdmin
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

    const costPerMessage = modelCreditCost[model];
    if (credits.balance < costPerMessage) {
      return new Response(JSON.stringify({ 
        error: `Insufficient credits. Required: ${costPerMessage}, Available: ${credits.balance}` 
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`User has ${credits.balance} credits, model costs ${costPerMessage}`);

    // Streaming proxy to OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
        'X-Title': 'AnimaChat'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true
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

    // Variables to store usage data
    let prompt_tokens = 0;
    let completion_tokens = 0;

    // Create a TransformStream to intercept the data chunks
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Convert chunk to string
        const chunkStr = new TextDecoder().decode(chunk);
        
        // Parse each line for SSE data
        const lines = chunkStr.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              // Stream is complete
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              // Check if this chunk contains usage data
              if (parsed.usage) {
                prompt_tokens = parsed.usage.prompt_tokens || 0;
                completion_tokens = parsed.usage.completion_tokens || 0;
                console.log(`Usage data: prompt_tokens=${prompt_tokens}, completion_tokens=${completion_tokens}`);
              }
            } catch (e) {
              // Not valid JSON, continue
            }
          }
        }
        
        // Pass the original chunk through to the client
        controller.enqueue(chunk);
      },
      
      flush() {
        // Stream is complete, perform credit deduction
        if (prompt_tokens > 0 || completion_tokens > 0) {
          const totalTokens = prompt_tokens + completion_tokens;
          const totalCost = Math.ceil(totalTokens / 1000) * costPerMessage;
          
          console.log(`Deducting ${totalCost} credits for ${totalTokens} tokens`);
          
          // Update user's credit balance
          supabaseAdmin
            .from('credits')
            .update({ balance: credits.balance - totalCost })
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Failed to deduct credits:', error);
              } else {
                console.log(`Successfully deducted ${totalCost} credits from user ${user.id}`);
              }
            });
        }
      }
    });

    // Pipe the OpenRouter response through our transform stream
    const readable = openRouterResponse.body!.pipeThrough(transformStream);

    // Return the transformed stream to the client
    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
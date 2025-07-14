import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Chat function called');

  try {
    // Create Supabase client using user's Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
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
      console.error('Authentication failed:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    // Parse the incoming request body
    const { model, messages, chat_id, character_id } = await req.json();

    if (!model || !messages || !chat_id || !character_id) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields: model, messages, chat_id, character_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing chat request for chat: ${chat_id}, character: ${character_id}`);

    // Get OpenRouter API key
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      console.error('OpenRouter API key not configured');
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create Supabase admin client for character data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch Character Definition
    const { data: character, error: characterError } = await supabaseAdmin
      .from('character_definitions')
      .select('personality_summary, description, scenario')
      .eq('character_id', character_id)
      .single();

    if (characterError) {
      console.error('Character definition error:', characterError);
      return new Response(JSON.stringify({ error: 'Character definition not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Character definition found');

    // Construct the System Prompt
    const systemPrompt = `You are to roleplay as the character defined below. Stay in character and respond naturally.

**Character Description:**
${character.description || 'A helpful assistant'}

**Personality Summary:**
${character.personality_summary || 'Friendly and helpful'}

**Scenario:**
${character.scenario || 'Casual conversation'}

Begin the conversation naturally.`;

    // Prepend system prompt to messages array
    const messagesWithSystemPrompt = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log('Calling OpenRouter API...');

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
        'X-Title': 'AnimaChat'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messagesWithSystemPrompt,
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

    console.log('OpenRouter API responded successfully');

    // Process and save the AI response
    const reader = openRouterResponse.body?.getReader();
    const decoder = new TextDecoder();
    let aiResponseContent = '';
    let buffer = '';
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            
            if (jsonStr.trim() === '[DONE]') {
              break;
            }
            
            try {
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                aiResponseContent += content;
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.log('Skipping invalid JSON line:', jsonStr);
            }
          }
        }
      }
    }
    
    // Edge Function only generates AI response - frontend handles database operations
    console.log('AI response generated successfully, length:', aiResponseContent.length);
    
    return new Response(JSON.stringify({ success: true, content: aiResponseContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
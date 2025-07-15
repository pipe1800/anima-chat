import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('🚀 Chat streaming function called - Enhanced Version');

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

    // Parse the incoming request body
    const { chatId, message, characterId, addonSettings, selectedPersonaId } = await req.json();

    if (!chatId || !message || !characterId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get OpenRouter API key
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      console.error('OpenRouter API key not configured');
      return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch character data and conversation history in parallel
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [characterResult, messageHistoryResult, userProfileResult] = await Promise.all([
      supabaseAdmin
        .from('character_definitions')
        .select('personality_summary, description, scenario, greeting')
        .eq('character_id', characterId)
        .single(),
      supabase
        .from('messages')
        .select('content, is_ai_message, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(10),
      supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
    ]);

    if (characterResult.error) {
      console.error('Character definition error:', characterResult.error);
      return new Response(JSON.stringify({ error: 'Character definition not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const character = characterResult.data;
    const messageHistory = messageHistoryResult.data || [];
    const userProfile = userProfileResult.data;

    if (messageHistoryResult.error) {
      console.error('Failed to fetch conversation history:', messageHistoryResult.error);
    }

    // Fetch persona data if provided
    let selectedPersona = null;
    if (selectedPersonaId) {
      const { data: persona } = await supabase
        .from('personas')
        .select('name, bio')
        .eq('id', selectedPersonaId)
        .eq('user_id', user.id)
        .single();
      
      if (persona) {
        selectedPersona = persona;
      }
    }

    // Template replacement function
    const replaceTemplates = (content: string): string => {
      if (!content) return content;
      
      const userName = selectedPersona?.name || userProfile?.username || 'User';
      const charName = character.personality_summary?.split(' ')[0] || 'Character';
      
      return content
        .replace(/\{\{user\}\}/g, userName)
        .replace(/\{\{char\}\}/g, charName);
    };

    // Build conversation context
    const conversationContext = messageHistory?.map(msg => ({
      role: msg.is_ai_message ? 'assistant' : 'user',
      content: msg.content
    })) || [];

    // Build enhanced prompt with addon settings
    let systemPrompt = `You are ${replaceTemplates(character.personality_summary || 'a helpful assistant')}.
    
${character.description ? `Description: ${replaceTemplates(character.description)}` : ''}
${character.scenario ? `Scenario: ${replaceTemplates(JSON.stringify(character.scenario))}` : ''}

Stay in character and respond naturally to the user's message.`;

    // Add addon context if enabled
    if (addonSettings) {
      if (addonSettings.enhancedMemory) {
        systemPrompt += '\n\nRemember details from previous conversations and reference them naturally.';
      }
      if (addonSettings.moodTracking) {
        systemPrompt += '\n\nPay attention to emotional context and respond appropriately to the user\'s mood.';
      }
      if (addonSettings.dynamicWorldInfo) {
        systemPrompt += '\n\nUse relevant world information to enhance your responses.';
      }
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationContext,
      { role: 'user', content: message }
    ];

    console.log('🎯 Streaming AI response for:', characterId);

    // Create streaming response
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
        'X-Title': 'AnimaChat-Streaming'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openRouterResponse.ok) {
      throw new Error('Failed to get AI response');
    }

    // Set up Server-Sent Events response
    const readable = new ReadableStream({
      start(controller) {
        const processStream = async () => {
          try {
            const reader = openRouterResponse.body?.getReader();
            if (!reader) throw new Error('No reader available');

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                    controller.close();
                    return;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } catch (error) {
            console.error('❌ Streaming error:', error);
            controller.error(error);
          }
        };

        processStream();
      }
    });

    const endTime = Date.now();
    console.log(`⚡ Streaming initiated in ${endTime - startTime}ms`);

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Chat streaming error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
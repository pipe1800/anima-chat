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
    const { model, user_message, chat_id, character_id } = await req.json();

    if (!model || !user_message || !chat_id || !character_id) {
      console.error('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields: model, user_message, chat_id, character_id' }), {
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

    // Fetch user's addon settings for dynamic world info
    const { data: addonSettings, error: addonError } = await supabase
      .from('user_character_addons')
      .select('addon_settings')
      .eq('user_id', user.id)
      .eq('character_id', character_id)
      .maybeSingle();

    const isWorldInfoEnabled = addonSettings?.addon_settings?.dynamicWorldInfo || false;
    console.log('Dynamic World Info enabled:', isWorldInfoEnabled);

    // Fetch world info entries if addon is enabled
    let worldInfoEntries = [];
    if (isWorldInfoEnabled) {
      const { data: worldInfoData, error: worldInfoError } = await supabaseAdmin
        .from('character_world_info_link')
        .select(`
          world_info_entries (
            keywords,
            entry_text
          )
        `)
        .eq('character_id', character_id);

      if (worldInfoError) {
        console.error('Failed to fetch world info:', worldInfoError);
      } else {
        worldInfoEntries = worldInfoData?.map(link => link.world_info_entries).filter(Boolean) || [];
        console.log('World info entries fetched:', worldInfoEntries.length);
      }
    }

    // Fetch conversation history for context
    const { data: messageHistory, error: historyError } = await supabase
      .from('messages')
      .select('content, is_ai_message, created_at')
      .eq('chat_id', chat_id)
      .order('created_at', { ascending: true })
      .limit(20); // Last 20 messages for context

    if (historyError) {
      console.error('Failed to fetch conversation history:', historyError);
    }

    console.log('Conversation history fetched:', messageHistory?.length || 0, 'messages');

    // Construct the System Prompt
    const systemPrompt = `You are to roleplay as the character defined below. Stay in character and respond naturally.

**Character Description:**
${character.description || 'A helpful assistant'}

**Personality Summary:**
${character.personality_summary || 'Friendly and helpful'}

**Scenario:**
${character.scenario || 'Casual conversation'}

Respond naturally to the conversation, keeping the character's personality consistent.`;

    // Build conversation history with system prompt
    const conversationMessages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if available
    if (messageHistory && messageHistory.length > 0) {
      for (const msg of messageHistory) {
        conversationMessages.push({
          role: msg.is_ai_message ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    // Process dynamic world info if enabled
    if (isWorldInfoEnabled && worldInfoEntries.length > 0) {
      console.log('Processing world info for keyword matching...');
      
      // Create keyword map for efficient lookups
      const worldInfoMap = new Map();
      for (const entry of worldInfoEntries) {
        for (const keyword of entry.keywords || []) {
          // Store both the keyword and entry text for deduplication
          const key = keyword.toLowerCase();
          if (!worldInfoMap.has(key)) {
            worldInfoMap.set(key, entry.entry_text);
          }
        }
      }

      // Scan user message for keywords (case-insensitive)
      const userMessageLower = user_message.toLowerCase();
      const matchedEntries = new Set(); // Use Set to avoid duplicates
      
      for (const [keyword, entryText] of worldInfoMap) {
        if (userMessageLower.includes(keyword)) {
          matchedEntries.add(entryText);
          console.log('Keyword matched:', keyword);
        }
      }

      // Inject world info as system message if keywords found
      if (matchedEntries.size > 0) {
        const worldInfoContext = Array.from(matchedEntries).join('\n\n');
        const worldInfoMessage = {
          role: 'system' as const,
          content: `[World Context: ${worldInfoContext}]`
        };
        
        // Insert after main system prompt but before conversation history
        conversationMessages.splice(1, 0, worldInfoMessage);
        console.log('Injected world info context for', matchedEntries.size, 'entries');
      }
    }

    // Add the current user message
    conversationMessages.push({
      role: 'user',
      content: user_message
    });

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
        messages: conversationMessages,
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
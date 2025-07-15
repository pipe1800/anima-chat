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

    // Enhanced prompt for context extraction
    const contextPrompt = `You are ${replaceTemplates(character.personality_summary || 'a helpful assistant')}.

${character.description ? `Description: ${replaceTemplates(character.description)}` : ''}
${character.scenario ? `Scenario: ${replaceTemplates(JSON.stringify(character.scenario))}` : ''}

Stay in character and respond naturally. After your response, provide context data in this exact format:

[CONTEXT_DATA]
{
  "mood": "current emotional state",
  "location": "current location or setting", 
  "clothing": "current clothing description",
  "time_weather": "current time and weather",
  "relationship": "relationship status/dynamic",
  "character_position": "physical position/posture"
}
[/CONTEXT_DATA]`;

    const contextMessages = [
      { role: 'system', content: contextPrompt },
      ...conversationContext,
      { role: 'user', content: message }
    ];

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
        messages: contextMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!openRouterResponse.ok) {
      throw new Error('Failed to get AI response');
    }

    // Set up Server-Sent Events response with context processing
    const readable = new ReadableStream({
      start(controller) {
        const processStream = async () => {
          try {
            const reader = openRouterResponse.body?.getReader();
            if (!reader) throw new Error('No reader available');

            let fullResponse = '';
            let rawResponse = '';  // Store raw response for context extraction
            let extractedContext = null;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    // Process context from raw response before closing
                    if (rawResponse.includes('[CONTEXT_DATA]')) {
                      const contextMatch = rawResponse.match(/\[CONTEXT_DATA\]\s*(\{[\s\S]*?\})\s*\[\/CONTEXT_DATA\]/);
                      if (contextMatch) {
                        try {
                          extractedContext = JSON.parse(contextMatch[1]);
                          console.log('✅ Context extracted:', extractedContext);
                        } catch (e) {
                          console.error('❌ Context parsing error:', e);
                        }
                      }
                    }

                    // Additional final cleanup for any remaining context data
                    fullResponse = fullResponse.replace(/\[CONTEXT_DATA\][\s\S]*?\[\/CONTEXT_DATA\]/g, '').trim();
                    fullResponse = fullResponse.replace(/\[CONTEXT_DATA\][\s\S]*$/g, '').trim();
                    fullResponse = fullResponse.replace(/^[\s\S]*?\[\/CONTEXT_DATA\]/g, '').trim();
                    
                    console.log('✅ Clean message content:', fullResponse.substring(0, 100) + '...');

                    // Send clean message content to frontend for final display
                    controller.enqueue(new TextEncoder().encode(`data: {"type":"final_message","content":"${fullResponse.replace(/"/g, '\\"')}"}\n\n`));

                    // Save context to database if extracted (DO NOT SAVE MESSAGE - let frontend handle it)
                    if (extractedContext && addonSettings) {
                      try {
                        // Update user chat context for enabled addons with corrected key mapping
                        if (addonSettings.moodTracking && extractedContext.mood) {
                          await supabase.from('user_chat_context').upsert({
                            user_id: user.id,
                            chat_id: chatId,
                            character_id: characterId,
                            context_type: 'mood',
                            current_context: extractedContext.mood,
                            updated_at: new Date().toISOString()
                          });
                        }

                        if (addonSettings.locationTracking && extractedContext.location) {
                          await supabase.from('user_chat_context').upsert({
                            user_id: user.id,
                            chat_id: chatId,
                            character_id: characterId,
                            context_type: 'location',
                            current_context: extractedContext.location,
                            updated_at: new Date().toISOString()
                          });
                        }

                        if (addonSettings.clothingInventory && extractedContext.clothing) {
                          await supabase.from('user_chat_context').upsert({
                            user_id: user.id,
                            chat_id: chatId,
                            character_id: characterId,
                            context_type: 'clothing',
                            current_context: extractedContext.clothing,
                            updated_at: new Date().toISOString()
                          });
                        }

                        if (addonSettings.timeAndWeather && extractedContext.time_weather) {
                          await supabase.from('user_chat_context').upsert({
                            user_id: user.id,
                            chat_id: chatId,
                            character_id: characterId,
                            context_type: 'time_weather',
                            current_context: extractedContext.time_weather,
                            updated_at: new Date().toISOString()
                          });
                        }

                        if (addonSettings.relationshipStatus && extractedContext.relationship) {
                          await supabase.from('user_chat_context').upsert({
                            user_id: user.id,
                            chat_id: chatId,
                            character_id: characterId,
                            context_type: 'relationship',
                            current_context: extractedContext.relationship,
                            updated_at: new Date().toISOString()
                          });
                        }

                        if (addonSettings.characterPosition && extractedContext.character_position) {
                          await supabase.from('user_chat_context').upsert({
                            user_id: user.id,
                            chat_id: chatId,
                            character_id: characterId,
                            context_type: 'character_position',
                            current_context: extractedContext.character_position,
                            updated_at: new Date().toISOString()
                          });
                        }

                        console.log('✅ Context saved successfully');
                      } catch (contextError) {
                        console.error('❌ Context save error:', contextError);
                      }
                    }

                    controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                    controller.close();
                    return;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices?.[0]?.delta?.content) {
                      let rawContent = parsed.choices[0].delta.content;
                      
                      // Store raw content for context extraction
                      rawResponse += rawContent;
                      
                      // CRITICAL FIX: Strip context data from raw content BEFORE adding to fullResponse
                      let cleanContent = rawContent;
                      
                      // Super aggressive context data removal - prevent any context data from accumulating
                      if (cleanContent.includes('[CONTEXT') || cleanContent.includes('CONTEXT_DATA') || 
                          cleanContent.includes('"mood"') || cleanContent.includes('"location"') ||
                          cleanContent.includes('"clothing"') || cleanContent.includes('"time_weather"') ||
                          cleanContent.includes('"relationship"') || cleanContent.includes('"character_position"') ||
                          cleanContent.includes('{') || cleanContent.includes('}') || 
                          cleanContent.includes('[/CONTEXT') || cleanContent.includes(':/') ||
                          /\[[A-Z_]+\]/.test(cleanContent) || /"[a-z_]+"\s*:/.test(cleanContent)) {
                        
                        // Remove any context-related content completely
                        cleanContent = cleanContent.replace(/\[CONTEXT_DATA\][\s\S]*?\[\/CONTEXT_DATA\]/g, '');
                        cleanContent = cleanContent.replace(/\[CONTEXT_DATA\][\s\S]*$/g, '');
                        cleanContent = cleanContent.replace(/^[\s\S]*?\[\/CONTEXT_DATA\]/g, '');
                        cleanContent = cleanContent.replace(/\[CONTEXT[^}]*$/g, '');
                        cleanContent = cleanContent.replace(/\[[A-Z_]+\][\s\S]*$/g, '');
                        cleanContent = cleanContent.replace(/\{[\s\S]*$/g, '');
                        cleanContent = cleanContent.replace(/"[a-z_]+"\s*:[\s\S]*$/g, '');
                        cleanContent = cleanContent.replace(/^[\s\S]*?\[\/[A-Z_]+\]/g, '');
                        
                        console.log('🧹 Stripped context from chunk - raw:', rawContent);
                        console.log('🧹 Stripped context from chunk - clean:', cleanContent);
                      }
                      
                      // Add ONLY clean content to fullResponse
                      fullResponse += cleanContent;
                      
                      // Only send clean content to client if there's actual content
                      if (cleanContent.trim()) {
                        const cleanParsed = {
                          ...parsed,
                          choices: [{
                            ...parsed.choices[0],
                            delta: {
                              ...parsed.choices[0].delta,
                              content: cleanContent
                            }
                          }]
                        };
                        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(cleanParsed)}\n\n`));
                      }
                    } else {
                      // Pass through non-content chunks
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
                    }
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
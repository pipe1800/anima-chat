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

    const [characterResult, messageHistoryResult, userProfileResult, userSubscriptionResult] = await Promise.all([
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
        .single(),
      supabase
        .from('subscriptions')
        .select('plan_id, status, current_period_end')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString())
        .maybeSingle()
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
    const userSubscription = userSubscriptionResult.data;

    if (messageHistoryResult.error) {
      console.error('Failed to fetch conversation history:', messageHistoryResult.error);
    }

    // Determine user's model tier - Default to Guest Pass if no active subscription
    let selectedModel = 'google/gemma-7b-it'; // Guest Pass - Fast & Fun
    
    if (userSubscription) {
      // Get plan details
      const { data: planData, error: planError } = await supabaseAdmin
        .from('plans')
        .select('name')
        .eq('id', userSubscription.plan_id)
        .single();
      
      if (planData) {
        switch (planData.name) {
          case 'True Fan':
            selectedModel = 'gryphe/mythomax-l2-13b'; // Smart & Creative
            break;
          case 'The Whale':
            selectedModel = 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo'; // Genius
            break;
          default:
            selectedModel = 'google/gemma-7b-it'; // Guest Pass - Fast & Fun
        }
      }
    }

    console.log('Selected model for user tier:', selectedModel);

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

IMPORTANT DIALOGUE GUIDELINES:
- Focus primarily on dialogue and conversation
- Use direct speech frequently with quotation marks
- Keep narrative descriptions brief and essential
- Respond with natural, engaging conversation
- Express emotions and thoughts through words and dialogue
- Avoid lengthy descriptive paragraphs
- Make your character feel alive through speech

Stay in character and engage in natural dialogue with the user.`;

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

    // PHASE 1: CLEAN MESSAGE GENERATION - NO CONTEXT EXTRACTION
    const cleanMessageResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
        'X-Title': 'AnimaChat-Streaming'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!cleanMessageResponse.ok) {
      throw new Error('Failed to get AI response');
    }

    // Start context extraction in background (separate API call)
    const extractContextInBackground = async () => {
      if (!addonSettings || !Object.values(addonSettings).some(Boolean)) {
        console.log('No addons enabled - skipping context extraction');
        return null;
      }

      const contextPrompt = `You are ${replaceTemplates(character.personality_summary || 'a helpful assistant')}.

${character.description ? `Description: ${replaceTemplates(character.description)}` : ''}
${character.scenario ? `Scenario: ${replaceTemplates(JSON.stringify(character.scenario))}` : ''}

Based on the conversation, extract context information for the following fields in JSON format:
{
  "mood": "current emotional state",
  "location": "current location or setting", 
  "clothing": "current clothing description",
  "time_weather": "current time and weather",
  "relationship": "relationship status/dynamic",
  "character_position": "physical position, posture, or stance of the character"
}

Return only the JSON object with no additional text.`;

      const contextMessages = [
        { role: 'system', content: contextPrompt },
        ...conversationContext,
        { role: 'user', content: message }
      ];

      try {
        const contextResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
            'X-Title': 'AnimaChat-Context'
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct', // Always use Mistral for context extraction
            messages: contextMessages,
            temperature: 0.1,
            max_tokens: 500
          })
        });

        if (contextResponse.ok) {
          const contextData = await contextResponse.json();
          const contextStr = contextData.choices?.[0]?.message?.content || '{}';
          console.log('📝 Raw context extraction response:', contextStr);
          const parsedContext = JSON.parse(contextStr);
          console.log('🔍 Parsed context:', parsedContext);
          return parsedContext;
        }
      } catch (error) {
        console.error('Context extraction error:', error);
      }
      return null;
    };

    const contextExtractionPromise = extractContextInBackground();

    // Set up Server-Sent Events response with clean message streaming
    const readable = new ReadableStream({
      start(controller) {
        const processStream = async () => {
          try {
            const reader = cleanMessageResponse.body?.getReader();
            if (!reader) throw new Error('No reader available');

            let fullResponse = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') {
                    // Clean message is guaranteed to be clean since it came from separate API call
                    const finalCleanMessage = fullResponse.trim();
                    
                    // Apply template replacement to the final AI response
                    const processedMessage = replaceTemplates(finalCleanMessage);
                    
                    console.log('✅ GUARANTEED clean message content:', processedMessage.substring(0, 100) + '...');

                    // Send clean message content to frontend for final display
                    controller.enqueue(new TextEncoder().encode(`data: {"type":"final_message","content":"${processedMessage.replace(/"/g, '\\"')}"}\n\n`));

                    // Wait for context extraction to complete and save to database
                    try {
                      const extractedContext = await contextExtractionPromise;
                      if (extractedContext && addonSettings) {
                        console.log('✅ Context extracted:', extractedContext);
                        console.log('🔧 Addon settings:', addonSettings);
                        
                        // Update user chat context for enabled addons
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
                          console.log('💾 Saving character position context:', extractedContext.character_position);
                          const { error: contextError } = await supabase.from('user_chat_context').upsert({
                            user_id: user.id,
                            chat_id: chatId,
                            character_id: characterId,
                            context_type: 'character_position',
                            current_context: extractedContext.character_position,
                            updated_at: new Date().toISOString()
                          });
                          if (contextError) {
                            console.error('❌ Character position save error:', contextError);
                          } else {
                            console.log('✅ Character position context saved successfully');
                          }
                        }

                        console.log('✅ Context saved successfully');
                      }
                    } catch (contextError) {
                      console.error('❌ Context save error:', contextError);
                    }

                    controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                    controller.close();
                    return;
                  }
                  
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices?.[0]?.delta?.content) {
                      const content = parsed.choices[0].delta.content;
                      
                      // Add to full response
                      fullResponse += content;
                      
                      // Stream clean content directly (no context stripping needed since it's already clean)
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
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
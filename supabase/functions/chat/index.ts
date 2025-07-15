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
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { model, user_message, chat_id, character_id, tracked_context, addon_settings } = requestBody;

    console.log('Full request body:', JSON.stringify(requestBody, null, 2));
    console.log('Field validation in edge function:', {
      model: !!model,
      user_message: !!user_message,
      chat_id: !!chat_id,
      character_id: !!character_id,
      model_value: model,
      user_message_length: user_message?.length,
      chat_id_value: chat_id,
      character_id_value: character_id
    });

    if (!model || !user_message || !chat_id || !character_id) {
      console.error('Missing required fields. Received:', { model, user_message: !!user_message, chat_id, character_id });
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: model, user_message, chat_id, character_id',
        received: { model, user_message: !!user_message, chat_id, character_id }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Received addon_settings:', JSON.stringify(addon_settings, null, 2));

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

    // Note: User message is already saved by the frontend hook to prevent duplication
    // We'll only save the AI response here

    // Get user's subscription and plan for model selection
    const { data: userSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('plan_id, status, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle();

    // Default to Guest Pass if no active subscription
    let selectedModel = 'openai/gpt-4o-mini'; // Guest Pass - Fast & Fun
    
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
            selectedModel = 'openai/gpt-4o-mini'; // Guest Pass - Fast & Fun
        }
      }
    }

    console.log('Selected model for user tier:', selectedModel);

    // Fetch user's addon settings for dynamic world info
    const { data: addonSettings, error: addonError } = await supabase
      .from('user_character_addons')
      .select('addon_settings')
      .eq('user_id', user.id)
      .eq('character_id', character_id)
      .maybeSingle();

    const isWorldInfoEnabled = addonSettings?.addon_settings?.dynamicWorldInfo || false;
    console.log('Dynamic World Info enabled:', isWorldInfoEnabled);

    // Fetch user's world info setting for this character
    let worldInfoEntries = [];
    if (isWorldInfoEnabled) {
      console.log('Fetching user world info setting for user:', user.id, 'character:', character_id);
      
      const { data: userWorldInfoSetting, error: settingError } = await supabase
        .from('user_character_world_info_settings')
        .select('world_info_id')
        .eq('user_id', user.id)
        .eq('character_id', character_id)
        .maybeSingle();

      if (settingError) {
        console.error('Failed to fetch user world info setting:', settingError);
      } else if (userWorldInfoSetting?.world_info_id) {
        console.log('Found user world info setting, world_info_id:', userWorldInfoSetting.world_info_id);
        
        // Fetch the world info entries for the user's selected world info
        const { data: worldInfoData, error: worldInfoError } = await supabaseAdmin
          .from('world_info_entries')
          .select('keywords, entry_text')
          .eq('world_info_id', userWorldInfoSetting.world_info_id);

        if (worldInfoError) {
          console.error('Failed to fetch world info entries:', worldInfoError);
        } else {
          worldInfoEntries = worldInfoData || [];
          console.log('World info entries fetched:', worldInfoEntries.length);
        }
      } else {
        console.log('No world info setting found for this user-character combination');
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

    // Check if this is the first message (only user message should exist)
    // After removing duplicate user message save, first message should have exactly 1 message
    const isFirstMessage = messageHistory?.length === 1;
    console.log('Is first message:', isFirstMessage);

    // Load existing context from database
    const addonSettingsObj = addon_settings || {};
    console.log('Processing context for addons:', addonSettingsObj);
    
    let currentContext: any = {};
    
    // Always load all available context from database (historical preservation)
    const { data: contextData } = await supabase
      .from('user_chat_context')
      .select('context_type, current_context')
      .eq('user_id', user.id)
      .eq('character_id', character_id)
      .eq('chat_id', chat_id);

    console.log('Loaded context from database:', contextData);

    // Initialize context for ALL addons first (even disabled ones for context preservation)
    currentContext.moodTracking = 'No context';
    currentContext.clothingInventory = 'No context';
    currentContext.locationTracking = 'No context';
    currentContext.timeAndWeather = 'No context';
    currentContext.relationshipStatus = 'No context';
    currentContext.characterPosition = 'No context';

    // Load existing context from database for ALL addons (preserve disabled context)
    if (contextData) {
      for (const row of contextData) {
        switch (row.context_type) {
          case 'mood':
            currentContext.moodTracking = row.current_context || 'No context';
            break;
          case 'clothing':
            currentContext.clothingInventory = row.current_context || 'No context';
            break;
          case 'location':
            currentContext.locationTracking = row.current_context || 'No context';
            break;
          case 'time_weather':
            currentContext.timeAndWeather = row.current_context || 'No context';
            break;
          case 'relationship':
            currentContext.relationshipStatus = row.current_context || 'No context';
            break;
          case 'character_position':
            currentContext.characterPosition = row.current_context || 'No context';
            break;
        }
      }
    }

    // Override with tracked context if provided (preserve all context even for disabled addons)
    if (tracked_context) {
      Object.keys(tracked_context).forEach(key => {
        // Update context for all addons to preserve state
        if (tracked_context[key] && tracked_context[key] !== 'No context') {
          currentContext[key] = tracked_context[key];
        }
      });
    }

    console.log('Current context loaded:', currentContext);

    // Check if any addons are enabled
    const hasEnabledAddons = addonSettingsObj.moodTracking || 
                           addonSettingsObj.clothingInventory || 
                           addonSettingsObj.locationTracking || 
                           addonSettingsObj.timeAndWeather || 
                           addonSettingsObj.relationshipStatus ||
                           addonSettingsObj.characterPosition;

    // Extract initial context from character card if this is the first message
    if (isFirstMessage && hasEnabledAddons) {
      console.log('First message detected, extracting initial context from character card...');
      
      // Build character context for analysis
      const characterContent = [
        character.description ? `Description: ${character.description}` : '',
        character.personality_summary ? `Personality: ${character.personality_summary}` : '',
        character.scenario ? `Scenario: ${JSON.stringify(character.scenario)}` : ''
      ].filter(Boolean).join('\n\n');

      // Build extraction prompt for character card
      const characterExtractionPrompt = `You are analyzing a character card to extract initial context for enabled tracking addons. Extract relevant information ONLY for the enabled fields below.

Rules:
1. Extract information that is explicitly stated or strongly implied in the character card
2. If no information is available for a field, return "No context"
3. Be specific and descriptive when information is available
4. Focus on the character's starting/default state
5. Return valid JSON only

Character Card Content:
${characterContent}

Enabled Fields to Extract:
${Object.keys(addonSettingsObj).filter(key => addonSettingsObj[key]).map(key => {
  switch(key) {
    case 'moodTracking': return '- moodTracking: Character\'s initial emotional state or typical mood';
    case 'clothingInventory': return '- clothingInventory: Character\'s default clothing or outfit';
    case 'locationTracking': return '- locationTracking: Character\'s starting location or typical environment';
    case 'timeAndWeather': return '- timeAndWeather: Time period or weather conditions from the scenario';
    case 'relationshipStatus': return '- relationshipStatus: Character\'s relationship situation or romantic status';
    case 'characterPosition': return '- characterPosition: Character\'s default physical position, stance, or posture';
    default: return `- ${key}: Extract relevant information for ${key}`;
  }
}).join('\n')}

Return the extracted context in this exact JSON format:
${JSON.stringify(Object.keys(addonSettingsObj).filter(key => addonSettingsObj[key]).reduce((acc, key) => {
  acc[key] = 'No context';
  return acc;
}, {}), null, 2)}`;

      // Call extraction LLM for character card
      const characterExtractionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
          'X-Title': 'AnimaChat-CharacterContext'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct', // Always use Mistral for character card analysis
          messages: [
            { role: 'system', content: 'You are a precise character analysis bot. Extract only the information that is explicitly stated or strongly implied. Return valid JSON only.' },
            { role: 'user', content: characterExtractionPrompt }
          ],
          temperature: 0.1
        })
      });

      if (characterExtractionResponse.ok) {
        try {
          const characterExtractionData = await characterExtractionResponse.json();
          const characterContextStr = characterExtractionData.choices?.[0]?.message?.content || '{}';
          console.log('Character card extraction response:', characterContextStr);
          
          const characterContext = JSON.parse(characterContextStr);
          console.log('Extracted character context:', characterContext);
          
          // Update current context with character card data
          Object.keys(characterContext).forEach(key => {
            if (addonSettingsObj[key] && characterContext[key] !== 'No context') {
              currentContext[key] = characterContext[key];
            }
          });
          
          // Save initial context to database
          const contextMappings = [
            { type: 'mood', value: currentContext.moodTracking, key: 'moodTracking' },
            { type: 'clothing', value: currentContext.clothingInventory, key: 'clothingInventory' },
            { type: 'location', value: currentContext.locationTracking, key: 'locationTracking' },
            { type: 'time_weather', value: currentContext.timeAndWeather, key: 'timeAndWeather' },
            { type: 'relationship', value: currentContext.relationshipStatus, key: 'relationshipStatus' },
            { type: 'character_position', value: currentContext.characterPosition, key: 'characterPosition' }
          ];

          for (const mapping of contextMappings) {
            const isAddonEnabled = addonSettingsObj[mapping.key];
            if (isAddonEnabled && mapping.value && mapping.value !== 'No context') {
              console.log(`Saving initial context for ${mapping.type}:`, mapping.value);
              await supabase
                .from('user_chat_context')
                .upsert({
                  user_id: user.id,
                  character_id: character_id,
                  chat_id: chat_id,
                  context_type: mapping.type,
                  current_context: mapping.value
                });
            }
          }
          
          console.log('Initial context from character card saved successfully');
          
        } catch (parseError) {
          console.error('Failed to parse character card extraction:', parseError);
        }
      } else {
        console.error('Character card extraction failed:', characterExtractionResponse.status);
      }
    }

    // Construct context injection for system prompt - only for enabled addons
    const contextParts = [];
    if (addonSettingsObj.moodTracking && currentContext.moodTracking && currentContext.moodTracking !== 'No context') {
      contextParts.push(`Mood: ${currentContext.moodTracking}`);
    }
    if (addonSettingsObj.clothingInventory && currentContext.clothingInventory && currentContext.clothingInventory !== 'No context') {
      contextParts.push(`Clothing: ${currentContext.clothingInventory}`);
    }
    if (addonSettingsObj.locationTracking && currentContext.locationTracking && currentContext.locationTracking !== 'No context') {
      contextParts.push(`Location: ${currentContext.locationTracking}`);
    }
    if (addonSettingsObj.timeAndWeather && currentContext.timeAndWeather && currentContext.timeAndWeather !== 'No context') {
      contextParts.push(`Time & Weather: ${currentContext.timeAndWeather}`);
    }
    if (addonSettingsObj.relationshipStatus && currentContext.relationshipStatus && currentContext.relationshipStatus !== 'No context') {
      contextParts.push(`Relationship: ${currentContext.relationshipStatus}`);
    }
    if (addonSettingsObj.characterPosition && currentContext.characterPosition && currentContext.characterPosition !== 'No context') {
      contextParts.push(`Character Position: ${currentContext.characterPosition}`);
    }
    
    const contextPrompt = contextParts.length > 0 ? `[Current Context:\n${contextParts.join('\n')}]` : '';

    // Construct the System Prompt with context injection
    const systemPrompt = `You are to roleplay as the character defined below. Stay in character and respond naturally.

**Character Description:**
${character.description || 'A helpful assistant'}

**Personality Summary:**
${character.personality_summary || 'Friendly and helpful'}

**Scenario:**
${character.scenario || 'Casual conversation'}

${contextPrompt}

**Roleplay Instructions:**
- Text between *asterisks* represents actions, thoughts, or descriptions (e.g., *waves hand*, *thinks quietly*, *the room is dimly lit*)
- Respond to these actions naturally and incorporate them into your roleplay
- You can also use *asterisks* for your own actions and descriptions
- Pay attention to actions when updating context information

Respond naturally to the conversation, keeping the character's personality consistent. Use the current context to inform your responses when relevant.`;

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
        model: selectedModel, // Use tier-based model for chat responses
        messages: conversationMessages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1000
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

    // Get the full response (non-streaming)
    const responseData = await openRouterResponse.json();
    const aiResponseContent = responseData.choices?.[0]?.message?.content || '';

    console.log('AI response generated successfully, length:', aiResponseContent.length);

    // Save the AI response to the database first
    console.log('Saving AI response to database...');
    const { error: saveError } = await supabase
      .from('messages')
      .insert({
        chat_id: chat_id,
        author_id: user.id,
        content: aiResponseContent,
        is_ai_message: true,
        model_id: selectedModel, // Store the actual model used
        token_cost: 1
      });

    if (saveError) {
      console.error('Error saving AI message:', saveError);
      return new Response(JSON.stringify({ error: 'Failed to save AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('AI response saved successfully');

    // Check if any addons are enabled before extracting context (already defined above)

    console.log('Checking enabled addons:', {
      moodTracking: addonSettingsObj.moodTracking,
      clothingInventory: addonSettingsObj.clothingInventory,
      locationTracking: addonSettingsObj.locationTracking,
      timeAndWeather: addonSettingsObj.timeAndWeather,
      relationshipStatus: addonSettingsObj.relationshipStatus,
      characterPosition: addonSettingsObj.characterPosition,
      hasEnabledAddons
    });
    
    // Add more detailed logging about addon settings
    console.log('Raw addon_settings received:', JSON.stringify(addon_settings, null, 2));
    console.log('Processed addonSettingsObj:', JSON.stringify(addonSettingsObj, null, 2));

    if (!hasEnabledAddons) {
      console.log('No addons enabled, skipping context extraction');
      return new Response(JSON.stringify({ 
        success: true, 
        content: aiResponseContent,
        updatedContext: currentContext 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Now extract context using a cheaper model
    console.log('Extracting context from conversation... Enabled addons:', addonSettingsObj);
    
    // Build extraction fields based on enabled addons with detailed instructions
    const extractionFields = {};
    let fieldInstructions = '';
    
    if (addonSettingsObj.moodTracking) {
      extractionFields['moodTracking'] = currentContext.moodTracking;
      fieldInstructions += '\n- moodTracking: Extract the character\'s current emotional state, feelings, or mood. Look for emotions, feelings, or mood indicators in actions between *asterisks* or dialogue.';
    }
    if (addonSettingsObj.clothingInventory) {
      extractionFields['clothingInventory'] = currentContext.clothingInventory;
      fieldInstructions += '\n- clothingInventory: Extract what the character is currently wearing or any clothing changes. Look for clothing descriptions in actions between *asterisks* or dialogue.';
    }
    if (addonSettingsObj.locationTracking) {
      extractionFields['locationTracking'] = currentContext.locationTracking;
      fieldInstructions += '\n- locationTracking: Extract the current location or any location changes. Look for location descriptions in actions between *asterisks* or dialogue.';
    }
    if (addonSettingsObj.timeAndWeather) {
      extractionFields['timeAndWeather'] = currentContext.timeAndWeather;
      fieldInstructions += '\n- timeAndWeather: Extract current time of day, weather conditions, or temporal references. Look for time/weather descriptions in actions between *asterisks* or dialogue.';
    }
    if (addonSettingsObj.relationshipStatus) {
      extractionFields['relationshipStatus'] = currentContext.relationshipStatus;
      fieldInstructions += '\n- relationshipStatus: Extract the relationship dynamics, intimacy level, or relationship changes between characters. Look for relationship indicators in actions between *asterisks* or dialogue.';
    }
    if (addonSettingsObj.characterPosition) {
      extractionFields['characterPosition'] = currentContext.characterPosition;
      fieldInstructions += '\n- characterPosition: Extract the character\'s physical position, stance, body language, or posture. Look for physical positioning details in actions between *asterisks* or dialogue.';
    }
    
    console.log('Extraction fields to process:', Object.keys(extractionFields));
    console.log('Field instructions:', fieldInstructions);

    const extractionPrompt = `You are a data extraction bot. Analyze this conversation turn and update context state based ONLY on the new information provided for the ENABLED fields.

CRITICAL: You must process ALL enabled fields simultaneously. Do not skip any enabled field.

Rules:
1. Only update a field if new information is EXPLICITLY mentioned in the "User Message" or "Character Response"
2. If a field is not mentioned or updated, you MUST return its previous value unchanged
3. If the previous value was "No context" and there is still no new information, keep it as "No context"
4. Pay special attention to text between *asterisks* as it contains actions and descriptions
5. Your response MUST be a valid JSON object and nothing else
6. Process ALL of these enabled addon fields: ${Object.keys(extractionFields).join(', ')}

Field Instructions:${fieldInstructions}

Previous Context:
${JSON.stringify(currentContext, null, 2)}

Conversation Turn:
User Message: "${user_message}"
Character Response: "${aiResponseContent}"

Extract the current state for ALL the following ENABLED fields and provide your response in JSON format:
${JSON.stringify(extractionFields, null, 2)}`;

    // Call extraction LLM
    const extractionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SITE_URL') || 'https://yourapp.com',
        'X-Title': 'AnimaChat-Context'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // Always use Mistral for context extraction
        messages: [
          { role: 'system', content: 'You are a precise data extraction bot. You must extract information for ALL enabled fields, not just some of them. Return valid JSON only.' },
          { role: 'user', content: extractionPrompt }
        ],
        temperature: 0.1
      })
    });

    let updatedContext = currentContext;
    
    if (extractionResponse.ok) {
      try {
        const extractionData = await extractionResponse.json();
        const extractedContextStr = extractionData.choices?.[0]?.message?.content || '{}';
        
        console.log('Raw LLM extraction response:', extractedContextStr);
        
        // Try to parse the JSON response
        const extractedContext = JSON.parse(extractedContextStr);
        console.log('Extracted context from LLM:', JSON.stringify(extractedContext, null, 2));
        
        // Validate that all expected fields are present
        const missingFields = Object.keys(extractionFields).filter(field => !(field in extractedContext));
        if (missingFields.length > 0) {
          console.warn('Missing fields in extraction:', missingFields);
          // Fill in missing fields with current context values
          for (const field of missingFields) {
            extractedContext[field] = currentContext[field];
          }
        }
        
        updatedContext = {
          moodTracking: addonSettingsObj.moodTracking ? (extractedContext.moodTracking || currentContext.moodTracking) : currentContext.moodTracking,
          clothingInventory: addonSettingsObj.clothingInventory ? (extractedContext.clothingInventory || currentContext.clothingInventory) : currentContext.clothingInventory,
          locationTracking: addonSettingsObj.locationTracking ? (extractedContext.locationTracking || currentContext.locationTracking) : currentContext.locationTracking,
          timeAndWeather: addonSettingsObj.timeAndWeather ? (extractedContext.timeAndWeather || currentContext.timeAndWeather) : currentContext.timeAndWeather,
          relationshipStatus: addonSettingsObj.relationshipStatus ? (extractedContext.relationshipStatus || currentContext.relationshipStatus) : currentContext.relationshipStatus,
          characterPosition: addonSettingsObj.characterPosition ? (extractedContext.characterPosition || currentContext.characterPosition) : currentContext.characterPosition
        };
        
        console.log('Context extracted successfully:', updatedContext);
        
        // Get the AI message ID for context linking
        const { data: aiMessage, error: aiMessageError } = await supabase
          .from('messages')
          .select('id')
          .eq('chat_id', chat_id)
          .eq('content', aiResponseContent)
          .eq('is_ai_message', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (aiMessageError) {
          console.error('Failed to get AI message ID:', aiMessageError);
        }

        // Save updated context to database
        const contextMappings = [
          { type: 'mood', value: updatedContext.moodTracking },
          { type: 'clothing', value: updatedContext.clothingInventory },
          { type: 'location', value: updatedContext.locationTracking },
          { type: 'time_weather', value: updatedContext.timeAndWeather },
          { type: 'relationship', value: updatedContext.relationshipStatus },
          { type: 'character_position', value: updatedContext.characterPosition }
        ];

        for (const mapping of contextMappings) {
          const contextField = mapping.type === 'mood' ? 'moodTracking' : 
                              mapping.type === 'clothing' ? 'clothingInventory' : 
                              mapping.type === 'location' ? 'locationTracking' : 
                              mapping.type === 'time_weather' ? 'timeAndWeather' : 
                              mapping.type === 'character_position' ? 'characterPosition' :
                              'relationshipStatus';
          
          // Only save if addon is enabled, context changed, and is not "No context"
          const isAddonEnabled = addonSettingsObj[contextField];
          if (isAddonEnabled && mapping.value !== 'No context' && mapping.value !== currentContext[contextField]) {
            console.log(`Saving context for ${mapping.type}:`, mapping.value);
            await supabase
              .from('user_chat_context')
              .upsert({
                user_id: user.id,
                character_id: character_id,
                chat_id: chat_id,
                context_type: mapping.type,
                current_context: mapping.value
              });
          }
        }

        // Store message-specific context updates if there are any changes
        const contextUpdates = {};
        let hasContextUpdates = false;
        
        for (const mapping of contextMappings) {
          const contextField = mapping.type === 'mood' ? 'moodTracking' : 
                              mapping.type === 'clothing' ? 'clothingInventory' : 
                              mapping.type === 'location' ? 'locationTracking' : 
                              mapping.type === 'time_weather' ? 'timeAndWeather' : 
                              mapping.type === 'character_position' ? 'characterPosition' :
                              'relationshipStatus';
          
          // Include update if addon is enabled and context changed
          const isAddonEnabled = addonSettingsObj[contextField];
          if (isAddonEnabled && mapping.value !== currentContext[contextField]) {
            contextUpdates[contextField] = {
              previous: currentContext[contextField],
              current: mapping.value
            };
            hasContextUpdates = true;
          }
        }

        // Always save the current context state to AI messages for inheritance
        if (aiMessage?.id) {
          if (hasContextUpdates) {
            console.log('Saving message-specific context:', contextUpdates);
            await supabase
              .from('message_context')
              .insert({
                message_id: aiMessage.id,
                user_id: user.id,
                character_id: character_id,
                chat_id: chat_id,
                context_updates: contextUpdates
              });
          }
          
          // Also save the current context state for inheritance
          console.log('Saving current context state to AI message:', updatedContext);
          await supabase
            .from('messages')
            .update({
              // Store context as JSON in a dedicated column or as metadata
              current_context: updatedContext
            })
            .eq('id', aiMessage.id);
        }
        
      } catch (parseError) {
        console.error('Failed to parse extracted context:', parseError);
      }
    } else {
      console.error('Context extraction failed:', extractionResponse.status);
    }

    // Return both response and context
    return new Response(JSON.stringify({ 
      success: true, 
      content: aiResponseContent,
      updatedContext 
    }), {
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
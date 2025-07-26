-- Fix all database functions to have proper search_path protection
-- The correct way is to set search_path as a function parameter, not inside the function body

CREATE OR REPLACE FUNCTION public.update_banner_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    IF OLD.banner_url IS DISTINCT FROM NEW.banner_url THEN
        NEW.banner_updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_character_stats(character_id uuid)
 RETURNS TABLE(total_chats bigint, total_messages bigint, unique_users bigint, average_rating numeric, total_favorites bigint, total_likes bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id)::BIGINT as total_chats,
        COUNT(m.id)::BIGINT as total_messages,
        COUNT(DISTINCT c.user_id)::BIGINT as unique_users,
        NULL::NUMERIC as average_rating,
        (SELECT COUNT(*)::BIGINT FROM public.character_favorites cf WHERE cf.character_id = $1) as total_favorites,
        (SELECT COUNT(*)::BIGINT FROM public.character_likes cl WHERE cl.character_id = $1) as total_likes
    FROM public.chats c
    LEFT JOIN public.messages m ON m.chat_id = c.id
    WHERE c.character_id = $1;
END;
$function$;

CREATE OR REPLACE FUNCTION public.consume_credits(user_id_param uuid, credits_to_consume integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  current_balance integer;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance 
  FROM public.credits 
  WHERE user_id = user_id_param;
  
  -- Check if user has enough credits
  IF current_balance >= credits_to_consume THEN
    -- Deduct credits
    UPDATE public.credits 
    SET balance = balance - credits_to_consume 
    WHERE user_id = user_id_param;
    
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_cleanup_disabled_addon_context()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Only run cleanup if addon settings actually changed
  IF OLD.addon_settings IS DISTINCT FROM NEW.addon_settings THEN
    -- Clean up context for this specific user-character combination
    DELETE FROM public.user_chat_context 
    WHERE user_id = NEW.user_id
      AND character_id = NEW.character_id
      AND NOT (
        (context_type = 'mood' AND (NEW.addon_settings->>'moodTracking')::boolean = true) OR
        (context_type = 'clothing' AND (NEW.addon_settings->>'clothingInventory')::boolean = true) OR
        (context_type = 'location' AND (NEW.addon_settings->>'locationTracking')::boolean = true) OR
        (context_type = 'time_weather' AND (NEW.addon_settings->>'timeAndWeather')::boolean = true) OR
        (context_type = 'relationship' AND (NEW.addon_settings->>'relationshipStatus')::boolean = true)
      );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_disabled_addon_context()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- This function now only cleans up current context state, never historical data
  DELETE FROM public.user_chat_context 
  WHERE current_context IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.user_character_addons uca
      WHERE uca.user_id = user_chat_context.user_id
        AND uca.character_id = user_chat_context.character_id
        AND (
          (user_chat_context.context_type = 'mood' AND (uca.addon_settings->>'moodTracking')::boolean = true) OR
          (user_chat_context.context_type = 'clothing' AND (uca.addon_settings->>'clothingInventory')::boolean = true) OR
          (user_chat_context.context_type = 'location' AND (uca.addon_settings->>'locationTracking')::boolean = true) OR
          (user_chat_context.context_type = 'time_weather' AND (uca.addon_settings->>'timeAndWeather')::boolean = true) OR
          (user_chat_context.context_type = 'relationship' AND (uca.addon_settings->>'relationshipStatus')::boolean = true)
        )
    );
    
  RAISE NOTICE 'Cleanup completed - ALL historical context preserved, only current context cleaned';
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)));
  
  -- Insert credits with 1000 initial balance
  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 1000);

  -- Create Guest Pass subscription for new users
  INSERT INTO public.subscriptions (user_id, plan_id, status, current_period_end)
  VALUES (NEW.id, 'c727a4cf-fe4b-428c-b136-6b8000d890eb', 'active', NOW() + INTERVAL '1 year');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM core.user_roles WHERE user_id = auth.uid() ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      WHEN 'user' THEN 3 
    END 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_new_context_for_disabled_addons()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- This trigger is informational only - it doesn't delete any data
  -- The actual prevention of new context creation happens in the chat edge function
  -- This ensures historical context is NEVER deleted
  
  IF OLD.addon_settings IS DISTINCT FROM NEW.addon_settings THEN
    RAISE NOTICE 'Addon settings changed for user % character % - historical context preserved', NEW.user_id, NEW.character_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.gentle_addon_context_cleanup()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  -- Only run if addon settings actually changed
  IF OLD.addon_settings IS DISTINCT FROM NEW.addon_settings THEN
    -- Log the change for debugging
    RAISE NOTICE 'Addon settings changed for user % character %', NEW.user_id, NEW.character_id;
    
    -- Clean up only CURRENT context for disabled addons, preserve historical context
    DELETE FROM public.user_chat_context 
    WHERE user_id = NEW.user_id
      AND character_id = NEW.character_id
      AND current_context IS NOT NULL
      AND NOT (
        (context_type = 'mood' AND (NEW.addon_settings->>'moodTracking')::boolean = true) OR
        (context_type = 'clothing' AND (NEW.addon_settings->>'clothingInventory')::boolean = true) OR
        (context_type = 'location' AND (NEW.addon_settings->>'locationTracking')::boolean = true) OR
        (context_type = 'time_weather' AND (NEW.addon_settings->>'timeAndWeather')::boolean = true) OR
        (context_type = 'relationship' AND (NEW.addon_settings->>'relationshipStatus')::boolean = true)
      );
      
    -- Clean up only future message context updates for disabled addons
    DELETE FROM public.message_context 
    WHERE user_id = NEW.user_id
      AND character_id = NEW.character_id
      AND created_at > NOW() - INTERVAL '1 hour'
      AND NOT (
        (context_updates ? 'moodTracking' AND (NEW.addon_settings->>'moodTracking')::boolean = true) OR
        (context_updates ? 'clothingInventory' AND (NEW.addon_settings->>'clothingInventory')::boolean = true) OR
        (context_updates ? 'locationTracking' AND (NEW.addon_settings->>'locationTracking')::boolean = true) OR
        (context_updates ? 'timeAndWeather' AND (NEW.addon_settings->>'timeAndWeather')::boolean = true) OR
        (context_updates ? 'relationshipStatus' AND (NEW.addon_settings->>'relationshipStatus')::boolean = true)
      );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_chat_complete(p_chat_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.chats 
    WHERE id = p_chat_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Chat not found or access denied';
  END IF;

  -- Delete in correct order to respect foreign key constraints
  
  -- 1. Delete character memories that reference this chat
  DELETE FROM public.character_memories 
  WHERE chat_id = p_chat_id;
  
  -- 2. Delete chat context (has UNIQUE constraint on chat_id)
  DELETE FROM public.chat_context 
  WHERE chat_id = p_chat_id;
  
  -- 3. Delete messages
  DELETE FROM public.messages 
  WHERE chat_id = p_chat_id;
  
  -- 4. Finally delete the chat itself
  DELETE FROM public.chats 
  WHERE id = p_chat_id AND user_id = p_user_id;
  
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_monthly_credits()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  -- Handle Guest Pass users (reset to 1000 - non-accumulative)
  UPDATE public.credits 
  SET balance = 1000
  FROM public.subscriptions 
  JOIN public.plans ON subscriptions.plan_id = plans.id
  WHERE credits.user_id = subscriptions.user_id 
    AND subscriptions.status = 'active'
    AND subscriptions.current_period_end > NOW()
    AND plans.name = 'Guest Pass';
    
  -- Handle paid subscription users (accumulative)
  UPDATE public.credits 
  SET balance = balance + plans.monthly_credits_allowance
  FROM public.subscriptions 
  JOIN public.plans ON subscriptions.plan_id = plans.id
  WHERE credits.user_id = subscriptions.user_id 
    AND subscriptions.status = 'active'
    AND subscriptions.current_period_end > NOW()
    AND plans.name != 'Guest Pass';
  
  -- Update subscription period end dates for active subscriptions
  UPDATE public.subscriptions 
  SET current_period_end = current_period_end + INTERVAL '1 month'
  WHERE status = 'active' 
    AND current_period_end <= NOW();
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_chat_with_greeting(p_character_id uuid, p_user_id uuid, p_user_message text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  new_chat_id uuid;
  character_name text;
  character_greeting text;
  final_greeting text;
BEGIN
  -- Step 1: Get character's name for the chat title
  SELECT name INTO character_name FROM public.characters WHERE id = p_character_id;

  -- Step 2: Get character's greeting from the definitions table (the crucial correction)
  SELECT greeting INTO character_greeting FROM public.character_definitions WHERE character_id = p_character_id;

  -- Step 3: Create the new chat record
  INSERT INTO public.chats (user_id, character_id, title)
  VALUES (p_user_id, p_character_id, 'Chat with ' || character_name)
  RETURNING id INTO new_chat_id;

  -- Step 4: Determine the final greeting, using a default if none is defined
  final_greeting := COALESCE(
    NULLIF(character_greeting, ''),
    'Hello! It''s a pleasure to meet you. What''s on your mind?'
  );

  -- Step 5: Insert the character's greeting message
  INSERT INTO public.messages (chat_id, author_id, content, is_ai_message)
  VALUES (new_chat_id, p_character_id, final_greeting, true);

  -- Step 6: Insert the user's initial message if it exists
  IF p_user_message IS NOT NULL AND p_user_message <> '' THEN
    INSERT INTO public.messages (chat_id, author_id, content, is_ai_message, model_id)
    VALUES (new_chat_id, p_user_id, p_user_message, false, NULL);
  END IF;

  -- Step 7: Return the new chat ID
  RETURN new_chat_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_new_chat_with_greeting(p_character_id uuid, p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  new_chat_id uuid;
  character_name text;
  character_greeting text;
  final_greeting text;
BEGIN
  -- Get character details
  SELECT
    c.name,
    cd.greeting
  INTO
    character_name,
    character_greeting
  FROM
    public.characters c
  LEFT JOIN
    public.character_definitions cd ON c.id = cd.character_id
  WHERE
    c.id = p_character_id;

  -- Create the new chat record
  INSERT INTO public.chats (user_id, character_id, title)
  VALUES (p_user_id, p_character_id, 'Chat with ' || character_name)
  RETURNING id INTO new_chat_id;

  -- Determine the greeting message
  final_greeting := COALESCE(
    NULLIF(trim(character_greeting), ''),
    'Hello! It''s a pleasure to meet you. What would you like to talk about?'
  );

  -- Insert the character's greeting message.
  INSERT INTO public.messages (chat_id, author_id, content, is_ai_message)
  VALUES (new_chat_id, p_user_id, final_greeting, true);

  -- Return the ID of the new chat
  RETURN new_chat_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_chat_context(p_chat_id uuid, p_user_id uuid, p_character_id uuid)
 RETURNS TABLE(current_context jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT cc.current_context
  FROM public.chat_context cc
  WHERE cc.chat_id = p_chat_id
    AND cc.user_id = p_user_id
    AND cc.character_id = p_character_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_update_chat_context_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
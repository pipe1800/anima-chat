-- Security fixes: Drop backup tables and add search_path protection to functions

-- 1. Drop backup tables as requested by user
DROP TABLE IF EXISTS user_character_addons_backup;
DROP TABLE IF EXISTS user_character_world_info_settings_backup;

-- 2. Add search_path protection to all database functions for security
CREATE OR REPLACE FUNCTION public.get_character_stats(character_id uuid)
 RETURNS TABLE(total_chats bigint, total_messages bigint, unique_users bigint, average_rating numeric, total_favorites bigint, total_likes bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Ensure the search_path is clean to prevent SQL injection
    SET search_path = '';
    
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
AS $function$
DECLARE
  current_balance integer;
BEGIN
  -- Ensure the search_path is clean to prevent SQL injection
  SET search_path = '';
  
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

CREATE OR REPLACE FUNCTION public.cleanup_disabled_addon_context()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Ensure the search_path is clean to prevent SQL injection
  SET search_path = '';
  
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Ensure the search_path is clean to prevent SQL injection
  SET search_path = '';
  
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
AS $function$
  -- Ensure the search_path is clean to prevent SQL injection
  SET search_path = '';
  
  SELECT role FROM core.user_roles WHERE user_id = auth.uid() ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      WHEN 'user' THEN 3 
    END 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.delete_chat_complete(p_chat_id uuid, p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Ensure the search_path is clean to prevent SQL injection
  SET search_path = '';
  
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
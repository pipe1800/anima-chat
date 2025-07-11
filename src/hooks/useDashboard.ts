import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserChats, 
  getUserCharacters, 
  getUserCredits, 
  getUserSubscription,
  getDailyMessageCount,
  getUserFavorites
} from '@/lib/supabase-queries';

export const useDashboardData = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['dashboard', 'overview', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      const [chatsResult, charactersResult, favoritesResult, creditsResult, subscriptionResult, messageCountResult] = await Promise.all([
        getUserChats(userId),
        getUserCharacters(userId),
        getUserFavorites(userId),
        getUserCredits(userId),
        getUserSubscription(userId),
        getDailyMessageCount(userId)
      ]);

      return {
        chats: chatsResult.data || [],
        characters: charactersResult.data || [],
        favorites: favoritesResult.data || [],
        credits: creditsResult.data?.balance || 0,
        subscription: subscriptionResult.data,
        messagesUsed: messageCountResult.data?.count || 0,
        errors: {
          chats: chatsResult.error,
          characters: charactersResult.error,
          favorites: favoritesResult.error,
          credits: creditsResult.error,
          subscription: subscriptionResult.error,
          messageCount: messageCountResult.error
        }
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserChats = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['user', 'chats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const result = await getUserChats(userId);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export const useUserCharacters = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['user', 'characters', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const result = await getUserCharacters(userId);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
};

export const useUserCredits = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['user', 'credits', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const result = await getUserCredits(userId);
      if (result.error) throw result.error;
      return result.data?.balance || 0;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - credits change more frequently
    gcTime: 10 * 60 * 1000,
  });
};

export const useUserSubscription = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['user', 'subscription', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const result = await getUserSubscription(userId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes - subscriptions change rarely
    gcTime: 30 * 60 * 1000,
  });
};

export const useDailyMessageCount = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['user', 'daily-messages', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const result = await getDailyMessageCount(userId);
      if (result.error) throw result.error;
      return result.data?.count || 0;
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - updates frequently during active use
    gcTime: 5 * 60 * 1000,
  });
};

export const useUserFavorites = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['user', 'favorites', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      const result = await getUserFavorites(userId);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
};

// Hook to invalidate dashboard-related queries
export const useDashboardMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'chats'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'characters'] });
    queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
  };

  const invalidateCredits = () => {
    queryClient.invalidateQueries({ queryKey: ['user', 'credits', userId] });
  };

  const invalidateMessageCount = () => {
    queryClient.invalidateQueries({ queryKey: ['user', 'daily-messages', userId] });
  };

  return {
    invalidateDashboard,
    invalidateCredits,
    invalidateMessageCount,
  };
};
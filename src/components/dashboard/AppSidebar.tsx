
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  User, 
  Settings, 
  CreditCard, 
  Home,
  Plus,
  Compass,
  Users,
  Zap,
  LogOut,
  Crown,
  PowerOff
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCredits } from '@/lib/supabase-queries';
import { useState, useEffect } from 'react';

const mainItems = [
  { title: "Create Character", url: "/character-creator", icon: Plus },
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Discover", url: "/discover", icon: Compass },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Subscription", url: "/subscription", icon: Crown },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const [userCredits, setUserCredits] = useState(0);
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      
      try {
        const creditsResult = await getUserCredits(user.id);
        if (creditsResult.data && typeof creditsResult.data.balance === 'number') {
          setUserCredits(creditsResult.data.balance);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    if (user) {
      fetchCredits();
    }
  }, [user]);

  const isActive = (path: string) => currentPath === path;

  const getNavClasses = (active: boolean) => 
    `flex items-center justify-start w-full space-x-2 px-3 py-2 transition-all duration-200 text-sm ${
      active 
        ? 'bg-[#FF7A00]/20 text-[#FF7A00] border-r-2 border-[#FF7A00]' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Don't show error to user for logout failures - just redirect
    } finally {
      // Always navigate to home regardless of logout success/failure
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="fixed left-0 top-0 w-64 h-screen bg-[#1b1b1b] border-r border-gray-700/50 z-40">
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-[#1b1b1b] border-r border-gray-700/50 z-40">
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-700/50 p-4">
          {/* App Logo */}
          <div className="flex items-center justify-start mb-6">
            <img 
              src="/lovable-uploads/45d0ba23-cfa2-404a-8527-54e83cb321ef.png" 
              alt="Anima AI Chat" 
              className="h-10 w-auto"
            />
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
              <AvatarImage 
                src={profile?.avatar_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face"} 
                alt={profile?.username || "User"} 
              />
              <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
                {profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">
                @{profile?.username || user?.email?.split('@')[0] || 'User'}
              </p>
              <div className="bg-[#FF7A00]/20 px-2 py-1 rounded-lg border border-[#FF7A00]/30 flex items-center space-x-2 mt-1 w-fit">
                <Zap className="w-3 h-3 text-[#FF7A00]" />
                <span className="text-[#FF7A00] text-xs font-bold">{userCredits.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 py-4 flex-1">
          <div className="space-y-2">
            {mainItems.map((item) => (
              <NavLink 
                key={item.title}
                to={item.url} 
                className={getNavClasses(isActive(item.url))}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700/50 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
            onClick={handleLogout}
          >
            <PowerOff className="w-4 h-4 flex-shrink-0" />
            <span className="ml-3 font-medium text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}


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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
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

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user || loading) return;
      
      try {
        const creditsResult = await getUserCredits(user.id);
        if (creditsResult.data && typeof creditsResult.data.balance === 'number') {
          setUserCredits(creditsResult.data.balance);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    if (user && !loading) {
      fetchCredits();
    }
  }, [user, loading]);

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
      navigate('/'); // Redirect to landing page instead of auth page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show sidebar even if auth is loading, but with fallback content
  if (loading) {
    return (
      <Sidebar 
        className="border-r border-gray-700/50 bg-[#1b1b1b] w-64 h-screen fixed z-40"
        collapsible="none"
      >
        <div className="flex flex-col h-full">
          <SidebarHeader className="border-b border-gray-700/50 p-4">
            <div className="flex items-center justify-start mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-white font-bold text-lg">ANIMA</h2>
              </div>
            </div>
            <div className="text-white text-center">Loading...</div>
          </SidebarHeader>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar 
      className="border-r border-gray-700/50 bg-[#1b1b1b] w-64 h-screen fixed z-40"
      collapsible="none"
    >
      <div className="flex flex-col h-full">
        <SidebarHeader className="border-b border-gray-700/50 p-4">
          {/* App Logo */}
          <div className="flex items-center justify-start mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-white font-bold text-lg">ANIMA</h2>
            </div>
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
        </SidebarHeader>

        <SidebarContent className="px-2 py-4 flex-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavClasses(isActive(item.url))}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-700/50 p-4">
          {/* Logout Button */}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
            onClick={handleLogout}
          >
            <PowerOff className="w-4 h-4 flex-shrink-0" />
            <span className="ml-3 font-medium text-sm">Logout</span>
          </Button>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

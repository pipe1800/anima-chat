
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  LogOut
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

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Create Character", url: "/create-character", icon: Plus },
  { title: "Discover", url: "/discover", icon: Compass },
  { title: "Community", url: "/community", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const getNavClasses = (active: boolean) => 
    `flex items-center justify-start w-full space-x-3 transition-all duration-200 ${
      active 
        ? 'bg-[#FF7A00]/20 text-[#FF7A00] border-r-2 border-[#FF7A00]' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`;

  return (
    <Sidebar 
      className="border-r border-gray-700/50 bg-[#1b1b1b] w-64"
      collapsible="none"
    >
      <SidebarHeader className="border-b border-gray-700/50 p-4">
        {/* App Logo */}
        <div className="flex items-center justify-start mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-white font-bold text-lg">AI Command</h2>
            <p className="text-[#FF7A00] text-xs font-medium">Neural Interface</p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12 ring-2 ring-[#FF7A00]/50">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-[#FF7A00] text-white font-bold">
              SG
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">@xX_ShadowGamer_Xx</p>
            <div className="bg-[#FF7A00]/20 px-2 py-1 rounded-lg border border-[#FF7A00]/30 flex items-center space-x-2 mt-1 w-fit">
              <Zap className="w-3 h-3 text-[#FF7A00]" />
              <span className="text-[#FF7A00] text-xs font-bold">1,247</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(isActive(item.url))}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-700/50 p-4 space-y-2">
        {/* Settings Link */}
        <SidebarMenuButton asChild>
          <NavLink 
            to="/settings" 
            className={getNavClasses(isActive('/settings'))}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Settings</span>
          </NavLink>
        </SidebarMenuButton>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
          onClick={() => {
            console.log('Logout clicked');
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="ml-3 font-medium">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

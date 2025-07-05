
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MessageCircle, 
  User, 
  Settings, 
  Trophy, 
  CreditCard, 
  Home,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Credits", url: "/credits", icon: CreditCard },
];

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const getNavClasses = (active: boolean) => 
    `flex items-center space-x-3 w-full transition-all duration-200 ${
      active 
        ? 'bg-[#FF7A00]/20 text-[#FF7A00] border-r-2 border-[#FF7A00]' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`;

  return (
    <Sidebar className={`${isCollapsed ? 'w-14' : 'w-64'} border-r border-gray-700/50 bg-[#1a1a2e]`}>
      <SidebarHeader className="border-b border-gray-700/50 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/70 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-white font-bold text-lg">AI Command</h2>
              <p className="text-[#FF7A00] text-xs font-medium">Neural Interface</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <SidebarTrigger className="absolute top-4 right-4 text-gray-400 hover:text-white" />
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#FF7A00] text-xs font-semibold tracking-wider uppercase mb-2">
            {!isCollapsed && "Main Navigation"}
          </SidebarGroupLabel>
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
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[#FF7A00] text-xs font-semibold tracking-wider uppercase mb-2">
            {!isCollapsed && "Account"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(isActive(item.url))}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <div className="mt-6 px-3">
            <div className="bg-gradient-to-r from-[#FF7A00]/20 to-[#FF7A00]/10 rounded-lg p-4 border border-[#FF7A00]/30">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-[#FF7A00]" />
                <span className="text-[#FF7A00] text-sm font-semibold">Neural Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Connection</span>
                  <span className="text-green-400 text-xs font-medium">STABLE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs">Credits</span>
                  <span className="text-[#FF7A00] text-xs font-bold">1,247</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-700/50 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8 ring-2 ring-[#FF7A00]/50">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback className="bg-[#FF7A00] text-white font-bold text-sm">
              U
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Neural Pilot</p>
              <p className="text-gray-400 text-xs truncate">Level 7 Explorer</p>
            </div>
          )}
        </div>
        {isCollapsed && (
          <SidebarTrigger className="mt-2 text-gray-400 hover:text-white" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

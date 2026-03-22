// AppSidebar.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "./NavLink";
import { useAuth } from "../components/lib/auth-context";
import { getNavItemsForRole } from "../components/lib/role-config";
import { LogOut, Warehouse } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/auth/login";
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      {/* Logo Section - Fixed alignment */}
      <div className="flex items-center px-4 py-5 border-b">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#1E3A8A] shrink-0">
            <Warehouse className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">WMS Pro</span>
              <span className="text-[10px] text-gray-500">Warehouse Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items - Fixed spacing and alignment */}
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink
                        to={item.url}
                        end
                        className={`
                          flex items-center w-full px-4 py-2.5
                          text-sm rounded-md transition-colors
                          ${active 
                            ? 'bg-gray-100 text-[#1E3A8A] font-medium' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#1E3A8A]' : 'text-gray-500'}`} />
                        {!collapsed && (
                          <span className="ml-3 truncate">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile & Footer - Fixed alignment */}
      <SidebarFooter className="border-t mt-auto">
        <div className="p-4">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#1E3A8A] flex items-center justify-center text-sm font-semibold text-white shrink-0">
                  {user.name?.split(" ").map(n => n[0]).join("") || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role?.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
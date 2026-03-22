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
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-[#1E3A8A]">
          <Warehouse className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              WMS Pro
            </p>
          </div>
        )}
      </div>

      <SidebarContent className="py-2">
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
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors duration-150 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        activeClassName="bg-gray-100 text-[#1E3A8A] font-medium"
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <span className="truncate">{item.title}</span>
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

      <SidebarFooter className="border-t border-gray-200 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-xs font-semibold text-white">
              {user.name?.split(" ").map(n => n[0]).join("") || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && "Sign Out"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
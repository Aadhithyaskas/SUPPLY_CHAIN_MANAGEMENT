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
} from "../components/ui/sidebar";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded bg-sidebar-accent">
          <Warehouse className="w-4 h-4 text-sidebar-accent-foreground" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-primary truncate">
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
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors duration-150 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-primary truncate">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-muted-foreground capitalize truncate">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            logout();
            window.location.href = "/auth/login";
          }}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && "Sign Out"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

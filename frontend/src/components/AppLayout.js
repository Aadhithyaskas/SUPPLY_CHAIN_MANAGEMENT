import React from "react";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/AppSidebar";
import { useAuth } from "../components/lib/auth-context";
import { Bell } from "lucide-react";

export function AppLayout({ children, title }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              {title && (
                <h2 className="text-sm font-semibold text-foreground">
                  {title}
                </h2>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-destructive" />
              </button>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                {user?.name.split(" ").map(n => n[0]).join("")}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 overflow-auto">
            <div className="animate-slide-in">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

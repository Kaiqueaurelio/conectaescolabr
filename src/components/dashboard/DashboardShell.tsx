import { ReactNode } from "react";
import { RoleSidebar, type SidebarNavItem } from "./RoleSidebar";
import BottomNav from "@/components/BottomNav";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

interface DashboardShellProps {
  title: string;
  sidebarTitle: string;
  sidebarItems: SidebarNavItem[];
  children: ReactNode;
}

export function DashboardShell({ title, sidebarTitle, sidebarItems, children }: DashboardShellProps) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Olá";

  return (
    <div className="min-h-screen bg-muted/30">
      <RoleSidebar title={sidebarTitle} items={sidebarItems} />

      <div className="lg:pl-64">
        {/* TopBar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between gap-4 px-4 lg:px-8 py-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Olá, {firstName} 👋</p>
              <h1 className="text-lg lg:text-xl font-bold truncate">{title}</h1>
            </div>
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9 bg-muted/40 border-none rounded-xl" />
              </div>
            </div>
            <button className="relative p-2 rounded-xl bg-muted/40 hover:bg-muted transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-coral" />
            </button>
          </div>
        </header>

        <main className="px-4 lg:px-8 py-6 pb-24 lg:pb-8 animate-fade-in">{children}</main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
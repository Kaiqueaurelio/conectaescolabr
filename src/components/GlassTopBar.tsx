import React from "react";
import { cn } from "@/lib/utils";
import { Search, Bell, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface GlassTopBarProps {
  title?: string;
  user?: UserInfo;
  onLogout?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

/**
 * GlassTopBar - Topbar com estilo Glassmorphism
 */
export function GlassTopBar({
  title,
  user,
  onLogout,
  showSearch = true,
  onSearch,
}: GlassTopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full",
        "bg-white/80 backdrop-blur-md border-b border-white/30",
        "shadow-soft-lg"
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Left: Title */}
        {title && (
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
        )}

        {/* Center: Search */}
        {showSearch && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className={cn(
                  "pl-10 bg-white/50 border-white/30",
                  "focus:bg-white/80 focus:border-primary/50",
                  "rounded-lg"
                )}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/20"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/20"
          >
            <Settings className="w-5 h-5 text-foreground" />
          </Button>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2",
                    "hover:bg-white/20 rounded-lg"
                  )}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>

                {onLogout && (
                  <>
                    <div className="my-1 border-t" />
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="flex items-center gap-2 text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

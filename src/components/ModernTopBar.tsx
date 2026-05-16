import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Bell, Search, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ModernTopBarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  notifications?: number;
  onNotificationsClick?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  className?: string;
}

/**
 * ModernTopBar - Topbar/Header moderno com busca, notificações e perfil
 */
export function ModernTopBar({
  title,
  subtitle,
  breadcrumbs,
  actions,
  searchPlaceholder = "Buscar...",
  onSearch,
  notifications,
  onNotificationsClick,
  user,
  onLogout,
  className,
}: ModernTopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-card border-b border-border shadow-soft",
        className
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Left Section - Title and Breadcrumbs */}
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-sm mb-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-muted-foreground">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="text-primary hover:underline">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{crumb.label}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {title && (
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Middle Section - Search */}
        {onSearch && (
          <div className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Right Section - Actions, Notifications, User Menu */}
        <div className="flex items-center gap-2">
          {actions && <div className="hidden sm:flex gap-2">{actions}</div>}

          {/* Notifications */}
          {onNotificationsClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationsClick}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {notifications && notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          )}

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem onClick={onLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

interface ModernPageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * ModernPageHeader - Header de página com título, descrição e ação
 */
export function ModernPageHeader({
  title,
  description,
  icon,
  action,
  className,
}: ModernPageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-8", className)}>
      <div className="flex items-start gap-4">
        {icon && <div className="text-3xl text-primary mt-1">{icon}</div>}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface ModernTabsProps {
  tabs: Array<{ label: string; value: string; icon?: ReactNode }>;
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

/**
 * ModernTabs - Abas modernas para organizar conteúdo
 */
export function ModernTabs({ tabs, activeTab, onTabChange, className }: ModernTabsProps) {
  return (
    <div className={cn("flex gap-1 border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === tab.value
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

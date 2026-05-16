import React from "react";
import { cn } from "@/lib/utils";
import { GlassSidebar } from "./GlassSidebar";
import { GlassTopBar } from "./GlassTopBar";

interface SidebarItem {
  label: string;
  href?: string;
  icon?: string;
  divider?: boolean;
  submenu?: SidebarItem[];
}

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface GlassLayoutProps {
  children: React.ReactNode;
  sidebarItems?: SidebarItem[];
  topBarTitle?: string;
  topBarUser?: UserInfo;
  onLogout?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * GlassLayout - Layout principal com Glassmorphism
 * Combina Sidebar, TopBar e conteúdo principal
 */
export function GlassLayout({
  children,
  sidebarItems = [],
  topBarTitle,
  topBarUser,
  onLogout,
  showSearch = true,
  onSearch,
  className,
}: GlassLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      {sidebarItems.length > 0 && (
        <GlassSidebar
          items={sidebarItems}
          logo={<span className="text-2xl">🏫</span>}
          onLogout={onLogout}
        />
      )}

      {/* Main Content */}
      <div className={cn(sidebarItems.length > 0 && "lg:ml-64")}>
        {/* TopBar */}
        <GlassTopBar
          title={topBarTitle}
          user={topBarUser}
          onLogout={onLogout}
          showSearch={showSearch}
          onSearch={onSearch}
        />

        {/* Content Area */}
        <main className={cn("min-h-[calc(100vh-80px)]", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * GlassContainer - Container com padding padrão
 */
export function GlassContainer({ children, className }: GlassContainerProps) {
  return (
    <div className={cn("p-6 md:p-8 max-w-7xl mx-auto", className)}>
      {children}
    </div>
  );
}

interface GlassGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "small" | "medium" | "large";
  className?: string;
}

/**
 * GlassGrid - Grid responsivo para cards
 */
export function GlassGrid({
  children,
  cols = 3,
  gap = "medium",
  className,
}: GlassGridProps) {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    small: "gap-4",
    medium: "gap-6",
    large: "gap-8",
  };

  return (
    <div
      className={cn(
        "grid",
        colsClasses[cols],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface GlassSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

/**
 * GlassSection - Seção com título e conteúdo
 */
export function GlassSection({
  title,
  description,
  children,
  className,
  headerAction,
}: GlassSectionProps) {
  return (
    <div className={className}>
      {(title || description || headerAction) && (
        <div className="flex items-start justify-between mb-6">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}

interface GlassEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * GlassEmptyState - Estado vazio com ícone e mensagem
 */
export function GlassEmptyState({
  icon,
  title,
  description,
  action,
}: GlassEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-6xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

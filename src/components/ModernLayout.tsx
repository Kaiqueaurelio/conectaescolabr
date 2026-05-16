import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModernLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * ModernLayout - Componente de layout base para toda a aplicação
 * Implementa design system moderno, minimalista e acolhedor
 */
export function ModernLayout({ children, className }: ModernLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background via-background to-muted", className)}>
      {children}
    </div>
  );
}

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  gradient?: "primary" | "warm" | "none";
}

/**
 * ModernCard - Card moderno com bordas suaves e sombras elevadas
 */
export function ModernCard({ children, className, hoverable = false, gradient = "none" }: ModernCardProps) {
  const gradientClass = {
    primary: "bg-gradient-card",
    warm: "bg-gradient-warm",
    none: "bg-card",
  }[gradient];

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 shadow-soft",
        gradientClass,
        hoverable && "hover-lift cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * ModernHeader - Header padrão para páginas
 */
export function ModernHeader({ title, subtitle, icon, action, className }: ModernHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-8", className)}>
      <div className="flex items-center gap-4">
        {icon && <div className="text-primary text-3xl">{icon}</div>}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface ModernGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * ModernGrid - Grid responsivo para organizar cards
 */
export function ModernGrid({ children, cols = 3, gap = "md", className }: ModernGridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[cols];

  const gapClass = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8",
  }[gap];

  return <div className={cn("grid", colsClass, gapClass, className)}>{children}</div>;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "destructive";
}

/**
 * StatCard - Card para exibir estatísticas
 */
export function StatCard({ label, value, icon, trend, trendValue, color = "primary" }: StatCardProps) {
  const colorClass = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[color];

  const trendClass = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground",
  }[trend || "neutral"];

  return (
    <ModernCard className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <p className={cn("text-3xl font-bold", colorClass)}>{value}</p>
          {trend && trendValue && (
            <p className={cn("text-xs font-medium mt-2", trendClass)}>
              {trend === "up" && "↑"} {trend === "down" && "↓"} {trendValue}
            </p>
          )}
        </div>
        {icon && <div className={cn("text-2xl", colorClass)}>{icon}</div>}
      </div>
    </ModernCard>
  );
}

interface ModernSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/**
 * ModernSection - Seção com título e conteúdo
 */
export function ModernSection({ title, subtitle, children, className }: ModernSectionProps) {
  return (
    <section className={cn("mb-12", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

interface ModernBadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * ModernBadge - Badge para status e tags
 */
export function ModernBadge({ children, variant = "primary", size = "md", className }: ModernBadgeProps) {
  const variantClass = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-secondary/10 text-secondary border border-secondary/20",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20",
    muted: "bg-muted text-muted-foreground border border-border",
  }[variant];

  const sizeClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }[size];

  return (
    <span className={cn("inline-flex items-center rounded-full font-medium", variantClass, sizeClass, className)}>
      {children}
    </span>
  );
}

interface ModernEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * ModernEmptyState - Estado vazio para listas vazias
 */
export function ModernEmptyState({ icon, title, description, action }: ModernEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-5xl text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

interface ModernDividerProps {
  className?: string;
  label?: string;
}

/**
 * ModernDivider - Divisor com label opcional
 */
export function ModernDivider({ className, label }: ModernDividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4 my-6", className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }

  return <div className={cn("h-px bg-border my-6", className)} />;
}

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "soft";
  hover?: boolean;
}

/**
 * GlassCard - Componente com efeito Glassmorphism
 * Usa backdrop blur, bordas arredondadas e sombras suaves
 */
export function GlassCard({
  children,
  className,
  variant = "default",
  hover = true,
}: GlassCardProps) {
  const baseClasses =
    "rounded-2xl border backdrop-blur-md transition-all duration-300";

  const variantClasses = {
    default: "bg-white/80 border-white/30 shadow-glass",
    gradient: "bg-gradient-to-br from-white/90 to-white/70 border-white/40 shadow-soft-lg",
    soft: "bg-white/60 border-white/20 shadow-soft",
  };

  const hoverClasses = hover
    ? "hover:shadow-soft-xl hover:bg-white/90 hover:border-white/50 hover:scale-105"
    : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

interface GlassStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "destructive";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

/**
 * GlassStatCard - Card de estatística com ícone colorido
 */
export function GlassStatCard({
  label,
  value,
  icon,
  color = "primary",
  trend,
  trendValue,
}: GlassStatCardProps) {
  const colorClasses = {
    primary: "bg-gradient-primary text-white",
    secondary: "bg-gradient-secondary text-white",
    success: "bg-gradient-to-br from-green-400 to-emerald-500 text-white",
    warning: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
    destructive: "bg-gradient-to-br from-red-400 to-pink-500 text-white",
  };

  return (
    <GlassCard variant="gradient" className="p-6">
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        )}
        {trend && (
          <div
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              trend === "up"
                ? "bg-green-100 text-green-700"
                : trend === "down"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
            )}
          >
            {trendValue}
          </div>
        )}
      </div>

      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </GlassCard>
  );
}

interface GlassBannerProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  image?: string;
  className?: string;
}

/**
 * GlassBanner - Banner de boas-vindas com efeito glassmorphism
 */
export function GlassBanner({
  title,
  subtitle,
  icon,
  image,
  className,
}: GlassBannerProps) {
  return (
    <GlassCard
      variant="gradient"
      className={cn(
        "p-8 md:p-12 relative overflow-hidden",
        "bg-gradient-to-r from-primary/20 to-secondary/20",
        className
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-4xl">{icon}</div>}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {image && (
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
          <img
            src={image}
            alt="banner"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Decorative blur circles */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />
    </GlassCard>
  );
}

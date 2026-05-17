import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SkillPathMetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "primary" | "secondary" | "accent" | "destructive";
  className?: string;
}

/**
 * SkillPathMetricCard - Card de métrica estilo SkillPath
 */
export function SkillPathMetricCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = "primary",
  className,
}: SkillPathMetricCardProps) {
  const colorClasses = {
    primary: "border-primary/20 bg-primary/5",
    secondary: "border-secondary/20 bg-secondary/5",
    accent: "border-accent/20 bg-accent/5",
    destructive: "border-destructive/20 bg-destructive/5",
  };

  const iconColorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    destructive: "text-destructive",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-6 border",
        colorClasses[color],
        "hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>

          {trend && trendValue && (
            <div className="flex items-center gap-1">
              {trend === "up" && (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              {trend === "down" && (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up" && "text-green-600",
                  trend === "down" && "text-red-600",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "text-3xl p-3 rounded-lg",
              iconColorClasses[color],
              "bg-white/50"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

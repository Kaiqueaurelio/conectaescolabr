import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface SkillPathProgressCardProps {
  title: string;
  current: number;
  total: number;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "accent" | "destructive";
  onClick?: () => void;
  className?: string;
}

/**
 * SkillPathProgressCard - Card com progresso circular estilo SkillPath
 */
export function SkillPathProgressCard({
  title,
  current,
  total,
  icon,
  color = "primary",
  onClick,
  className,
}: SkillPathProgressCardProps) {
  const percentage = Math.round((current / total) * 100);

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    destructive: "text-destructive",
  };

  const bgColorClasses = {
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    accent: "bg-accent/10",
    destructive: "bg-destructive/10",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white border border-border",
        "hover:shadow-lg transition-all duration-300 cursor-pointer",
        "flex items-center justify-between gap-4",
        className
      )}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0", bgColorClasses[color], "opacity-50")} />

      {/* Content */}
      <div className="relative z-10 flex-1">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">
          {current} / {total}
        </p>
      </div>

      {/* Circular Progress */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background circle */}
          <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-border"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${(percentage / 100) * 282.7} 282.7`}
              className={cn("transition-all duration-500", colorClasses[color])}
            />
          </svg>

          {/* Center text */}
          <div className="text-center">
            <p className={cn("text-xl font-bold", colorClasses[color])}>
              {percentage}%
            </p>
          </div>
        </div>

        {/* Icon or arrow */}
        {icon ? (
          <div className={cn("text-2xl", colorClasses[color])}>{icon}</div>
        ) : (
          <ArrowRight className={cn("w-5 h-5", colorClasses[color])} />
        )}
      </div>
    </div>
  );
}

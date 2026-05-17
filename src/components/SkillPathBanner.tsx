import React from "react";
import { cn } from "@/lib/utils";

interface SkillPathBannerProps {
  title: string;
  subtitle?: string;
  userName?: string;
  userAvatar?: string;
  gradientFrom?: string;
  gradientTo?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SkillPathBanner - Banner de boas-vindas estilo SkillPath
 */
export function SkillPathBanner({
  title,
  subtitle,
  userName,
  userAvatar,
  gradientFrom = "from-primary",
  gradientTo = "to-secondary",
  children,
  className,
}: SkillPathBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-8 md:p-12",
        "bg-gradient-to-r",
        gradientFrom,
        gradientTo,
        "text-white shadow-lg",
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-white/80 text-lg">{subtitle}</p>}
          {userName && (
            <p className="text-white/70 mt-3 text-sm">
              Bem-vindo de volta, <span className="font-semibold">{userName}</span>! 👋
            </p>
          )}
        </div>

        {userAvatar && (
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
            />
          </div>
        )}
      </div>

      {children && <div className="relative z-10 mt-6">{children}</div>}
    </div>
  );
}

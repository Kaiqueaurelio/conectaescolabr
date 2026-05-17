import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "secondary" | "tertiary" | "coral" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  primary: "from-primary to-[#2ecc71]",
  secondary: "from-secondary to-[#f39c12]",
  tertiary: "from-tertiary to-[#3da5e0]",
  coral: "from-coral to-[#ff7a59]",
  success: "from-success to-[#34d399]",
  warning: "from-warning to-[#fbbf24]",
};

const shadowClasses: Record<Tone, string> = {
  primary: "shadow-[0_12px_30px_-12px_hsl(var(--primary)/0.55)]",
  secondary: "shadow-[0_12px_30px_-12px_hsl(var(--secondary)/0.55)]",
  tertiary: "shadow-[0_12px_30px_-12px_hsl(var(--tertiary)/0.55)]",
  coral: "shadow-[0_12px_30px_-12px_hsl(var(--coral)/0.55)]",
  success: "shadow-[0_12px_30px_-12px_hsl(var(--success)/0.55)]",
  warning: "shadow-[0_12px_30px_-12px_hsl(var(--warning)/0.55)]",
};

export interface ColorStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  trend?: string;
  className?: string;
}

export function ColorStatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  trend,
  className,
}: ColorStatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 text-white",
        "bg-gradient-to-br",
        toneClasses[tone],
        shadowClasses[tone],
        "transition-transform hover:-translate-y-1",
        className
      )}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold leading-none">{value}</p>
          <p className="text-xs mt-2 font-medium opacity-90">{label}</p>
          {trend && (
            <p className="text-[10px] mt-1 opacity-80">{trend}</p>
          )}
        </div>
        <div className="h-10 w-10 rounded-full bg-white/25 backdrop-blur flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  hint?: string;
  tone?: "primary" | "secondary" | "tertiary" | "coral" | "success";
  alert?: boolean;
}

const toneClass: Record<NonNullable<Props["tone"]>, string> = {
  primary: "bg-primary/12 text-primary",
  secondary: "bg-secondary/15 text-secondary",
  tertiary: "bg-tertiary/15 text-tertiary",
  coral: "bg-coral/15 text-coral",
  success: "bg-success/15 text-success",
};

export default function StatCard({ icon: Icon, label, value, hint, tone = "primary", alert }: Props) {
  return (
    <Card className={cn("p-4 transition-smooth hover:shadow-soft", alert && "border-coral/40 bg-coral/5")}>
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl mb-3", toneClass[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold leading-none tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1.5">{label}</p>
      {hint && <p className={cn("text-[10px] mt-1 font-medium", alert ? "text-coral" : "text-muted-foreground")}>{hint}</p>}
    </Card>
  );
}
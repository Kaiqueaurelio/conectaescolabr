import { NavLink } from "react-router-dom";
import { Home, Calendar, Megaphone, Bell, Menu } from "lucide-react";
import { useAuth, roleHome } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const { user } = useAuth();
  const { reminders, isOverdue } = useData();
  if (!user) return null;
  const overdue = reminders.filter((r) => {
    if (!isOverdue(r)) return false;
    if (r.target === "ALL") return true;
    if (user.role === "TEACHER" || user.role === "ADMIN") return r.target === "TEACHERS";
    if (user.role === "PARENT") return r.target === "PARENTS";
    if (user.role === "STUDENT") return r.target === "STUDENTS";
    return false;
  }).length;
  const items = [
    { to: roleHome(user.role), label: "Início", icon: Home, end: true },
    { to: "/agenda", label: "Agenda", icon: Calendar },
    { to: "/lembretes", label: "Lembretes", icon: Bell, badge: overdue },
    { to: "/comunicados", label: "Comunicados", icon: Megaphone },
    { to: "/menu", label: "Menu", icon: Menu },
  ] as const;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md shadow-floating">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {items.map(({ to, label, icon: Icon, end, badge }: any) => (
          <NavLink
            key={to + label}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-3 text-xs font-medium transition-smooth",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                <div
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-xl transition-smooth",
                    isActive && "bg-primary/12"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {badge ? (
                  <span className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-coral text-coral-foreground text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
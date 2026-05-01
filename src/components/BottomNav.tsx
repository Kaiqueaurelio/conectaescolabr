import { NavLink } from "react-router-dom";
import { Home, Calendar, Megaphone, Menu } from "lucide-react";
import { useAuth, roleHome } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const { user } = useAuth();
  if (!user) return null;
  const items = [
    { to: roleHome(user.role), label: "Início", icon: Home, end: true },
    { to: "/agenda", label: "Agenda", icon: Calendar },
    { to: "/comunicados", label: "Comunicados", icon: Megaphone },
    { to: "/menu", label: "Menu", icon: Menu },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md shadow-floating">
      <div className="mx-auto grid max-w-3xl grid-cols-4">
        {items.map(({ to, label, icon: Icon, end }) => (
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
                <div
                  className={cn(
                    "flex h-9 w-12 items-center justify-center rounded-xl transition-smooth",
                    isActive && "bg-primary/12"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
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
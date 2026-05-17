import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LogOut, type LucideIcon } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth, type Role } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface SidebarNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface RoleSidebarProps {
  title?: string;
  items: SidebarNavItem[];
}

const roleLabels: Record<Role, string> = {
  ADMIN: "Administração",
  TEACHER: "Colaborador(a)",
  STUDENT: "Aluno(a) / Voluntário(a)",
  PARENT: "Responsável",
};

export function RoleSidebar({ title = "Painel", items }: RoleSidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 z-30 bg-card border-r border-border shadow-soft-lg">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <Logo size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight truncate">Assoc. Camila</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{title}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          Navegação
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            {user?.avatar_url && <AvatarImage src={user.avatar_url} />}
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user?.name || "Usuário"}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user ? roleLabels[user.role] : ""}
            </p>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-coral hover:bg-coral/10 transition-colors"
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
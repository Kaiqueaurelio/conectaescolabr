import { useAuth, roleHome } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Megaphone, AlertTriangle, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useData } from "@/contexts/DataContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabel: Record<string, string> = {
  TEACHER: "Professor(a)",
  STUDENT: "Aluno(a)",
  PARENT: "Responsável",
  ADMIN: "Administração",
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadAnnouncementsFor, markAllAnnouncementsRead, reminders, isOverdue } = useData();
  if (!user) return null;
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  const unread = unreadAnnouncementsFor(user.role).slice(0, 5);
  const overdue = reminders.filter((r) => {
    if (!isOverdue(r)) return false;
    if (r.target === "ALL") return true;
    if (user.role === "TEACHER" || user.role === "ADMIN") return r.target === "TEACHERS";
    if (user.role === "PARENT") return r.target === "PARENTS";
    if (user.role === "STUDENT") return r.target === "STUDENTS";
    return false;
  });
  const totalAlerts = unread.length + overdue.length;
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to={roleHome(user.role)} className="flex items-center gap-3 min-w-0">
          <Logo size="md" />
          <div className="leading-tight border-l border-border pl-3 hidden sm:block">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">Portal</p>
            <p className="text-[11px] text-muted-foreground">{roleLabel[user.role]}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-coral text-coral-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalAlerts > 9 ? "9+" : totalAlerts}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notificações</span>
                {unread.length > 0 && (
                  <button onClick={markAllAnnouncementsRead} className="text-[11px] font-normal text-primary hover:underline">
                    Marcar como lidas
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {totalAlerts === 0 && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">Tudo em dia 🎉</div>
              )}
              {overdue.slice(0, 3).map((r) => (
                <DropdownMenuItem key={"o" + r.id} onClick={() => navigate("/lembretes")} className="cursor-pointer">
                  <AlertTriangle className="mr-2 h-4 w-4 text-coral flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground">Lembrete atrasado</p>
                  </div>
                </DropdownMenuItem>
              ))}
              {unread.map((a) => (
                <DropdownMenuItem key={"a" + a.id} onClick={() => navigate("/comunicados")} className="cursor-pointer">
                  <Megaphone className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{a.author}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" /> Meu perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer">
              <SettingsIcon className="mr-2 h-4 w-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
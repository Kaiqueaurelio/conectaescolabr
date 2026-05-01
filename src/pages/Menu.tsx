import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Newspaper, ClipboardCheck, LogOut, ChevronRight, Settings, HelpCircle, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/components/Logo";

export default function Menu() {
  const { user, logout } = useAuth();
  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("") || "";

  const items = [
    { to: "/blog", icon: Newspaper, label: "Blog da ONG", desc: "Notícias e histórias" },
    ...(user?.role === "TEACHER" ? [{ to: "/chamada", icon: ClipboardCheck, label: "Fazer Chamada", desc: "Registrar presença" }] : []),
    { to: "#", icon: Settings, label: "Configurações", desc: "Preferências da conta" },
    { to: "#", icon: HelpCircle, label: "Ajuda e Suporte", desc: "Tire suas dúvidas" },
  ];

  return (
    <AppLayout>
      <PageHeader title="Menu" />
      <Card className="p-5 mb-6 flex items-center gap-4 gradient-card shadow-soft">
        <Avatar className="h-14 w-14 border-2 border-primary/20">
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </Card>

      <div className="space-y-2 mb-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.label} to={it.to}>
              <Card className="p-4 flex items-center gap-3 hover:shadow-soft transition-smooth">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary"><Icon className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{it.label}</p>
                  <p className="text-xs text-muted-foreground">{it.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>
          );
        })}
      </div>

      <button onClick={logout} className="w-full">
        <Card className="p-4 flex items-center gap-3 hover:bg-destructive/5 transition-smooth border-destructive/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/12 text-destructive"><LogOut className="h-5 w-5" /></div>
          <div className="flex-1 text-left">
            <p className="font-medium text-sm text-destructive">Sair da conta</p>
          </div>
        </Card>
      </button>

      <div className="mt-10 flex flex-col items-center gap-2">
        <Logo size="md" className="opacity-80" />
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          Feito com <Heart className="h-3 w-3 fill-coral text-coral" /> para a Associação Camila
        </p>
      </div>
    </AppLayout>
  );
}
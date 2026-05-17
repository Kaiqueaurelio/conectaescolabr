import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ColorStatCard } from "@/components/dashboard/ColorStatCard";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  CalendarDays,
  Megaphone,
  Trophy,
  Sparkles,
  BookOpen,
  ClipboardCheck,
  HelpCircle,
  Settings,
  CheckCircle2,
  TrendingUp,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const sidebarItems = [
  { label: "Painel", to: "/aluno", icon: LayoutDashboard, end: true },
  { label: "Agenda", to: "/agenda", icon: CalendarDays },
  { label: "Comunicados", to: "/comunicados", icon: Megaphone },
  { label: "Blog", to: "/blog", icon: BookOpen },
  { label: "Lembretes", to: "/lembretes", icon: ClipboardCheck },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
  { label: "Ajuda", to: "/ajuda", icon: HelpCircle },
];

const progressData = [
  { week: "S1", presenca: 80 },
  { week: "S2", presenca: 85 },
  { week: "S3", presenca: 92 },
  { week: "S4", presenca: 88 },
  { week: "S5", presenca: 95 },
  { week: "S6", presenca: 100 },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { events, studentPoints, studentFrequency, announcements } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today).slice(0, 4);
  const myPoints = user ? studentPoints[user.id] || 0 : 0;
  const myFreq = user ? studentFrequency(user.id) : { rate: 0, total: 0, present: 0 };
  const notices = announcements
    .filter((a) => a.target === "ALL" || a.target === "STUDENTS")
    .slice(0, 3);

  return (
    <DashboardShell title="Meu painel" sidebarTitle="Aluno(a)" sidebarItems={sidebarItems}>
      {/* Welcome banner */}
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-primary via-primary to-tertiary p-6 text-primary-foreground shadow-glow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-secondary/30 blur-3xl animate-blob" />
        <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-tertiary/40 blur-3xl animate-blob" />
        <div className="relative flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-4 ring-white/30">
            <AvatarFallback className="bg-white/20 text-white font-bold">
              {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs opacity-90">Bem-vindo(a) de volta</p>
            <h2 className="text-2xl font-bold leading-tight">{user?.name?.split(" ")[0]} 👋</h2>
            <p className="text-xs opacity-90 mt-1">Continue de onde parou. Você está indo muito bem!</p>
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ColorStatCard label="Pontos" value={myPoints} icon={Trophy} tone="secondary" />
        <ColorStatCard
          label="Presença"
          value={myFreq.total ? `${myFreq.rate}%` : "—"}
          icon={CheckCircle2}
          tone="primary"
          trend={myFreq.total ? `${myFreq.present}/${myFreq.total} aulas` : "Sem registros"}
        />
        <ColorStatCard label="Atividades" value={upcoming.length} icon={CalendarDays} tone="tertiary" />
        <ColorStatCard label="Avisos" value={notices.length} icon={Sparkles} tone="coral" />
      </div>

      {/* Chart + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Sua evolução</p>
              <h3 className="font-bold">Frequência nas últimas 6 semanas</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="presencaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                />
                <Area type="monotone" dataKey="presenca" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#presencaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Comunicados</h3>
            <Link to="/comunicados" className="text-xs text-primary font-medium">Ver tudo</Link>
          </div>
          <div className="space-y-3">
            {notices.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum comunicado.</p>
            ) : (
              notices.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{n.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{n.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming events */}
      <Card className="p-5 rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Programação</p>
            <h3 className="font-bold">Próximas atividades</h3>
          </div>
          <Link to="/agenda" className="text-xs text-primary font-medium">Ver agenda</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma atividade agendada.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-4 py-3">
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-secondary/15 text-secondary shrink-0">
                  <span className="text-[10px] uppercase font-semibold">
                    {new Date(e.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                  </span>
                  <span className="text-base font-bold leading-none">{new Date(e.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{e.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{e.description}</p>
                </div>
                <Star className="h-4 w-4 text-secondary opacity-50" />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ColorStatCard } from "@/components/dashboard/ColorStatCard";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard,
  CalendarDays,
  Megaphone,
  Bell,
  CheckCircle2,
  TrendingUp,
  Settings,
  HelpCircle,
  Users,
  BookOpen,
  Trophy,
  UserPlus,
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
import EmptyState from "@/components/EmptyState";

const sidebarItems = [
  { label: "Painel", to: "/responsavel", icon: LayoutDashboard, end: true },
  { label: "Portal completo", to: "/parent/portal", icon: Users },
  { label: "Agenda", to: "/agenda", icon: CalendarDays },
  { label: "Comunicados", to: "/comunicados", icon: Megaphone },
  { label: "Lembretes", to: "/lembretes", icon: Bell },
  { label: "Blog", to: "/blog", icon: BookOpen },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
  { label: "Ajuda", to: "/ajuda", icon: HelpCircle },
];

const evolution = [
  { mes: "Jan", presenca: 78 },
  { mes: "Fev", presenca: 84 },
  { mes: "Mar", presenca: 90 },
  { mes: "Abr", presenca: 88 },
  { mes: "Mai", presenca: 95 },
];

export default function ParentDashboard() {
  const { user, selectedChildId, switchChild } = useAuth();
  const { announcements, events, turmas, reminders, isOverdue, studentFrequency, studentPoints, students } = useData();

  const children = students.filter((s) => user?.childrenIds?.includes(s.id));
  const child = children.find((c) => c.id === selectedChildId) || children[0];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today && (!e.class_id || child?.classIds?.includes(e.class_id))).slice(0, 4);
  const notices = announcements.filter((a) => a.target === "ALL" || a.target === "PARENTS").slice(0, 3);
  const childTurma = turmas.find((t) => child?.classIds?.includes(t.id));
  const overdue = reminders.filter((r) => isOverdue(r) && (r.target === "ALL" || r.target === "PARENTS")).length;
  const freq = child ? studentFrequency(child.id) : { rate: 0, total: 0, present: 0 };
  const points = child ? studentPoints[child.id] || 0 : 0;
  const initials = child?.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <DashboardShell title="Portal do responsável" sidebarTitle="Responsável" sidebarItems={sidebarItems}>
      {/* Hero with child selector */}
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-tertiary via-primary to-tertiary p-6 text-primary-foreground shadow-glow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-secondary/40 blur-3xl animate-blob" />
        <p className="text-xs opacity-90">Acompanhe</p>
        <h2 className="text-2xl font-bold mt-1">Olá, {user?.name?.split(" ")[0]}</h2>
        <div className="mt-4 max-w-xs">
          {children.length > 0 ? (
            <Select value={selectedChildId || child?.id} onValueChange={switchChild}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white backdrop-blur">
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {children.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs italic opacity-90">Nenhum aluno vinculado.</p>
          )}
        </div>
      </section>

      {!child ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhum aluno vinculado"
          description="Acesse o Portal completo para vincular a conta do seu filho(a)."
        />
      ) : (
        <>
          {/* Child card */}
          <Card className="p-5 mb-6 rounded-2xl flex items-center gap-4 shadow-soft">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/15 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{child.name}</p>
              <p className="text-xs text-muted-foreground truncate">{childTurma?.name || "Sem turma cadastrada"}</p>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <ColorStatCard label="Presença" value={freq.total ? `${freq.rate}%` : "—"} icon={CheckCircle2} tone="primary" trend={freq.total ? `${freq.present}/${freq.total} aulas` : "Sem registros"} />
            <ColorStatCard label="Pontos" value={points} icon={Trophy} tone="secondary" />
            <ColorStatCard label="Eventos" value={upcoming.length} icon={CalendarDays} tone="tertiary" />
            <ColorStatCard label="Atrasados" value={overdue} icon={Bell} tone="coral" />
          </div>

          {/* Chart + notices */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card className="lg:col-span-2 p-5 rounded-2xl shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Acompanhamento</p>
                  <h3 className="font-bold">Frequência ao longo do tempo</h3>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="freqParent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--tertiary))" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="hsl(var(--tertiary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="presenca" stroke="hsl(var(--tertiary))" strokeWidth={3} fill="url(#freqParent)" />
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
                ) : notices.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="h-8 w-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{n.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Upcoming */}
          <Card className="p-5 rounded-2xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Próximos eventos</h3>
              <Link to="/agenda" className="text-xs text-primary font-medium">Ver agenda</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem eventos próximos.</p>
            ) : (
              <ul className="divide-y divide-border">
                {upcoming.map((e) => (
                  <li key={e.id} className="flex items-center gap-4 py-3">
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-tertiary/10 text-tertiary shrink-0">
                      <span className="text-[10px] uppercase font-semibold">
                        {new Date(e.date).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="text-base font-bold leading-none">{new Date(e.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
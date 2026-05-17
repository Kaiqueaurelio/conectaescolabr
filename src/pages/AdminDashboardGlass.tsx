import { useData } from "@/contexts/DataContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ColorStatCard } from "@/components/dashboard/ColorStatCard";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  Megaphone,
  CalendarDays,
  Gift,
  FileText,
  BarChart3,
  Shield,
  Settings,
  HelpCircle,
  Trophy,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const sidebarItems = [
  { label: "Painel", to: "/admin/dashboard", icon: LayoutDashboard, end: true },
  { label: "Usuários", to: "/admin/users", icon: Users },
  { label: "Turmas", to: "/turmas", icon: GraduationCap },
  { label: "Presença", to: "/admin/attendance", icon: ClipboardCheck },
  { label: "Benefícios", to: "/admin/benefits", icon: Gift },
  { label: "Comunicados", to: "/comunicados", icon: Megaphone },
  { label: "Calendário", to: "/admin/calendar", icon: CalendarDays },
  { label: "Documentos", to: "/admin/scanning", icon: FileText },
  { label: "Relatórios", to: "/admin/reports", icon: BarChart3 },
  { label: "Segurança", to: "/admin/security", icon: Shield },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
  { label: "Ajuda", to: "/ajuda", icon: HelpCircle },
];

const monthly = [
  { mes: "Jan", presencas: 240, benef: 80 },
  { mes: "Fev", presencas: 280, benef: 95 },
  { mes: "Mar", presencas: 310, benef: 110 },
  { mes: "Abr", presencas: 295, benef: 120 },
  { mes: "Mai", presencas: 340, benef: 130 },
];

const palette = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--tertiary))", "hsl(var(--coral))"];

export function AdminDashboardGlassPage() {
  const { students, turmas, events, announcements } = useData();

  const roleData = [
    { name: "Alunas", value: students.length, color: "hsl(var(--primary))" },
    { name: "Turmas", value: turmas.length, color: "hsl(var(--secondary))" },
    { name: "Eventos", value: events.length, color: "hsl(var(--tertiary))" },
    { name: "Avisos", value: announcements.length, color: "hsl(var(--coral))" },
  ];

  return (
    <DashboardShell title="Painel administrativo" sidebarTitle="Administração" sidebarItems={sidebarItems}>
      {/* Hero */}
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-primary via-tertiary to-secondary p-6 text-primary-foreground shadow-glow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-coral/30 blur-3xl animate-blob" />
        <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-secondary/40 blur-3xl animate-blob" />
        <p className="text-xs opacity-90">Resumo geral</p>
        <h2 className="text-2xl font-bold mt-1">Visão da Associação Camila</h2>
        <p className="text-xs opacity-90 mt-1">Acompanhe presença, comunicação e benefícios em tempo real.</p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ColorStatCard label="Assistidas" value={students.length} icon={Users} tone="primary" trend="+12% este mês" />
        <ColorStatCard label="Turmas ativas" value={turmas.length} icon={GraduationCap} tone="secondary" />
        <ColorStatCard label="Eventos" value={events.length} icon={CalendarDays} tone="tertiary" />
        <ColorStatCard label="Comunicados" value={announcements.length} icon={Megaphone} tone="coral" />
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Últimos 5 meses</p>
              <h3 className="font-bold">Presenças e benefícios distribuídos</h3>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="presencas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="benef" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft">
          <h3 className="font-bold mb-2">Distribuição</h3>
          <p className="text-xs text-muted-foreground mb-2">Visão geral</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {roleData.map((d, i) => (<Cell key={i} fill={palette[i]} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 mt-2">
            {roleData.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: palette[i] }} />
                <span className="flex-1 text-muted-foreground">{d.name}</span>
                <span className="font-semibold">{d.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recent announcements */}
      <Card className="p-5 rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Comunicados recentes</h3>
        </div>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum comunicado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {announcements.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-3">
                <div className="h-9 w-9 rounded-xl bg-coral/15 text-coral flex items-center justify-center shrink-0">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{a.content}</p>
                </div>
                <Trophy className="h-4 w-4 text-secondary/50" />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}
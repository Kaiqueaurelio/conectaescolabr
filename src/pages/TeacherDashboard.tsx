import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ColorStatCard } from "@/components/dashboard/ColorStatCard";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Megaphone,
  CalendarDays,
  GraduationCap,
  Bell,
  AlertTriangle,
  Settings,
  HelpCircle,
  BookOpen,
  ChevronRight,
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
} from "recharts";
import { Link } from "react-router-dom";

const sidebarItems = [
  { label: "Painel", to: "/professor", icon: LayoutDashboard, end: true },
  { label: "Turmas", to: "/turmas", icon: GraduationCap },
  { label: "Chamada", to: "/chamada", icon: ClipboardCheck },
  { label: "Comunicados", to: "/comunicados", icon: Megaphone },
  { label: "Agenda", to: "/agenda", icon: CalendarDays },
  { label: "Lembretes", to: "/lembretes", icon: Bell },
  { label: "Blog", to: "/blog", icon: BookOpen },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
  { label: "Ajuda", to: "/ajuda", icon: HelpCircle },
];

const attendanceData = [
  { day: "Seg", presentes: 28 },
  { day: "Ter", presentes: 30 },
  { day: "Qua", presentes: 26 },
  { day: "Qui", presentes: 31 },
  { day: "Sex", presentes: 29 },
];

const palette = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--tertiary))", "hsl(var(--coral))", "hsl(var(--success))"];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { turmas, events, reminders, isOverdue } = useData();
  const myClasses = turmas.filter((t) => t.teacher_id === user?.id);
  const totalStudents = myClasses.reduce((sum, c) => sum + c.studentIds.length, 0);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= today).slice(0, 4);
  const myReminders = reminders.filter((r) => r.target === "ALL" || r.target === "TEACHERS");
  const overdue = myReminders.filter(isOverdue).length;

  return (
    <DashboardShell title="Painel do colaborador(a)" sidebarTitle="Colaborador(a)" sidebarItems={sidebarItems}>
      {/* Hero */}
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-primary via-tertiary to-primary p-6 text-primary-foreground shadow-glow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-secondary/40 blur-3xl animate-blob" />
        <p className="text-xs opacity-90">Bem-vindo(a) de volta</p>
        <h2 className="text-2xl font-bold mt-1">{user?.name}</h2>
        <p className="text-xs opacity-90 mt-1 capitalize">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ColorStatCard label="Alunas" value={totalStudents} icon={Users} tone="primary" />
        <ColorStatCard label="Turmas" value={myClasses.length} icon={GraduationCap} tone="secondary" />
        <ColorStatCard label="Lembretes" value={myReminders.filter((r) => !r.done).length} icon={Bell} tone="tertiary" />
        <ColorStatCard label="Atrasados" value={overdue} icon={AlertTriangle} tone="coral" />
      </div>

      {/* Chart + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Esta semana</p>
              <h3 className="font-bold">Presenças por dia</h3>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="presentes" radius={[10, 10, 0, 0]}>
                  {attendanceData.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft">
          <h3 className="font-bold mb-4">Ações rápidas</h3>
          <div className="space-y-2">
            {[
              { to: "/chamada", label: "Fazer chamada", icon: ClipboardCheck, tone: "bg-primary/15 text-primary" },
              { to: "/comunicados/novo", label: "Novo comunicado", icon: Megaphone, tone: "bg-secondary/15 text-secondary" },
              { to: "/turmas", label: "Minhas turmas", icon: Users, tone: "bg-tertiary/15 text-tertiary" },
              { to: "/agenda", label: "Agenda", icon: CalendarDays, tone: "bg-coral/15 text-coral" },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-soft transition-all"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${a.tone}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{a.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
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
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary shrink-0">
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
    </DashboardShell>
  );
}
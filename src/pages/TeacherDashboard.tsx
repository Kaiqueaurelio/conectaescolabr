import { useAuth } from "@/contexts/AuthContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ColorStatCard } from "@/components/dashboard/ColorStatCard";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard, Users, ClipboardCheck, Megaphone, CalendarDays,
  GraduationCap, Settings, HelpCircle, Bell, AlertTriangle, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AttendanceRow { date: string; status: string; }
interface UpcomingEvent { id: string; title: string; start_datetime: string; location?: string | null; }

const sidebarItems = [
  { label: "Painel", to: "/professor", icon: LayoutDashboard, end: true },
  { label: "Turmas", to: "/turmas", icon: GraduationCap },
  { label: "Chamada", to: "/admin/attendance", icon: ClipboardCheck },
  { label: "Comunicados", to: "/admin/communications", icon: Megaphone },
  { label: "Agenda", to: "/admin/calendar", icon: CalendarDays },
  { label: "Configurações", to: "/configuracoes", icon: Settings },
  { label: "Ajuda", to: "/ajuda", icon: HelpCircle },
];

const palette = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--tertiary))", "hsl(var(--coral))", "hsl(var(--success))"];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [activitiesCount, setActivitiesCount] = useState<number | null>(null);
  const [announcementsCount, setAnnouncementsCount] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<Array<{ day: string; presentes: number }>>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryFailed, setQueryFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartDate = weekStart.toISOString().slice(0, 10);

      const [students, activities, announcements, attendance, events] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "STUDENT").eq("status", "APPROVED"),
        supabase.from("activities").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("attendance_records").select("date,status").gte("date", weekStartDate).lte("date", today),
        supabase.from("events").select("id,title,start_datetime,location").gte("start_datetime", new Date().toISOString()).order("start_datetime", { ascending: true }).limit(5),
      ]);
      if (!active) return;

      const errors = [students.error, activities.error, announcements.error, attendance.error, events.error];
      const failed = errors.some(Boolean);
      setQueryFailed(failed);
      if (failed) console.error("Falha ao carregar painel do professor:", errors);
      setStudentsCount(students.error ? null : students.count ?? 0);
      setActivitiesCount(activities.error ? null : activities.count ?? 0);
      setAnnouncementsCount(announcements.error ? null : announcements.count ?? 0);
      setUpcoming(events.error ? [] : (events.data ?? []) as UpcomingEvent[]);

      const rows = attendance.error ? [] : (attendance.data ?? []) as AttendanceRow[];
      const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
      setAttendanceData(days.map((day, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const key = date.toISOString().slice(0, 10);
        return { day, presentes: rows.filter((row) => row.date === key && row.status === "PRESENT").length };
      }));
      setLoading(false);
    };
    void loadDashboard().catch((error) => {
      console.error("Erro inesperado no painel do professor:", error);
      if (active) { setQueryFailed(true); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  return (
    <DashboardShell title="Painel do colaborador(a)" sidebarTitle="Colaborador(a)" sidebarItems={sidebarItems}>
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-primary via-tertiary to-primary p-6 text-primary-foreground shadow-glow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-secondary/40 blur-3xl animate-blob" />
        <p className="text-xs opacity-90">Bem-vindo(a) de volta</p>
        <h2 className="text-2xl font-bold mt-1">{user?.name || "Professor(a)"}</h2>
        <p className="text-xs opacity-90 mt-1 capitalize">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </section>

      {queryFailed && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          Algumas consultas falharam. Indicadores indisponíveis aparecem como traço (—), sem dados de demonstração.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <ColorStatCard label="Alunos aprovados" value={loading ? "…" : studentsCount ?? "—"} icon={Users} tone="primary" />
        <ColorStatCard label="Atividades cadastradas" value={loading ? "…" : activitiesCount ?? "—"} icon={GraduationCap} tone="secondary" />
        <ColorStatCard label="Comunicados" value={loading ? "…" : announcementsCount ?? "—"} icon={Bell} tone="tertiary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl shadow-soft">
          <div className="mb-4">
            <p className="text-xs text-muted-foreground">Esta semana</p>
            <h3 className="font-bold">Presenças registradas por dia</h3>
          </div>
          {loading ? <p className="py-6 text-sm text-muted-foreground">Carregando chamadas...</p> :
            attendanceData.every((day) => day.presentes === 0) ? (
              <p className="py-6 text-sm text-muted-foreground">Não há presenças registradas nesta semana.</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} />
                    <Bar dataKey="presentes" name="Presentes" radius={[10, 10, 0, 0]}>
                      {attendanceData.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
        </Card>

        <Card className="p-5 rounded-2xl shadow-soft">
          <h3 className="font-bold mb-4">Ações rápidas</h3>
          <div className="space-y-2">
            {[
              { to: "/admin/attendance", label: "Fazer chamada", icon: ClipboardCheck, tone: "bg-primary/15 text-primary" },
              { to: "/admin/communications", label: "Comunicados", icon: Megaphone, tone: "bg-secondary/15 text-secondary" },
              { to: "/admin/calendar", label: "Agenda", icon: CalendarDays, tone: "bg-tertiary/15 text-tertiary" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.to} to={action.to} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:shadow-soft transition-all">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${action.tone}`}><Icon className="h-4 w-4" /></div>
                  <span className="flex-1 text-sm font-medium">{action.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-5 rounded-2xl shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Próximos eventos</h3>
          <Link to="/admin/calendar" className="text-xs text-primary font-medium">Ver agenda</Link>
        </div>
        {loading ? <p className="text-sm text-muted-foreground py-6">Carregando eventos...</p> : upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum evento futuro disponível.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((event) => (
              <li key={event.id} className="flex items-center gap-4 py-3">
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary shrink-0">
                  <span className="text-[10px] uppercase font-semibold">{new Date(event.start_datetime).toLocaleDateString("pt-BR", { month: "short" })}</span>
                  <span className="text-lg font-bold leading-none">{new Date(event.start_datetime).getDate()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{event.title}</p>
                  {event.location && <p className="text-xs text-muted-foreground mt-1">{event.location}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(event.start_datetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}

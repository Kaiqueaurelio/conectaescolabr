import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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

const palette = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--tertiary))", "hsl(var(--coral))"];

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface DashboardAnnouncement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function AdminDashboardGlassPage() {
  const [counts, setCounts] = useState<{ students: number | null; activities: number | null; events: number | null; announcements: number | null; benefits: number | null }>({
    students: null, activities: null, events: null, announcements: null, benefits: null,
  });
  const [monthly, setMonthly] = useState<Array<{ mes: string; presencas: number; benef: number }>>([]);
  const [announcements, setAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryFailed, setQueryFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      const now = new Date();
      const firstMonth = new Date(now.getFullYear(), now.getMonth() - 4, 1);
      const startDate = firstMonth.toISOString().slice(0, 10);
      const [
        studentsCount, activitiesCount, eventsCount, announcementsCount, benefitsCount,
        attendanceRows, benefitRows, announcementRows,
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "STUDENT").eq("status", "APPROVED"),
        supabase.from("activities").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }),
        supabase.from("benefit_distributions").select("id", { count: "exact", head: true }),
        supabase.from("attendance_records").select("date,status").gte("date", startDate),
        supabase.from("benefit_distributions").select("distribution_date,quantity").gte("distribution_date", startDate),
        supabase.from("announcements").select("id,title,content,created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      if (!active) return;
      const errors = [studentsCount.error, activitiesCount.error, eventsCount.error, announcementsCount.error,
        benefitsCount.error, attendanceRows.error, benefitRows.error, announcementRows.error];
      const failed = errors.some(Boolean);
      setQueryFailed(failed);
      if (failed) console.error("Algumas consultas do painel administrativo falharam:", errors);

      setCounts({
        students: studentsCount.error ? null : studentsCount.count ?? 0,
        activities: activitiesCount.error ? null : activitiesCount.count ?? 0,
        events: eventsCount.error ? null : eventsCount.count ?? 0,
        announcements: announcementsCount.error ? null : announcementsCount.count ?? 0,
        benefits: benefitsCount.error ? null : benefitsCount.count ?? 0,
      });
      setAnnouncements(announcementRows.error ? [] : (announcementRows.data ?? []) as DashboardAnnouncement[]);

      const attendance = attendanceRows.data ?? [];
      const benefits = benefitRows.data ?? [];
      setMonthly(Array.from({ length: 5 }, (_, index) => {
        const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return {
          mes: MONTHS[date.getMonth()],
          presencas: attendance.filter((row) => String(row.date).slice(0, 7) === key && row.status === "PRESENT").length,
          benef: benefits.filter((row) => String(row.distribution_date).slice(0, 7) === key)
            .reduce((sum, row) => sum + Number(row.quantity ?? 0), 0),
        };
      }));
      setLoading(false);
    };
    void loadDashboard().catch((error) => {
      console.error("Erro inesperado no painel administrativo:", error);
      if (active) {
        setQueryFailed(true);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const roleData = [
    { name: "Alunas aprovadas", value: counts.students, color: "hsl(var(--primary))" },
    { name: "Atividades", value: counts.activities, color: "hsl(var(--secondary))" },
    { name: "Eventos", value: counts.events, color: "hsl(var(--tertiary))" },
    { name: "Comunicados", value: counts.announcements, color: "hsl(var(--coral))" },
  ];

  return (
    <DashboardShell title="Painel administrativo" sidebarTitle="Administração" sidebarItems={sidebarItems}>
      {/* Hero */}
      <section className="mb-6 rounded-3xl bg-gradient-to-br from-primary via-tertiary to-secondary p-6 text-primary-foreground shadow-glow relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-coral/30 blur-3xl animate-blob" />
        <div className="absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-secondary/40 blur-3xl animate-blob" />
        <p className="text-xs opacity-90">Resumo geral</p>
        <h2 className="text-2xl font-bold mt-1">Visão da Associação Camila</h2>
        <p className="text-xs opacity-90 mt-1">Indicadores consultados diretamente no banco de dados.</p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ColorStatCard label="Alunas aprovadas" value={loading ? "…" : counts.students ?? "—"} icon={Users} tone="primary" />
        <ColorStatCard label="Atividades cadastradas" value={loading ? "…" : counts.activities ?? "—"} icon={GraduationCap} tone="secondary" />
        <ColorStatCard label="Eventos" value={loading ? "…" : counts.events ?? "—"} icon={CalendarDays} tone="tertiary" />
        <ColorStatCard label="Comunicados" value={loading ? "…" : counts.announcements ?? "—"} icon={Megaphone} tone="coral" />
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 p-5 rounded-2xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground">Últimos 5 meses</p>
              <h3 className="font-bold">Presenças registradas e quantidades distribuídas</h3>
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
          <p className="text-xs text-muted-foreground mb-2">Distribuições registradas: {loading ? "…" : counts.benefits ?? "—"}</p>
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
                <span className="font-semibold">{d.value === null ? "—" : d.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {queryFailed && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          Algumas consultas falharam. Os indicadores indisponíveis aparecem como traço (—), sem valores de demonstração.
        </div>
      )}

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
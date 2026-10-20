import { useEffect, useMemo, useState } from "react";
import { SkillPathBanner } from "@/components/SkillPathBanner";
import { SkillPathMetricCard } from "@/components/SkillPathMetricCard";
import { GlassLayout, GlassContainer, GlassGrid, GlassSection } from "@/components/GlassLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Bell, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface AttendanceRow {
  date: string;
  status: string;
}
interface UpcomingEvent {
  id: string;
  title: string;
  start_datetime: string;
  location?: string | null;
}
interface StudentAnnouncement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const sidebarItems = [
  { label: "Meu Dashboard", href: "/aluno/dashboard", icon: "📊" },
  { label: "Frequência", href: "/aluno/dashboard", icon: "📋" },
  { label: "Comunicados", href: "/aluno/dashboard", icon: "📢" },
];

export function StudentDashboardSkillPathPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryFailed, setQueryFailed] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) {
      setAttendance([]);
      setEvents([]);
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    let active = true;
    const loadDashboard = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartDate = monthStart.toISOString().slice(0, 10);
      const [attendanceResult, eventsResult, announcementsResult] = await Promise.all([
        supabase.from("attendance_records")
          .select("date,status")
          .eq("user_id", currentUser.id)
          .gte("date", monthStartDate)
          .lte("date", today)
          .order("date", { ascending: true }),
        supabase.from("events")
          .select("id,title,start_datetime,location")
          .gte("start_datetime", new Date().toISOString())
          .order("start_datetime", { ascending: true })
          .limit(5),
        supabase.from("announcements")
          .select("id,title,content,target_roles,created_at")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      if (!active) return;
      const failed = Boolean(attendanceResult.error || eventsResult.error || announcementsResult.error);
      setQueryFailed(failed);
      if (failed) console.error("Falha ao carregar dados do painel do aluno", {
        attendance: attendanceResult.error,
        events: eventsResult.error,
        announcements: announcementsResult.error,
      });
      setAttendance(attendanceResult.error ? [] : (attendanceResult.data ?? []) as AttendanceRow[]);
      setEvents(eventsResult.error ? [] : (eventsResult.data ?? []) as UpcomingEvent[]);
      setAnnouncements(announcementsResult.error ? [] : (announcementsResult.data ?? [])
        .filter((item) => Array.isArray(item.target_roles) &&
          (item.target_roles.includes("ALL") || item.target_roles.includes("STUDENTS")))
        .map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          created_at: item.created_at,
        })));
      setLoading(false);
    };

    void loadDashboard().catch((error) => {
      console.error("Erro inesperado no painel do aluno:", error);
      if (active) {
        setQueryFailed(true);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [currentUser?.id]);

  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter((row) => row.status === "PRESENT" || row.status === "EXCUSED").length / attendance.length) * 100)
    : null;

  const weeklyFrequency = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    return Array.from({ length: 4 }, (_, index) => {
      const weekStart = new Date(start);
      weekStart.setDate(1 + index * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const records = attendance.filter((row) => {
        const date = new Date(`${row.date}T00:00:00`);
        return date >= weekStart && date <= weekEnd;
      });
      const present = records.filter((row) => row.status === "PRESENT" || row.status === "EXCUSED").length;
      return {
        week: `Sem. ${index + 1}`,
        frequency: records.length ? Math.round((present / records.length) * 100) : null,
      };
    });
  }, [attendance]);

  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Meu Dashboard"
      topBarUser={currentUser ? { name: currentUser.full_name || "Aluno", email: currentUser.email || "" } : undefined}
    >
      <GlassContainer className="space-y-8">
        <SkillPathBanner
          title={`Bem-vindo${currentUser?.full_name ? `, ${currentUser.full_name}` : ""}!`}
          subtitle="Aqui estão as informações que conseguimos consultar para sua conta."
          userName={currentUser?.full_name || "Aluno"}
          gradientFrom="from-primary"
          gradientTo="to-accent"
        />

        {queryFailed && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            Algumas consultas falharam. Os dados indisponíveis não serão substituídos por números de demonstração.
          </div>
        )}

        <GlassSection title="Seu progresso" description="Resumo calculado a partir dos registros disponíveis">
          <GlassGrid cols={3} gap="medium">
            <SkillPathMetricCard
              title="Frequência no mês"
              value={loading ? "…" : attendanceRate === null ? "—" : `${attendanceRate}%`}
              icon={<CheckCircle className="w-6 h-6" />}
              color="primary"
            />
            <SkillPathMetricCard
              title="Próximos eventos"
              value={loading ? "…" : String(events.length)}
              icon={<Calendar className="w-6 h-6" />}
              color="secondary"
            />
            <SkillPathMetricCard
              title="Comunicados para alunos"
              value={loading ? "…" : String(announcements.length)}
              icon={<Bell className="w-6 h-6" />}
              color="accent"
            />
          </GlassGrid>
        </GlassSection>

        <GlassSection title="Frequência semanal" description="Percentual calculado com base nas chamadas registradas neste mês">
          {attendance.length === 0 ? (
            <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
              {loading ? "Carregando registros de frequência..." : "Não há registros de frequência disponíveis para este mês."}
            </p>
          ) : (
            <div className="h-64 rounded-2xl border border-border bg-card p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="frequency" name="Frequência (%)" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassSection>

        <GlassGrid cols={2} gap="medium">
          <GlassSection title="Próximos eventos" description="Eventos cadastrados">
            {loading ? <p className="text-sm text-muted-foreground">Carregando eventos...</p> : events.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">Nenhum evento futuro disponível.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(event.start_datetime).toLocaleString("pt-BR")}
                    </p>
                    {event.location && <p className="mt-1 text-xs text-muted-foreground">{event.location}</p>}
                  </div>
                ))}
              </div>
            )}
          </GlassSection>

          <GlassSection title="Comunicados" description="Avisos direcionados aos alunos">
            {loading ? <p className="text-sm text-muted-foreground">Carregando comunicados...</p> : announcements.length === 0 ? (
              <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">Nenhum comunicado disponível.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold text-foreground">{announcement.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{announcement.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(announcement.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassSection>
        </GlassGrid>

        <p className="text-xs text-muted-foreground">
          Cursos, certificados e horas de estudo não aparecem aqui porque ainda não há tabelas confirmadas para esses dados.
        </p>
      </GlassContainer>
    </GlassLayout>
  );
}

export default StudentDashboardSkillPathPage;
